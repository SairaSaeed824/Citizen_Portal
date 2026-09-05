import hashlib
import logging
import time
import urllib.robotparser
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import requests

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger("ScraperEngine")


class BaseScraper(ABC):
    def __init__(self, source_name: str, base_url: str, delay_seconds: float = 2.5):
        self.source_name = source_name
        self.base_url = base_url
        self.delay_seconds = delay_seconds
        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            )
        }
        self.robot_parser = urllib.robotparser.RobotFileParser()
        self._init_robots_txt()

    def _init_robots_txt(self) -> None:
        try:
            robots_url = f"{self.base_url.rstrip('/')}/robots.txt"
            self.robot_parser.set_url(robots_url)
            self.robot_parser.read()
        except Exception as e:
            logger.warning(f"[{self.source_name}] Could not read robots.txt: {e}")

    def is_allowed(self, target_url: str) -> bool:
        try:
            return self.robot_parser.can_fetch(self.headers["User-Agent"], target_url)
        except Exception:
            return True

    def calculate_hash(self, title: str, url: str) -> str:
        """Duplicate items detect karne ke liye unique fingerprint banata hai."""
        raw = f"{title.strip().lower()}|{url.strip().lower()}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def respectful_delay(self) -> None:
        time.sleep(self.delay_seconds)

    def fetch_with_retry(self, url: str, max_retries: int = 3) -> Optional[requests.Response]:
        if not self.is_allowed(url):
            logger.warning(f"[{self.source_name}] robots.txt se blocked: {url}")
            return None

        backoff = 3
        for attempt in range(1, max_retries + 1):
            try:
                self.respectful_delay()
                response = requests.get(url, headers=self.headers, timeout=30)
                if response.status_code == 200:
                    return response
                logger.warning(f"[{self.source_name}] Status {response.status_code}, retry {attempt}")
                time.sleep(backoff)
                backoff *= 2
            except requests.RequestException as e:
                logger.error(f"[{self.source_name}] Request fail (attempt {attempt}): {e}")
                time.sleep(backoff)
                backoff *= 2
        return None

    @abstractmethod
    def scrape(self) -> List[Dict[str, Any]]:
        """Har scraper is function ko apne hisab se likhega."""
        pass