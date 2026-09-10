import logging
from typing import Any, Dict, List

from app.scrapers.loader import save_to_db
from app.scrapers.njp_scraper import NJPScraper
from app.scrapers.pmyp_scraper import PMYPScraper
from app.scrapers.psic_loan_scraper import PSICScraper
from app.rag.indexer import index_new_opportunities
from app.core.database import get_db

logger = logging.getLogger(__name__)


def _prepare_rows(scraper: Any, rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    formatter = getattr(scraper, "to_db_format", None)
    if callable(formatter):
        return formatter(rows)
    return rows


def _fetch_rows_by_ids(ids: List[int]) -> List[Dict[str, Any]]:
    if not ids:
        return []
    db = get_db()
    return db.table("opportunities").select("*").in_("id", ids).execute().data or []


def run_all_scrapers() -> Dict[str, Any]:
    """Run scrapers, save new rows to Supabase, then index newly inserted rows in Qdrant."""
    scraper_classes = [
        ("njp", NJPScraper),
        ("pmyp", PMYPScraper),
        ("psic", PSICScraper),
    ]

    results: Dict[str, Any] = {}
    newly_inserted_ids: List[int] = []

    for name, scraper_class in scraper_classes:
        try:
            logger.info("Starting %s scraper", name.upper())
            scraper = scraper_class()
            scraped_rows = scraper.scrape()
            db_rows = _prepare_rows(scraper, scraped_rows or [])
            save_result = save_to_db(db_rows)

            results[name] = {
                "success": True,
                "scraped": len(scraped_rows or []),
                **save_result,
            }
            logger.info("Finished %s scraper: %s", name.upper(), results[name])
        except Exception as exc:
            logger.exception("%s scraper failed", name.upper())
            results[name] = {"success": False, "error": str(exc)}

    # Index all currently new/unindexed rows after scraping. This keeps the scraper
    # pipeline independent from Qdrant and lets the chatbot use fresh data.
    try:
        db = get_db()
        all_rows = db.table("opportunities").select("*").execute().data or []
        rag_result = index_new_opportunities(all_rows)
        results["rag"] = {"success": True, **rag_result}
    except Exception as exc:
        logger.exception("RAG indexing failed")
        results["rag"] = {"success": False, "error": str(exc)}

    scraper_success = all(
        value.get("success", False)
        for key, value in results.items()
        if key not in {"success", "rag"}
    )
    results["success"] = scraper_success
    return results
