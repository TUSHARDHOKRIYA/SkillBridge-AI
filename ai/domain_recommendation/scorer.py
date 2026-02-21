import json
from pathlib import Path

from ai.config.weights import (
    WEIGHTS,
    SKILL_WEIGHTS,
    INTEREST_SCORING,
    NORMALIZATION,
    ROUNDING_PRECISION
)

# -----------------------
# Interest-domain mappings
# -----------------------

PRIMARY_DOMAIN_INTEREST = {
    "machine_learning_engineer": "machine_learning",
    "data_analyst": "data_analysis",
    "backend_developer": "backend",
    "full_stack_developer": "full_stack",
    "cybersecurity_engineer": "cybersecurity",
    "cloud_devops_engineer": "cloud_devops"
}

DOMAIN_INTEREST_MAP = {
    "machine_learning_engineer": ["machine_learning"],
    "data_analyst": ["data_analysis", "machine_learning"],
    "backend_developer": ["backend"],
    "full_stack_developer": ["backend", "full_stack"],
    "cybersecurity_engineer": ["cybersecurity"],
    "cloud_devops_engineer": ["cloud_devops"]
}

# -----------------------
# Load domain skill config
# -----------------------

CONFIG_PATH = Path(__file__).resolve().parents[1] / "config"

def load_domain_skills():
    with open(CONFIG_PATH / "domain_skills.json", "r") as f:
        return json.load(f)

DOMAIN_SKILLS = load_domain_skills()

# -----------------------
# Interest score
# -----------------------

def score_interest_match(parsed_interests, domain):
    """
    Returns interest alignment score in range [0, 1]
    """
    if not parsed_interests:
        return 0.0

    domain_interests = DOMAIN_INTEREST_MAP.get(domain, [])
    primary_interest = PRIMARY_DOMAIN_INTEREST.get(domain)

    exact_matches = 0
    related_matches = 0
    unrelated_matches = 0
    primary_bonus = 0.0

    for interest in parsed_interests:
        if interest == primary_interest:
            primary_bonus = 0.25
            exact_matches += 1
        elif interest in domain_interests:
            related_matches += 1
        else:
            unrelated_matches += 1

    # Weight calculation
    # distinct from config constant names to be clearer
    score_sum = (
        (exact_matches * 1.0) +
        (related_matches * 0.5) +
        (unrelated_matches * 0.0)
    )

    avg_score = score_sum / len(parsed_interests) if parsed_interests else 0.0

    return min(avg_score + primary_bonus, 1.0)

# -----------------------
# (Deprecated) Skill overlap score
# -----------------------
# ⚠️ Kept only for backward compatibility
# ❌ NOT used in final scoring anymore

def score_skill_match(parsed_skills, domain):
    if domain not in DOMAIN_SKILLS:
        return 0.0

    domain_data = DOMAIN_SKILLS[domain]
    score = 0.0
    max_score = 0.0

    for level in ["core", "secondary"]:
        weight = SKILL_WEIGHTS[level]
        for skill in domain_data.get(level, []):
            max_score += weight
            if skill in parsed_skills:
                score += weight

    return score / max_score if max_score > 0 else 0.0

# -----------------------
# Combine interest + readiness
# -----------------------

def combine_scores(interest_score, readiness_score):
    """
    interest_score   -> [0, 1]
    readiness_score  -> [0, 1]
    returns final score in percentage
    """
    final = (0.6 * interest_score) + (0.4 * readiness_score)
    return round(final * 100, 2)

# -----------------------
# Final domain scoring API
# -----------------------

def score_domain(domain, parsed_interests, readiness_score):
    """
    This is the ONLY function that should be used
    for final domain scoring.
    """
    interest_score = score_interest_match(parsed_interests, domain)
    final_score = combine_scores(interest_score, readiness_score)

    return {
        "domain": domain,
        "interest_score": round(interest_score, 2),
        "readiness_score": round(readiness_score, 2),
        "final_score": final_score
    }

# -----------------------
# Normalize final score (optional UI scaling)
# -----------------------

def normalize_score(score):
    min_s = NORMALIZATION["min_score"]
    max_s = NORMALIZATION["max_score"]

    normalized = (score - min_s) / (max_s - min_s)
    normalized = min(max(normalized, 0.0), 1.0)

    return round(normalized, ROUNDING_PRECISION)
