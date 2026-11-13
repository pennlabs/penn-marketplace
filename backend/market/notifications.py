from market.models import Notification


def notify(recipient, notification_type, data=None, offer=None):
    return Notification.objects.create(
        recipient=recipient, type=notification_type, data=data or {}, offer=offer
    )
