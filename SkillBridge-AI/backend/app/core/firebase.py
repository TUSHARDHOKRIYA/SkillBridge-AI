import firebase_admin
from firebase_admin import credentials, auth, firestore

from .config import settings
import os

def init_firebase():
    if not firebase_admin._apps:
        try:
            if settings.FIREBASE_SERVICE_ACCOUNT_PATH and os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_PATH):
                cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
                firebase_admin.initialize_app(cred)
            else:
                # This will work in Google Cloud environments automatically
                firebase_admin.initialize_app()
        except Exception as e:
            print("\n" + "="*60)
            print("FIREBASE INITIALIZATION ERROR")
            print("="*60)
            print("The Firebase Admin SDK could not be initialized.")
            print("Please ensure you have:")
            print("1. Set FIREBASE_SERVICE_ACCOUNT_PATH in your .env file")
            print("2. Pointed it to a valid service account JSON file")
            print("   OR")
            print("3. Configured Application Default Credentials (ADC)")
            print("-" * 60)
            print(f"Error detail: {e}")
            print("="*60 + "\n")
            # Don't re-raise, let the app start but it will fail on DB calls
            # This allows the terminal to remain 'cleaner' during development

def verify_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None

def get_db():
    init_firebase()
    return firestore.client()
