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

from market.models import Category, Item, ItemImage, Offer, Sublet, Tag
from market.pagination import PageSizeOffsetPagination
from market.permissions import (
    IsSuperUser,
    ItemImageOwnerPermission,
    ItemOwnerPermission,
    OfferOwnerPermission,
    SubletOwnerPermission,
)
from market.serializers import (
    CategorySerializer,
    ItemImageSerializer,
    ItemImageURLSerializer,
    ItemSerializer,
    ItemSerializerList,
    ItemSerializerPublic,
    OfferSerializer,
    SubletSerializer,
    SubletSerializerList,
    SubletSerializerPublic,
    TagSerializer,
)

User = get_user_model()


class Tags(ListAPIView):
    serializer_class = TagSerializer
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        return Tag.objects.all()


class Categories(ListAPIView):
    serializer_class = CategorySerializer
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        return Category.objects.all()


class UserFavorites(ListAPIView):
    serializer_class = ItemSerializerList
    permission_classes = [IsAuthenticated]
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        user = self.request.user
        return user.items_favorited


# TODO: Can add feature to filter for active offers only
class OffersMade(ListAPIView):
    serializer_class = OfferSerializer
    permission_classes = [IsAuthenticated | IsSuperUser]
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        user = self.request.user
        return Offer.objects.filter(user=user)


class OffersReceived(ListAPIView):
    serializer_class = OfferSerializer
    permission_classes = [IsAuthenticated | IsSuperUser]
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        user = self.request.user
        return Offer.objects.filter(item__seller=user)


class Items(viewsets.ModelViewSet):
    """
    list:
    Returns a list of Items that match query parameters (e.g., amenities) and belong to the user.

    create:
    Create an Item.

    partial_update:
    Update certain fields in the Item. Only the owner can edit it.

    destroy:
    Delete an Item.
    """

    permission_classes = [ItemOwnerPermission | IsSuperUser]
    serializer_class = ItemSerializer
    queryset = Item.objects.filter(sublet__isnull=True)
    pagination_class = PageSizeOffsetPagination

    def get_serializer_class(self):
        if self.action == "list":
            return ItemSerializerList
        elif self.action == "retrieve" and self.get_object().seller != self.request.user:
            return ItemSerializerPublic
        else:
            return ItemSerializer

    @staticmethod
    def get_filter_dict():
        filter_dict = {
            "category": "category__name",
            "title": "title__icontains",
            "min_price": "price__gte",
            "max_price": "price__lte",
            "negotiable": "negotiable",
        }
        return filter_dict

    def list(self, request, *args, **kwargs):
        """Returns a list of Items that match query parameters and user ownership."""
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

        page = self.paginate_queryset(queryset.order_by("id"))
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class Sublets(viewsets.ModelViewSet):
    permission_classes = [SubletOwnerPermission | IsSuperUser]
    queryset = Sublet.objects.all()
    pagination_class = PageSizeOffsetPagination

    def get_serializer_class(self):
        if self.action == "list":
            return SubletSerializerList
        elif self.action == "retrieve" and self.get_object().item.seller != self.request.user:
            return SubletSerializerPublic
        else:
            return SubletSerializer

    @staticmethod
    def get_filter_dict():
        item_filter_dict = Items.get_filter_dict()
        for key, value in item_filter_dict.items():
            item_filter_dict[key] = "item__" + value
        filter_dict = {
            **item_filter_dict,
            "address": "address__icontains",
            "min_beds": "beds__gte",
            "max_beds": "beds__lte",
            "min_baths": "baths__gte",
            "max_baths": "baths__lte",
            "start_date_min": "start_date__gte",
            "start_date_max": "start_date__lte",
            "end_date_min": "end_date__gte",
            "end_date_max": "end_date__lte",
        }
        del filter_dict["category"]
        return filter_dict

    def list(self, request, *args, **kwargs):
        """Returns a filtered list of Sublets based on query parameters."""
        queryset = self.get_queryset()

        filter_dict = self.get_filter_dict()

        for param, field in filter_dict.items():
            if param_value := request.query_params.get(param):
                queryset = queryset.filter(**{field: param_value})

        for tag in request.query_params.getlist("tags"):
            queryset = queryset.filter(item__tags__name=tag)

        if request.query_params.get("seller", "false").lower() == "true":
            queryset = queryset.filter(item__seller=request.user)
        else:
            queryset = queryset.filter(item__expires_at__gte=timezone.now())

        page = self.paginate_queryset(queryset.order_by("id"))
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# TODO: This doesn't use CreateAPIView's functionality since we overrode the create method.
# Think about if there's a better way
class CreateImages(CreateAPIView):
    serializer_class = ItemImageSerializer
    http_method_names = ["post"]
    permission_classes = [ItemOwnerPermission | IsSuperUser]
    parser_classes = (
        MultiPartParser,
        FormParser,
    )

    def get_queryset(self, *args, **kwargs):
        item = get_object_or_404(Item, id=int(self.kwargs["item_id"]))
        return ItemImage.objects.filter(item=item)

    # takes an image multipart form data and creates a new image object
    def post(self, request, *args, **kwargs):
        images = request.data.getlist("images", [])
        item_id = int(self.kwargs["item_id"])
        item = get_object_or_404(Item, id=item_id)
        self.check_object_permissions(request, item)
        instances = []

        for img in images:
            img_serializer = self.get_serializer(data={"item": item_id, "image": img})
            img_serializer.is_valid(raise_exception=True)
            instances.append(img_serializer.save())

        data = ItemImageURLSerializer(instances, many=True).data
        return Response(data, status=status.HTTP_201_CREATED)


class DeleteImage(DestroyAPIView):
    serializer_class = ItemImageSerializer
    http_method_names = ["delete"]
    permission_classes = [ItemImageOwnerPermission | IsSuperUser]
    queryset = ItemImage.objects.all()

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
    serializer_class = ItemSerializer
    http_method_names = ["post", "delete"]
    permission_classes = [IsAuthenticated | IsSuperUser]
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        user = self.request.user
        return user.items_favorited

    def create(self, request, *args, **kwargs):
        item_id = int(self.kwargs["item_id"])
        queryset = self.get_queryset()
        if queryset.filter(id=item_id).exists():
            raise exceptions.ValidationError("Favorite already exists")
        item = get_object_or_404(Item, id=item_id)
        self.get_queryset().add(item)
        return Response(status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        item = get_object_or_404(queryset, pk=int(self.kwargs["item_id"]))
        self.get_queryset().remove(item)
        return Response(status=status.HTTP_204_NO_CONTENT)


class Offers(viewsets.ModelViewSet):
    """
    list:
    Returns a list of all offers for the item matching the provided ID.

    create:
    Create an offer on the item matching the provided ID.

    destroy:
    Delete the offer between the user and the item matching the ID.
    """

    permission_classes = [OfferOwnerPermission | IsSuperUser]
    serializer_class = OfferSerializer
    pagination_class = PageSizeOffsetPagination

    def get_queryset(self):
        if Item.objects.filter(pk=int(self.kwargs["item_id"])).exists():
            return Offer.objects.filter(item_id=int(self.kwargs["item_id"])).order_by("created_at")
        else:
            raise exceptions.NotFound("No Item matches the given query")

    def create(self, request, *args, **kwargs):
        # Required to be mutable since the item field is from the URL
        data = request.data.copy()
        if self.get_queryset().filter(user=self.request.user).exists():
            raise exceptions.ValidationError("Offer already exists")
        data["item"] = int(self.kwargs["item_id"])
        data["user"] = self.request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        filter = {
            "user": self.request.user,
            "item": int(self.kwargs["item_id"]),
        }
        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)
        self.perform_destroy(obj)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def list(self, request, *args, **kwargs):
        if not Item.objects.filter(pk=int(self.kwargs["item_id"])).exists():
            raise exceptions.NotFound("No Item matches the given query")
        for offer in self.get_queryset():
            self.check_object_permissions(request, offer)
        return super().list(request, *args, **kwargs)
