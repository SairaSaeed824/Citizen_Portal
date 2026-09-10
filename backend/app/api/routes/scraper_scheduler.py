from fastapi import APIRouter, BackgroundTasks

from app.scheduler.jobs import run_all_scrapers

router = APIRouter(prefix="/api/scrapers", tags=["Scrapers"])


@router.post("/run")
def run_scrapers(background_tasks: BackgroundTasks):
    """Trigger all scrapers manually without blocking the API response."""
    background_tasks.add_task(run_all_scrapers)
    return {
        "success": True,
        "message": "Scraper job started in the background",
    }
