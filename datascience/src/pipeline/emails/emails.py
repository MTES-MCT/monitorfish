import smtplib
from email.message import EmailMessage

from config import (
    MONITORFISH_EMAIL_ADDRESS,
    MONITORFISH_EMAIL_SERVER_PORT,
    MONITORFISH_EMAIL_SERVER_URL,
)


def create_html_email(to: str, subject: str, html: str) -> EmailMessage:

    assert MONITORFISH_EMAIL_ADDRESS is not None

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = MONITORFISH_EMAIL_ADDRESS
    msg["To"] = to

    msg.add_alternative(html, subtype="html")

    return msg


def send_email(msg: EmailMessage):

    assert MONITORFISH_EMAIL_SERVER_URL is not None
    assert MONITORFISH_EMAIL_SERVER_PORT is not None

    with smtplib.SMTP(
        host=MONITORFISH_EMAIL_SERVER_URL, port=MONITORFISH_EMAIL_SERVER_PORT
    ) as s:
        s.send_message(msg)
