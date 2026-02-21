import os
import logging
from ai.roadmap.generator import (
    generate_learning_roadmap,
    attach_resources
)
from ai.syllabus_intelligence.pdf_extractor import extract_text_from_pdf
from ai.syllabus_intelligence.text_cleaner import clean_syllabus_text
from ai.syllabus_intelligence.topic_extractor import (
    split_into_courses,
    extract_topics_from_unit
)
from ai.syllabus_intelligence.unit_parser import split_into_units
from ai.syllabus_intelligence.skill_mapper import normalize_topics
from ai.skill_gap.gap_analyzer import (
    build_skill_frequency,
    analyze_skill_gap
)
from ai.domain_recommendation.parser import recommend_domains
from ai.exports.sheet_exporter import export_roadmap_to_sheets

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    # Ensure source PDF path is valid or taken from env
    pdf_filename = os.getenv("TEST_PDF_FILENAME", "syllabus.pdf")
    
    if os.path.exists(pdf_filename):
        raw_text = extract_text_from_pdf(pdf_filename)
        clean_text = clean_syllabus_text(raw_text)
        courses = split_into_courses(clean_text)

        logger.info("\n=== COURSES FOUND ===")
        for course in courses:
            logger.info(f"- {course}")
            
        # Example: Mocking one course selection if available
        if courses:
            course_name = list(courses.keys())[0]
            logger.info(f"Processing first course: {course_name}")
            
            course_text = courses[course_name]
            units = split_into_units(course_text)
            unit_skill_map = {}
            for unit, text in units.items():
                raw_topics = extract_topics_from_unit(text)
                skills = normalize_topics(raw_topics)

                unit_skill_map[unit] = skills

                logger.info(f"\n{unit}")
                logger.info(f"Raw topics: {raw_topics}")
                logger.info(f"Normalized skills: {skills}")
                
            skill_freq = build_skill_frequency(unit_skill_map)
            ml_required_skills = [
                "statistics",
                "probability",
                "machine learning basics",
                "linear algebra",
                "deep learning"
            ]
            gap = analyze_skill_gap(ml_required_skills, skill_freq)
            logger.info("\n=== ML SKILL GAP ===")
            for k, v in gap.items():
                logger.info(f"{k} : {v}")
                
            results = recommend_domains(
                user_interests=["machine learning", "ai"],
                unit_skill_map=unit_skill_map
            )
            logger.info("\n=== DOMAIN SCORES ===")
            for r in results:
                logger.info(str(r))
            
            if results:
                top_domain = results[0]

                payload = {
                    "domain": top_domain["domain"],
                    "readiness_score": top_domain["readiness_score"],
                    "fully_covered": top_domain["skill_gap"]["fully_covered"],
                    "partially_covered": top_domain["skill_gap"]["partially_covered"],
                    "missing_skills": top_domain["skill_gap"]["missing"],
                    "weekly_hours": 10,
                    "duration_weeks": 16
                }

                logger.info("Generating roadmap...")
                roadmap = generate_learning_roadmap(payload)

                logger.info("\n=== GENERATED ROADMAP ===")
                logger.info(str(roadmap))
                
                logger.info("Attaching resources...")
                roadmap = attach_resources(roadmap)
                
                # Requires GOOGLE_SERVICE_ACCOUNT_JSON in env
                try:
                    sheet_url = export_roadmap_to_sheets(roadmap)
                    logger.info("\n📄 GOOGLE SHEET CREATED SUCCESSFULLY")
                    logger.info(sheet_url)
                except Exception as e:
                    logger.error(f"Sheet export failed: {e}")
        else:
            logger.warning("No courses found in syllabus.")
    else:
        logger.error(f"Test PDF file not found: {pdf_filename}")
