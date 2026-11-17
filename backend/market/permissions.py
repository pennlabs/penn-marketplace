from rest_framework import permissions


class IsSuperUser(permissions.BasePermission):
    """
    Grants permission if the current user is a superuser.
    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser

    def has_permission(self, request, view):
        return request.user.is_superuser


class ListingOwnerPermission(permissions.BasePermission):
    """
    Custom permission to allow the owner of a Listing to edit or delete it.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Check if the user is the owner of the Listing.
        return request.method in permissions.SAFE_METHODS or obj.seller == request.user


class ListingImageOwnerPermission(permissions.BasePermission):
    """
    Custom permission to allow the owner of a ListingImage to edit or delete it.

    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Check if the user is the owner of the Listing.
        return (
            request.method in permissions.SAFE_METHODS
            or obj.listing.seller == request.user
        )


class ListingOwnerOffersPermission(permissions.BasePermission):
    """
    The listing seller may act on an Offer for their listing.
    Use only on views/actions where that is intended (e.g. list offers, PATCH status).
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return obj.listing.seller == request.user


class OfferOwnerPermission(permissions.BasePermission):
    """
    The user who created the offer may act on that Offer.
    Use only on buyer-facing views (e.g. withdraw offer, PATCH details).
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id
