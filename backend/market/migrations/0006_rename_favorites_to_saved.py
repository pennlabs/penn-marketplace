from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("market", "0005_sublet_true_latitude_sublet_true_longitude"),
    ]

    operations = [
        migrations.RenameField(
            model_name="listing",
            old_name="favorites",
            new_name="saved",
        ),
        migrations.AlterField(
            model_name="listing",
            name="saved",
            field=models.ManyToManyField(
                blank=True, related_name="listings_saved", to=settings.AUTH_USER_MODEL
            ),
        ),
    ]
