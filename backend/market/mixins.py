from market.models import Item, Sublet


def get_listing_type(obj):
    for subclass in (Item, Sublet):
        try:
            getattr(obj, subclass.__name__.lower())
            return subclass.__name__.lower()
        except subclass.DoesNotExist:
            continue
    raise ValueError(f"Listing {obj.pk} is neither an Item nor a Sublet")


class DefaultOrderMixin:
    default_ordering = ["id"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not qs.query.order_by:
            qs = qs.order_by(*self.default_ordering)
        return qs


class ListingTypeMixin:
    # a list shares one context, so this is one query per page, not one per listing
    def get_is_favorited(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        if "favorited_ids" not in self.context:
            self.context["favorited_ids"] = set(
                request.user.listings_favorited.values_list("id", flat=True)
            )
        return obj.id in self.context["favorited_ids"]

    def get_listing_type(self, obj):
        return get_listing_type(obj)

    def get_additional_data(self, obj):
        from market.serializers import ItemDataSerializer, SubletDataSerializer

        listing_type = self.get_listing_type(obj)
        if listing_type == "item":
            serializer = ItemDataSerializer(obj.item, context=self.context)
            return serializer.data
        serializer = SubletDataSerializer(obj.sublet, context=self.context)
        return serializer.data
