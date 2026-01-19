import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta, date
from market.models import Item, Sublet, Category

User = get_user_model()


class Command(BaseCommand):
    help = "Generate 25 random items and 25 random sublets for testing"

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username="testuser",
            defaults={
                "email": "testuser@example.com",
                "first_name": "Test",
                "last_name": "User",
            }
        )
        if created:
            user.set_password("testpassword123")
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created test user: {user.username}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Using existing user: {user.username}"))

        categories_data = [
            "Art", "Books", "Clothing", "Electronics", "Furniture",
            "Home and Garden", "Music", "Other", "Tools", "Vehicles"
        ]

        categories = []
        for cat_name in categories_data:
            category, created = Category.objects.get_or_create(name=cat_name)
            categories.append(category)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created category: {cat_name}"))

        adjectives = [
            "Vintage", "Modern", "Classic", "Brand New", "Like New",
            "Gently Used", "Rare", "Limited Edition", "Premium", "Budget-Friendly",
            "Professional", "Student", "Portable", "Compact", "Spacious"
        ]

        item_types = {
            "Art": ["Painting", "Sculpture", "Print", "Drawing", "Poster"],
            "Books": ["Textbook", "Novel", "Magazine", "Comic Book", "Reference Book"],
            "Clothing": ["Jacket", "Shirt", "Pants", "Dress", "Shoes"],
            "Electronics": ["Laptop", "Phone", "Tablet", "Headphones", "Monitor"],
            "Furniture": ["Chair", "Desk", "Table", "Bookshelf", "Lamp"],
            "Home and Garden": ["Plant", "Rug", "Curtains", "Kitchen Set", "Decoration"],
            "Music": ["Guitar", "Keyboard", "Speakers", "Vinyl Record", "Music Stand"],
            "Other": ["Bike", "Skateboard", "Game Console", "Camera", "Watch"],
            "Tools": ["Toolbox", "Drill", "Hammer Set", "Measuring Tape", "Saw"],
            "Vehicles": ["Bicycle", "Scooter", "Skateboard", "Motorcycle Helmet", "Car Seat"]
        }

        item_descriptions = [
            "Great condition, barely used!",
            "Perfect for students. Must sell before graduation.",
            "Moving out sale - need gone ASAP!",
            "Works perfectly, no issues.",
            "Excellent quality, well maintained.",
            "Amazing deal, don't miss out!",
            "Slight wear and tear but fully functional.",
            "Like new condition, original packaging included.",
            "Used for one semester only.",
            "Selling because I upgraded to a newer model.",
        ]

        conditions = [Item.Condition.NEW, Item.Condition.LIKE_NEW, Item.Condition.GOOD, Item.Condition.FAIR]

        # generate 25 items
        items_created = 0
        self.stdout.write(self.style.WARNING("\n=== Generating Items ==="))
        for i in range(25):
            category = random.choice(categories)
            adjective = random.choice(adjectives)
            item_type = random.choice(item_types.get(category.name, ["Item"]))
            
            title = f"{adjective} {item_type}"
            description = random.choice(item_descriptions)
            
            # Random price between $5 and $500
            price = Decimal(random.uniform(5, 500)).quantize(Decimal("0.01"))
            
            # Random condition
            condition = random.choice(conditions)
            
            # Negotiable - 70% chance of being negotiable
            negotiable = random.random() < 0.7
            
            # Expires in 30-90 days
            days_until_expiry = random.randint(30, 90)
            expires_at = timezone.now() + timedelta(days=days_until_expiry)
            
            try:
                item = Item.objects.create(
                    seller=user,
                    title=title,
                    description=description,
                    price=price,
                    negotiable=negotiable,
                    expires_at=expires_at,
                    condition=condition,
                    category=category
                )
                items_created += 1
                self.stdout.write(f"Created item {items_created}: {title} - ${price}")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating item: {str(e)}"))

        sublet_adjectives = [
            "Cozy", "Spacious", "Modern", "Renovated", "Charming",
            "Bright", "Quiet", "Convenient", "Luxurious", "Affordable"
        ]

        sublet_types = [
            "Studio Apartment", "1BR Apartment", "2BR Apartment", "3BR Apartment",
            "Room in Shared Apartment", "Loft", "Townhouse", "House"
        ]

        neighborhoods = [
            "University City", "Center City", "Rittenhouse Square", "Fairmount",
            "Graduate Hospital", "Old City", "Northern Liberties", "Fishtown",
            "Queen Village", "South Philadelphia"
        ]

        street_names = [
            "Walnut", "Chestnut", "Spruce", "Pine", "Locust", "Market",
            "Sansom", "Baltimore", "Lombard", "South", "Arch", "Race"
        ]

        sublet_descriptions = [
            "Perfect location near campus! Walking distance to classes and libraries.",
            "Newly renovated with modern appliances. Available for summer sublet.",
            "Great for students! Utilities included, close to public transportation.",
            "Furnished apartment in a safe, quiet neighborhood. Perfect for studying.",
            "Beautiful apartment with lots of natural light. Must see!",
            "Ideal for summer internship. Flexible lease terms available.",
            "Close to restaurants, shops, and nightlife. Very convenient location.",
            "Spacious and clean. Perfect for roommates or single occupant.",
            "Pet-friendly building with on-site laundry. Great amenities!",
            "Amazing deal for the location! Available immediately.",
        ]

        # generate 25 sublets
        sublets_created = 0
        self.stdout.write(self.style.WARNING("\n=== Generating Sublets ==="))
        for i in range(25):
            adjective = random.choice(sublet_adjectives)
            sublet_type = random.choice(sublet_types)
            
            title = f"{adjective} {sublet_type}"
            description = random.choice(sublet_descriptions)
            
            # generate random address
            street_number = random.randint(100, 4999)
            street = random.choice(street_names)
            neighborhood = random.choice(neighborhoods)
            address = f"{street_number} {street} St, {neighborhood}, Philadelphia, PA"
            
            # random beds and baths
            beds = random.randint(0, 4)  # 0 for studio
            baths = random.randint(1, 3)
            
            # random price between $500 and $3000 per month
            price = Decimal(random.uniform(500, 3000)).quantize(Decimal("0.01"))
            
            # negotiable - 60% chance of being negotiable
            negotiable = random.random() < 0.6
            
            # start date: between now and 90 days from now
            days_until_start = random.randint(0, 90)
            start_date = date.today() + timedelta(days=days_until_start)
            
            # end date: 1-12 months after start date
            months_duration = random.randint(1, 12)
            days_duration = months_duration * 30
            end_date = start_date + timedelta(days=days_duration)
            
            # listing expires 30 days before start date or in 60 days, whichever is sooner
            days_until_expiry = min(days_until_start + 30, 60)
            if days_until_expiry < 1:
                days_until_expiry = 30
            expires_at = timezone.now() + timedelta(days=days_until_expiry)
            
            try:
                sublet = Sublet.objects.create(
                    seller=user,
                    title=title,
                    description=description,
                    price=price,
                    negotiable=negotiable,
                    expires_at=expires_at,
                    address=address,
                    beds=beds,
                    baths=baths,
                    start_date=start_date,
                    end_date=end_date
                )
                sublets_created += 1
                bed_str = "Studio" if beds == 0 else f"{beds} bed"
                self.stdout.write(
                    f"Created sublet {sublets_created}: {title} - ${price}/mo ({bed_str}, {baths} bath)"
                )
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating sublet: {str(e)}"))

        # summary
        self.stdout.write(self.style.SUCCESS(f"\n=== Summary ==="))
        self.stdout.write(self.style.SUCCESS(f"Successfully created {items_created} items!"))
        self.stdout.write(self.style.SUCCESS(f"Successfully created {sublets_created} sublets!"))
        self.stdout.write(self.style.SUCCESS(f"All listings are created by user: {user.username}"))
