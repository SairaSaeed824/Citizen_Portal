import logging
from typing import Any, Dict, List

from app.scrapers.loader import save_to_db
from app.scrapers.njp_scraper import NJPScraper
from app.scrapers.pmyp_scraper import PMYPScraper
from app.scrapers.psic_loan_scraper import PSICScraper

logger = logging.getLogger(__name__)


def _prepare_rows(scraper: Any, rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Convert scraper output to the database format when supported."""
    formatter = getattr(scraper, "to_db_format", None)
    if callable(formatter):
        return formatter(rows)
    return rows


def run_all_scrapers() -> Dict[str, Any]:
    """Run all Citizen Portal scrapers and save their results to Supabase."""
    scraper_classes = [
        ("njp", NJPScraper),
        ("pmyp", PMYPScraper),
        ("psic", PSICScraper),
    ]

    results: Dict[str, Any] = {}

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
            results[name] = {
                "success": False,
                "error": str(exc),
            }

    results["success"] = all(
        value.get("success", False)
        for key, value in results.items()
        if key != "success"
    )
    return results
