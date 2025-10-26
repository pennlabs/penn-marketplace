from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import exceptions, mixins, status, viewsets
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
from market.models import Listing, ListingImage, Offer, Tag, Type
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
    TypeSerializer,
)

User = get_user_model()


class Tags(ListAPIView, DefaultOrderMixin):
    serializer_class = TagSerializer
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        return Tag.objects.all()


class Types(ListAPIView, DefaultOrderMixin):
    serializer_class = TypeSerializer
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        return Type.objects.all()


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
    Returns a list of Listings that match query parameters (e.g., amenities) and belong to the user.

    create:
    Create a Listing.

    partial_update:
    Update certain fields in the Listing. Only the owner can edit it.

    destroy:
    Delete a Listing.
    """

    permission_classes = [ListingOwnerPermission | IsSuperUser]
    serializer_class = ListingSerializer
    queryset = Listing.objects.all()
    pagination_class = PageSizeOffsetPagination

    def get_serializer_class(self):
        if self.action == "list":
            return ListingSerializerList
        elif self.action == "retrieve" and self.get_object().seller != self.request.user:
            return ListingSerializerPublic
        else:
            return ListingSerializer

    @staticmethod
    def get_filter_dict():
        return {
            "type": "type__name",
            "title": "title__icontains",
            "min_price": "price__gte",
            "max_price": "price__lte",
            "negotiable": "negotiable",
        }

    def list(self, request, *args, **kwargs):
        """Returns a list of Listings that match query parameters and user ownership."""
        queryset = self.get_queryset()

        filter_dict = self.get_filter_dict()

        for param, field in filter_dict.items():
            if param_value := request.query_params.get(param):
                queryset = queryset.filter(**{field: param_value})

        for tag in request.query_params.getlist("tags"):
            queryset = queryset.filter(tags__name=tag)

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
            img_serializer = self.get_serializer(data={"listing": listing_id, "image": img})
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
class Favorites(mixins.DestroyModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
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
        queryset = self.get_queryset()
        listing = get_object_or_404(queryset, pk=int(self.kwargs["listing_id"]))
        self.get_queryset().remove(listing)
        return Response(status=status.HTTP_204_NO_CONTENT)


class Offers(viewsets.ModelViewSet):
    """
    list:
    Returns a list of all offers for the listing matching the provided ID.

    create:
    Create an offer on the listing matching the provided ID.

    destroy:
    Delete the offer between the user and the listing matching the ID.
    """

    permission_classes = [OfferOwnerPermission | IsSuperUser]
    serializer_class = OfferSerializer
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        if Listing.objects.filter(pk=int(self.kwargs["listing_id"])).exists():
            return Offer.objects.filter(listing_id=int(self.kwargs["listing_id"])).order_by(
                "created_at"
            )
        else:
            raise exceptions.NotFound("No Listing matches the given query")

    def create(self, request, *args, **kwargs):
        # Required to be mutable since the listing field is from the URL
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
        if not Listing.objects.filter(pk=int(self.kwargs["listing_id"])).exists():
            raise exceptions.NotFound("No Listing matches the given query")
        for offer in self.get_queryset():
            self.check_object_permissions(request, offer)
        return super().list(request, *args, **kwargs)
