def generate_reason(domain, interest_score, skill_score):
    reasons = []

    if interest_score > 0.6:
        reasons.append("Strong alignment with your interests")
    elif interest_score > 0.3:
        reasons.append("Partial alignment with your interests")

    if skill_score > 0.5:
        reasons.append("You already have relevant foundational skills")
    elif skill_score > 0.2:
        reasons.append("You have some skills related to this domain")
    else:
        reasons.append("This domain will require learning new skills")

    return f"{domain.replace('_', ' ').title()} recommended because " + " and ".join(reasons) + "."
