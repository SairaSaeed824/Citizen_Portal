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
            "AppleWebKit/537.36 (KHTML, like Gecko) "
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
    DELAY_SECONDS = 2.5

    # ========================================================
    # INIT
    # ========================================================

    def __init__(self):
        super().__init__(
            source_name=self.SOURCE_NAME,
            base_url=self.base_url,
            delay_seconds=self.DELAY_SECONDS,
        )

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
            if not self.is_allowed(url):
                logger.warning("[PSIC] robots.txt blocked URL: %s", url)
                return None

            self.respectful_delay()
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

            return BeautifulSoup(response.text, "html.parser")

        except requests.RequestException as exc:
            logger.error("[PSIC] Request failed: %s", exc)
            return None

        except Exception as exc:
            logger.exception("[PSIC] Unexpected fetch error: %s", exc)
            return None

    # ========================================================
    # FIND VALUE FROM CONTAINER
    # ========================================================

    def _find_label_value(
        self,
        container,
        labels: List[str]
    ) -> str:
        if not container:
            return ""

        text = self._clean_text(container.get_text(" ", strip=True))

        cells = container.find_all(
            ["td", "th", "dt", "dd", "div", "span", "p"]
        )

        for index, element in enumerate(cells):
            current = self._clean_text(
                element.get_text(" ", strip=True)
            )

            for label in labels:
                match = re.search(
                    rf"{re.escape(label)}\s*:\s*(.+)",
                    current,
                    re.I
                )

                if match:
                    return self._clean_text(match.group(1))

                if label.lower() in current.lower():
                    if index + 1 < len(cells):
                        next_value = self._clean_text(
                            cells[index + 1].get_text(" ", strip=True)
                        )
                        if next_value:
                            return next_value

        for label in labels:
            match = re.search(
                rf"{re.escape(label)}\s*:\s*([^|]+)",
                text,
                re.I
            )

            if match:
                return self._clean_text(match.group(1))

        return ""

    # ========================================================
    # DETERMINE RECORD TYPE
    # ========================================================

    @staticmethod
    def _get_project_record_type(
        title: str,
        description: str
    ) -> str:
        combined = f"{title} {description}".lower()

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

        if any(keyword in combined for keyword in loan_keywords):
            return "loan"

        return "project"

    # ========================================================
    # CAREER RECORD
    # ========================================================

    def _parse_career_row(self, row) -> Optional[Dict[str, Any]]:
        try:
            cells = row.find_all(["td", "th"])

            if not cells:
                return None

            cell_texts = [
                self._clean_text(cell.get_text(" ", strip=True))
                for cell in cells
            ]

            row_text = self._clean_text(row.get_text(" ", strip=True))

            title = ""
            link = row.find("a", href=True)

            if link:
                title = self._clean_text(link.get_text(" ", strip=True))

            if not title and cell_texts:
                title = cell_texts[0]

            href = ""

            for anchor in row.find_all("a", href=True):
                candidate = anchor.get("href", "").strip()
                if not candidate:
                    continue

                candidate_text = self._clean_text(
                    anchor.get_text(" ", strip=True)
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
                href = urljoin(self.base_url, href)

            dates = []

            for text in cell_texts:
                dates.extend(re.findall(
                    r"\b\d{1,2}[-/.]\d{1,2}[-/.]\d{4}\b",
                    text
                ))
                dates.extend(re.findall(
                    r"\b\d{1,2}\s+"
                    r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
                    r"[a-z]*\s+\d{4}\b",
                    text,
                    re.I
                ))

            dates = list(dict.fromkeys(dates))

            posted_date = (
                self._normalize_date(dates[0])
                if len(dates) >= 1 else ""
            )
            closing_date = (
                self._normalize_date(dates[1])
                if len(dates) >= 2 else ""
            )

            status = ""
            for text in cell_texts:
                lower = text.lower()
                if "closed" in lower:
                    status = "Closed"
                    break
                if "expired" in lower:
                    status = "Expired"
                    break
                if "active" in lower:
                    status = "Active"
                    break
                if "open" in lower:
                    status = "Open"
                    break

            location = ""
            pakistan_locations = [
                "lahore", "multan", "rawalpindi", "islamabad",
                "faisalabad", "gujranwala", "sialkot", "bahawalpur",
                "sargodha", "dera ghazi khan", "punjab",
            ]

            for text in cell_texts:
                lower = text.lower()
                if any(name in lower for name in pakistan_locations):
                    location = text
                    break

            if not location:
                location = "Punjab, Pakistan"

            return {
                "record_type": "job",
                "title": title,
                "description": row_text,
                "location": location,
                "posted_date": posted_date,
                "closing_date": closing_date,
                "closing_time": "",
                "status": status,
                "link": href,
                "source": self.SOURCE_NAME,
                "scraped_at": datetime.now(timezone.utc).isoformat(),
            }

        except Exception as exc:
            logger.exception("[PSIC] Career row parsing failed: %s", exc)
            return None

    # ========================================================
    # PARSE CAREERS
    # ========================================================

    def parse_careers_html(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        careers: List[Dict[str, Any]] = []

        if not soup:
            return careers

        rows = soup.find_all("tr")
        logger.info("[PSIC] Found %s career rows", len(rows))

        for row in rows:
            record = self._parse_career_row(row)
            if record and record.get("title"):
                careers.append(record)

        logger.info("[PSIC] Total careers extracted: %s", len(careers))
        return careers

    # ========================================================
    # FIND PROJECT DETAIL LINKS
    # ========================================================

    def _find_project_links(self, soup: BeautifulSoup) -> List[str]:
        links: List[str] = []

        if not soup:
            return links

        seen = set()

        for anchor in soup.find_all("a", href=True):
            href = anchor.get("href", "").strip()
            if not href:
                continue

            absolute_url = urljoin(self.base_url, href)
            parsed_path = absolute_url.split(self.base_url, 1)[-1]

            if re.search(r"/node/\d+/?$", parsed_path):
                if absolute_url not in seen:
                    seen.add(absolute_url)
                    links.append(absolute_url)

        logger.info(
            "[PSIC] Found %s project node links on projects page",
            len(links)
        )
        return links

    # ========================================================
    # EXTRACT PROJECT TITLE
    # ========================================================

    def _extract_project_title(self, soup: BeautifulSoup) -> str:
        selectors = [
            "h1.page-header",
            "h1",
            ".page-header",
            ".node-title",
            "article h1",
            "main h1",
        ]

        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                title = self._clean_text(
                    element.get_text(" ", strip=True)
                )
                if title:
                    return title

        if soup.title:
            title = self._clean_text(soup.title.get_text(" ", strip=True))
            title = re.sub(
                r"\s*[-|]\s*(Punjab Small Industries Corporation|PSIC).*$",
                "",
                title,
                flags=re.I
            )
            if title:
                return title

        return ""

    # ========================================================
    # REMOVE WEBSITE CHROME FROM CONTENT
    # ========================================================

    @staticmethod
    def _remove_site_chrome(text: str) -> str:
        """Remove repeated PSIC header/footer/navigation text."""
        if not text:
            return ""

        noise_phrases = [
            "FAQs Rules & Policies Downloads Publications Sitemap Contact Us",
            "Head Office Punjab Small Industries Corporation",
            "23 A DAVIS ROAD PSIC HOUSE, LAHORE",
            "Contact: 042- 992000439",
            "About Us Field offices Objectives Messages Board of Members Core Team Organogram",
            "Overview Vision Mission",
            "Quick Links Tenders Jobs",
            "Punjab Small Industries Corporation, Government of the Punjab",
            "Powered by: Punjab Information Technology Board",
        ]

        cleaned = text

        for phrase in noise_phrases:
            cleaned = re.sub(
                re.escape(phrase),
                " ",
                cleaned,
                flags=re.I
            )

        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    # ========================================================
    # CHECK IF TEXT IS MOSTLY WEBSITE NAVIGATION
    # ========================================================

    @staticmethod
    def _is_navigation_text(text: str, title: str = "") -> bool:
        if not text:
            return True

        lower = text.lower()

        navigation_terms = [
            "faqs",
            "rules & policies",
            "downloads",
            "publications",
            "sitemap",
            "contact us",
            "head office",
            "quick links",
            "powered by",
            "core team",
            "organogram",
            "board of members",
            "field offices",
        ]

        hits = sum(1 for term in navigation_terms if term in lower)

        if hits >= 3:
            return True

        if title:
            title_lower = title.lower()
            if lower == title_lower:
                return False

        return False

    # ========================================================
    # EXTRACT PROJECT DESCRIPTION
    # ========================================================

    def _extract_project_description(self, soup: BeautifulSoup) -> str:
        """Extract actual node content instead of the full website chrome."""

        selectors = [
            ".field--name-body",
            ".field-name-body",
            ".field--type-text-with-summary",
            ".node__content",
            ".node__body",
            ".field--name-field-description",
            ".field--name-field-content",
            "article .content",
            "article",
            "[role='main']",
            "main",
        ]

        # Site-wide elements that should never become a project description.
        unwanted_selectors = [
            "script",
            "style",
            "noscript",
            "nav",
            "header",
            "footer",
            "aside",
            "form",
            ".breadcrumb",
            ".pager",
            ".pagination",
            ".region-sidebar-first",
            ".region-sidebar-second",
            ".sidebar",
            ".menu",
            ".navbar",
            ".toolbar",
        ]

        candidates: List[str] = []

        for selector in selectors:
            for element in soup.select(selector):
                element_copy = BeautifulSoup(
                    str(element),
                    "html.parser"
                )

                # Remove elements by standard selectors.
                for unwanted in element_copy.select(
                    ", ".join(unwanted_selectors)
                ):
                    unwanted.decompose()

                # Remove containers whose class/id clearly belongs to
                # website chrome (menu/header/footer/sidebar/navigation).
                for node in element_copy.find_all(True):
                    class_text = " ".join(node.get("class", []))
                    id_text = node.get("id", "") or ""
                    marker = f"{class_text} {id_text}".lower()

                    if re.search(
                        r"(header|footer|sidebar|navbar|navigation|menu|breadcrumb|toolbar|region-sidebar)",
                        marker,
                        re.I
                    ):
                        node.decompose()

                text = self._clean_text(
                    element_copy.get_text(" ", strip=True)
                )

                text = self._remove_site_chrome(text)

                if not text:
                    continue

                if self._is_navigation_text(text):
                    continue

                candidates.append(text)

        if not candidates:
            return ""

        # Prefer the most focused/shortest meaningful content instead of
        # returning a large parent <main> containing unrelated page text.
        candidates = list(dict.fromkeys(candidates))
        candidates.sort(key=lambda value: len(value))

        for candidate in candidates:
            if len(candidate) >= 20:
                return candidate

        return candidates[0]

    # ========================================================
    # FETCH PROJECT DETAIL
    # ========================================================

    def _fetch_project_detail(
        self,
        detail_url: str
    ) -> Optional[Dict[str, Any]]:
        logger.info("[PSIC] Fetching project detail: %s", detail_url)

        soup = self._fetch(detail_url)
        if not soup:
            return None

        title = self._extract_project_title(soup)
        description = self._extract_project_description(soup)

        if not title:
            logger.warning(
                "[PSIC] Could not extract title: %s",
                detail_url
            )
            return None

        record_type = self._get_project_record_type(title, description)

        location = self._find_label_value(
            soup,
            ["Location", "District", "City", "Address"]
        ) or "Punjab, Pakistan"

        posted_date = self._normalize_date(
            self._find_label_value(
                soup,
                ["Posted Date", "Publish Date", "Published", "Date"]
            )
        )

        closing_date = self._normalize_date(
            self._find_label_value(
                soup,
                ["Closing Date", "Deadline", "Last Date"]
            )
        )

        status = self._find_label_value(soup, ["Status"]) or "N/A"

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

    # ========================================================
    # PARSE PROJECTS
    # ========================================================

    def parse_projects_html(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        projects: List[Dict[str, Any]] = []

        if not soup:
            return projects

        detail_links = self._find_project_links(soup)

        for index, detail_url in enumerate(detail_links, start=1):
            logger.info(
                "[PSIC] Processing project %s/%s",
                index,
                len(detail_links)
            )

            try:
                record = self._fetch_project_detail(detail_url)
                if record:
                    projects.append(record)
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
        all_records: List[Dict[str, Any]] = []

        logger.info("=" * 70)
        logger.info("PSIC LIVE SCRAPER (CAREERS + PROJECTS)")
        logger.info("=" * 70)
        logger.info("[PSIC] Starting live scraper")

        logger.info("[PSIC] URL: %s", self.careers_url)
        careers_soup = self._fetch(self.careers_url)

        if careers_soup:
            all_records.extend(self.parse_careers_html(careers_soup))

        logger.info("[PSIC] URL: %s", self.projects_url)
        projects_soup = self._fetch(self.projects_url)

        if projects_soup:
            all_records.extend(self.parse_projects_html(projects_soup))

        career_count = sum(
            1 for record in all_records
            if record.get("record_type") == "job"
        )
        project_count = sum(
            1 for record in all_records
            if record.get("record_type") == "project"
        )
        loan_count = sum(
            1 for record in all_records
            if record.get("record_type") == "loan"
        )

        logger.info("=" * 70)
        logger.info("[PSIC] SCRAPING COMPLETE")
        logger.info("[PSIC] Careers: %s", career_count)
        logger.info("[PSIC] Projects: %s", project_count)
        logger.info("[PSIC] Loans: %s", loan_count)
        logger.info("[PSIC] Total records: %s", len(all_records))
        logger.info("=" * 70)

        return all_records

    # ========================================================
    # DATABASE FORMAT
    # ========================================================

    def to_db_format(self, record: Dict[str, Any]) -> Dict[str, Any]:
        category = record.get("record_type", "job")

        extra_data = dict(record)
        extra_data.pop("record_type", None)

        return {
            "category": category,
            "extra_data": extra_data,
        }

    # ========================================================
    # SAVE TO DATABASE
    # ========================================================

    def save_to_database(self, records: List[Dict[str, Any]]) -> None:
        if not records:
            logger.warning("[PSIC] No records to save")
            return

        logger.info(
            "[PSIC] Saving %s records to database",
            len(records)
        )

        try:
            db = get_db()

            db_records = [
                self.to_db_format(record)
                for record in records
            ]

            categories = set(
                record["category"]
                for record in db_records
            )

            for category in categories:
                try:
                    existing = (
                        db.table("opportunities")
                        .select("id, category, extra_data")
                        .eq("category", category)
                        .execute()
                    )

                    delete_ids = []

                    for row in (existing.data or []):
                        extra_data = row.get("extra_data") or {}

                        if extra_data.get("source") == self.SOURCE_NAME:
                            delete_ids.append(row["id"])

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
                                .eq("id", record_id)
                                .execute()
                            )

                except Exception as exc:
                    logger.warning(
                        "[PSIC] Could not clean old %s records: %s",
                        category,
                        exc
                    )

            response = (
                db.table("opportunities")
                .insert(db_records)
                .execute()
            )

            inserted_count = len(
                response.data if response.data else db_records
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
            self.save_to_database(records)
        else:
            logger.warning("[PSIC] Nothing was scraped")

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

    for index, record in enumerate(records, start=1):
        print()
        print(f"Record #{index}")
        print("-" * 70)

        for key, value in record.items():
            print(f"{key}: {value}")

    print()
    print("=" * 70)
    print(f"TOTAL RECORDS: {len(records)}")
    print("=" * 70)
