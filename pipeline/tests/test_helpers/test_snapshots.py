import os


def should_generate_snapshots() -> bool:
    val = os.getenv("TEST_GENERATE_SNAPSHOTS")
    if val is None:
        return False
    return val.lower() == "true"


def normalize_extracted_pdf_text(text: str) -> str:
    """
    Collapse all runs of whitespace to single spaces so that comparisons of
    `pypdf` extracted text check the extracted content and glyph fidelity, not
    the exact line-break positions.

    WeasyPrint delegates line breaking and glyph metrics to the system Pango /
    HarfBuzz / fontconfig stack, whose behaviour shifts between Debian releases
    (e.g. the bullseye -> trixie base image bump). Those shifts move where a word
    wraps without changing the text itself, which would otherwise break these
    snapshot assertions on every base-image upgrade.
    """
    return " ".join(text.split())
