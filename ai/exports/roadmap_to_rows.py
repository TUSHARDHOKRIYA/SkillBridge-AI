# ai/exports/roadmap_to_rows.py

def roadmap_to_sheet_rows(roadmap: dict):
    rows = []

    for phase in roadmap.get("phases", []):
        phase_name = phase.get("phaseName", "")

        for week in phase.get("weeklyPlan", []):
            skills = ", ".join(week.get("skillsTargeted", []))

            # Collect all YouTube links
            links = []
            for res in week.get("learning_resources", []):
                for item in res.get("resources", []):
                    links.append(item["url"])

            rows.append([
                phase_name,
                week.get("week"),
                week.get("topic"),
                skills,
                week.get("deliverable"),
                "\n".join(links)
            ])

    return rows
