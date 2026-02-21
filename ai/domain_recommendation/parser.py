import json
from pathlib import Path

from ai.domain_recommendation.scorer import score_domain
from ai.skill_gap.gap_analyzer import analyze_skill_gap, build_skill_frequency

# -----------------------
# Config loading
# -----------------------

CONFIG_PATH = Path(__file__).resolve().parents[1] / "config"

def load_interest_taxonomy():
    with open(CONFIG_PATH / "interest_taxonomy.json", "r") as f:
        return json.load(f)

def load_domain_skills():
    with open(CONFIG_PATH / "domain_skills.json", "r") as f:
        return json.load(f)

INTEREST_TAXONOMY = load_interest_taxonomy()
DOMAIN_SKILLS = load_domain_skills()

# -----------------------
# Interest Parsing
# -----------------------

def parse_interests(user_interests):
    """
    user_interests: list[str]
    returns: list[str] (canonical interest tags)
    """
    normalized_tags = []

    for interest in user_interests:
        interest = interest.lower().strip()
        
        # 1. Direct match check
        found = False
        for tag, synonyms in INTEREST_TAXONOMY.items():
            if interest in synonyms:
                normalized_tags.append(tag)
                found = True
                break
        
        if found: continue

        # 2. Substring / Token matching fallback
        # If user says "cloud computing", and "cloud" is a synonym for cloud_devops, we should match.
        interest_tokens = interest.split()
        for tag, synonyms in INTEREST_TAXONOMY.items():
            for synonym in synonyms:
                # Check if synonym is inside interest (e.g. "cloud" in "cloud computing")
                if synonym in interest: 
                    normalized_tags.append(tag)
                    found = True
                    break
            if found: break

    return normalized_tags

# -----------------------
# MAIN DOMAIN RECOMMENDER
# -----------------------

def recommend_domains(
    user_interests,
    unit_skill_map
):
    parsed_interests = parse_interests(user_interests)
    skill_freq = build_skill_frequency(unit_skill_map)

    results = []

    for domain, domain_data in DOMAIN_SKILLS.items():
        required_skills = (
            domain_data.get("core", []) +
            domain_data.get("secondary", [])
        )

        gap_result = analyze_skill_gap(
            domain_skills=required_skills,
            skill_freq=skill_freq
        )

        scored = score_domain(
            domain=domain,
            parsed_interests=parsed_interests,
            readiness_score=gap_result["readiness_score"]
        )

        scored["skill_gap"] = gap_result
        results.append(scored)

    results.sort(key=lambda x: x["final_score"], reverse=True)
    return results
