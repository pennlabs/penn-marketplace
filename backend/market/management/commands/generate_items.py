import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from market.models import Item, Category

User = get_user_model()


class Command(BaseCommand):
    help = 'Generate 50 random items for testing'

    def handle(self, *args, **options):
        # Create or get a test user
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'testuser@example.com',
                'first_name': 'Test',
                'last_name': 'User',
            }
        )
        if created:
            user.set_password('testpassword123')
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Created test user: {user.username}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Using existing user: {user.username}'))

        # Categories data
        categories_data = [
            "Art", "Books", "Clothing", "Electronics", "Furniture",
            "Home and Garden", "Music", "Other", "Tools", "Vehicles"
        ]

        # Create categories if they don't exist
        categories = []
        for cat_name in categories_data:
            category, created = Category.objects.get_or_create(name=cat_name)
            categories.append(category)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {cat_name}'))

        # Sample data for generating items
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

        descriptions = [
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

        # Generate 50 items
        items_created = 0
        for i in range(50):
            category = random.choice(categories)
            adjective = random.choice(adjectives)
            item_type = random.choice(item_types.get(category.name, ["Item"]))
            
            title = f"{adjective} {item_type}"
            description = random.choice(descriptions)
            
            # Random price between $5 and $500
            price = Decimal(random.uniform(5, 500)).quantize(Decimal('0.01'))
            
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
                self.stdout.write(f'Created item {items_created}: {title} - ${price}')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating item: {str(e)}'))

        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully created {items_created} items!'))
        self.stdout.write(self.style.SUCCESS(f'All items are sold by user: {user.username}'))

