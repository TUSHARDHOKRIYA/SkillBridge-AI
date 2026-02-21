import re

COURSE_TITLE_PATTERN = re.compile(
    r"^[a-zA-Z].{3,}$"
)

COURSE_META_KEYWORDS = {
    "course type",
    "semester",
    "teaching scheme",
    "credits"
}

def split_into_courses(clean_text: str):
    """
    Robust course splitter using 'course type' as anchor.
    Returns: dict { course_name: course_text }
    """

    lines = [l.strip().lower() for l in clean_text.split("\n") if l.strip()]

    courses = {}
    current_course = None
    buffer = []

    for i, line in enumerate(lines):
        # Anchor: course type
        if line == "course type":
            # The line BEFORE 'course type' is the course name
            if i > 0:
                # Save previous course
                if current_course and buffer:
                    courses[current_course] = "\n".join(buffer).strip()
                    buffer = []

                current_course = lines[i - 1]
            continue

        if current_course:
            buffer.append(line)

    # Save last course
    if current_course and buffer:
        courses[current_course] = "\n".join(buffer).strip()

    return courses
def extract_topics_from_unit(unit_text: str):
    """
    Extract raw topic phrases from a unit description.
    """
    topics = []

    # Normalize
    text = unit_text.lower()

    # Remove numeric junk
    text = re.sub(r"\b(hours?|unit|co|btl|ap|an|un)\b", "", text)

    # Split by common academic separators
    candidates = re.split(r"[,:;\n]", text)

    for c in candidates:
        c = c.strip()

        # heuristic filters
        if len(c) < 4:
            continue
        if any(x in c for x in ["marks", "lecture", "tutorial", "practical"]):
            continue
        if c.isnumeric():
            continue

        topics.append(c)

    # de-duplicate while preserving order
    seen = set()
    final_topics = []
    for t in topics:
        if t not in seen:
            seen.add(t)
            final_topics.append(t)

    return final_topics
