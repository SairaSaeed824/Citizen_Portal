import logging
import os
from datetime import datetime
from zoneinfo import ZoneInfo

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.scheduler.jobs import run_all_scrapers

logger = logging.getLogger(__name__)

_scheduler = BackgroundScheduler(timezone="Asia/Karachi")


def start_scheduler() -> None:
    """Start the daily scraper scheduler once per application process."""
    if _scheduler.running:
        return

    hour = int(os.getenv("SCRAPER_SCHEDULE_HOUR", "8"))
    minute = int(os.getenv("SCRAPER_SCHEDULE_MINUTE", "0"))

    _scheduler.add_job(
        run_all_scrapers,
        CronTrigger(hour=hour, minute=minute, timezone=ZoneInfo("Asia/Karachi")),
        id="daily_scrapers",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
        misfire_grace_time=3600,
    )

    _scheduler.start()
    logger.info("Daily scraper scheduler started: %02d:%02d Asia/Karachi", hour, minute)


def stop_scheduler() -> None:
    if _scheduler.running:
        _scheduler.shutdown(wait=False)


def run_scrapers_now():
    """Manual trigger used by the API endpoint."""
    return run_all_scrapers()
