from app.core.firebase import get_db
from google.cloud.firestore_v1.base_query import FieldFilter

class UserService:
    def __init__(self):
        self.db = get_db()
        self.users_ref = self.db.collection("users")
        self.onboarding_ref = self.db.collection("onboarding")
        self.roadmaps_ref = self.db.collection("roadmaps")

    async def get_user(self, uid: str):
        doc = self.users_ref.document(uid).get()
        if doc.exists:
            return doc.to_dict()
        return None

    async def create_or_update_user(self, uid: str, user_data: dict):
        self.users_ref.document(uid).set(user_data, merge=True)
        return await self.get_user(uid)

    async def save_onboarding_data(self, uid: str, onboarding_data: dict):
        self.onboarding_ref.document(uid).set(onboarding_data, merge=True)
        # Update user status
        self.users_ref.document(uid).update({"onboardingCompleted": True})
        return onboarding_data

    async def get_onboarding_data(self, uid: str):
        doc = self.onboarding_ref.document(uid).get()
        if doc.exists:
            return doc.to_dict()
        return None

    async def save_roadmap(self, uid: str, roadmap_data: dict):
        self.roadmaps_ref.document(uid).set(roadmap_data)
        return roadmap_data

    async def get_roadmap(self, uid: str):
        doc = self.roadmaps_ref.document(uid).get()
        if doc.exists:
            return doc.to_dict()
        return None

user_service = UserService()
