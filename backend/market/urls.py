from django.urls import path
from rest_framework import routers

from market.views import (
    CreateImages,
    DeleteImage,
    Favorites,
    Listings,
    Offers,
    OffersMade,
    OffersReceived,
    Tags,
    Types,
    UserFavorites,
)

app_name = "market"

router = routers.DefaultRouter()
router.register(r"listings", Listings, basename="listings")

additional_urls = [
    # List of all amenities
    path("tags/", Tags.as_view(), name="tags"),
    # List of all types
    path("types/", Types.as_view(), name="types"),
    # All favorites for user
    path("favorites/", UserFavorites.as_view(), name="user-favorites"),
    # All offers made by user
    path("offers/made/", OffersMade.as_view(), name="offers-made"),
    # All offers for an listing owned by user
    path("offers/received/", OffersReceived.as_view(), name="offers-received"),
    # Favorites
    # post: add a listing to the user's favorites
    # delete: remove a listing from the user's favorites
    path(
        "listings/<listing_id>/favorites/",
        Favorites.as_view({"post": "create", "delete": "destroy"}),
    ),
    # Offers
    # get: list all offers for an listing
    # post: create an offer for an listing
    # delete: delete an offer for an listing
    path(
        "listings/<listing_id>/offers/",
        Offers.as_view({"get": "list", "post": "create", "delete": "destroy"}),
    ),
    # Image Creation
    path("listings/<listing_id>/images/", CreateImages.as_view()),
    # Image Deletion
    path("listings/images/<image_id>/", DeleteImage.as_view()),
]

urlpatterns = router.urls + additional_urls
