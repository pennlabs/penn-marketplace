from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField


class User(AbstractUser):
    """
    This extends the User model from django-labs-account
    to add phonenumber related fields
    """

    phone_number = PhoneNumberField(null=True, blank=True)
    phone_verified = models.BooleanField(default=False)
    phone_verified_at = models.DateTimeField(null=True, blank=True)


class Offer(models.Model):
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "listing"], name="unique_offer_market"
            )
        ]
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["listing"]),
            models.Index(fields=["created_at"]),
        ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="offers")
    listing = models.ForeignKey(
        "Listing", on_delete=models.CASCADE, related_name="offers_received"
    )
    offered_price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    message = models.TextField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Offer for {self.listing} made by {self.user}"


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=255)

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

    seller = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="listings_created"
    )
    buyers = models.ManyToManyField(
        User, through=Offer, related_name="listings_offered", blank=True
    )
    tags = models.ManyToManyField(Tag, blank=True)
    favorites = models.ManyToManyField(
        User, related_name="listings_favorited", blank=True
    )

    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    external_link = models.URLField(max_length=255, null=True, blank=True)
    price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    negotiable = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"{self.title} by {self.seller}"


class ListingImage(models.Model):
    listing = models.ForeignKey(
        Listing, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="marketplace/images")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"Image for {self.listing}"


class Item(Listing):
    class Condition(models.TextChoices):
        NEW = "NEW", "New"
        LIKE_NEW = "LIKE_NEW", "Used - Like New"
        GOOD = "GOOD", "Used - Good"
        FAIR = "FAIR", "Used - Fair"

    condition = models.CharField(
        max_length=50, choices=Condition.choices, default=Condition.NEW
    )
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="items"
    )


class Sublet(Listing):
    address = models.CharField(max_length=255)
    beds = models.PositiveIntegerField()
    baths = models.PositiveIntegerField()
    start_date = models.DateField()
    end_date = models.DateField()

    def clean(self):
        super().clean()
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValidationError({"end_date": "End date must be after start date"})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
