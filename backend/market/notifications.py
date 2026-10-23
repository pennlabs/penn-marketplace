from market.models import Notification


def notify(recipient, type, data=None):
    return Notification.objects.create(recipient=recipient, type=type, data=data or {})
