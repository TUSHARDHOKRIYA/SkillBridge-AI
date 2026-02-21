"""
Firebase Admin SDK helper for the SkillBridge AI backend.
Handles initialization, token verification, and Firestore client.
"""
import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
from fastapi import HTTPException, status
from dotenv import load_dotenv

load_dotenv()

def init_firebase():
    """Initialize Firebase Admin SDK (idempotent — only runs once)."""
    if firebase_admin._apps:
        return  # Already initialized

    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")

    try:
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred, {"projectId": "skillbridge-ai-9c4fb"})
            print(f"[Firebase] Initialized with service account: {service_account_path}")
        else:
            # Works automatically on Google Cloud (uses Application Default Credentials)
            # Enforce the correct projectId so that auth.verify_id_token expects the correct "aud"
            firebase_admin.initialize_app(options={"projectId": "skillbridge-ai-9c4fb"})
            print("[Firebase] Initialized with Application Default Credentials enforcing skillbridge-ai-9c4fb.")
    except Exception as e:
        print("\n" + "=" * 60)
        print("FIREBASE INITIALIZATION ERROR")
        print("=" * 60)
        print("Please ensure you have set FIREBASE_SERVICE_ACCOUNT_PATH in your .env file")
        print("pointing to a valid Firebase service account JSON file.")
        print(f"Error: {e}")
        print("=" * 60 + "\n")


def get_db():
    """Return a Firestore client. Initializes Firebase first if needed."""
    init_firebase()
    return firestore.client()


def verify_token(token: str) -> dict:
    """
    Verify a Firebase ID token and return the decoded token payload.
    Raises HTTP 401 if invalid.
    """
    try:
        init_firebase()
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired auth token: {e}"
        )


def get_uid_from_header(authorization: str | None) -> str | None:
    """
    Optionally extract UID from Authorization header.
    Returns None if no token is present (so endpoints can work without auth during dev).
    Raises HTTP 401 if token is present but invalid.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split("Bearer ")[1]
    decoded = verify_token(token)
    return decoded.get("uid")
