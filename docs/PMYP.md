# PMYP Scholarship Scraper — Build Spec

## Task
Write a Python Selenium scraper for this URL:
`https://pmyp.gov.pk/education?category=Scholarship`

This is a Next.js/React SPA — data loads via JS, no static HTML. Must use Selenium (headless Chrome), not requests/BeautifulSoup.

## Steps
1. Load the URL with headless Chrome, wait for cards to render (explicit wait on the card selector, not sleep()).
2. Find all card elements: `div.rounded-2xl.cursor-pointer` inside the grid container `div.grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-3`.
3. For each card, extract fields (from the DOM, no click yet):

| Field | Selector | Notes |
|---|---|---|
| category | `div.text-white.w-fit.text-xs` | text content, e.g. "Scholarship" |
| published_date | `span.flex.items-center.mb-2.text-xs` | e.g. "19 August 2026 \| 12:10 PM" |
| title | `div.text-lg.font-bold.text-gray-800` | fallback: `img[alt]` inside `div.relative img` |
| image_url | `div.relative img` → `src` attribute | |
| description | `p.text-sm.text-gray-600` | |
| metadata (level/requirements/quota) | `div.grid.grid-cols-2.sm:grid-cols-4 span` | returns multiple spans, map by position or label |
| deadline | `div.text-xs.text-gray-600 > span.block` | e.g. "30 September 2026 \| 05:00 AM" |

4. **Detail URL (no href exists — client-side routing):**
   - Click the card (or `button.btn-primary-theme` "Apply Now" inside it).
   - Wait for URL to change, read `driver.current_url`.
   - Store as `detail_link`.
   - Navigate back (`driver.back()`), re-wait for cards to reload before processing the next card (DOM re-renders after back navigation, so re-fetch the card list each loop — don't reuse stale element references).

5. Save all records as JSON list with fields:
   `title, category, description, image_url, published_date, deadline, detail_link, source="PMYP"`.

6. Print first 5 records + total count at the end.

## Requirements
- Use `WebDriverWait` + `expected_conditions`, not fixed `time.sleep()`.
- Handle missing fields gracefully (try/except → `None`), don't crash on one bad card.
- Headless Chrome (`--headless=new`, `--no-sandbox`).
- Output file: `pmyp_scholarships.json`.
- Add comments explaining each selector block (for future edits when site changes).

## Do NOT
- Do not use requests/BeautifulSoup (site is JS-rendered, will return empty).
- Do not hardcode a fixed sleep for card loading — use explicit waits.
- Do not assume `href` exists on cards — there isn't one, must click-and-read-URL.