ROADMAP_SCHEMA = {
    "domain": "string",
    "readiness_score": "float (0-1)",
    "duration_weeks": "int",
    "weekly_time_hours": "int",
    "roadmap": [
        {
            "week": "int",
            "focus": "string",
            "skills": ["string"],
            "topics": ["string"],
            "deliverables": ["string"],
            "resources": [
                {
                    "type": "video | article | course",
                    "title": "string",
                    "source": "string"
                }
            ]
        }
    ]
}
