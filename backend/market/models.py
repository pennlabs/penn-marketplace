from django.contrib.auth import get_user_model
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField

User = get_user_model()


class Offer(models.Model):
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "listing"], name="unique_offer_market")
        ]
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["listing"]),
            models.Index(fields=["created_at"]),
        ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="offers")
    listing = models.ForeignKey("Listing", on_delete=models.CASCADE)
    email = models.EmailField(max_length=255, null=True, blank=True)
    phone_number = PhoneNumberField(null=True, blank=True)
    message = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Offer for {self.listing} made by {self.user}"


class Attribute(models.Model):
    name = models.CharField(max_length=255, primary_key=True)

    def __str__(self):
        return self.name


class Type(models.Model):
    name = models.CharField(max_length=50, primary_key=True)
    required_attributes = models.ManyToManyField(
        Attribute, blank=True, related_name="types_required"
    )
    recommended_attributes = models.ManyToManyField(
        Attribute, blank=True, related_name="types_recommended"
    )

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=255, primary_key=True)

    def __str__(self):
        return self.name


class Listing(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=["title"]),
            models.Index(fields=["price"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["expires_at"]),
            models.Index(fields=["negotiable"]),
        ]

    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="listings_created")
    buyers = models.ManyToManyField(
        User, through=Offer, related_name="listings_offered", blank=True
    )
    tags = models.ManyToManyField(Tag, blank=True)
    type = models.ForeignKey(Type, on_delete=models.CASCADE)
    favorites = models.ManyToManyField(User, related_name="listings_favorited", blank=True)

    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    external_link = models.URLField(max_length=255, null=True, blank=True)
    price = models.FloatField()
    negotiable = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    additional_data = models.JSONField(null=True, blank=True, default=dict)

    def __str__(self):
        return f"{self.title} by {self.seller}"

    def clean(self):
        super().clean()
        required_fields = self.type.required_attributes.values_list("name", flat=True)
        if missing := [field for field in required_fields if field not in self.additional_data]:
            raise ValueError(f"Missing required fields for type {self.type}: {missing}")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="marketplace/images")
