class DefaultOrderMixin:
    default_ordering = ["id"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not qs.query.order_by:
            qs = qs.order_by(*self.default_ordering)
        return qs
