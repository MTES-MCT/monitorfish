import io
import smtplib
from email.message import EmailMessage
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
    cc: Union[str, List[str]] = None,
    bcc: Union[str, List[str]] = None,
    images: List[Path] = None,
    attachments: dict = None,
) -> EmailMessage:
    """
    Creates a `email.EmailMessage` with the defined parameters.

    Args:
        to (Union[str, List[str]]): email address or list of email addresses of
          recipient(s)
        subject (str): Subject of the email.
        html (str): html representation of the email's content.
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
        attachments (dict, optional): `dict of attachments to add to the email.
          Consists of {filename : bytes} value pairs. Defaults
          to None.

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


def send_email(msg: EmailMessage):

    assert MONITORFISH_EMAIL_SERVER_URL is not None
    assert MONITORFISH_EMAIL_SERVER_PORT is not None

    with smtplib.SMTP(
        host=MONITORFISH_EMAIL_SERVER_URL, port=MONITORFISH_EMAIL_SERVER_PORT
    ) as server:
        return server.send_message(msg)


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
