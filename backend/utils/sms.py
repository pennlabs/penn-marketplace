import random
import string

from django.conf import settings
from twilio.rest import Client


def generate_verification_code():
    return "".join(random.choices(string.digits, k=6))


def send_verification_sms(phone_number, code):
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"Penn Marketplace: Your verification code is: {code}",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone_number,
        )
        return message.sid
    except Exception as e:
        print(f"Error sending verification SMS: {e}")
        return None


def send_offer_notification_sms(phone_number, listing_title):
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=(
                f'Penn Marketplace: You received a new offer on "{listing_title}"! '
                "Log in to view it."
            ),
            from_=settings.TWILIO_PHONE_NUMBER,
            to=str(phone_number),
        )
        return message.sid
    except Exception as e:
        print(f"Error sending offer notification SMS: {e}")
        return None
