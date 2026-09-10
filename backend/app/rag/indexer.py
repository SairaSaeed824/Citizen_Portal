import hashlib
from typing import Any, Dict, Iterable

from app.rag.gemini import embed_text
from app.rag.qdrant import get_indexed_hashes, upsert_opportunity


def _text_for_embedding(item: Dict[str, Any]) -> str:
    extra = item.get("extra_data") or {}
    parts = [
        item.get("title") or extra.get("title"),
        item.get("description") or extra.get("description"),
        extra.get("eligibility"),
        extra.get("requirements"),
        extra.get("organization") or extra.get("department") or extra.get("company"),
        extra.get("province"),
        extra.get("location"),
        item.get("category"),
    ]
    return "\n".join(str(value).strip() for value in parts if value not in (None, ""))


def embedding_hash(item: Dict[str, Any]) -> str:
    return hashlib.sha256(_text_for_embedding(item).encode("utf-8")).hexdigest()


def index_opportunity(item: Dict[str, Any], indexed_hashes: Dict[int, str]) -> str:
    opportunity_id = item.get("id")
    if opportunity_id is None:
        return "skipped"
    opportunity_id = int(opportunity_id)
    current_hash = embedding_hash(item)
    if indexed_hashes.get(opportunity_id) == current_hash:
        return "skipped"

    text = _text_for_embedding(item)
    if not text.strip():
        return "skipped"

    vector = embed_text(text)
    extra = item.get("extra_data") or {}
    payload = {
        "opportunity_id": opportunity_id,
        "title": item.get("title") or extra.get("title") or "",
        "category": item.get("category") or "",
        "province": extra.get("province") or "",
        "location": extra.get("location") or "",
        "organization": extra.get("organization") or extra.get("department") or extra.get("company") or "",
        "description": item.get("description") or extra.get("description") or "",
        "eligibility": extra.get("eligibility") or "",
        "closing_date": extra.get("closing_date") or extra.get("deadline") or "",
        "apply_link": extra.get("apply_link") or extra.get("link") or extra.get("url") or "",
        "source": extra.get("source") or "",
        "embedding_hash": current_hash,
    }
    upsert_opportunity(opportunity_id, vector, payload)
    return "indexed"


def index_new_opportunities(rows: Iterable[Dict[str, Any]]) -> Dict[str, int]:
    indexed = 0
    skipped = 0
    failed = 0
    indexed_hashes = get_indexed_hashes()

    for row in rows:
        try:
            result = index_opportunity(row, indexed_hashes)
            if result == "indexed":
                indexed += 1
                indexed_hashes[int(row["id"])] = embedding_hash(row)
            else:
                skipped += 1
        except Exception:
            failed += 1
    return {"indexed": indexed, "skipped": skipped, "failed": failed}
