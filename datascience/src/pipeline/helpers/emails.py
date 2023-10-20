import io
import smtplib
from email.message import EmailMessage
from mimetypes import guess_type
from pathlib import Path
from typing import List, Union

import pypdf

from config import (
    MONITORFISH_EMAIL_ADDRESS,
    MONITORFISH_EMAIL_SERVER_PORT,
    MONITORFISH_EMAIL_SERVER_URL,
    MONITORFISH_FAX_DOMAIN,
    MONITORFISH_FAX_SERVER_PORT,
    MONITORFISH_FAX_SERVER_URL,
    MONITORFISH_SMS_DOMAIN,
    MONITORFISH_SMS_SERVER_PORT,
    MONITORFISH_SMS_SERVER_URL,
)


def create_html_email(
    to: Union[str, List[str]],
    subject: str,
    html: str,
    from_: str = MONITORFISH_EMAIL_ADDRESS,
    cc: Union[str, List[str]] = None,
    bcc: Union[str, List[str]] = None,
    images: List[Path] = None,
    attachments: dict = None,
    reply_to: str = None,
) -> EmailMessage:
    """
    Creates a `email.EmailMessage` with the defined parameters.

    Args:
        to (Union[str, List[str]]): email address or list of email addresses of
          recipient(s)
        subject (str): Subject of the email.
        html (str): html representation of the email's content.
        from_ (str, optional): `From` field. Defaults to env var
          `MONITORFISH_EMAIL_ADDRESS`.
        cc (Union[str, List[str]], optional): `Cc` field with optional email address
        (or list of email addresses) of copied recipient(s). Defaults to None.
        bcc (Union[str, List[str]], optional): `Bcc` field with optional email address
        (or list of email addresses) of hidden copied recipient(s). Defaults to None.
        from_ (str, optional): `From` field. Defaults to MONITORFISH_EMAIL_ADDRESS env
          var.
        images (List[Path], optional): List of `Path` to images on the server's file
          system to attach to the email. These images can be displayed in the html body
          of the email by referencing them in the `src` attribute of an `<img>` tag as
          `cid:<image_name>`, where `<image_name>` is the image file's name.

          For example: `/a/b/c/my_image_123.png` can be included in the html message
          as :

            `<img src="cid:my_image_123.png">` in the html message.

          Defaults to None.
        attachments (dict, optional): `dict` of attachments to add to the email.
          Consists of {filename : bytes} value pairs. Defaults
          to None.
        reply_to (str, optional): if given, added as `Reply-To` header. Defaults to
          None.

    Returns:
        EmailMessage
    """

    if isinstance(to, list):
        to = ", ".join(to)

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_
    msg["To"] = to

    if cc:
        if isinstance(cc, list):
            cc = ", ".join(cc)
        msg["Cc"] = cc

    if bcc:
        if isinstance(bcc, list):
            bcc = ", ".join(bcc)
        msg["Bcc"] = bcc

    if reply_to:
        msg["Reply-To"] = reply_to

    msg.set_content(html, subtype="html")

    if images:
        for image in images:
            (mimetype, _) = guess_type(image)
            (maintype, subtype) = mimetype.split("/")

            with open(image, "rb") as f:
                img_data = f.read()
            msg.add_related(
                img_data,
                maintype=maintype,
                subtype=subtype,
                filename=image.name,
                cid=f"<{image.name}>",
            )

    if attachments:
        for filename, filebytes in attachments.items():
            msg.add_attachment(
                filebytes,
                maintype="application",
                subtype="octet-stream",
                filename=filename,
            )

    return msg


def create_sms_email(
    to: Union[str, List[str]],
    text: str,
    from_: str = MONITORFISH_EMAIL_ADDRESS,
) -> EmailMessage:
    """
    Creates a `email.EmailMessage` with the defined parameters, configured to be sent
    as an SMS.

    Args:
        to (Union[str, List[str]]): phone number or list of phone numbers of
          recipient(s)
        text (str): text of the SMS message
        from_ (str, optional): `From` field. Defaults to MONITORFISH_EMAIL_ADDRESS env
          var.

    Returns:
        EmailMessage
    """
    assert isinstance(to, (str, list))
    assert MONITORFISH_SMS_DOMAIN

    if isinstance(to, str):
        to = f"{to}@{MONITORFISH_SMS_DOMAIN}"

    if isinstance(to, list):
        to = [f"{phone_number}@{MONITORFISH_SMS_DOMAIN}" for phone_number in to]
        to = ", ".join(to)

    msg = EmailMessage()
    msg["From"] = from_
    msg["To"] = to

    msg.set_content(text)

    return msg


def create_fax_email(
    to: Union[str, List[str]],
    pdf: bytes,
    from_: str = MONITORFISH_EMAIL_ADDRESS,
) -> EmailMessage:
    """
    Creates a `email.EmailMessage` with the defined parameters.

    Args:
        to (Union[str, List[str]]): email address or list of email addresses of
          recipient(s)
        pdf (bytes): `bytes` pdf object
        from_ (str, optional): `From` field. Defaults to MONITORFISH_EMAIL_ADDRESS env
          var.

    Returns:
        EmailMessage
    """
    assert isinstance(to, (str, list))
    assert MONITORFISH_FAX_DOMAIN

    if isinstance(to, str):
        to = f"{to}@{MONITORFISH_FAX_DOMAIN}"

    if isinstance(to, list):
        to = [f"{phone_number}@{MONITORFISH_FAX_DOMAIN}" for phone_number in to]
        to = ", ".join(to)

    msg = EmailMessage()
    msg["Subject"] = "FAX"
    msg["From"] = from_
    msg["To"] = to

    msg.add_attachment(
        pdf,
        maintype="application",
        subtype="octet-stream",
        filename="FAX.pdf",
    )

    return msg


def send_email(msg: EmailMessage) -> dict:
    """
    Sends input email using the contents of `From` header as sender and `To`, `Cc`
    and `Bcc` headers as recipients.

    This method will return normally if the mail is accepted for at least
    one recipient.  It returns a dictionary, with one entry for each
    recipient that was refused.  Each entry contains a tuple of the SMTP
    error code and the accompanying error message sent by the server, like :

      { "three@three.org" : ( 550 ,"User unknown" ) }

    Args:
        msg (EmailMessage): `email.message.EmailMessage` to send.

    Returns:
        dict: {email_address : (error_code, error_message)} for all recipients that
          were refused.

    Raises:
        SMTPHeloError: The server didn't reply properly to the helo greeting.
        SMTPRecipientsRefused: The server rejected ALL recipients (no mail was sent).
        SMTPSenderRefused: The server didn't accept the from_addr.
        SMTPDataError: The server replied with an unexpected error code (other than a
          refusal of a recipient).
        SMTPNotSupportedError: The mail_options parameter includes 'SMTPUTF8' but the
          SMTPUTF8 extension is not supported by the server.
        ValueError: if there is more than one set of 'Resent-' headers
    """

    assert MONITORFISH_EMAIL_SERVER_URL is not None
    assert MONITORFISH_EMAIL_SERVER_PORT is not None

    with smtplib.SMTP(
        host=MONITORFISH_EMAIL_SERVER_URL, port=MONITORFISH_EMAIL_SERVER_PORT
    ) as server:
        send_errors = server.send_message(msg)
    return send_errors


def send_sms(msg: EmailMessage) -> dict:
    """
    Same as `send_email`, using sms server.
    """

    assert MONITORFISH_SMS_SERVER_URL is not None
    assert MONITORFISH_SMS_SERVER_PORT is not None

    with smtplib.SMTP(
        host=MONITORFISH_SMS_SERVER_URL, port=MONITORFISH_SMS_SERVER_PORT
    ) as server:
        send_errors = server.send_message(msg)
    return send_errors


def send_fax(msg: EmailMessage) -> dict:
    """
    Same as `send_email`, using fax server.
    """

    assert MONITORFISH_FAX_SERVER_URL is not None
    assert MONITORFISH_FAX_SERVER_PORT is not None

    with smtplib.SMTP(
        host=MONITORFISH_FAX_SERVER_URL, port=MONITORFISH_FAX_SERVER_PORT
    ) as server:
        send_errors = server.send_message(msg)
    return send_errors


def resize_pdf_to_A4(pdf: bytes) -> bytes:
    DPI = 72
    INCHES_IN_CM = 2.54
    A4_WIDTH_CM = 21
    A4_HEIGHT_CM = 29.7
    A4 = {
        "width": DPI * A4_WIDTH_CM / INCHES_IN_CM,
        "height": DPI * A4_HEIGHT_CM / INCHES_IN_CM,
    }

    pdf = pypdf.PdfReader(io.BytesIO(pdf))

    writer = pypdf.PdfWriter()

    for page in pdf.pages:
        page.scale_to(width=A4["width"], height=A4["height"])
        writer.add_page(page)

    for page in writer.pages:
        page.compress_content_streams()

    buf = io.BytesIO()
    writer.write(buf)
    buf.seek(0)
    return buf.read()
