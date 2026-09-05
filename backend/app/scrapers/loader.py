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
except ImportError:
    try:
        from core.database import get_db
    except ImportError:
        raise ImportError("Could not resolve 'core.database'. Check your sys.path configuration.")


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
    """Insert rows into the DB in bulk, skipping duplicates via content_hash check."""
    if not rows:
        return {"inserted": 0, "skipped": 0}

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

    if to_insert:
        db.table("opportunities").insert(to_insert).execute()

    return {"inserted": len(to_insert), "skipped": skipped}