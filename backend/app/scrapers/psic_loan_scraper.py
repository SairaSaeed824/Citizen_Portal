import os
import re
import sys
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

_BACKEND_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from app.scrapers.base import BaseScraper
from app.core.database import get_db

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


class PSICScraper(BaseScraper):
    """Scraper for PSIC careers and project/loan pages.

    PSIC's Careers page is a table. The table currently uses dates such as
    ``May 12, 2025`` and ``May 31, 2025``. Do not treat the whole row as a
    description because that creates the ugly "Program Overview" block in
    the frontend.
    """

    base_url = "https://psic.punjab.gov.pk"
    careers_url = f"{base_url}/careers"
    projects_url = f"{base_url}/projects"
    SOURCE_NAME = "PSIC Website"
    DELAY_SECONDS = 2.5
    REQUEST_TIMEOUT = 30

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/151.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    # Cities/places useful for PSIC career titles when the careers table has
    # no dedicated Location column. If no match exists, location stays empty.
    PAKISTAN_PLACES = [
        "lahore", "multan", "rawalpindi", "islamabad", "faisalabad",
        "gujranwala", "sialkot", "bahawalpur", "sargodha", "kamalia",
        "khewra", "taunsa", "murree", "hazro", "kot addu", "zahir pir",
        "ahmadpur east", "dera ghazi khan", "toba tek singh",
    ]

    def __init__(self):
        super().__init__(
            source_name=self.SOURCE_NAME,
            base_url=self.base_url,
            delay_seconds=self.DELAY_SECONDS,
        )
        self.session = requests.Session()
        self.session.headers.update(self.HEADERS)

    @staticmethod
    def _clean_text(value: Any) -> str:
        if value is None:
            return ""
        return re.sub(r"\s+", " ", str(value).replace("\xa0", " ")).strip()

    @classmethod
    def _normalize_date(cls, value: str) -> str:
        value = cls._clean_text(value)
        if not value:
            return ""

        formats = [
            "%B %d, %Y", "%b %d, %Y",
            "%d %B %Y", "%d %b %Y",
            "%d-%m-%Y", "%d/%m/%Y", "%d.%m.%Y",
            "%Y-%m-%d",
        ]
        for fmt in formats:
            try:
                return datetime.strptime(value, fmt).strftime("%Y-%m-%d")
            except ValueError:
                pass
        return value

    @classmethod
    def _extract_dates(cls, text: str) -> List[str]:
        text = cls._clean_text(text)
        patterns = [
            r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}\b",
            r"\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b",
            r"\b\d{1,2}[-/.]\d{1,2}[-/.]\d{4}\b",
        ]
        found: List[str] = []
        for pattern in patterns:
            found.extend(re.findall(pattern, text, flags=re.I))
        return list(dict.fromkeys(found))

    @classmethod
    def _place_from_text(cls, text: str) -> str:
        lower = cls._clean_text(text).lower()
        for place in sorted(cls.PAKISTAN_PLACES, key=len, reverse=True):
            if re.search(rf"\b{re.escape(place)}\b", lower):
                return f"{place.title()}, Punjab, Pakistan"
        return ""

    def _fetch(self, url: str) -> Optional[BeautifulSoup]:
        try:
            if not self.is_allowed(url):
                logger.warning("[PSIC] robots.txt blocked URL: %s", url)
                return None
            self.respectful_delay()
            response = self.session.get(url, timeout=self.REQUEST_TIMEOUT)
            response.raise_for_status()
            return BeautifulSoup(response.text, "html.parser")
        except requests.RequestException as exc:
            logger.error("[PSIC] Request failed: %s", exc)
            return None
        except Exception as exc:
            logger.exception("[PSIC] Fetch failed: %s", exc)
            return None

    @staticmethod
    def _headers_for_table(table) -> List[str]:
        header_row = table.find("tr")
        if not header_row:
            return []
        return [
            re.sub(r"[^a-z0-9]+", " ", str(cell.get_text(" ", strip=True)).lower()).strip()
            for cell in header_row.find_all(["th", "td"])
        ]

    @staticmethod
    def _header_index(headers: List[str], *names: str) -> Optional[int]:
        normalized = [re.sub(r"[^a-z0-9]+", " ", name.lower()).strip() for name in names]
        for index, header in enumerate(headers):
            if any(name == header or name in header for name in normalized):
                return index
        return None

    def _parse_career_row(self, row, headers: List[str]) -> Optional[Dict[str, Any]]:
        cells = row.find_all(["td", "th"])
        if not cells:
            return None

        values = [self._clean_text(cell.get_text(" ", strip=True)) for cell in cells]
        row_text = self._clean_text(row.get_text(" ", strip=True))

        # Skip the table's own header row.
        if not values or all(value.lower() in {"title", "advertisement", "status"} for value in values):
            return None

        title_index = self._header_index(headers, "title")
        published_index = self._header_index(headers, "advertisement published", "published", "publish date")
        closing_index = self._header_index(headers, "closing date", "deadline", "last date")
        time_index = self._header_index(headers, "closing time")
        status_index = self._header_index(headers, "status")

        def value_at(index: Optional[int]) -> str:
            return values[index] if index is not None and index < len(values) else ""

        title = value_at(title_index)
        if not title:
            link = row.find("a", href=True)
            title = self._clean_text(link.get_text(" ", strip=True)) if link else (values[0] if values else "")

        if not title:
            return None

        href = ""
        for anchor in row.find_all("a", href=True):
            candidate = anchor.get("href", "").strip()
            if not candidate:
                continue
            href = urljoin(self.base_url, candidate)
            if ".pdf" in candidate.lower() or "download" in self._clean_text(anchor.get_text()).lower() or "advertisement" in self._clean_text(anchor.get_text()).lower():
                break

        posted_date = self._normalize_date(value_at(published_index))
        closing_date = self._normalize_date(value_at(closing_index))

        # Fallback for table markup changes. This also handles PSIC's
        # month-first format: "May 31, 2025".
        if not posted_date or not closing_date:
            dates = self._extract_dates(row_text)
            if not posted_date and dates:
                posted_date = self._normalize_date(dates[0])
            if not closing_date and len(dates) > 1:
                closing_date = self._normalize_date(dates[1])

        status = value_at(status_index)
        if not status:
            lower = row_text.lower()
            for candidate in ("closed", "expired", "active", "open"):
                if candidate in lower:
                    status = candidate.title()
                    break

        # The Careers table has no location column. Never return a menu item,
        # "Toggle navigation", or a made-up location. Derive a place only
        # when the title itself contains one.
        location = self._place_from_text(title)

        return {
            "record_type": "job",
            "title": title,
            "description": "",  # Do not show the whole PSIC table row as overview.
            "location": location,
            "posted_date": posted_date,
            "closing_date": closing_date,
            "closing_time": value_at(time_index),
            "status": status,
            "link": href,
            "source": self.SOURCE_NAME,
            "scraped_at": datetime.now(timezone.utc).isoformat(),
        }

    def parse_careers_html(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        careers: List[Dict[str, Any]] = []
        if not soup:
            return careers

        # Prefer the table whose headers look like PSIC Careers.
        tables = soup.find_all("table")
        for table in tables:
            headers = self._headers_for_table(table)
            header_text = " | ".join(headers)
            if not any(term in header_text for term in ("closing date", "advertisement published", "status")):
                continue

            for row in table.find_all("tr")[1:]:
                record = self._parse_career_row(row, headers)
                if record:
                    careers.append(record)
            if careers:
                break

        logger.info("[PSIC] Careers extracted: %s", len(careers))
        return careers

    def _extract_project_title(self, soup: BeautifulSoup) -> str:
        for selector in ("h1.page-header", "h1", ".page-header", ".node-title", "article h1"):
            element = soup.select_one(selector)
            if element:
                title = self._clean_text(element.get_text(" ", strip=True))
                if title:
                    return title
        if soup.title:
            title = self._clean_text(soup.title.get_text(" ", strip=True))
            return re.sub(r"\s*[-|]\s*(Punjab Small Industries Corporation|PSIC).*$", "", title, flags=re.I)
        return ""

    @staticmethod
    def _strip_site_chrome(element) -> str:
        copy = BeautifulSoup(str(element), "html.parser")
        for selector in (
            "script", "style", "noscript", "nav", "header", "footer", "aside",
            "form", ".breadcrumb", ".pager", ".pagination", ".navbar", ".menu",
            ".toolbar", ".sidebar", ".region-sidebar-first", ".region-sidebar-second",
        ):
            for node in copy.select(selector):
                node.decompose()
        return PSICScraper._clean_text(copy.get_text(" ", strip=True))

    def _extract_project_description(self, soup: BeautifulSoup) -> str:
        for selector in (
            ".field--name-body", ".field-name-body", ".field--type-text-with-summary",
            ".field--name-field-description", ".field--name-field-content", ".node__body",
        ):
            for element in soup.select(selector):
                text = self._strip_site_chrome(element)
                if text and len(text) >= 20:
                    return text
        return ""

    @classmethod
    def _find_explicit_value(cls, soup: BeautifulSoup, labels: List[str]) -> str:
        """Read only real label/value structures; never use the next random div.

        This prevents Bootstrap's "Toggle navigation" text from becoming a
        location when PSIC has no Location field.
        """
        wanted = {label.lower() for label in labels}

        for table in soup.find_all("table"):
            for row in table.find_all("tr"):
                cells = row.find_all(["th", "td"])
                if len(cells) < 2:
                    continue
                first = cls._clean_text(cells[0].get_text(" ", strip=True)).rstrip(":").lower()
                if first in wanted:
                    value = cls._clean_text(cells[1].get_text(" ", strip=True))
                    if value and "toggle navigation" not in value.lower():
                        return value

        for dl in soup.find_all("dl"):
            terms = dl.find_all("dt")
            for term in terms:
                label = cls._clean_text(term.get_text(" ", strip=True)).rstrip(":").lower()
                if label in wanted:
                    value_node = term.find_next_sibling("dd")
                    value = cls._clean_text(value_node.get_text(" ", strip=True)) if value_node else ""
                    if value and "toggle navigation" not in value.lower():
                        return value

        # Explicit text such as "Location: Kamalia" is safe to parse.
        visible = cls._clean_text(soup.get_text(" ", strip=True))
        for label in labels:
            match = re.search(rf"\b{re.escape(label)}\s*:\s*([^|]+?)(?=\s+(?:Location|District|City|Address|Status|Closing Date|Deadline)\s*:|$)", visible, re.I)
            if match:
                value = cls._clean_text(match.group(1))
                if value and "toggle navigation" not in value.lower():
                    return value
        return ""

    def _find_project_links(self, soup: BeautifulSoup) -> List[str]:
        links: List[str] = []
        seen = set()
        if not soup:
            return links
        for anchor in soup.find_all("a", href=True):
            absolute = urljoin(self.base_url, anchor.get("href", "").strip())
            path = absolute.split(self.base_url, 1)[-1]
            if re.search(r"/node/\d+/?$", path) and absolute not in seen:
                seen.add(absolute)
                links.append(absolute)
        return links

    def _get_project_record_type(self, title: str, description: str) -> str:
        combined = f"{title} {description}".lower()
        if any(word in combined for word in (
            "loan", "interest-free", "interest free", "credit facility",
            "credit scheme", "financing", "financial assistance",
        )):
            return "loan"
        return "project"

    def _fetch_project_detail(self, detail_url: str) -> Optional[Dict[str, Any]]:
        soup = self._fetch(detail_url)
        if not soup:
            return None

        title = self._extract_project_title(soup)
        if not title:
            return None

        description = self._extract_project_description(soup)
        record_type = self._get_project_record_type(title, description)

        location = self._find_explicit_value(soup, ["Location", "District", "City", "Address"])
        if not location:
            location = self._place_from_text(title)

        posted_date = self._normalize_date(
            self._find_explicit_value(soup, ["Posted Date", "Publish Date", "Published", "Date"])
        )
        closing_date = self._normalize_date(
            self._find_explicit_value(soup, ["Closing Date", "Deadline", "Last Date"])
        )
        status = self._find_explicit_value(soup, ["Status"])

        return {
            "record_type": record_type,
            "title": title,
            "description": description,
            "location": location,
            "posted_date": posted_date,
            "closing_date": closing_date,
            "closing_time": "",
            "status": status,
            "link": detail_url,
            "source": self.SOURCE_NAME,
            "scraped_at": datetime.now(timezone.utc).isoformat(),
        }

    def parse_projects_html(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        projects: List[Dict[str, Any]] = []
        for detail_url in self._find_project_links(soup):
            try:
                record = self._fetch_project_detail(detail_url)
                if record:
                    projects.append(record)
            except Exception as exc:
                logger.exception("[PSIC] Project parse failed for %s: %s", detail_url, exc)
        return projects

    def scrape(self) -> List[Dict[str, Any]]:
        records: List[Dict[str, Any]] = []

        careers = self._fetch(self.careers_url)
        if careers:
            records.extend(self.parse_careers_html(careers))

        projects = self._fetch(self.projects_url)
        if projects:
            records.extend(self.parse_projects_html(projects))

        logger.info("[PSIC] Total records: %s", len(records))
        return records

    def to_db_format(self, record: Dict[str, Any]) -> Dict[str, Any]:
        extra_data = dict(record)
        category = extra_data.pop("record_type", "job")
        return {"category": category, "extra_data": extra_data}

    def save_to_database(self, records: List[Dict[str, Any]]) -> None:
        if not records:
            return

        db = get_db()
        db_records = [self.to_db_format(record) for record in records]
        categories = {record["category"] for record in db_records}

        # Replace only PSIC's own records, leaving other sources untouched.
        for category in categories:
            existing = (
                db.table("opportunities")
                .select("id, extra_data")
                .eq("category", category)
                .execute()
            )
            for row in existing.data or []:
                if (row.get("extra_data") or {}).get("source") == self.SOURCE_NAME:
                    db.table("opportunities").delete().eq("id", row["id"]).execute()

        db.table("opportunities").insert(db_records).execute()

    def run(self) -> List[Dict[str, Any]]:
        records = self.scrape()
        if records:
            self.save_to_database(records)
        return records


if __name__ == "__main__":
    scraper = PSICScraper()
    result = scraper.run()
    for item in result:
        print(item)
