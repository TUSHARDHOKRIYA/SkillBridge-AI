import json
from pathlib import Path

CONFIG_PATH = Path(__file__).resolve().parents[1] / "config"

def load_skill_normalization():
    with open(CONFIG_PATH / "skill_normalization.json", "r") as f:
        return json.load(f)

SKILL_MAP = load_skill_normalization()

def normalize_topic(topic: str):
    """
    Normalize a syllabus topic to a canonical skill.
    """
    topic = topic.lower().strip()

    # direct match
    if topic in SKILL_MAP:
        return SKILL_MAP[topic]

    # partial match
    for key, value in SKILL_MAP.items():
        if key in topic:
            return value

    return None


def normalize_topics(topic_list):
    """
    Convert raw syllabus topics to normalized skills.
    """
    skills = set()

    for topic in topic_list:
        normalized = normalize_topic(topic)
        if normalized:
            skills.add(normalized)

    return list(skills)
