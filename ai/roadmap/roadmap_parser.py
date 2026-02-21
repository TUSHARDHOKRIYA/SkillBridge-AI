import json

def parse_roadmap(raw_text: str) -> dict:
    try:
        roadmap = json.loads(raw_text)
    except json.JSONDecodeError:
        raise ValueError("Gemini returned invalid JSON")

    # basic sanity checks
    for week, tasks in roadmap.items():
        total = sum(t["estimated_hours"] for t in tasks)
        if total > 8:
            raise ValueError("Weekly hour limit violated")

    return roadmap
    