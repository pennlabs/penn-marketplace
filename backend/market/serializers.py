from django.contrib.auth import get_user_model
from phonenumber_field.serializerfields import PhoneNumberField
from profanity_check import predict
from rest_framework import serializers

from market.models import Listing, ListingImage, Offer, Tag, Type

User = get_user_model()


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"
        read_only_fields = [field.name for field in model._meta.fields]


# TODO: We could make a Read-Only Serializer in a PennLabs core library.
# This could inherit from that.
class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Type
        fields = "__all__"
        read_only_fields = [field.name for field in model._meta.fields]


class OfferSerializer(serializers.ModelSerializer):
    phone_number = PhoneNumberField()

    class Meta:
        model = Offer
        fields = "__all__"
        read_only_fields = ["id", "created_at", "user"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


# Create/Update Image Serializer
class ListingImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = ListingImage
        fields = "__all__"


# Browse images
class ListingImageURLSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        image = obj.image

        if not image:
            return None
        if image.url.startswith("http"):
            return image.url
        elif "request" in self.context:
            return self.context["request"].build_absolute_uri(image.url)
        else:
            return image.url

    class Meta:
        model = ListingImage
        fields = "__all__"
        read_only_fields = [field.name for field in model._meta.fields]


# complex listing serializer for use in C/U/D + getting info about a singular listing
class ListingSerializer(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, required=False, read_only=True)

    class Meta:
        model = Listing
        fields = "__all__"
        read_only_fields = [
            "id",
            "created_at",
            "seller",
            "buyers",
            "images",
            "favorites",
        ]

    def validate_title(self, value):
        if self.contains_profanity(value):
            raise serializers.ValidationError("The title contains inappropriate language.")
        return value

    def validate_description(self, value):
        if self.contains_profanity(value):
            raise serializers.ValidationError("The description contains inappropriate language.")
        return value

    def contains_profanity(self, text):
        return predict([text])[0]

    def create(self, validated_data):
        self.validate(validated_data)
        validated_data["seller"] = self.context["request"].user
        return super().create(validated_data)


# Read-only serializer for use when reading a single listing
class ListingSerializerPublic(serializers.ModelSerializer):
    buyer_count = serializers.SerializerMethodField()
    favorite_count = serializers.SerializerMethodField()
    images = ListingImageURLSerializer(many=True)

    class Meta:
        model = Listing
        fields = [
            "id",
            "seller",
            "buyer_count",
            "tags",
            "type",
            "title",
            "description",
            "external_link",
            "price",
            "negotiable",
            "expires_at",
            "images",
            "favorite_count",
            "additional_data",
        ]
        read_only_fields = fields

    def get_buyer_count(self, obj):
        return obj.buyers.count()

    def get_favorite_count(self, obj):
        return obj.favorites.count()


# Read-only serializer for use when pulling all listings /etc
class ListingSerializerList(serializers.ModelSerializer):
    favorite_count = serializers.SerializerMethodField()
    images = ListingImageURLSerializer(many=True)

    class Meta:
        model = Listing
        fields = [
            "id",
            "seller",
            "tags",
            "type",
            "title",
            "price",
            "expires_at",
            "images",
            "favorite_count",
        ]
        read_only_fields = fields

    def get_favorite_count(self, obj):
        return obj.favorites.count()
