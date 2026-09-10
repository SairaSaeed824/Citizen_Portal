import logging
import os
import sys
from typing import Any, Dict, List

# Ensure the backend root directory is in sys.path for absolute imports
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

# Fallback import block to handle both direct script execution and package imports
try:
    from app.core.database import get_db
    from app.rag.indexer import index_new_opportunities
except ImportError:
    try:
        from core.database import get_db
        from rag.indexer import index_new_opportunities
    except ImportError:
        raise ImportError("Could not resolve backend imports. Check your sys.path configuration.")

logger = logging.getLogger(__name__)


def get_existing_hashes(category: str) -> set:
    """Fetch all existing content_hash values for a category from the DB."""
    db = get_db()
    result = db.table("opportunities").select("extra_data").eq("category", category).execute()

    hashes = set()
    for row in result.data or []:
        extra_data = row.get("extra_data") or {}
        h = extra_data.get("content_hash")
        if h:
            hashes.add(h)
    return hashes


def save_to_db(rows: List[Dict[str, Any]]) -> Dict[str, int]:
    """Insert scraper rows and immediately index successfully inserted rows in Qdrant.

    Database insertion is intentionally independent from embedding. If Gemini/Qdrant
    is unavailable, the opportunity remains safely stored in Supabase and the regular
    scheduler reconciliation can index it later.
    """
    if not rows:
        return {"inserted": 0, "skipped": 0, "embedded": 0, "embedding_failed": 0}

    db = get_db()
    category = rows[0].get("category")
    existing_hashes = get_existing_hashes(category)

    to_insert = []
    skipped = 0

    for row in rows:
        extra_data = row.get("extra_data") or {}
        row_hash = extra_data.get("content_hash")

        if row_hash and row_hash in existing_hashes:
            skipped += 1
            continue

        to_insert.append(row)
        if row_hash:
            existing_hashes.add(row_hash)

    if not to_insert:
        return {"inserted": 0, "skipped": skipped, "embedded": 0, "embedding_failed": 0}

    inserted_rows = db.table("opportunities").insert(to_insert).execute().data or []

    embedded = 0
    embedding_failed = 0
    try:
        rag_result = index_new_opportunities(inserted_rows)
        embedded = rag_result.get("indexed", 0)
        embedding_failed = rag_result.get("failed", 0)
    except Exception as exc:
        # Never roll back a successful DB insert because the vector service failed.
        embedding_failed = len(inserted_rows)
        logger.exception("Immediate RAG indexing failed after scraper DB insert: %s", exc)

    return {
        "inserted": len(inserted_rows),
        "skipped": skipped,
        "embedded": embedded,
        "embedding_failed": embedding_failed,
    }
