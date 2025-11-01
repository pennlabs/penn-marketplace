from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as ModelValidationError
from phonenumber_field.serializerfields import PhoneNumberField
from profanity_check import predict
from rest_framework.serializers import (
    ImageField,
    ModelSerializer,
    SerializerMethodField,
    SlugRelatedField,
    ValidationError,
)

from market.mixins import ListingTypeMixin
from market.models import Category, Item, Listing, ListingImage, Offer, Sublet, Tag

User = get_user_model()


class TagSerializer(ModelSerializer):
    class Meta:
        model = Tag
        fields = ["name"]
        read_only_fields = fields


class OfferSerializer(ModelSerializer):
    phone_number = PhoneNumberField()

    class Meta:
        model = Offer
        fields = "__all__"
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
    
    class Meta:
        model = Item
        fields = ['condition', 'category']


class SubletDataSerializer(ModelSerializer):
    class Meta:
        model = Sublet
        fields = ['address', 'beds', 'baths', 'start_date', 'end_date']


# Unified serializer for all listing types (Items and Sublets); used for CRUD operations
class ListingSerializer(ListingTypeMixin, ModelSerializer):
    LISTING_TYPE_CONFIG = {
        "item": {
            "required_fields": ["condition", "category"],
            "model": Item,
        },
        "sublet": {
            "required_fields": ["address", "beds", "baths", "start_date", "end_date"],
            "model": Sublet,
        },
    }

    images = ListingImageSerializer(many=True, required=False, read_only=True)
    tags = SlugRelatedField(many=True, slug_field="name", queryset=Tag.objects.all())
    listing_type = SerializerMethodField()
    additional_data = SerializerMethodField()

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
                raise ValidationError({
                    "listing_type": "This field is required for creating a listing."
                })

            if listing_type not in self.LISTING_TYPE_CONFIG:
                valid_types = ", ".join(self.LISTING_TYPE_CONFIG.keys())
                raise ValidationError({
                    "listing_type": f"Must be one of: {valid_types}"
                })
            
            config = self.LISTING_TYPE_CONFIG[listing_type]
            required_fields = config["required_fields"]
            
            missing_fields = [f for f in required_fields if f not in additional_data]
            if missing_fields:
                raise ValidationError({
                    "additional_data": {
                        f: f"This field is required for {listing_type}"
                        for f in missing_fields
                    }
                })
        
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
            raise ValidationError({
                "listing_type": f"Must be one of: {valid_types}"
            })
        
        try:
            return create_method(validated_data, additional_data)
        except ModelValidationError as e:
            raise ValidationError(e.message_dict if hasattr(e, "message_dict") else e.messages)
    
    def _create_item(self, validated_data, additional_data):
        category_name = additional_data.get("category")
        category = Category.objects.filter(name=category_name).first()
        if not category:
            raise ValidationError({
                "additional_data": {
                    "category": f"Category '{category_name}' does not exist."
                }
            })
        
        return Item.objects.create(
            condition=additional_data.get("condition"),
            category=category,
            **validated_data
        )
    
    def _create_sublet(self, validated_data, additional_data):
        return Sublet.objects.create(
            address=additional_data.get("address"),
            beds=additional_data.get("beds"),
            baths=additional_data.get("baths"),
            start_date=additional_data.get("start_date"),
            end_date=additional_data.get("end_date"),
            **validated_data
        )

    def update(self, instance, validated_data):
        additional_data = self.initial_data.get("additional_data", {})
        
        try:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            if additional_data:
                if isinstance(instance, Item):
                    self._update_item(instance, additional_data)
                elif isinstance(instance, Sublet):
                    self._update_sublet(instance, additional_data)
            
            instance.save()
            return instance
            
        except ModelValidationError as e:
            raise ValidationError(e.message_dict if hasattr(e, "message_dict") else e.messages)
    
    def _update_item(self, instance, additional_data):
        if "condition" in additional_data:
            instance.condition = additional_data["condition"]
        
        if "category" in additional_data:
            category = Category.objects.filter(name=additional_data["category"]).first()
            if category:
                instance.category = category
    
    def _update_sublet(self, instance, additional_data):
        sublet_fields = ["address", "beds", "baths", "start_date", "end_date"]
        for field in sublet_fields:
            if field in additional_data:
                setattr(instance, field, additional_data[field])


# Read-only serializer for use when reading a single listing
class ListingSerializerPublic(ListingTypeMixin, ModelSerializer):
    buyer_count = SerializerMethodField()
    favorite_count = SerializerMethodField()
    tags = SlugRelatedField(many=True, slug_field="name", queryset=Tag.objects.all())
    images = ListingImageURLSerializer(many=True)
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
