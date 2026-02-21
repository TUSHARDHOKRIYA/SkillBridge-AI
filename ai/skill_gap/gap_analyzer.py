from collections import Counter

def build_skill_frequency(unit_skill_map: dict):
    """
    unit_skill_map:
    {
        "unit_1": ["statistics", "probability"],
        "unit_2": ["statistics"],
        ...
    }
    """
    freq = Counter()

    for skills in unit_skill_map.values():
        for skill in skills:
            freq[skill] += 1

    return freq


def analyze_skill_gap(domain_skills: list, skill_freq: dict):
    """
    domain_skills: list of required skills for domain
    skill_freq: Counter of syllabus-derived skills
    """

    fully_covered = []
    partially_covered = []
    missing = []

    score = 0.0

    for skill in domain_skills:
        count = skill_freq.get(skill, 0)

        if count >= 2:
            fully_covered.append(skill)
            score += 1.0
        elif count == 1:
            partially_covered.append(skill)
            score += 0.5
        else:
            missing.append(skill)

    readiness = round(score / max(len(domain_skills), 1), 2)

    return {
        "fully_covered": fully_covered,
        "partially_covered": partially_covered,
        "missing": missing,
        "readiness_score": readiness
    }
