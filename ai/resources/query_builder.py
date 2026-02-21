def build_youtube_query(skill: str, domain: str) -> str:
    """
    Converts a skill into a high-quality YouTube search query
    """
    skill = skill.replace("_", " ").lower()

    templates = [
        f"{skill} full course",
        f"{skill} tutorial for beginners",
        f"{skill} complete playlist",
        f"{skill} roadmap explained",
        f"{skill} crash course"
    ]

    # Domain bias
    if domain == "machine_learning_engineer":
        templates.insert(0, f"{skill} machine learning")

    return templates
