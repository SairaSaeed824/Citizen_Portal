import os
import sys
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Set
from urllib.parse import urljoin, urlparse, parse_qs

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
# IMPORT BASE SCRAPER
# ============================================================

try:
    from app.scrapers.base import BaseScraper, logger
except ImportError:
    from app.scrapers.base import BaseScraper
    import logging
    logger = logging.getLogger(__name__)


# ============================================================
# NJP SCRAPER
# ============================================================

class NJPScraper(BaseScraper):

    def __init__(self):

        super().__init__(
            source_name="NJP",
            base_url="https://www.njp.gov.pk",
            delay_seconds=2.5
        )

        self.jobs_url = urljoin(
            self.base_url,
            "/jobs/live"
        )

    # ========================================================
    # NORMALIZE DATE
    # ========================================================

    def _normalize_date(self, text: str) -> str:

        if not text:
            return ""

        cleaned = " ".join(
            text.strip().split()
        )

        match = re.search(
            r"""
            (
                \d{4}[-/]\d{1,2}[-/]\d{1,2}
                |
                \d{1,2}[-/]\d{1,2}[-/]\d{4}
                |
                (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)
                \s+\d{1,2},?\s+\d{4}
                |
                (?:January|February|March|April|May|June|July|August|September|October|November|December)
                \s+\d{1,2},?\s+\d{4}
                |
                \d{1,2}\s+
                (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)
                ,?\s+\d{4}
                |
                \d{1,2}\s+
                (?:January|February|March|April|May|June|July|August|September|October|November|December)
                ,?\s+\d{4}
            )
            """,
            cleaned,
            flags=re.IGNORECASE | re.VERBOSE
        )

        if not match:
            return ""

        date_text = match.group(1).strip()

        formats = [
            "%b %d, %Y",
            "%b %d %Y",
            "%B %d, %Y",
            "%B %d %Y",
            "%d %b, %Y",
            "%d %b %Y",
            "%d %B, %Y",
            "%d %B %Y",
            "%d-%m-%Y",
            "%d/%m/%Y",
            "%Y-%m-%d",
            "%Y/%m/%d",
        ]

        for date_format in formats:

            try:

                parsed_date = datetime.strptime(
                    date_text,
                    date_format
                )

                return parsed_date.strftime(
                    "%Y-%m-%d"
                )

            except ValueError:
                continue

        return ""

    # ========================================================
    # EXTRACT CLOSING DATE
    # ========================================================

    def _extract_closing_date(self, card) -> str:

        """
        Handles NJP formats:

        Available Till Sep 06, 2026
        Available Until Sep 06, 2026
        Expired On Aug 31, 2026
        Deadline: Aug 31, 2026
        Closing Date: Aug 31, 2026
        Last Date: Aug 31, 2026
        """

        card_text = card.get_text(
            " ",
            strip=True
        )

        if not card_text:
            return ""

        patterns = [

            r"available\s+till\s*:?\s*"
            r"([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})",

            r"available\s+until\s*:?\s*"
            r"([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})",

            r"expired\s+on\s*:?\s*"
            r"([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})",

            r"deadline\s*:?\s*"
            r"([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})",

            r"closing\s+date\s*:?\s*"
            r"([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})",

            r"last\s+date\s*:?\s*"
            r"([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})",

            r"(?:available\s+till|available\s+until|expired\s+on|deadline|closing\s+date|last\s+date)"
            r"\s*:?\s*"
            r"(\d{1,2}[/-]\d{1,2}[/-]\d{4})",

            r"(?:available\s+till|available\s+until|expired\s+on|deadline|closing\s+date|last\s+date)"
            r"\s*:?\s*"
            r"(\d{4}[-/]\d{1,2}[-/]\d{1,2})",
        ]

        # Search complete card
        for pattern in patterns:

            match = re.search(
                pattern,
                card_text,
                flags=re.IGNORECASE
            )

            if match:

                raw_date = match.group(1).strip()

                normalized = self._normalize_date(
                    raw_date
                )

                if normalized:
                    return normalized

        # Search individual spans
        for span in card.find_all("span"):

            text = span.get_text(
                " ",
                strip=True
            )

            if not text:
                continue

            lower_text = text.lower()

            if any(
                keyword in lower_text
                for keyword in [
                    "available till",
                    "available until",
                    "expired on",
                    "deadline",
                    "closing date",
                    "last date"
                ]
            ):

                normalized = self._normalize_date(
                    text
                )

                if normalized:
                    return normalized

        # Final fallback
        for element in card.find_all(
            [
                "span",
                "div",
                "p",
                "small",
                "label"
            ]
        ):

            text = element.get_text(
                " ",
                strip=True
            )

            if not text:
                continue

            normalized = self._normalize_date(
                text
            )

            if normalized:

                lower_text = text.lower()

                if any(
                    keyword in lower_text
                    for keyword in [
                        "available till",
                        "available until",
                        "expired on",
                        "deadline",
                        "closing date",
                        "last date"
                    ]
                ):
                    return normalized

        return ""

    # ========================================================
    # PARSE JOB CARDS
    # ========================================================

    def parse_job_cards(
        self,
        html_content: str
    ) -> List[Dict[str, Any]]:

        soup = BeautifulSoup(
            html_content,
            "html.parser"
        )

        jobs = []

        cards = soup.find_all(
            "div",
            class_="job-card"
        )

        logger.info(
            f"[NJP] Found {len(cards)} job-card elements"
        )

        for index, card in enumerate(cards):

            job = self._extract_from_card(
                card,
                index
            )

            if job.get("title"):
                jobs.append(job)

        logger.info(
            f"[NJP] Total extracted: {len(jobs)}"
        )

        dates_found = sum(
            1
            for job in jobs
            if job.get("closing_date")
        )

        logger.info(
            f"[NJP] Closing dates found: "
            f"{dates_found}/{len(jobs)}"
        )

        return jobs

    # ========================================================
    # EXTRACT SINGLE JOB
    # ========================================================

    def _extract_from_card(
        self,
        card,
        index: int
    ) -> Dict[str, Any]:

        job: Dict[str, Any] = {}

        # ----------------------------------------------------
        # TITLE
        # ----------------------------------------------------

        title_element = card.find("h2")

        if title_element:

            title = title_element.get_text(
                " ",
                strip=True
            )

            if title:
                job["title"] = title

        # ----------------------------------------------------
        # ORGANIZATION
        # ----------------------------------------------------

        p_element = card.find("p")

        if p_element:

            organization = p_element.get_text(
                " ",
                strip=True
            )

            organization = re.sub(
                r"^by\s+",
                "",
                organization,
                flags=re.IGNORECASE
            ).strip()

            if organization:
                job["organization"] = organization

        # ----------------------------------------------------
        # SPANS
        # ----------------------------------------------------

        for span in card.find_all("span"):

            text = span.get_text(
                " ",
                strip=True
            )

            if not text:
                continue

            lower_text = text.lower()

            # Job type
            if text in [
                "Contract",
                "Permanent",
                "Temporary",
                "Internship"
            ]:

                job["job_type"] = text

            # Grade
            elif text.startswith("E-"):

                job["grade"] = text

            # Vacancies
            elif "vacancy" in lower_text:

                match = re.search(
                    r"\d+",
                    text
                )

                if match:

                    job["vacancies"] = int(
                        match.group()
                    )

            # Experience
            elif "experience:" in lower_text:

                parts = re.split(
                    r"experience\s*:",
                    text,
                    flags=re.IGNORECASE
                )

                if len(parts) > 1:

                    experience = parts[1].strip()

                    if experience:
                        job["experience"] = experience

        # ----------------------------------------------------
        # CLOSING DATE
        # ----------------------------------------------------

        closing_date = (
            self._extract_closing_date(card)
        )

        if closing_date:

            job["closing_date"] = closing_date

            logger.info(
                f"[NJP] Closing date found: "
                f"{job.get('title', 'Unknown')} "
                f"-> {closing_date}"
            )

        else:

            logger.warning(
                f"[NJP] Closing date NOT found: "
                f"{job.get('title', 'Unknown')}"
            )

        # ----------------------------------------------------
        # LINKS
        # ----------------------------------------------------

        for anchor in card.find_all("a"):

            href = anchor.get(
                "href",
                ""
            )

            link_text = anchor.get_text(
                " ",
                strip=True
            ).lower()

            if not href:
                continue

            absolute_url = urljoin(
                self.base_url,
                href
            )

            # Job detail link
            if "/jobs/" in href:

                if "job_link" not in job:
                    job["job_link"] = absolute_url

            # Apply link
            if "apply" in link_text:

                job["apply_link"] = absolute_url

        # ----------------------------------------------------
        # SOURCE
        # ----------------------------------------------------

        job["source"] = (
            "National Job Portal (NJP)"
        )

        # ----------------------------------------------------
        # SCRAPED AT
        # ----------------------------------------------------

        job["scraped_at"] = (
            datetime.now(
                timezone.utc
            ).isoformat()
        )

        return job

    # ========================================================
    # FIND NEXT PAGE
    # ========================================================

    def _find_next_page(
        self,
        html_content: str,
        current_url: str
    ) -> str:

        soup = BeautifulSoup(
            html_content,
            "html.parser"
        )

        current_parsed = urlparse(
            current_url
        )

        current_page = 1

        try:

            current_page = int(
                parse_qs(
                    current_parsed.query
                ).get(
                    "page",
                    ["1"]
                )[0]
            )

        except (
            ValueError,
            TypeError
        ):

            current_page = 1

        # ----------------------------------------------------
        # NEXT LINK
        # ----------------------------------------------------

        for link in soup.find_all("a"):

            href = link.get(
                "href",
                ""
            )

            if not href:
                continue

            text = link.get_text(
                " ",
                strip=True
            ).lower()

            aria_label = (
                link.get(
                    "aria-label",
                    ""
                )
                .strip()
                .lower()
            )

            title = (
                link.get(
                    "title",
                    ""
                )
                .strip()
                .lower()
            )

            if (
                text in [
                    "next",
                    "next page",
                    "›",
                    "»"
                ]
                or aria_label == "next"
                or "next page" in aria_label
                or "next" in title
            ):

                return urljoin(
                    self.base_url,
                    href
                )

        # ----------------------------------------------------
        # PAGE NUMBER LINKS
        # ----------------------------------------------------

        page_links = []

        for link in soup.find_all("a"):

            href = link.get(
                "href",
                ""
            )

            if not href:
                continue

            absolute_url = urljoin(
                self.base_url,
                href
            )

            parsed = urlparse(
                absolute_url
            )

            query = parse_qs(
                parsed.query
            )

            if "page" not in query:
                continue

            try:

                page_number = int(
                    query["page"][0]
                )

            except (
                ValueError,
                TypeError
            ):

                continue

            if page_number > current_page:

                page_links.append(
                    (
                        page_number,
                        absolute_url
                    )
                )

        if page_links:

            page_links.sort(
                key=lambda x: x[0]
            )

            return page_links[0][1]

        return ""

    # ========================================================
    # LIVE SCRAPE
    # ========================================================

    def scrape(
        self
    ) -> List[Dict[str, Any]]:

        all_jobs: List[
            Dict[str, Any]
        ] = []

        visited_urls: Set[str] = set()

        current_url = self.jobs_url

        page_number = 1

        max_pages = 50

        logger.info(
            "[NJP] Starting live scrape"
        )

        logger.info(
            f"[NJP] Starting URL: "
            f"{current_url}"
        )

        while (
            current_url
            and page_number <= max_pages
        ):

            if current_url in visited_urls:

                logger.warning(
                    f"[NJP] Already visited: "
                    f"{current_url}"
                )

                break

            visited_urls.add(
                current_url
            )

            logger.info(
                f"[NJP] Downloading page "
                f"{page_number}: "
                f"{current_url}"
            )

            response = (
                self.fetch_with_retry(
                    current_url
                )
            )

            if not response:

                logger.error(
                    f"[NJP] Failed to download "
                    f"page {page_number}"
                )

                break

            html_content = response.text

            page_jobs = (
                self.parse_job_cards(
                    html_content
                )
            )

            logger.info(
                f"[NJP] Page {page_number}: "
                f"{len(page_jobs)} jobs"
            )

            all_jobs.extend(
                page_jobs
            )

            next_url = (
                self._find_next_page(
                    html_content,
                    current_url
                )
            )

            if not next_url:

                logger.info(
                    "[NJP] No next page found."
                )

                break

            current_url = next_url

            page_number += 1

        # ====================================================
        # REMOVE DUPLICATES
        # ====================================================

        unique_jobs = []

        seen: Set[str] = set()

        for job in all_jobs:

            job_link = job.get(
                "job_link",
                ""
            ).strip()

            title = job.get(
                "title",
                ""
            ).strip().lower()

            unique_key = (
                job_link
                if job_link
                else title
            )

            if not unique_key:
                continue

            if unique_key in seen:
                continue

            seen.add(
                unique_key
            )

            unique_jobs.append(
                job
            )

        # ====================================================
        # FINAL STATS
        # ====================================================

        dates_found = sum(
            1
            for job in unique_jobs
            if job.get("closing_date")
        )

        logger.info(
            f"[NJP] Pages scraped: "
            f"{page_number}"
        )

        logger.info(
            f"[NJP] Total jobs collected: "
            f"{len(all_jobs)}"
        )

        logger.info(
            f"[NJP] Unique jobs: "
            f"{len(unique_jobs)}"
        )

        logger.info(
            f"[NJP] Closing dates found: "
            f"{dates_found}/{len(unique_jobs)}"
        )

        return unique_jobs

    # ========================================================
    # SCRAPE FROM HTML FILE
    # ========================================================

    def scrape_from_file(
        self,
        html_file: str
    ) -> List[Dict[str, Any]]:

        logger.info(
            f"[NJP] Reading HTML file: "
            f"{html_file}"
        )

        with open(
            html_file,
            "r",
            encoding="utf-8"
        ) as file:

            html_content = file.read()

        return self.parse_job_cards(
            html_content
        )

    # ========================================================
    # DATABASE FORMAT
    # ========================================================

    def to_db_format(
        self,
        jobs: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:

        rows = []

        for job in jobs:

            content_hash = (
                self.calculate_hash(
                    job.get(
                        "title",
                        ""
                    ),
                    job.get(
                        "job_link",
                        ""
                    )
                )
            )

            job["content_hash"] = (
                content_hash
            )

            rows.append(
                {
                    "category": "job",
                    "extra_data": job
                }
            )

        return rows


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    # IMPORTANT:
    # Because we run:
    # python -m app.scrapers.njp_scraper
    #
    # loader must be imported like this.

    from app.scrapers.loader import save_to_db

    scraper = NJPScraper()

    print("=" * 70)
    print("NJP LIVE SCRAPER")
    print("=" * 70)

    print(
        f"\nSource:"
        f"\n{scraper.jobs_url}\n"
    )

    # ========================================================
    # SCRAPE LIVE WEBSITE
    # ========================================================

    jobs = scraper.scrape()

    print(
        f"\nJobs extracted: {len(jobs)}"
    )

    # ========================================================
    # DISPLAY JOBS
    # ========================================================

    print("\n" + "=" * 70)
    print("EXTRACTED JOBS")
    print("=" * 70)

    for index, job in enumerate(
        jobs,
        start=1
    ):

        print(
            f"\n{index}. "
            f"{job.get('title', 'Unknown')}"
        )

        print(
            f"   Organization: "
            f"{job.get('organization', 'N/A')}"
        )

        print(
            f"   Job Type: "
            f"{job.get('job_type', 'N/A')}"
        )

        print(
            f"   Grade: "
            f"{job.get('grade', 'N/A')}"
        )

        print(
            f"   Vacancies: "
            f"{job.get('vacancies', 'N/A')}"
        )

        print(
            f"   Experience: "
            f"{job.get('experience', 'N/A')}"
        )

        print(
            f"   Closing Date: "
            f"{job.get('closing_date', 'N/A')}"
        )

        print(
            f"   Job Link: "
            f"{job.get('job_link', 'N/A')}"
        )

        print(
            f"   Apply Link: "
            f"{job.get('apply_link', 'N/A')}"
        )

    # ========================================================
    # NO JOBS
    # ========================================================

    if not jobs:

        print(
            "\nNo jobs extracted."
        )

        sys.exit(1)

    # ========================================================
    # DATABASE FORMAT
    # ========================================================

    db_rows = scraper.to_db_format(
        jobs
    )

    # ========================================================
    # SAVE TO SUPABASE
    # ========================================================

    print(
        "\nSaving jobs to Supabase..."
    )

    result = save_to_db(
        db_rows
    )

    # ========================================================
    # DATABASE RESULT
    # ========================================================

    print("\n" + "=" * 70)
    print("DATABASE RESULT")
    print("=" * 70)

    print(
        f"Saved to DB: "
        f"{result['inserted']} new, "
        f"{result['skipped']} already existed "
        f"(skipped)"
    )

    print(
        "\nNJP scraping completed."
    )