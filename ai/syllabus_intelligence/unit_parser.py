import re

UNIT_PATTERN = re.compile(
    r"(unit\s*(no)?\s*[-:]?\s*(\d+|[ivx]+))",
    re.IGNORECASE
)

def split_into_units(course_text: str):
    """
    Splits a course block into units.
    Returns: dict { unit_name: unit_text }
    """

    units = {}
    current_unit = None
    buffer = []

    lines = course_text.split("\n")

    for line in lines:
        match = UNIT_PATTERN.search(line)

        if match:
            # Save previous unit
            if current_unit and buffer:
                units[current_unit] = "\n".join(buffer).strip()
                buffer = []

            unit_id = match.group(3)
            current_unit = f"unit_{unit_id}"
        else:
            if current_unit:
                buffer.append(line)

    # Save last unit
    if current_unit and buffer:
        units[current_unit] = "\n".join(buffer).strip()

    return units
