from google import genai
import os

MODEL_NAME = "gemini-2.5-flash"

def _get_client():
    return genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_roadmap(system_prompt: str, user_prompt: str) -> str:
    client = _get_client()

    full_prompt = f"""
{system_prompt}

--------------------

{user_prompt}
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=full_prompt,
        config={"response_mime_type": "application/json", "temperature": 0.2, "top_p": 0.9}
    )

    return response.text
