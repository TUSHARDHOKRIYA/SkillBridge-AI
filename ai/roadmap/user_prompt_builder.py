def build_user_prompt(payload: dict) -> str:
    skills_str = ", ".join(payload['skills']) if payload['skills'] else "None"
    return f"""
Generate a highly personalized learning roadmap for the following user profile:

Target Domain: {payload['domain']}
Current Skills: {skills_str}
Career Goal: {payload['career_goal']}
Current Knowledge Level: {payload['knowledge_description']}
Weekly available hours: {payload['weekly_hours']}
Total duration (weeks): {payload['duration_weeks']}

Constraints:
- Tailor the curriculum specifically to bridge the gap between their current knowledge and their career goal.
- Account for the skills they already have (skip basics if they know them).
- Each week must have clear deliverables.
- Keep difficulty progressive.

Return ONLY valid JSON following the predefined schema.
"""
