from datetime import timedelta
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.utils import timezone
from rest_framework import exceptions, mixins, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import (
    CreateAPIView,
    DestroyAPIView,
    ListAPIView,
    get_object_or_404,
)
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from market.mixins import DefaultOrderMixin
from market.models import Listing, ListingImage, Offer, Tag
from market.pagination import PageSizeOffsetPagination
from market.permissions import (
    IsSuperUser,
    ListingImageOwnerPermission,
    ListingOwnerPermission,
    OfferOwnerPermission,
)
from market.serializers import (
    ListingImageSerializer,
    ListingImageURLSerializer,
    ListingSerializer,
    ListingSerializerList,
    ListingSerializerPublic,
    OfferSerializer,
    TagSerializer,
    UserSerializer,
)
from utils.sms import generate_verification_code, send_verification_sms

User = get_user_model()


class Tags(ListAPIView, DefaultOrderMixin):
    serializer_class = TagSerializer
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        return Tag.objects.all()


class UserFavorites(ListAPIView, DefaultOrderMixin):
    serializer_class = ListingSerializerList
    permission_classes = [IsAuthenticated]
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        user = self.request.user
        return user.listings_favorited


# TODO: Can add feature to filter for active offers only
class OffersMade(ListAPIView, DefaultOrderMixin):
    serializer_class = OfferSerializer
    permission_classes = [IsAuthenticated | IsSuperUser]
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        user = self.request.user
        return Offer.objects.filter(user=user)


class OffersReceived(ListAPIView, DefaultOrderMixin):
    serializer_class = OfferSerializer
    permission_classes = [IsAuthenticated | IsSuperUser]
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        user = self.request.user
        return Offer.objects.filter(listing__seller=user)


class Listings(viewsets.ModelViewSet, DefaultOrderMixin):
    """
    list:
    Returns a list of Listings that match query parameters. Supports filtering by type (item/sublet) and type-specific fields.

    create:
    Create a Listing (Item or Sublet based on listing_type).

    partial_update:
    Update certain fields in the Listing. Only the owner can edit it.

    destroy:
    Delete a Listing.
    """

    permission_classes = [ListingOwnerPermission | IsSuperUser]
    serializer_class = ListingSerializer
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        return Listing.objects.select_related(
            "item", "sublet"
        ).prefetch_related("tags", "images")

    def get_serializer_class(self):
        if self.action == "list":
            return ListingSerializerList
        elif self.action == "retrieve":
            return ListingSerializerPublic
        else:
            return ListingSerializer

    @staticmethod
    def get_filter_dict(listing_type):
        base_filters = {
            "title": "title__icontains",
            "min_price": "price__gte",
            "max_price": "price__lte",
            "negotiable": "negotiable",
        }

        item_filters = {
            "condition": "item__condition",
            "category": "item__category__name",
        }

        sublet_filters = {
            "beds": "sublet__beds",
            "baths": "sublet__baths",
            "address": "sublet__address__icontains",
        }

        if listing_type == "item":
            return {**base_filters, **item_filters}
        elif listing_type == "sublet":
            return {**base_filters, **sublet_filters}
        else:
            return base_filters

    def list(self, request, *args, **kwargs):
        """
        Returns a list of Listings that match query parameters. Supports filtering by type and type-specific fields.
        """
        queryset = self.get_queryset()

        listing_type = request.query_params.get("type", "").lower()
        if listing_type == "item":
            queryset = queryset.filter(item__isnull=False)
        elif listing_type == "sublet":
            queryset = queryset.filter(sublet__isnull=False)

        filter_dict = self.get_filter_dict(listing_type)

        for param, field in filter_dict.items():
            if param_value := request.query_params.get(param):
                queryset = queryset.filter(**{field: param_value})

        for tag in request.query_params.getlist("tags"):
            queryset = queryset.filter(tags__name=tag)

        if start_date := request.query_params.get("start_date"):
            queryset = queryset.filter(sublet__start_date__gte=start_date)
        if end_date := request.query_params.get("end_date"):
            queryset = queryset.filter(sublet__end_date__lte=end_date)

        if request.query_params.get("seller", "false").lower() == "true":
            queryset = queryset.filter(seller=request.user)
        else:
            queryset = queryset.filter(expires_at__gte=timezone.now())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.seller == request.user:
            serializer_class = ListingSerializer
        else:
            serializer_class = ListingSerializerPublic
        serializer = serializer_class(instance)
        return Response(serializer.data)


# TODO: This doesn't use CreateAPIView's functionality since we overrode the create method.
# Think about if there's a better way
class CreateImages(CreateAPIView):
    serializer_class = ListingImageSerializer
    http_method_names = ["post"]
    permission_classes = [ListingOwnerPermission | IsSuperUser]
    parser_classes = (
        MultiPartParser,
        FormParser,
    )

    def get_queryset(self, *args, **kwargs):
        listing = get_object_or_404(Listing, id=int(self.kwargs["listing_id"]))
        return ListingImage.objects.filter(listing=listing)

    # takes an image multipart form data and creates a new image object
    def post(self, request, *args, **kwargs):
        images = request.data.getlist("images", [])
        listing_id = int(self.kwargs["listing_id"])
        listing = get_object_or_404(Listing, id=listing_id)
        self.check_object_permissions(request, listing)
        instances = []

        for img in images:
            img_serializer = self.get_serializer(
                data={"listing": listing_id, "image": img}
            )
            img_serializer.is_valid(raise_exception=True)
            instances.append(img_serializer.save())

        data = ListingImageURLSerializer(instances, many=True).data
        return Response(data, status=status.HTTP_201_CREATED)


class DeleteImage(DestroyAPIView):
    serializer_class = ListingImageSerializer
    http_method_names = ["delete"]
    permission_classes = [ListingImageOwnerPermission | IsSuperUser]
    queryset = ListingImage.objects.all()

    def destroy(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        filter = {"id": self.kwargs["image_id"]}
        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)
        self.perform_destroy(obj)
        return Response(status=status.HTTP_204_NO_CONTENT)


# TODO: We don't use the CreateModelMixin or DestroyModelMixin's functionality here.
# Think about if there's a better way
class Favorites(
    mixins.DestroyModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet
):
    serializer_class = ListingSerializer
    http_method_names = ["post", "delete"]
    permission_classes = [IsAuthenticated | IsSuperUser]
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        user = self.request.user
        return user.listings_favorited

    def create(self, request, *args, **kwargs):
        listing_id = int(self.kwargs["listing_id"])
        queryset = self.get_queryset()
        if queryset.filter(id=listing_id).exists():
            raise exceptions.ValidationError("Favorite already exists")
        listing = get_object_or_404(Listing, id=listing_id)
        self.get_queryset().add(listing)
        return Response(status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        listing_id = int(self.kwargs["listing_id"])
        listing = get_object_or_404(Listing, id=listing_id)

        if listing not in request.user.listings_favorited.all():
            raise exceptions.NotFound("Favorite does not exist.")

        self.get_queryset().remove(listing)
        return Response(status=status.HTTP_204_NO_CONTENT)


class Offers(viewsets.ModelViewSet):
    """
    list:
    Returns a list of all offers for the listing matching the provided ID.

    create:
    Create an offer on the listing matching the provided ID.
    User must have a verified phone number before making an offer.

    destroy:
    Delete the offer between the user and the listing matching the ID.
    """

    permission_classes = [OfferOwnerPermission | IsSuperUser]
    serializer_class = OfferSerializer
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        if Listing.objects.filter(pk=int(self.kwargs["listing_id"])).exists():
            return Offer.objects.filter(
                listing_id=int(self.kwargs["listing_id"])
            ).order_by("created_at")
        else:
            raise exceptions.NotFound("No Listing matches the given query")

    def create(self, request, *args, **kwargs):
        if not request.user.phone_number or not request.user.phone_verified:
            raise exceptions.ValidationError("You must verify your phone number before making an offer")
        data = request.data.copy()
        if self.get_queryset().filter(user=self.request.user).exists():
            raise exceptions.ValidationError("Offer already exists")
        data["listing"] = int(self.kwargs["listing_id"])
        data["user"] = self.request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        filter = {
            "user": self.request.user,
            "listing": int(self.kwargs["listing_id"]),
        }
        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)
        self.perform_destroy(obj)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def list(self, request, *args, **kwargs):
        if not Listing.objects.filter(
            pk=int(self.kwargs["listing_id"])
        ).exists():
            raise exceptions.NotFound("No Listing matches the given query")
        for offer in self.get_queryset():
            self.check_object_permissions(request, offer)
        return super().list(request, *args, **kwargs)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_verification_code(request):
    phone_number = request.data.get("phone_number")
    
    if not phone_number:
        raise exceptions.ValidationError("Phone number is required")
    
    code = generate_verification_code()
    
    # unique cache key for this user + phone combination
    cache_key = f"phone_verify:{request.user.id}:{phone_number}"
    
    # verification code in cache with auto-expiration
    timeout = settings.PHONE_VERIFICATION_CODE_EXPIRY_MINUTES * 60
    cache.set(cache_key, code, timeout=timeout)
    
    try:
        send_verification_sms(phone_number, code)
    except Exception as e:
        raise exceptions.APIException(f"Failed to send SMS: {str(e)}")
    
    return Response({
        "success": True,
        "message": "Verification code sent"
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_phone_code(request):
    phone_number = request.data.get("phone_number")
    code = request.data.get("code")
    
    if not phone_number or not code:
        raise exceptions.ValidationError("Phone number and code are required")
    
    cache_key = f"phone_verify:{request.user.id}:{phone_number}"
    stored_code = cache.get(cache_key)
    
    if not stored_code or stored_code != code:
        raise exceptions.ValidationError("Invalid or expired verification code")
    
    # Success! Update user's phone verification status
    request.user.phone_number = phone_number
    request.user.phone_verified = True
    request.user.phone_verified_at = timezone.now()
    request.user.save()
    
    cache.delete(cache_key)
    
    return Response({
        "verified": True,
        "message": "Phone number verified successfully",
        "phone_number": str(phone_number)
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get the current authenticated user's info"""
    return Response(UserSerializer(request.user).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_phone_status(request):
    user = request.user
    return Response({
        "phone_number": str(user.phone_number) if user.phone_number else None,
        "phone_verified": user.phone_verified,
    })