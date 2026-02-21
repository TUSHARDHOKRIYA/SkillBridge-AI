

from ai.resources.resource_fetcher import fetch_youtube_resources


def attach_resources_to_roadmap(roadmap: dict) -> dict:
    domain = roadmap.get("domain", "")

    for week in roadmap.get("weeks", []):
        skills = week.get("skillsCovered", [])

        all_resources = []

        for skill in skills:
            resources = fetch_youtube_resources(
                skill=skill,
                domain=domain,
                max_results=2   # IMPORTANT: keep it small
            )

            for r in resources:
                all_resources.append(
                    f"{skill.upper()} | {r['type'].title()}\n"
                    f"{r['title']}\n"
                    f"{r['url']}"
                )

        week["learningResources"] = all_resources

    return roadmap
