"""
Utility to normalize and format legal sources safely.
"""

import re
from typing import List, Dict, Tuple
from dataclasses import dataclass


def clean_text(text: str) -> str:
    """
    Remove duplicated parentheses and excessive spaces.
    """
    if not text:
        return ""

    text = re.sub(r"\(+", "(", text)
    text = re.sub(r"\)+", ")", text)
    text = text.replace("( ", "(").replace(" )", ")")
    text = re.sub(r"\s+", " ", text).strip()

    return text


@dataclass(frozen=True)
class LegalSource:
    law_name: str
    article_number: str

    def __str__(self) -> str:
        law = clean_text(self.law_name).replace("(", "").replace(")", "").strip()
        article = self.article_number.strip()

        if article and law:
            return f"Điều {article} ({law})"
        elif article:
            return f"Điều {article}"
        elif law:
            return law
        else:
            return "Không xác định"


def format_sources_from_docs(docs: List[Dict]) -> List[str]:
    """
    Format and deduplicate legal sources from retriever docs.
    """
    unique = set()
    formatted = []

    for doc in docs:
        law_name = clean_text(doc.get("law_name", ""))
        article = clean_text(doc.get("law_id", "")).replace("Điều", "").strip()

        source = LegalSource(
            law_name=law_name,
            article_number=article,
        )

        if source not in unique:
            unique.add(source)
            formatted.append(str(source))

    return formatted
