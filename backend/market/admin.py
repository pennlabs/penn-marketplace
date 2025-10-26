from django.contrib import admin
from django.utils.html import mark_safe

from market.models import Listing, ListingImage, Offer, Tag, Type


class ListingAdmin(admin.ModelAdmin):

    def image_tag(self, instance):
        images = [
            '<img src="%s" height="150" />' % image.image.url for image in instance.images.all()
        ]
        return mark_safe("<br>".join(images))

    image_tag.short_description = "Listing Images"
    readonly_fields = ("image_tag",)


admin.site.register(Offer)
admin.site.register(Tag)
admin.site.register(Type)
admin.site.register(Listing, ListingAdmin)
admin.site.register(ListingImage)
