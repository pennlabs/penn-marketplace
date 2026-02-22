
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as ModelValidationError
from profanity_check import predict
from rest_framework.serializers import (
    BooleanField,
    DateTimeField,
    ImageField,
    ModelSerializer,
    SerializerMethodField,
    SlugRelatedField,
    URLField,
    ValidationError,
)

from market.mixins import ListingTypeMixin
from market.models import Category, Item, Listing, ListingImage, Offer, Sublet, Tag


User = get_user_model()


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "phone_verified",
        ]
        read_only_fields = fields


class TagSerializer(ModelSerializer):
    class Meta:
        model = Tag
        fields = ["name"]
        read_only_fields = fields


class OfferSerializer(ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Offer
        fields = ["id", "user", "listing", "offered_price", "message", "created_at"]
        read_only_fields = ["id", "created_at", "user"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


# Create/Update Image Serializer
class ListingImageSerializer(ModelSerializer):
    image = ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = ListingImage
        fields = "__all__"


# Browse images
class ListingImageURLSerializer(ModelSerializer):
    image_url = SerializerMethodField()

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


class ItemDataSerializer(ModelSerializer):
    category = SlugRelatedField(slug_field="name", read_only=True)
    condition = SerializerMethodField()

    class Meta:
        model = Item
        fields = ["condition", "category"]

    def get_condition(self, obj):
        return obj.get_condition_display()


class SubletDataSerializer(ModelSerializer):
    latitude = SerializerMethodField()
    longitude = SerializerMethodField()

    class Meta:
        model = Sublet
        fields = ["street_address", "beds", "baths", "start_date", "end_date",
            "latitude", "longitude"]

    def get_latitude(self, obj):
        if obj.approximate_latitude:
            return float(obj.approximate_latitude)
        return None

    def get_longitude(self, obj):
        if obj.approximate_longitude:
            return float(obj.approximate_longitude)
        return None

# Unified serializer for all listing types (Items and Sublets); used for CRUD operations
class ListingSerializer(ListingTypeMixin, ModelSerializer):
    LISTING_TYPE_CONFIG = {
        "item": {
            "required_fields": ["condition", "category"],
            "model": Item,
        },
        "sublet": {
            "required_fields": [
                "street_address",
                "beds",
                "baths",
                "start_date",
                "end_date",
            ],
            "model": Sublet,
        },
    }

    images = ListingImageSerializer(many=True, required=False, read_only=True)
    tags = SlugRelatedField(
        many=True,
        slug_field="name",
        queryset=Tag.objects.all(),
        required=False,
        allow_empty=True,
    )
    seller = UserSerializer(read_only=True)
    listing_type = SerializerMethodField()
    additional_data = SerializerMethodField()
    external_link = URLField(required=False, allow_blank=True, allow_null=True)
    negotiable = BooleanField(required=False, default=True)
    expires_at = DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Listing
        fields = [
            "id",
            "seller",
            "buyers",
            "tags",
            "favorites",
            "title",
            "description",
            "external_link",
            "price",
            "negotiable",
            "created_at",
            "expires_at",
            "images",
            "listing_type",
            "additional_data",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "seller",
            "buyers",
            "images",
            "favorites",
        ]

    def validate(self, attrs):
        if not self.instance:
            listing_type = self.initial_data.get("listing_type")
            additional_data = self.initial_data.get("additional_data", {})

            if not listing_type:
                raise ValidationError(
                    {"listing_type": "This field is required for creating a listing."}
                )

            if listing_type not in self.LISTING_TYPE_CONFIG:
                valid_types = ", ".join(self.LISTING_TYPE_CONFIG.keys())
                raise ValidationError(
                    {"listing_type": f"Must be one of: {valid_types}"}
                )

            config = self.LISTING_TYPE_CONFIG[listing_type]
            required_fields = config["required_fields"]

            missing_fields = [f for f in required_fields if f not in additional_data]
            if missing_fields:
                raise ValidationError(
                    {
                        "additional_data": dict.fromkeys(
                            missing_fields, f"This field is required for {listing_type}"
                        )
                    }
                )

        return super().validate(attrs)

    def validate_title(self, value):
        if self.contains_profanity(value):
            raise ValidationError("The title contains inappropriate language.")
        return value

    def validate_description(self, value):
        if self.contains_profanity(value):
            raise ValidationError("The description contains inappropriate language.")
        return value

    def contains_profanity(self, text):
        return predict([text])[0]

    def create(self, validated_data):
        validated_data["seller"] = self.context["request"].user

        listing_type = self.initial_data.get("listing_type")
        additional_data = self.initial_data.get("additional_data", {})

        create_method_name = f"_create_{listing_type}"
        create_method = getattr(self, create_method_name, None)

        if not create_method:
            valid_types = ", ".join(self.LISTING_TYPE_CONFIG.keys())
            raise ValidationError({"listing_type": f"Must be one of: {valid_types}"})

        try:
            return create_method(validated_data, additional_data)
        except ModelValidationError as e:
            raise ValidationError(
                e.message_dict if hasattr(e, "message_dict") else e.messages
            ) from e

    def _create_item(self, validated_data, additional_data):
        category_name = additional_data.get("category")
        category = Category.objects.filter(name=category_name).first()
        if not category:
            raise ValidationError(
                {
                    "additional_data": {
                        "category": f"Category '{category_name}' does not exist."
                    }
                }
            )

        tags = validated_data.pop("tags", None)

        item = Item.objects.create(
            condition=additional_data.get("condition"),
            category=category,
            **validated_data,
        )

        if tags:
            item.tags.set(tags)

        return item

    def _create_sublet(self, validated_data, additional_data):
        tags = validated_data.pop("tags", None)

        latitude = additional_data.get("latitude")
        longitude = additional_data.get("longitude")


        if latitude is not None:
            latitude = float(latitude)
        if longitude is not None:
            longitude = float(longitude)

        sublet = Sublet.objects.create(
            street_address=additional_data.get("street_address"),
            beds=additional_data.get("beds"),
            baths=additional_data.get("baths"),
            start_date=additional_data.get("start_date"),
            end_date=additional_data.get("end_date"),
            latitude=latitude,
            longitude=longitude,
            **validated_data,
        )

        if tags:
            sublet.tags.set(tags)

        return sublet

    def update(self, instance, validated_data):
        listing_type = self.initial_data.get("listing_type")
        additional_data = self.initial_data.get("additional_data", {})

        try:
            tags = validated_data.pop("tags", None)
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            if tags:
                instance.tags.set(tags)

            if listing_type and listing_type != self.get_listing_type(instance):
                raise ValidationError(
                    {"listing_type": "Cannot change listing type on update."}
                )

            if additional_data:
                if self.get_listing_type(instance) == "item":
                    self._update_item(instance, additional_data)
                elif self.get_listing_type(instance) == "sublet":
                    self._update_sublet(instance, additional_data)

            instance.save()
            return instance

        except ModelValidationError as e:
            raise ValidationError(
                e.message_dict if hasattr(e, "message_dict") else e.messages
            ) from e

    def _update_item(self, instance, additional_data):
        item = instance.item
        if "condition" in additional_data:
            item.condition = additional_data["condition"]

        if "category" in additional_data:
            category = Category.objects.filter(name=additional_data["category"]).first()
            if category:
                item.category = category
        item.full_clean()
        item.save()

    def _update_sublet(self, instance, additional_data):
        sublet = instance.sublet
        sublet_fields = ["street_address", "beds", "baths", "start_date", "end_date"]
        for field in sublet_fields:
            if field in additional_data:
                setattr(sublet, field, additional_data[field])
        if "latitude" in additional_data:
            sublet.latitude = float(additional_data["latitude"])
        if "longitude" in additional_data:
            sublet.longitude = float(additional_data["longitude"])
        sublet.full_clean()
        sublet.save()


# Read-only serializer for use when reading a single listing
class ListingSerializerPublic(ListingTypeMixin, ModelSerializer):
    buyer_count = SerializerMethodField()
    favorite_count = SerializerMethodField()
    tags = SlugRelatedField(many=True, slug_field="name", queryset=Tag.objects.all())
    images = ListingImageURLSerializer(many=True)
    seller = UserSerializer(read_only=True)
    listing_type = SerializerMethodField()
    additional_data = SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "seller",
            "buyer_count",
            "tags",
            "title",
            "description",
            "external_link",
            "price",
            "negotiable",
            "expires_at",
            "images",
            "favorite_count",
            "listing_type",
            "additional_data",
        ]
        read_only_fields = fields

    def get_buyer_count(self, obj):
        return obj.buyers.count()

    def get_favorite_count(self, obj):
        return obj.favorites.count()


# Read-only serializer for use when pulling all listings /etc
class ListingSerializerList(ListingTypeMixin, ModelSerializer):
    favorite_count = SerializerMethodField()
    tags = SlugRelatedField(many=True, slug_field="name", queryset=Tag.objects.all())
    images = ListingImageURLSerializer(many=True)
    seller = UserSerializer(read_only=True)
    listing_type = SerializerMethodField()
    additional_data = SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "seller",
            "tags",
            "title",
            "price",
            "expires_at",
            "images",
            "favorite_count",
            "listing_type",
            "additional_data",
        ]
        read_only_fields = fields

    def get_favorite_count(self, obj):
        return obj.favorites.count()
