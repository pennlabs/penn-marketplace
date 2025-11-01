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
        if isinstance(obj, Item):
            return "item"
        elif isinstance(obj, Sublet):
            return "sublet"
        return "other"
    
    def get_additional_data(self, obj):
        from market.serializers import ItemDataSerializer, SubletDataSerializer
        
        if isinstance(obj, Item):
            serializer = ItemDataSerializer(obj, context=self.context)
            return serializer.data
        elif isinstance(obj, Sublet):
            serializer = SubletDataSerializer(obj, context=self.context)
            return serializer.data
        return {}
