# ai/exports/sheets_client.py

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
import os

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

def get_sheets_service():
    creds = Credentials.from_service_account_file(
        os.getenv("GOOGLE_SHEETS_CREDENTIALS"),
        scopes=SCOPES
    )
    service = build("sheets", "v4", credentials=creds)
    return service
