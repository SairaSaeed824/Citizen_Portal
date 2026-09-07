import os
import sys
import re
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


# ============================================================
# BACKEND PATH
# ============================================================

_BACKEND_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)


# ============================================================
# PROJECT IMPORTS
# ============================================================

from app.scrapers.base import BaseScraper
from app.core.database import get_db


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s"
)

logger = logging.getLogger(__name__)


# ============================================================
# PSIC SCRAPER
# ============================================================

class PSICScraper(BaseScraper):

    base_url = "https://psic.punjab.gov.pk"

    careers_url = f"{base_url}/careers"
    projects_url = f"{base_url}/projects"

    SOURCE_NAME = "PSIC Website"

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/151.0.0.0 Safari/537.36"
        ),
        "Accept": (
            "text/html,application/xhtml+xml,"
            "application/xml;q=0.9,image/avif,image/webp,"
            "*/*;q=0.8"
        ),
        "Accept-Language": "en-US,en;q=0.9",
    }

    REQUEST_TIMEOUT = 30

    # ========================================================
    # INIT
    # ========================================================

    def __init__(self):
        try:
            super().__init__()
        except TypeError:
            # In case BaseScraper does not define __init__
            pass

        self.session = requests.Session()
        self.session.headers.update(self.HEADERS)

    # ========================================================
    # CLEAN TEXT
    # ========================================================

    @staticmethod
    def _clean_text(value: Any) -> str:
        if value is None:
            return ""

        text = str(value)

        text = text.replace("\xa0", " ")

        text = re.sub(r"\s+", " ", text)

        return text.strip()

    # ========================================================
    # NORMALIZE DATE
    # ========================================================

    @staticmethod
    def _normalize_date(value: str) -> str:
        value = PSICScraper._clean_text(value)

        if not value:
            return ""

        formats = [
            "%d-%m-%Y",
            "%d/%m/%Y",
            "%d.%m.%Y",
            "%Y-%m-%d",
            "%d-%b-%Y",
            "%d-%B-%Y",
            "%d %b %Y",
            "%d %B %Y",
            "%b %d, %Y",
            "%B %d, %Y",
        ]

        for fmt in formats:
            try:
                return datetime.strptime(value, fmt).strftime("%Y-%m-%d")
            except ValueError:
                continue

        return value

    # ========================================================
    # FETCH PAGE
    # ========================================================

    def _fetch(self, url: str) -> Optional[BeautifulSoup]:

        try:
            logger.info("[PSIC] HTTP GET: %s", url)

            response = self.session.get(
                url,
                timeout=self.REQUEST_TIMEOUT
            )

            logger.info(
                "[PSIC] HTTP Status (%s): %s",
                url,
                response.status_code
            )

            response.raise_for_status()

            return BeautifulSoup(
                response.text,
                "html.parser"
            )

        except requests.RequestException as exc:

            logger.error(
                "[PSIC] Request failed: %s",
                exc
            )

            return None

        except Exception as exc:

            logger.exception(
                "[PSIC] Unexpected fetch error: %s",
                exc
            )

            return None

    # ========================================================
    # FIND VALUE FROM ROW
    # ========================================================

    def _find_label_value(
        self,
        container,
        labels: List[str]
    ) -> str:

        if not container:
            return ""

        text = self._clean_text(
            container.get_text(" ", strip=True)
        )

        # ----------------------------------------------------
        # Search table cells
        # ----------------------------------------------------

        cells = container.find_all(
            ["td", "th", "dt", "dd", "div", "span", "p"]
        )

        for index, element in enumerate(cells):

            current = self._clean_text(
                element.get_text(" ", strip=True)
            )

            current_lower = current.lower()

            for label in labels:

                label_lower = label.lower()

                if label_lower in current_lower:

                    # Same element with colon
                    match = re.search(
                        rf"{re.escape(label)}\s*:\s*(.+)",
                        current,
                        re.I
                    )

                    if match:
                        return self._clean_text(
                            match.group(1)
                        )

                    # Next element
                    if index + 1 < len(cells):

                        next_value = self._clean_text(
                            cells[index + 1].get_text(
                                " ",
                                strip=True
                            )
                        )

                        if next_value:
                            return next_value

        # ----------------------------------------------------
        # Search complete text
        # ----------------------------------------------------

        for label in labels:

            match = re.search(
                rf"{re.escape(label)}\s*:\s*([^|]+)",
                text,
                re.I
            )

            if match:
                return self._clean_text(
                    match.group(1)
                )

        return ""

    # ========================================================
    # DETERMINE RECORD TYPE
    # ========================================================

    @staticmethod
    def _get_project_record_type(
        title: str,
        description: str
    ) -> str:

        combined = (
            f"{title} {description}"
        ).lower()

        loan_keywords = [
            "loan",
            "interest-free loan",
            "interest free loan",
            "interest-free",
            "credit facility",
            "credit scheme",
            "financing",
            "financial assistance",
        ]

        for keyword in loan_keywords:

            if keyword in combined:
                return "loan"

        return "project"

    # ========================================================
    # CAREER RECORD
    # ========================================================

    def _parse_career_row(
        self,
        row
    ) -> Optional[Dict[str, Any]]:

        try:

            cells = row.find_all(
                ["td", "th"]
            )

            if not cells:
                return None

            cell_texts = [
                self._clean_text(
                    cell.get_text(
                        " ",
                        strip=True
                    )
                )
                for cell in cells
            ]

            row_text = self._clean_text(
                row.get_text(
                    " ",
                    strip=True
                )
            )

            # ------------------------------------------------
            # Find title
            # ------------------------------------------------

            title = ""

            link = row.find(
                "a",
                href=True
            )

            if link:

                title = self._clean_text(
                    link.get_text(
                        " ",
                        strip=True
                    )
                )

            if not title and cell_texts:
                title = cell_texts[0]

            # ------------------------------------------------
            # Find PDF / detail link
            # ------------------------------------------------

            href = ""

            for anchor in row.find_all(
                "a",
                href=True
            ):

                candidate = anchor.get(
                    "href",
                    ""
                ).strip()

                if not candidate:
                    continue

                candidate_text = self._clean_text(
                    anchor.get_text(
                        " ",
                        strip=True
                    )
                ).lower()

                if (
                    ".pdf" in candidate.lower()
                    or "download" in candidate_text
                    or "view" in candidate_text
                    or "detail" in candidate_text
                ):
                    href = candidate
                    break

                if not href:
                    href = candidate

            if href:
                href = urljoin(
                    self.base_url,
                    href
                )

            # ------------------------------------------------
            # Extract dates
            # ------------------------------------------------

            dates = []

            for text in cell_texts:

                matches = re.findall(
                    r"\b\d{1,2}[-/.]\d{1,2}[-/.]\d{4}\b",
                    text
                )

                dates.extend(matches)

                matches2 = re.findall(
                    r"\b\d{1,2}\s+"
                    r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
                    r"[a-z]*\s+\d{4}\b",
                    text,
                    re.I
                )

                dates.extend(matches2)

            dates = list(
                dict.fromkeys(dates)
            )

            posted_date = ""
            closing_date = ""

            if len(dates) >= 1:
                posted_date = self._normalize_date(
                    dates[0]
                )

            if len(dates) >= 2:
                closing_date = self._normalize_date(
                    dates[1]
                )

            # ------------------------------------------------
            # Status
            # ------------------------------------------------

            status = ""

            for text in cell_texts:

                lower = text.lower()

                if "closed" in lower:
                    status = "Closed"
                    break

                if "open" in lower:
                    status = "Open"
                    break

                if "active" in lower:
                    status = "Active"
                    break

                if "expired" in lower:
                    status = "Expired"
                    break

            # ------------------------------------------------
            # Location
            # ------------------------------------------------

            location = ""

            pakistan_locations = [
                "lahore",
                "multan",
                "rawalpindi",
                "islamabad",
                "faisalabad",
                "gujranwala",
                "sialkot",
                "bahawalpur",
                "sargodha",
                "dera ghazi khan",
                "punjab",
            ]

            for text in cell_texts:

                lower = text.lower()

                if any(
                    location_name in lower
                    for location_name in pakistan_locations
                ):
                    location = text
                    break

            # ------------------------------------------------
            # Fallback location
            # ------------------------------------------------

            if not location:
                location = "Punjab, Pakistan"

            # ------------------------------------------------
            # Determine record type
            # ------------------------------------------------

            record_type = "job"

            # ------------------------------------------------
            # Return complete record
            # ------------------------------------------------

            record = {
                "record_type": record_type,
                "title": title,
                "description": row_text,
                "location": location,
                "posted_date": posted_date,
                "closing_date": closing_date,
                "closing_time": "",
                "status": status,
                "link": href,
                "source": self.SOURCE_NAME,
                "scraped_at": datetime.now(
                    timezone.utc
                ).isoformat(),
            }

            return record

        except Exception as exc:

            logger.exception(
                "[PSIC] Career row parsing failed: %s",
                exc
            )

            return None

    # ========================================================
    # PARSE CAREERS
    # ========================================================

    def parse_careers_html(
        self,
        soup: BeautifulSoup
    ) -> List[Dict[str, Any]]:

        careers = []

        if not soup:
            return careers

        rows = soup.find_all("tr")

        logger.info(
            "[PSIC] Found %s career rows",
            len(rows)
        )

        for row in rows:

            record = self._parse_career_row(
                row
            )

            if record and record.get("title"):

                careers.append(
                    record
                )

        logger.info(
            "[PSIC] Total careers extracted: %s",
            len(careers)
        )

        return careers

    # ========================================================
    # FIND PROJECT DETAIL LINKS
    # ========================================================

    def _find_project_links(
        self,
        soup: BeautifulSoup
    ) -> List[str]:

        links = []

        if not soup:
            return links

        seen = set()

        # ----------------------------------------------------
        # Find Drupal node links
        # ----------------------------------------------------

        for anchor in soup.find_all(
            "a",
            href=True
        ):

            href = anchor.get(
                "href",
                ""
            ).strip()

            if not href:
                continue

            absolute_url = urljoin(
                self.base_url,
                href
            )

            parsed_path = absolute_url.split(
                self.base_url,
                1
            )[-1]

            if re.search(
                r"/node/\d+/?$",
                parsed_path
            ):

                if absolute_url not in seen:

                    seen.add(
                        absolute_url
                    )

                    links.append(
                        absolute_url
                    )

        logger.info(
            "[PSIC] Found %s project node links on projects page",
            len(links)
        )

        return links

    # ========================================================
    # EXTRACT PROJECT TITLE
    # ========================================================

    def _extract_project_title(
        self,
        soup: BeautifulSoup
    ) -> str:

        selectors = [
            "h1.page-header",
            "h1",
            ".page-header",
            ".node-title",
            "article h1",
            "main h1",
        ]

        for selector in selectors:

            element = soup.select_one(
                selector
            )

            if element:

                title = self._clean_text(
                    element.get_text(
                        " ",
                        strip=True
                    )
                )

                if title:
                    return title

        # ----------------------------------------------------
        # Fallback to HTML title
        # ----------------------------------------------------

        if soup.title:

            title = self._clean_text(
                soup.title.get_text(
                    " ",
                    strip=True
                )
            )

            title = re.sub(
                r"\s*[-|]\s*"
                r"(Punjab Small Industries Corporation|PSIC).*$",
                "",
                title,
                flags=re.I
            )

            if title:
                return title

        return ""

    # ========================================================
    # EXTRACT PROJECT DESCRIPTION
    # ========================================================

    def _extract_project_description(
        self,
        soup: BeautifulSoup
    ) -> str:

        selectors = [
            ".field--name-body",
            ".field-name-body",
            ".node__content",
            ".field--type-text-with-summary",
            "article .content",
            "article",
            "main",
        ]

        for selector in selectors:

            elements = soup.select(
                selector
            )

            for element in elements:

                # Remove irrelevant elements
                for unwanted in element.select(
                    "script, style, nav, header, footer, "
                    ".breadcrumb, .pager, .pagination"
                ):
                    unwanted.decompose()

                text = self._clean_text(
                    element.get_text(
                        " ",
                        strip=True
                    )
                )

                if len(text) > 30:
                    return text

        return ""

    # ========================================================
    # FETCH PROJECT DETAIL
    # ========================================================

    def _fetch_project_detail(
        self,
        detail_url: str
    ) -> Optional[Dict[str, Any]]:

        logger.info(
            "[PSIC] Fetching project detail: %s",
            detail_url
        )

        soup = self._fetch(
            detail_url
        )

        if not soup:
            return None

        title = self._extract_project_title(
            soup
        )

        description = self._extract_project_description(
            soup
        )

        if not title:

            logger.warning(
                "[PSIC] Could not extract title: %s",
                detail_url
            )

            return None

        record_type = self._get_project_record_type(
            title,
            description
        )

        # ----------------------------------------------------
        # Try extracting additional information
        # ----------------------------------------------------

        location = self._find_label_value(
            soup,
            [
                "Location",
                "District",
                "City",
                "Address",
            ]
        )

        if not location:
            location = "Punjab, Pakistan"

        posted_date = self._find_label_value(
            soup,
            [
                "Posted Date",
                "Publish Date",
                "Published",
                "Date",
            ]
        )

        posted_date = self._normalize_date(
            posted_date
        )

        closing_date = self._find_label_value(
            soup,
            [
                "Closing Date",
                "Deadline",
                "Last Date",
            ]
        )

        closing_date = self._normalize_date(
            closing_date
        )

        status = self._find_label_value(
            soup,
            [
                "Status"
            ]
        )

        if not status:
            status = "N/A"

        # ----------------------------------------------------
        # Complete record
        # ----------------------------------------------------

        record = {
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
            "scraped_at": datetime.now(
                timezone.utc
            ).isoformat(),
        }

        return record

    # ========================================================
    # PARSE PROJECTS
    # ========================================================

    def parse_projects_html(
        self,
        soup: BeautifulSoup
    ) -> List[Dict[str, Any]]:

        projects = []

        if not soup:
            return projects

        detail_links = self._find_project_links(
            soup
        )

        for index, detail_url in enumerate(
            detail_links,
            start=1
        ):

            logger.info(
                "[PSIC] Processing project %s/%s",
                index,
                len(detail_links)
            )

            try:

                record = self._fetch_project_detail(
                    detail_url
                )

                if record:

                    projects.append(
                        record
                    )

            except Exception as exc:

                logger.exception(
                    "[PSIC] Failed project %s: %s",
                    detail_url,
                    exc
                )

        logger.info(
            "[PSIC] Total projects extracted: %s",
            len(projects)
        )

        return projects

    # ========================================================
    # SCRAPE ALL
    # ========================================================

    def scrape(self) -> List[Dict[str, Any]]:

        all_records = []

        logger.info("=" * 70)
        logger.info(
            "PSIC LIVE SCRAPER (CAREERS + PROJECTS)"
        )
        logger.info("=" * 70)

        logger.info(
            "[PSIC] Starting live scraper"
        )

        # ====================================================
        # CAREERS
        # ====================================================

        logger.info(
            "[PSIC] URL: %s",
            self.careers_url
        )

        careers_soup = self._fetch(
            self.careers_url
        )

        if careers_soup:

            careers = self.parse_careers_html(
                careers_soup
            )

            all_records.extend(
                careers
            )

        # ====================================================
        # PROJECTS
        # ====================================================

        logger.info(
            "[PSIC] URL: %s",
            self.projects_url
        )

        projects_soup = self._fetch(
            self.projects_url
        )

        if projects_soup:

            projects = self.parse_projects_html(
                projects_soup
            )

            all_records.extend(
                projects
            )

        # ====================================================
        # SUMMARY
        # ====================================================

        career_count = sum(
            1
            for record in all_records
            if record.get("record_type") == "job"
        )

        project_count = sum(
            1
            for record in all_records
            if record.get("record_type") == "project"
        )

        loan_count = sum(
            1
            for record in all_records
            if record.get("record_type") == "loan"
        )

        logger.info("=" * 70)
        logger.info(
            "[PSIC] SCRAPING COMPLETE"
        )
        logger.info(
            "[PSIC] Careers: %s",
            career_count
        )
        logger.info(
            "[PSIC] Projects: %s",
            project_count
        )
        logger.info(
            "[PSIC] Loans: %s",
            loan_count
        )
        logger.info(
            "[PSIC] Total records: %s",
            len(all_records)
        )
        logger.info("=" * 70)

        return all_records

    # ========================================================
    # DATABASE FORMAT
    # ========================================================

    def to_db_format(
        self,
        record: Dict[str, Any]
    ) -> Dict[str, Any]:

        category = record.get(
            "record_type",
            "job"
        )

        # ----------------------------------------------------
        # Preserve EVERYTHING
        # ----------------------------------------------------

        extra_data = dict(
            record
        )

        # record_type is represented by category
        extra_data.pop(
            "record_type",
            None
        )

        return {
            "category": category,
            "extra_data": extra_data,
        }

    # ========================================================
    # SAVE TO DATABASE
    # ========================================================

    def save_to_database(
        self,
        records: List[Dict[str, Any]]
    ) -> None:

        if not records:

            logger.warning(
                "[PSIC] No records to save"
            )

            return

        logger.info(
            "[PSIC] Saving %s records to database",
            len(records)
        )

        try:

            db = get_db()

            # ------------------------------------------------
            # Convert records
            # ------------------------------------------------

            db_records = [
                self.to_db_format(
                    record
                )
                for record in records
            ]

            # ------------------------------------------------
            # Group by category
            # ------------------------------------------------

            categories = set(
                record["category"]
                for record in db_records
            )

            # ------------------------------------------------
            # Delete old PSIC records
            # ------------------------------------------------

            for category in categories:

                try:

                    existing = (
                        db.table("opportunities")
                        .select("id, category, extra_data")
                        .eq(
                            "category",
                            category
                        )
                        .execute()
                    )

                    if existing.data:

                        delete_ids = []

                        for row in existing.data:

                            extra_data = row.get(
                                "extra_data"
                            ) or {}

                            if (
                                extra_data.get("source")
                                == self.SOURCE_NAME
                            ):

                                delete_ids.append(
                                    row["id"]
                                )

                        if delete_ids:

                            logger.info(
                                "[PSIC] Removing %s old %s records",
                                len(delete_ids),
                                category
                            )

                            for record_id in delete_ids:

                                (
                                    db.table("opportunities")
                                    .delete()
                                    .eq(
                                        "id",
                                        record_id
                                    )
                                    .execute()
                                )

                except Exception as exc:

                    logger.warning(
                        "[PSIC] Could not clean old %s records: %s",
                        category,
                        exc
                    )

            # ------------------------------------------------
            # Insert fresh records
            # ------------------------------------------------

            if db_records:

                response = (
                    db.table("opportunities")
                    .insert(db_records)
                    .execute()
                )

                inserted_count = len(
                    response.data
                    if response.data
                    else db_records
                )

                logger.info(
                    "[PSIC] Successfully inserted %s records",
                    inserted_count
                )

        except Exception as exc:

            logger.exception(
                "[PSIC] Database save failed: %s",
                exc
            )

            raise

    # ========================================================
    # RUN
    # ========================================================

    def run(self) -> List[Dict[str, Any]]:

        records = self.scrape()

        if records:

            self.save_to_database(
                records
            )

        else:

            logger.warning(
                "[PSIC] Nothing was scraped"
            )

        return records


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    scraper = PSICScraper()

    records = scraper.run()

    print()
    print("=" * 70)
    print("PSIC SCRAPING RESULT")
    print("=" * 70)

    for index, record in enumerate(
        records,
        start=1
    ):

        print()
        print(f"Record #{index}")
        print("-" * 70)

        for key, value in record.items():

            print(
                f"{key}: {value}"
            )

    print()
    print("=" * 70)
    print(
        f"TOTAL RECORDS: {len(records)}"
    )
    print("=" * 70)