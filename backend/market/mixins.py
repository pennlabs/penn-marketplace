from market.models import Item, Sublet


class DefaultOrderMixin:
    default_ordering = ["id"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not qs.query.order_by:
            qs = qs.order_by(*self.default_ordering)
        return qs


class ListingTypeMixin:
    def get_listing_type(self, obj):
        for subclass in (Item, Sublet):
            try:
                getattr(obj, subclass.__name__.lower())
                return subclass.__name__.lower()
            except subclass.DoesNotExist:
                continue
        return "other"

    def get_additional_data(self, obj):
        from market.serializers import ItemDataSerializer, SubletDataSerializer

        listing_type = self.get_listing_type(obj)
        if listing_type == "item":
            serializer = ItemDataSerializer(obj.item, context=self.context)
            return serializer.data
        elif listing_type == "sublet":
            serializer = SubletDataSerializer(obj.sublet, context=self.context)
            return serializer.data
        print("UNKNOWN LISTING TYPE FOR ADDITIONAL DATA")
        return {}
