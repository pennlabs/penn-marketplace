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


class OfferOwnerPermission(permissions.BasePermission):
    """
    - GET: offer owner can view offers on their listing
    - DELETE: offer owner can delete their own offer
    - PATCH: offer owner can update offer status
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.listing.seller == request.user

        if request.method in ("PATCH", "PUT"):
            return obj.listing.seller == request.user

        return obj.user == request.user
