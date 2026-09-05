import os
import sys
import re
import logging
import urllib3

from datetime import datetime, timezone
from typing import Any, Dict, List
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
# IMPORTS
# ============================================================

from app.scrapers.base import BaseScraper
from app.core.database import get_db


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: [%(name)s] %(message)s"
)

logger = logging.getLogger("PMYP")


# ============================================================
# SSL WARNING
# ============================================================

urllib3.disable_warnings(
    urllib3.exceptions.InsecureRequestWarning
)


# ============================================================
# PMYP SCRAPER
# ============================================================

class PMYPScraper(BaseScraper):

    base_url = "https://pmybals.pmyp.gov.pk"

    scholarships_url = (
        "https://pmybals.pmyp.gov.pk/"
        "pmyphome/Scholarship"
    )

    # ========================================================
    # INIT
    # ========================================================

    def __init__(self):

        super().__init__(
            source_name="PMYP Website",
            base_url=self.base_url
        )

        self.logger = logger

        self.session = requests.Session()

        self.session.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 "
                "(KHTML, like Gecko) "
                "Chrome/151.0.0.0 Safari/537.36"
            ),
            "Accept": (
                "text/html,application/xhtml+xml,"
                "application/xml;q=0.9,"
                "image/avif,image/webp,*/*;q=0.8"
            ),
            "Accept-Language": "en-US,en;q=0.9",
            "Connection": "keep-alive",
        })

    # ========================================================
    # CLEAN TEXT
    # ========================================================

    def clean_text(
        self,
        text: Any
    ) -> str:

        if text is None:
            return ""

        text = str(text)

        text = text.replace(
            "\xa0",
            " "
        )

        text = re.sub(
            r"\s+",
            " ",
            text
        )

        return text.strip()

    # ========================================================
    # NORMALIZE DATE
    # ========================================================

    def normalize_date(
        self,
        text: str
    ) -> str:

        text = self.clean_text(text)

        if not text:
            return ""

        formats = [
            "%Y-%m-%d",
            "%Y/%m/%d",

            "%d-%m-%Y",
            "%d/%m/%Y",

            "%m-%d-%Y",
            "%m/%d/%Y",

            "%d %B %Y",
            "%d %b %Y",

            "%d %B, %Y",
            "%d %b, %Y",

            "%B %d %Y",
            "%b %d %Y",

            "%B %d, %Y",
            "%b %d, %Y",
        ]

        for fmt in formats:

            try:

                date_obj = datetime.strptime(
                    text,
                    fmt
                )

                return date_obj.strftime(
                    "%Y-%m-%d"
                )

            except ValueError:
                continue

        # ----------------------------------------------------
        # Search date inside text
        # ----------------------------------------------------

        patterns = [

            r"\b\d{4}-\d{1,2}-\d{1,2}\b",

            r"\b\d{1,2}[/-]\d{1,2}[/-]\d{4}\b",

            r"\b"
            r"(?:January|February|March|April|May|June|"
            r"July|August|September|October|November|December)"
            r"\s+\d{1,2},?\s+\d{4}"
            r"\b",

            r"\b"
            r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
            r"\s+\d{1,2},?\s+\d{4}"
            r"\b",

            r"\b\d{1,2}\s+"
            r"(?:January|February|March|April|May|June|"
            r"July|August|September|October|November|December)"
            r",?\s+\d{4}\b",

            r"\b\d{1,2}\s+"
            r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
            r",?\s+\d{4}\b",
        ]

        for pattern in patterns:

            match = re.search(
                pattern,
                text,
                re.IGNORECASE
            )

            if match:

                found = match.group(0)

                result = self.normalize_date(
                    found
                )

                if result:
                    return result

        return ""

    # ========================================================
    # EXTRACT DATES
    # ========================================================

    def _extract_dates(
        self,
        card
    ) -> Dict[str, str]:

        result = {
            "posted_date": "",
            "closing_date": ""
        }

        card_text = self.clean_text(
            card.get_text(
                " ",
                strip=True
            )
        )

        if not card_text:
            return result

        # ----------------------------------------------------
        # Posted date
        # ----------------------------------------------------

        posted_patterns = [

            r"posted\s*(?:on|date)?\s*:?\s*"
            r"([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})",

            r"published\s*(?:on|date)?\s*:?\s*"
            r"([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})",

            r"posted\s*(?:on|date)?\s*:?\s*"
            r"(\d{1,2}[/-]\d{1,2}[/-]\d{4})",

            r"published\s*(?:on|date)?\s*:?\s*"
            r"(\d{1,2}[/-]\d{1,2}[/-]\d{4})",

            r"posted\s*(?:on|date)?\s*:?\s*"
            r"(\d{4}-\d{1,2}-\d{1,2})",
        ]

        for pattern in posted_patterns:

            match = re.search(
                pattern,
                card_text,
                re.IGNORECASE
            )

            if match:

                date = self.normalize_date(
                    match.group(1)
                )

                if date:

                    result["posted_date"] = date

                    break

        # ----------------------------------------------------
        # Closing date
        # ----------------------------------------------------

        closing_patterns = [

            r"closing\s*(?:date)?\s*:?\s*"
            r"([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})",

            r"deadline\s*:?\s*"
            r"([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})",

            r"last\s*date\s*:?\s*"
            r"([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})",

            r"expired\s*on\s*:?\s*"
            r"([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})",

            r"closing\s*(?:date)?\s*:?\s*"
            r"(\d{1,2}[/-]\d{1,2}[/-]\d{4})",

            r"deadline\s*:?\s*"
            r"(\d{1,2}[/-]\d{1,2}[/-]\d{4})",

            r"last\s*date\s*:?\s*"
            r"(\d{1,2}[/-]\d{1,2}[/-]\d{4})",

            r"expired\s*on\s*:?\s*"
            r"(\d{1,2}[/-]\d{1,2}[/-]\d{4})",

            r"closing\s*(?:date)?\s*:?\s*"
            r"(\d{4}-\d{1,2}-\d{1,2})",

            r"deadline\s*:?\s*"
            r"(\d{4}-\d{1,2}-\d{1,2})",

            r"last\s*date\s*:?\s*"
            r"(\d{4}-\d{1,2}-\d{1,2})",
        ]

        for pattern in closing_patterns:

            match = re.search(
                pattern,
                card_text,
                re.IGNORECASE
            )

            if match:

                date = self.normalize_date(
                    match.group(1)
                )

                if date:

                    result["closing_date"] = date

                    break

        # ----------------------------------------------------
        # Element fallback
        # ----------------------------------------------------

        if not result["closing_date"]:

            for element in card.find_all(
                [
                    "span",
                    "div",
                    "p",
                    "small",
                    "label",
                    "strong"
                ]
            ):

                text = self.clean_text(
                    element.get_text(
                        " ",
                        strip=True
                    )
                )

                if not text:
                    continue

                lower = text.lower()

                if any(
                    keyword in lower
                    for keyword in [
                        "deadline",
                        "closing date",
                        "last date",
                        "expired on"
                    ]
                ):

                    date = self.normalize_date(
                        text
                    )

                    if date:

                        result["closing_date"] = date

                        break

        return result

    # ========================================================
    # EXTRACT TITLE
    # ========================================================

    def _extract_title(
        self,
        card
    ) -> str:

        # ----------------------------------------------------
        # PMYP actual title
        # ----------------------------------------------------

        element = card.select_one(
            ".--title .--designation"
        )

        if element:

            title = self.clean_text(
                element.get_text(
                    " ",
                    strip=True
                )
            )

            if (
                len(title) > 3
                and not re.match(
                    r"^description\s*:?\s*$",
                    title,
                    re.IGNORECASE
                )
            ):
                return title

        # ----------------------------------------------------
        # Direct designation fallback
        # ----------------------------------------------------

        element = card.select_one(
            ".--designation"
        )

        if element:

            title = self.clean_text(
                element.get_text(
                    " ",
                    strip=True
                )
            )

            if (
                len(title) > 3
                and not re.match(
                    r"^description\s*:?\s*$",
                    title,
                    re.IGNORECASE
                )
            ):
                return title

        # ----------------------------------------------------
        # Common heading tags
        # ----------------------------------------------------

        for tag in [
            "h1",
            "h2",
            "h3",
            "h4"
        ]:

            elements = card.find_all(tag)

            for element in elements:

                title = self.clean_text(
                    element.get_text(
                        " ",
                        strip=True
                    )
                )

                if (
                    len(title) > 3
                    and not re.match(
                        r"^(description|details|eligibility)\s*:?\s*$",
                        title,
                        re.IGNORECASE
                    )
                ):
                    return title

        # ----------------------------------------------------
        # Common classes
        # ----------------------------------------------------

        selectors = [
            ".title",
            ".job_title",
            ".job-title",
            ".scholarship-title",
            ".card-title",
            ".heading",
            "[class*='title']",
        ]

        for selector in selectors:

            element = card.select_one(
                selector
            )

            if element:

                title = self.clean_text(
                    element.get_text(
                        " ",
                        strip=True
                    )
                )

                if (
                    len(title) > 3
                    and not re.match(
                        r"^(description|details|eligibility)\s*:?\s*$",
                        title,
                        re.IGNORECASE
                    )
                ):
                    return title

        return ""

    # ========================================================
    # EXTRACT LOCATION
    # ========================================================

    def _extract_location(
        self,
        card
    ) -> str:

        selectors = [
            ".location",
            ".job-location",
            ".scholarship-location",
            "[class*='location']",
        ]

        for selector in selectors:

            element = card.select_one(
                selector
            )

            if element:

                text = self.clean_text(
                    element.get_text(
                        " ",
                        strip=True
                    )
                )

                if text:
                    return text

        card_text = self.clean_text(
            card.get_text(
                " ",
                strip=True
            )
        )

        match = re.search(
            r"location\s*:?\s*(.*?)(?="
            r"posted|closing|deadline|last date|$)",
            card_text,
            re.IGNORECASE
        )

        if match:

            location = self.clean_text(
                match.group(1)
            )

            if location:
                return location

        # PMYP default
        return "Lahore, Punjab"

    # ========================================================
    # EXTRACT DESCRIPTION
    # ========================================================

    def _extract_description(
        self,
        card
    ) -> str:

        # ----------------------------------------------------
        # PMYP ACTUAL DESCRIPTION STRUCTURE
        #
        # <div class="job_description">
        #     <div class="--jd">
        #         <h5 class="--h">Description:</h5>
        #         Actual description...
        #     </div>
        # </div>
        # ----------------------------------------------------

        element = card.select_one(
            ".job_description .--jd"
        )

        if element:

            # ------------------------------------------------
            # Remove exact Description heading
            # ------------------------------------------------

            heading = element.select_one(
                ".--h"
            )

            if heading:
                heading.decompose()

            # ------------------------------------------------
            # Remove remaining Description headings
            # ------------------------------------------------

            for heading in element.find_all(
                [
                    "h1",
                    "h2",
                    "h3",
                    "h4",
                    "h5",
                    "h6"
                ]
            ):

                heading_text = self.clean_text(
                    heading.get_text(
                        " ",
                        strip=True
                    )
                )

                if re.match(
                    r"^description\s*:?",
                    heading_text,
                    re.IGNORECASE
                ):

                    heading.decompose()

            # ------------------------------------------------
            # Get actual description
            # ------------------------------------------------

            text = self.clean_text(
                element.get_text(
                    " ",
                    strip=True
                )
            )

            # ------------------------------------------------
            # Extra safety
            # ------------------------------------------------

            text = re.sub(
                r"^\s*description\s*:\s*",
                "",
                text,
                flags=re.IGNORECASE
            )

            text = re.sub(
                r"^\s*description\s*-\s*",
                "",
                text,
                flags=re.IGNORECASE
            )

            return self.clean_text(
                text
            )

        # ----------------------------------------------------
        # Fallback
        # ----------------------------------------------------

        selectors = [
            ".description",
            ".desc",
            ".details",
            ".content",
            ".card-text",
            "[class*='description']",
        ]

        for selector in selectors:

            element = card.select_one(
                selector
            )

            if not element:
                continue

            # ------------------------------------------------
            # Remove description heading
            # ------------------------------------------------

            for heading in element.find_all(
                [
                    "h1",
                    "h2",
                    "h3",
                    "h4",
                    "h5",
                    "h6"
                ]
            ):

                heading_text = self.clean_text(
                    heading.get_text(
                        " ",
                        strip=True
                    )
                )

                if re.match(
                    r"^description\s*:?",
                    heading_text,
                    re.IGNORECASE
                ):

                    heading.decompose()

            text = self.clean_text(
                element.get_text(
                    " ",
                    strip=True
                )
            )

            text = re.sub(
                r"^\s*description\s*:\s*",
                "",
                text,
                flags=re.IGNORECASE
            )

            if len(text) > 10:

                return self.clean_text(
                    text
                )

        return ""

    # ========================================================
    # EXTRACT LINK
    # ========================================================

    def _extract_link(
        self,
        card
    ) -> str:

        links = card.find_all(
            "a",
            href=True
        )

        # ----------------------------------------------------
        # Prefer apply/detail links
        # ----------------------------------------------------

        for link in links:

            href = self.clean_text(
                link.get(
                    "href",
                    ""
                )
            )

            text = self.clean_text(
                link.get_text(
                    " ",
                    strip=True
                )
            ).lower()

            if not href:
                continue

            if (
                "apply" in text
                or "detail" in text
                or "view" in text
                or "more" in text
            ):

                return urljoin(
                    self.base_url,
                    href
                )

        # ----------------------------------------------------
        # First valid link
        # ----------------------------------------------------

        for link in links:

            href = self.clean_text(
                link.get(
                    "href",
                    ""
                )
            )

            if href:

                return urljoin(
                    self.base_url,
                    href
                )

        return "N/A"

    # ========================================================
    # EXTRACT ICON
    # ========================================================

    def _extract_icon(
        self,
        card
    ) -> str:

        img = card.find(
            "img",
            src=True
        )

        if img:

            src = self.clean_text(
                img.get(
                    "src",
                    ""
                )
            )

            if src:

                return urljoin(
                    self.base_url,
                    src
                )

        return (
            "https://pmybals.pmyp.gov.pk/"
            "assets/images/microsoftSkills/"
            "student.png"
        )

    # ========================================================
    # EXTRACT CARD
    # ========================================================

    def _extract_from_card(
        self,
        card,
        index: int
    ) -> Dict[str, Any]:

        scholarship = {}

        # ----------------------------------------------------
        # TITLE
        # ----------------------------------------------------

        title = self._extract_title(
            card
        )

        if not title:
            return scholarship

        scholarship["title"] = title

        # ----------------------------------------------------
        # LOCATION
        # ----------------------------------------------------

        scholarship["location"] = (
            self._extract_location(
                card
            )
        )

        # ----------------------------------------------------
        # DESCRIPTION
        # ----------------------------------------------------

        scholarship["description"] = (
            self._extract_description(
                card
            )
        )

        # ----------------------------------------------------
        # LINK
        # ----------------------------------------------------

        scholarship["link"] = (
            self._extract_link(
                card
            )
        )

        # ----------------------------------------------------
        # ICON
        # ----------------------------------------------------

        scholarship["icon"] = (
            self._extract_icon(
                card
            )
        )

        # ----------------------------------------------------
        # DATES
        # ----------------------------------------------------

        dates = self._extract_dates(
            card
        )

        scholarship["posted_date"] = (
            dates.get(
                "posted_date",
                ""
            )
        )

        scholarship["closing_date"] = (
            dates.get(
                "closing_date",
                ""
            )
        )

        # ----------------------------------------------------
        # SOURCE
        # ----------------------------------------------------

        scholarship["source"] = (
            "PMYP Website"
        )

        # ----------------------------------------------------
        # SCRAPED AT
        # ----------------------------------------------------

        scholarship["scraped_at"] = (
            datetime.now(
                timezone.utc
            ).isoformat()
        )

        return scholarship

    # ========================================================
    # PARSE HTML
    # ========================================================

    def parse_html(
        self,
        html_content: str
    ) -> List[Dict[str, Any]]:

        soup = BeautifulSoup(
            html_content,
            "html.parser"
        )

        scholarships = []

        # ----------------------------------------------------
        # PMYP CARD SELECTORS
        # ----------------------------------------------------

        cards = soup.select(
            "div.job_card"
        )

        if not cards:

            cards = soup.select(
                ".job_card"
            )

        if not cards:

            cards = soup.select(
                "[class*='job_card']"
            )

        # ----------------------------------------------------
        # Fallback
        # ----------------------------------------------------

        if not cards:

            cards = soup.select(
                ".card"
            )

        if not cards:

            cards = soup.select(
                ".scholarship-card"
            )

        logger.info(
            f"[PMYP] Found "
            f"{len(cards)} scholarship cards"
        )

        # ----------------------------------------------------
        # EXTRACT
        # ----------------------------------------------------

        for index, card in enumerate(
            cards,
            start=1
        ):

            try:

                scholarship = (
                    self._extract_from_card(
                        card,
                        index
                    )
                )

                if scholarship.get(
                    "title"
                ):

                    scholarships.append(
                        scholarship
                    )

            except Exception as e:

                logger.warning(
                    f"[PMYP] Error parsing card "
                    f"{index}: {e}"
                )

        logger.info(
            f"[PMYP] Total extracted: "
            f"{len(scholarships)}"
        )

        return scholarships

    # ========================================================
    # SCRAPE LIVE
    # ========================================================

    def scrape_live(
        self
    ) -> List[Dict[str, Any]]:

        logger.info(
            "[PMYP] Starting live scraper"
        )

        logger.info(
            f"[PMYP] URL: "
            f"{self.scholarships_url}"
        )

        try:

            response = self.session.get(
                self.scholarships_url,
                timeout=30,
                verify=False
            )

            response.raise_for_status()

            logger.info(
                f"[PMYP] HTTP Status: "
                f"{response.status_code}"
            )

            html_content = response.text

            if not html_content:

                logger.error(
                    "[PMYP] Empty HTML response"
                )

                return []

            scholarships = self.parse_html(
                html_content
            )

            return scholarships

        except requests.RequestException as e:

            logger.error(
                f"[PMYP] Request failed: {e}"
            )

            return []

        except Exception as e:

            logger.exception(
                f"[PMYP] Scraping failed: {e}"
            )

            return []

    # ========================================================
    # REQUIRED ABSTRACT METHOD
    # ========================================================

    def scrape(
        self
    ) -> List[Dict[str, Any]]:

        return self.scrape_live()

    # ========================================================
    # CONVERT TO DATABASE FORMAT
    # ========================================================

    def to_db_format(
        self,
        scholarship: Dict[str, Any]
    ) -> Dict[str, Any]:

        return {

            "category": "scholarship",

            "extra_data": {

                "title": scholarship.get(
                    "title",
                    ""
                ),

                "location": scholarship.get(
                    "location",
                    ""
                ),

                "description": scholarship.get(
                    "description",
                    ""
                ),

                "posted_date": scholarship.get(
                    "posted_date",
                    ""
                ),

                "closing_date": scholarship.get(
                    "closing_date",
                    ""
                ),

                "link": scholarship.get(
                    "link",
                    "N/A"
                ),

                "icon": scholarship.get(
                    "icon",
                    ""
                ),

                "source": scholarship.get(
                    "source",
                    "PMYP Website"
                ),

                "scraped_at": scholarship.get(
                    "scraped_at",
                    ""
                )
            }
        }

    # ========================================================
    # DELETE OLD PMYP RECORDS
    # ========================================================

    def delete_old_pmyp_records(
        self,
        db
    ) -> bool:

        logger.info(
            "[PMYP] Checking old PMYP records..."
        )

        try:

            # ------------------------------------------------
            # Get existing scholarship records
            # ------------------------------------------------

            response = (
                db.table("opportunities")
                .select("*")
                .eq("category", "scholarship")
                .execute()
            )

            old_records = response.data or []

            logger.info(
                f"[PMYP] Existing scholarship records found: "
                f"{len(old_records)}"
            )

            pmyp_ids = []

            # ------------------------------------------------
            # Identify ONLY PMYP records
            # ------------------------------------------------

            for record in old_records:

                extra_data = record.get(
                    "extra_data"
                )

                if not isinstance(
                    extra_data,
                    dict
                ):
                    continue

                source = self.clean_text(
                    extra_data.get(
                        "source",
                        ""
                    )
                )

                if source.lower() == "pmyp website":

                    record_id = record.get(
                        "id"
                    )

                    if record_id is not None:

                        pmyp_ids.append(
                            record_id
                        )

            logger.info(
                f"[PMYP] Old PMYP records to remove: "
                f"{len(pmyp_ids)}"
            )

            # ------------------------------------------------
            # Delete old PMYP records
            # ------------------------------------------------

            deleted = 0

            for record_id in pmyp_ids:

                (
                    db.table("opportunities")
                    .delete()
                    .eq("id", record_id)
                    .execute()
                )

                deleted += 1

            logger.info(
                f"[PMYP] Deleted old PMYP records: "
                f"{deleted}"
            )

            return True

        except Exception as e:

            logger.exception(
                f"[PMYP] Failed to delete old PMYP "
                f"records: {e}"
            )

            return False

    # ========================================================
    # SAVE TO DATABASE
    # ========================================================

    def save_to_database(
        self,
        scholarships: List[Dict[str, Any]]
    ) -> bool:

        if not scholarships:

            logger.warning(
                "[PMYP] No scholarships to save."
            )

            return False

        logger.info(
            f"[PMYP] Preparing to save "
            f"{len(scholarships)} records..."
        )

        try:

            db = get_db()

            # =================================================
            # STEP 1
            # REMOVE OLD PMYP RECORDS
            # =================================================

            deleted = self.delete_old_pmyp_records(
                db
            )

            if not deleted:

                logger.error(
                    "[PMYP] Could not clean old "
                    "PMYP records."
                )

                return False

            # =================================================
            # STEP 2
            # PREPARE FRESH RECORDS
            # =================================================

            records = []

            for scholarship in scholarships:

                record = self.to_db_format(
                    scholarship
                )

                records.append({

                    "category": record[
                        "category"
                    ],

                    "extra_data": record[
                        "extra_data"
                    ]
                })

            # =================================================
            # STEP 3
            # INSERT FRESH DATA
            # =================================================

            logger.info(
                f"[PMYP] Inserting "
                f"{len(records)} fresh PMYP records..."
            )

            response = (
                db.table("opportunities")
                .insert(records)
                .execute()
            )

            inserted_count = len(
                response.data or []
            )

            logger.info(
                f"[PMYP] Successfully inserted "
                f"{inserted_count} PMYP records."
            )

            # =================================================
            # STEP 4
            # VERIFY
            # =================================================

            verify_response = (
                db.table("opportunities")
                .select("*")
                .eq("category", "scholarship")
                .execute()
            )

            all_scholarships = (
                verify_response.data or []
            )

            pmyp_count = 0

            for record in all_scholarships:

                extra_data = record.get(
                    "extra_data"
                )

                if not isinstance(
                    extra_data,
                    dict
                ):
                    continue

                source = self.clean_text(
                    extra_data.get(
                        "source",
                        ""
                    )
                )

                if source.lower() == "pmyp website":

                    pmyp_count += 1

            logger.info(
                f"[PMYP] Verification: "
                f"{pmyp_count} PMYP records currently in DB."
            )

            return True

        except Exception as e:

            logger.exception(
                f"[PMYP] Database save failed: {e}"
            )

            return False

    # ========================================================
    # RUN
    # ========================================================

    def run(
        self
    ) -> List[Dict[str, Any]]:

        logger.info(
            "=" * 70
        )

        logger.info(
            "PMYP LIVE SCHOLARSHIP SCRAPER"
        )

        logger.info(
            "=" * 70
        )

        scholarships = self.scrape()

        if not scholarships:

            logger.warning(
                "[PMYP] No scholarships extracted."
            )

            return []

        # ----------------------------------------------------
        # DISPLAY RESULTS
        # ----------------------------------------------------

        for index, scholarship in enumerate(
            scholarships,
            start=1
        ):

            print()

            print(
                f"[{index}] "
                f"{scholarship.get('title', 'N/A')}"
            )

            print(
                f"    Location: "
                f"{scholarship.get('location', 'N/A')}"
            )

            print(
                f"    Description: "
                f"{scholarship.get('description', 'N/A')}"
            )

            print(
                f"    Posted: "
                f"{scholarship.get('posted_date', 'N/A')}"
            )

            print(
                f"    Closing: "
                f"{scholarship.get('closing_date', 'N/A')}"
            )

            print(
                f"    Link: "
                f"{scholarship.get('link', 'N/A')}"
            )

            print(
                f"    Icon: "
                f"{scholarship.get('icon', 'N/A')}"
            )

        print()

        print(
            "=" * 70
        )

        print(
            f"Total scholarships extracted: "
            f"{len(scholarships)}"
        )

        print(
            "=" * 70
        )

        # ----------------------------------------------------
        # SAVE DATABASE
        # ----------------------------------------------------

        saved = self.save_to_database(
            scholarships
        )

        if saved:

            logger.info(
                "[PMYP] Database save completed."
            )

        else:

            logger.error(
                "[PMYP] Database save failed."
            )

        return scholarships


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    scraper = PMYPScraper()

    scholarships = scraper.run()

    print()

    print(
        f"Scholarships extracted: "
        f"{len(scholarships)}"
    )