import json
import logging

from ai.roadmap.gemini_prompt import SYSTEM_PROMPT
from ai.roadmap.user_prompt_builder import build_user_prompt
from ai.roadmap.gemini_client import generate_roadmap
from ai.resources.resource_fetcher import fetch_youtube_resources

# Configure Logging
logger = logging.getLogger(__name__)

def attach_resources(roadmap_json):
    domain = roadmap_json["domain"]

    # Support for flat 'weeks' schema (NEW)
    if "weeks" in roadmap_json:
        for week in roadmap_json["weeks"]:
            all_resources = []
            skills = week.get("skillsCovered", [])
            if not skills:
                # Fallback to other keys if Gemini drops skillsCovered
                topic = week.get("title") or week.get("topic")
                if topic:
                    skills = [topic]
                elif week.get("learningObjectives"):
                    skills = [week["learningObjectives"][0]]
            
            for skill in skills:
                videos = fetch_youtube_resources(skill, domain)
                if videos:
                    # Flatten resources directly into the week's list
                    all_resources.extend(videos)
            # Use snake_case to match frontend type
            week["learning_resources"] = all_resources[:8] # Limit to 8 resources

    # Support for 'phases' schema (OLD)
    elif "phases" in roadmap_json:
        for phase in roadmap_json.get("phases", []):
            for week in phase.get("weeklyPlan", []):
                all_resources = []
                # Check for multiple possible keys (skillsCovered or skillsTargeted)
                skills = week.get("skillsCovered") or week.get("skillsTargeted") or []
                if not skills:
                    topic = week.get("title") or week.get("topic")
                    if topic:
                        skills = [topic]
                    elif week.get("learningObjectives"):
                        skills = [week["learningObjectives"][0]]

                for skill in skills:
                    videos = fetch_youtube_resources(skill, domain)
                    if videos:
                        all_resources.extend(videos)
                week["learning_resources"] = all_resources[:8]

    return roadmap_json


def generate_learning_roadmap(payload: dict) -> dict:
    user_prompt = build_user_prompt(payload)
    
    try:
        raw = generate_roadmap(SYSTEM_PROMPT, user_prompt)
    except Exception as e:
        logger.error(f"Gemini generation failed: {e}")
        raise

    if not raw or raw.strip() == "":
        logger.error("Gemini returned empty response")
        raise ValueError("Gemini returned empty response")

    try:
        roadmap = json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error("Gemini returned invalid JSON")
        logger.error("--- RAW GEMINI OUTPUT START ---")
        logger.error(raw)
        logger.error("--- RAW GEMINI OUTPUT END ---")
        raise ValueError("Gemini returned invalid JSON") from e

    roadmap = attach_resources(roadmap)

    return roadmap
