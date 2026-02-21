import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from syllabus PDF using PyMuPDF.
    Preserves layout better than plain text.
    """
    doc = fitz.open(pdf_path)
    text_blocks = []

    for page in doc:
        blocks = page.get_text("blocks")
        for block in blocks:
            block_text = block[4]
            if block_text.strip():
                text_blocks.append(block_text)

    return "\n".join(text_blocks)
