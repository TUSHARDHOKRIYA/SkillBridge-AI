import json
import logging

from ai.roadmap.generator import generate_learning_roadmap
from ai.exports.sheet_exporter import export_roadmap_to_sheets

# Configure logging
logger = logging.getLogger(__name__)

def run_full_pipeline(
    domain: str,
    skills: list[str],
    career_goal: str,
    knowledge_description: str,
    weekly_hours: int,
    duration_weeks: int
):
    logger.info(f"Starting pipeline for domain: {domain}")

    # --------------------------------------------------
    # 1️⃣ Roadmap generation 
    # --------------------------------------------------
    roadmap = generate_learning_roadmap({
        "domain": domain,
        "skills": skills,
        "career_goal": career_goal,
        "knowledge_description": knowledge_description,
        "weekly_hours": weekly_hours,
        "duration_weeks": duration_weeks
    })

    logger.info("====== FINAL ROADMAP OBJECT ======")
    logger.info(json.dumps(roadmap, indent=2))
    logger.info("=================================")

    # 🚨 CRITICAL FRONTEND SYNC: 
    # The frontend expects 'totalDurationWeeks' and 'weeklyHours' inside the roadmap object.
    
    roadmap["totalDurationWeeks"] = duration_weeks
    roadmap["weeklyHours"] = weekly_hours
    
    if "weeks" in roadmap and "phases" not in roadmap:
        # Simple grouping logic: every 4 weeks is a phase, or just one phase if short
        weeks = roadmap["weeks"]
        phases = []
        phase_size = 4
        for i in range(0, len(weeks), phase_size):
            chunk = weeks[i : i + phase_size]
            phases.append({
                "phaseName": f"Phase {len(phases) + 1}",
                "weeklyPlan": [
                    {
                        "week": w["weekNumber"],
                        "topic": w["title"],
                        "skillsCovered": w["skillsCovered"],
                        "deliverable": w.get("actionItems", ["Complete week objectives"])[0] if w.get("actionItems") else "Weekly review",
                        "learning_resources": w.get("learning_resources", []),
                        "mini_project": w.get("mini_project")
                    } for w in chunk
                ]
            })
        roadmap["phases"] = phases

    # --------------------------------------------------
    # 2️⃣ Export to Google Sheets
    # --------------------------------------------------
    sheet_url = "skipped-due-to-error"
    try:
        sheet_url = export_roadmap_to_sheets(roadmap)
    except Exception as e:
        logger.error(f"Sheet export failed, returning without sheet URL. Error: {e}")

    return {
        "domain": domain,
        "google_sheet_url": sheet_url,
        "roadmap": roadmap,
        "major_projects": roadmap.get("major_projects", [])
    }
