import io
import smtplib
from email.message import EmailMessage
from email.mime.image import MIMEImage
from mimetypes import guess_type
from pathlib import Path
from typing import List, Union

import PyPDF2

from config import (
    MONITORFISH_EMAIL_ADDRESS,
    MONITORFISH_EMAIL_SERVER_PORT,
    MONITORFISH_EMAIL_SERVER_URL,
)


def create_html_email(
    to: Union[str, List[str]],
    subject: str,
    html: str,
    from_: str = MONITORFISH_EMAIL_ADDRESS,
    images: List[Path] = None,
    attachments: List = None,
) -> EmailMessage:
    """Creates a `email.EmailMessage` ready to be sent with the defined parameters.

    Args:
        to (Union[str, List[str]]): email address or list of email addresses of
          recipient(s)
        subject (str): Subject of the email.
        html (str): html representation of the email's content.
        from_ (str, optional): From field. Defaults to `MONITORFISH_EMAIL_ADDRESS`.
        images (List[Path], optional): List of `Path` to images on the server's file
          system to attach to the email. These images can be displayed in the html body
          of the email by referencing them in the `src` attribute of `<img>` tag as
          `cid:<image_name>`, where `<image_name>` is the image file's name.

          For example: `/a/b/c/my_image_123.png` can be included in the html message
          as :

            `<img src="cid:my_image_123.png">` in the html message.

          Defaults to None.
        attachements (List): List of attachments to add to the email.

    Returns:
        EmailMessage
    """

    if isinstance(to, list):
        to = ", ".join(to)

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_
    msg["To"] = to

    msg.add_related(html, subtype="html")

    if images:
        for image in images:

            (mimetype, _) = guess_type(image)
            (_, subtype) = mimetype.split("/")

            with open(image, "rb") as fp:
                img = MIMEImage(fp.read(), _subtype=subtype)
            img.add_header("Content-ID", f"<{image.name}>")
            msg.add_related(img)

    if attachments:
        for attachment in attachments:
            msg.add_attachment(attachment)

    return msg


def send_email(msg: EmailMessage):

    assert MONITORFISH_EMAIL_SERVER_URL is not None
    assert MONITORFISH_EMAIL_SERVER_PORT is not None

    with smtplib.SMTP(
        host=MONITORFISH_EMAIL_SERVER_URL, port=MONITORFISH_EMAIL_SERVER_PORT
    ) as s:
        s.send_message(msg)


def resize_pdf_to_A4(pdf: bytes) -> bytes:

    DPI = 72
    INCHES_IN_CM = 2.54
    A4_WIDTH_CM = 21
    A4_HEIGHT_CM = 29.7
    A4 = {
        "width": DPI * A4_WIDTH_CM / INCHES_IN_CM,
        "height": DPI * A4_HEIGHT_CM / INCHES_IN_CM,
    }

    pdf = PyPDF2.PdfReader(io.BytesIO(pdf))

    writer = PyPDF2.PdfWriter()

    for page in pdf.pages:
        page.scale_to(width=A4["width"], height=A4["height"])
        page.compress_content_streams()
        writer.add_page(page)

    buf = io.BytesIO()
    writer.write(buf)
    buf.seek(0)
    return buf.read()
