import re

def clean_syllabus_text(raw_text: str) -> str:
    """
    Remove noise from syllabus text.
    """
    text = raw_text.lower()

    # Remove credit lines
    text = re.sub(r"credits?\s*:\s*\d+", "", text)

    # Remove exam patterns
    text = re.sub(r"(end semester|mid semester|internal assessment).*", "", text)

    # Remove CO / BTL mappings
    text = re.sub(r"co\d+.*", "", text)

    # Remove extra whitespace
    text = re.sub(r"\n{2,}", "\n", text)

    return text.strip()
