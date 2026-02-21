# -------------------------------
# SkillBridge AI - Scoring Weights
# -------------------------------

# Overall signal importance
WEIGHTS = {
    "interest_match": 0.50,
    "skill_match": 0.30,
    "syllabus_alignment": 0.20
}

# Skill-level importance
SKILL_WEIGHTS = {
    "core": 2.0,
    "secondary": 1.0
}

# Interest scoring parameters
INTEREST_SCORING = {
    "exact_match": 1.0,
    "partial_match": 0.5
}

# Syllabus alignment scoring
SYLLABUS_SCORING = {
    "fully_covered": 1.0,
    "partially_covered": 0.5,
    "not_covered": 0.0
}

# Score normalization
NORMALIZATION = {
    "min_score": 0.0,
    "max_score": 1.0
}

# Output formatting
ROUNDING_PRECISION = 2
