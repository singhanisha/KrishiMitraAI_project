
"""
Gmail API helper for sending emails using Google Cloud Console.

The following four values are required in the .env file:
    GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET
    GOOGLE_REFRESH_TOKEN
    GMAIL_SENDER  (the Gmail address from which emails will be sent)
"""

import base64
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]


def _gmail_service():
    creds = Credentials(
        token=None,
        refresh_token=os.getenv("GOOGLE_REFRESH_TOKEN"),
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        token_uri="https://oauth2.googleapis.com/token",
        scopes=SCOPES,
    )

    creds.refresh(Request())

    return build(
        "gmail",
        "v1",
        credentials=creds,
        cache_discovery=False,
    )


def send_email(to_email: str, subject: str, html_body: str, text_body: str):
    sender = os.getenv("GMAIL_SENDER")

    msg = MIMEMultipart("alternative")
    msg["To"] = to_email
    msg["From"] = f"KrishiMitra AI <{sender}>"
    msg["Subject"] = subject

    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()

    _gmail_service().users().messages().send(
        userId="me",
        body={"raw": raw},
    ).execute()


def send_password_reset_email(to_email: str, name: str, reset_link: str):
    subject = "KrishiMitra AI - Reset Your Password"

    text_body = (
        f"Hello {name},\n\n"
        f"To reset your password, please open the link below. "
        f"This link is valid for 15 minutes:\n"
        f"{reset_link}\n\n"
        f"If you did not request this password reset, "
        f"please ignore this email."
    )

    html_body = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#245b27">KrishiMitra AI</h2>

      <p>Hello {name},</p>

      <p>
        To reset your password, click the button below.
        The link will expire in 15 minutes.
      </p>

      <p>
        <a href="{reset_link}"
           style="background:#2f7d32;color:#fff;padding:12px 22px;
                  border-radius:8px;text-decoration:none;display:inline-block">
          Reset Password
        </a>
      </p>

      <p style="color:#777;font-size:13px">
        If you did not request this password reset,
        please ignore this email.
      </p>
    </div>
    """

    send_email(to_email, subject, html_body, text_body)
