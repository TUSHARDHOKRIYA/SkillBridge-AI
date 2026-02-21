import os
import json
import logging
import pickle
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# Configure logging
logger = logging.getLogger(__name__)

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

def get_oauth_credentials():
    """
    Retrieves credentials.
    Priority 1: GOOGLE_SERVICE_ACCOUNT_JSON (Service Account)
    Priority 2: token.pickle (User OAuth Credentials - Local Dev)
    """
    # 1. Try Service Account from ENV
    creds_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    if creds_json:
        try:
            creds_dict = json.loads(creds_json)
            return service_account.Credentials.from_service_account_info(
                creds_dict,
                scopes=SCOPES
            )
        except json.JSONDecodeError as e:
            logger.warning(f"Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON: {e}")

    # 2. Try loading token.pickle (User Credentials)
    # The Uvicorn server runs from d:\python\SkillBridgeAI (root)
    token_path = "token.pickle"
    
    if os.path.exists(token_path):
        try:
            with open(token_path, 'rb') as token:
                creds = pickle.load(token)
            
            if creds and creds.expired and creds.refresh_token:
                logger.info("Refreshing expired token...")
                creds.refresh(Request())
                
            logger.info("Using credentials from token.pickle")
            return creds
        except Exception as e:
            logger.error(f"Failed to load token.pickle: {e}")

    logger.error("No valid Google Credentials found.")
    raise ValueError("Missing Credentials: Set GOOGLE_SERVICE_ACCOUNT_JSON or ensure token.pickle exists.")


def export_roadmap_to_sheets(roadmap: dict) -> str:
    creds = get_oauth_credentials()

    drive = build("drive", "v3", credentials=creds)
    sheets = build("sheets", "v4", credentials=creds)

    # 1️⃣ Create spreadsheet
    try:
        file = drive.files().create(
            body={
                "name": f"SkillBridgeAI Roadmap – {roadmap.get('domain', 'Unknown')}",
                "mimeType": "application/vnd.google-apps.spreadsheet"
            },
            fields="id"
        ).execute()
    except Exception as e:
        logger.error(f"Failed to create Google Sheet: {e}")
        raise

    spreadsheet_id = file["id"]

    # 2️⃣ Header row
    rows = [[
        "Week",
        "Focus",
        "Skills Covered",
        "Deliverables",
        "Estimated Hours",
        "Learning Resources" 
    ]]

    # 3️⃣ Fill rows from roadmap["weeks"]
    for week in roadmap.get("weeks", []):
        # Support both old and new schema keys
        week_num = week.get("week", week.get("weekNumber", ""))
        focus = week.get("focus", week.get("title", ""))
        skills = week.get("skillsCovered", [])
        
        deliverables = week.get("deliverables", week.get("actionItems", []))
        if isinstance(deliverables, str): 
            deliverables = [deliverables]
            
        hours = week.get("estimatedHours", "")
        
        # Resources (camelCase vs snake_case fallback)
        resources = week.get("learningResources", week.get("learning_resources", []))

        # Format resources as string
        resource_str = ""
        if isinstance(resources, list):
             cleaned_res = []
             for r in resources:
                 if isinstance(r, dict):
                     # CASE 1: Flat resource object (Current Format)
                     # {"title": "...", "url": "...", "type": "..."}
                     if "title" in r and "url" in r:
                         cleaned_res.append(f"{r['title']} - {r['url']}")
                     
                     # CASE 2: Nested skill-based grouping (Old Format - Backwards compat)
                     # {"skill": "...", "resources": [{"title":...}]}
                     elif "resources" in r:
                        for v in r.get("resources", []):
                             cleaned_res.append(f"{v['title']} - {v['url']}")
                 
                 elif isinstance(r, str):
                     cleaned_res.append(r)
             
             resource_str = "\n".join(cleaned_res)

        rows.append([
            week_num,
            focus,
            ", ".join(skills),
            "\n".join(deliverables),
            hours,
            resource_str
        ])


    # 4️⃣ Write to Google Sheets
    try:
        sheets.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range="A1",
            valueInputOption="RAW",
            body={"values": rows}
        ).execute()
    except Exception as e:
        logger.error(f"Failed to write content to Google Sheet {spreadsheet_id}: {e}")
        raise

    sheet_url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"
    logger.info(f"Successfully exported roadmap to {sheet_url}")
    
    return sheet_url
