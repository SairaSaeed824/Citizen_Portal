# Citizen Opportunities Portal — Project Overview

## 1. Executive Summary

The **Citizen Opportunities Portal** is a centralized, AI-enhanced national opportunities discovery platform developed to bridge the information gap for Pakistani citizens seeking government and public sector opportunities. By aggregating programs from disparate institutional portals into a single, unified, bilingual (Urdu & English) interface, the system eliminates fragmentation and empowers youth, students, job-seekers, and entrepreneurs.

The platform continuously harvests, validates, and categorizes opportunities across five key pillars:
- **Scholarships** (Higher Education Commission - HEC)
- **Employment** (National Job Portal - NJP)
- **Internships** (Ba-Ikhtiyar Naujawan Internship Program - BNIP)
- **Business Loans & Financing** (Small and Medium Enterprises Development Authority - SMEDA)
- **Technical & Vocational Training** (National Vocational and Technical Training Commission - NAVTTC)
- **Youth Empowerment Initiatives** (Prime Minister's Youth Programme / Youth Affairs)

---

## 2. Problem Statement

### 2.1 The Current Landscape
Pakistani public sector opportunities are dispersed across dozens of independent federal and provincial websites. Each entity operates on disparate technical infrastructures with varying degrees of accessibility, uptime, and update frequency.

### 2.2 Core Challenges
1. **Information Asymmetry & Silos:** Citizens must manually track 10+ different portals weekly to discover relevant opportunities.
2. **Language Barrier:** Most official portals publish notices exclusively in formal English, alienating rural and non-English proficient demographics.
3. **Stale & Duplicate Listings:** Expired schemes remain indexed on search engines, leading to wasted applicant effort.
4. **Complex Eligibility Verification:** Applicants frequently spend hours preparing documentation only to discover late disqualifications (e.g., provincial quotas, age limits).
5. **Lack of Automated Alerts:** No proactive notification channel exists to alert eligible citizens before deadlines close.

---

## 3. Proposed Solution

The Citizen Opportunities Portal serves as an intelligent aggregation engine and user-centric portal with the following foundational pillars:

```
+-----------------------------------------------------------------------+
|                      Citizen Opportunities Portal                     |
+-----------------------------------------------------------------------+
|  [ Aggregation Layer ]      [ Core Platform Engine ]  [ Intelligence ]|
|  - 6+ Source Scrapers       - Deduplication & Expiry  - AI Chatbot    |
|  - Rate-Limited Harvester   - Bilingual Localization  - Eligibility   |
|  - Robots.txt Compliant     - Fast Search & Filter    - Recommender   |
+-----------------------------------------------------------------------+
|                         Citizen Access Touchpoints                    |
|       [ Responsive Web UI (EN/UR) ]    [ RESTful Public APIs ]        |
+-----------------------------------------------------------------------+
```

1. **Automated Scraping & Ingestion:** Automated Python-based scrapers (BeautifulSoup + Selenium) crawl designated government sources periodically.
2. **Strict Data Quality Pipeline:** Pydantic-powered validation guarantees valid links, future deadlines, strict schema conformance, and duplicate elimination.
3. **Bilingual Accessibility (Urdu & English):** Native internationalization (i18n) for full navigation and opportunity summaries.
4. **AI-Driven Citizen Services:** Embedded natural language chatbot for query resolution, rule-based eligibility calculation, and personalized recommendations.
5. **Administrative Governance:** Dedicated dashboard for manual verification, scraping triggers, log monitoring, and opportunity lifecycle moderation.

---

## 4. Project Objectives

- **Centralize Information:** Integrate at least 6 primary government opportunity streams into a single database.
- **Maintain Data Freshness:** Guarantee zero expired opportunities displayed to public users through automated lifecycle cron tasks.
- **Sub-Second Performance:** Deliver fast search and filtering across tens of thousands of listings using Redis caching and MongoDB compound indexing.
- **Maximized Inclusivity:** Provide 100% responsive mobile-first UI with toggleable Urdu (Right-to-Left / Nastaliq friendly) and English layouts.
- **Zero Hallucination AI Assisting:** Deploy an AI assistant bounded strictly to indexed opportunities for precise deadline and eligibility guidance.

---

## 5. Feature Catalog (23 Comprehensive Features)

| # | Feature Name | Category | Target Actor | Description |
|---|---|---|---|---|
| 1 | **Global Keyword Search** | Search & Discovery | Citizen | Full-text search across opportunity title, description, issuing body, and tags with debounced instant querying. |
| 2 | **Multi-Facet Category Filter** | Search & Discovery | Citizen | Dynamic filtering by 5 main sectors: Jobs, Scholarships, Internships, Loans, and Technical Training. |
| 3 | **Provincial & Regional Filter** | Search & Discovery | Citizen | Filter by domicile eligibility (Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Gilgit-Baltistan, Azad Jammu & Kashmir, Federal/All Pakistan). |
| 4 | **Eligibility Criterion Filter** | Search & Discovery | Citizen | Filter by age group, minimum qualification (Matric, Inter, Bachelors, Masters, PhD), and gender-specific quotas. |
| 5 | **Opportunity Detail View** | Core UX | Citizen | Rich markdown-rendered opportunity page displaying eligibility, benefits, stipend/grant amounts, documents required, and deadlines. |
| 6 | **Verified Direct "Apply Now"** | Core UX | Citizen | Secure redirect to the authentic official application portal with click telemetry and external warning prompts. |
| 7 | **Favorites & Saved Items** | Personalization | Citizen | Client-side and authenticated bookmarking of opportunities with deadline countdown indicators. |
| 8 | **Bilingual Toggle (Urdu & English)** | Accessibility | Citizen | Dynamic interface translation between English and Urdu with bidirectional layout adjustment (LTR to RTL). |
| 9 | **Mobile-First Responsive Layout** | Accessibility | Citizen | Fully responsive, touch-friendly UI optimized for low-bandwidth 3G/4G mobile connections across Pakistan. |
| 10 | **Admin Secure Authentication** | Administration | Administrator | JWT-based authentication with bcrypt password hashing and refresh token rotation for system administrators. |
| 11 | **Admin Opportunity CRUD** | Administration | Administrator | Create, read, update, and soft-delete opportunity records with live form validation and preview rendering. |
| 12 | **Scraper Execution Logs Monitor** | Administration | Administrator | Real-time audit log viewer displaying scraper run status, HTTP response codes, records parsed, and error stack traces. |
| 13 | **Manual Scraper Trigger** | Administration | Administrator | Admin panel trigger to initiate on-demand scraping workflows for specific target websites. |
| 14 | **Automated Scheduled Scraping** | System Automation | Background Engine | Cron-based background workers executing scraping routines on weekly, daily, or monthly schedules. |
| 15 | **Intelligent Deduplication** | Data Integrity | Background Engine | Hash-based and URL-canonicalized deduplication preventing duplicate records across scraping cycles. |
| 16 | **Strict Data Validation Engine** | Data Integrity | Background Engine | Pydantic schema validation rejecting records with broken HTTPS links, missing deadlines, or out-of-range text lengths. |
| 17 | **Automated Expiry Manager** | Data Integrity | Background Engine | Hourly background worker marking opportunities as `EXPIRED` once deadline passes 23:59:59 PKT. |
| 18 | **Threshold Assurance Worker** | Data Integrity | System Engine | Health monitor ensuring a minimum of 10 active opportunities are available per category; triggers alerts otherwise. |
| 19 | **AI Citizen Assistant (Chatbot)** | AI & Intelligence | Citizen | Natural language conversational interface helping users find programs, understand requirements, and navigate schemes. |
| 20 | **Dynamic Eligibility Calculator** | AI & Intelligence | Citizen | Interactive questionnaire evaluating user age, education, and province against opportunity requirements to output match percentages. |
| 21 | **Smart Opportunity Recommender** | AI & Intelligence | Citizen | Content-based recommendation module suggesting similar opportunities based on user search patterns and viewed listings. |
| 22 | **Deadline Countdown & Urgency Badges** | Core UX | Citizen | Visual urgency badges (`Closing Soon`, `7 Days Left`, `New`) dynamically computed from system timestamps. |
| 23 | **Social Sharing & Print Summary** | Core UX | Citizen | One-click sharing to WhatsApp, Facebook, LinkedIn, Twitter, and print-ready summary generation for offline distribution. |

---

## 6. Target Audience & Stakeholders

| Stakeholder Group | Primary Needs & Use Cases |
|---|---|
| **Undergraduate & Graduate Students** | Finding HEC indigenous/foreign scholarships, merit stipends, and BNIP paid internships. |
| **Job Seekers & Fresh Graduates** | Searching verified NJP federal civil service vacancies, contract jobs, and provincial postings. |
| **Micro-Entrepreneurs & Artisans** | Exploring SMEDA subsidized business loans, youth entrepreneurship schemes, and microfinance credit. |
| **Skilled & Vocational Workers** | Discovering NAVTTC high-tech training courses, free technical certifications, and apprenticeship quotas. |
| **Government Portal Administrators** | Moderating crawled records, monitoring scraper health, and rectifying unparsed program entries. |

---

## 7. High-Level System Architecture

```
                                 [ CITIZEN / ADMIN USER ]
                                            │
                                            ▼
                     +----------------------------------------------+
                     |        React.js (Vite) + Tailwind CSS        |
                     |         Redux Toolkit + i18next (UR/EN)      |
                     +----------------------------------------------+
                                            │
                                  HTTPS / REST + JWT
                                            │
                                            ▼
                     +----------------------------------------------+
                     |               FastAPI Backend                |
                     | ┌──────────────────────────────────────────┐ |
                     | │ Auth & RBAC  │ Public API │ Admin API    │ |
                     | ├──────────────┼────────────┼──────────────┤ |
                     | │ AI Services  │ Recommender│ Validation   │ |
                     | └──────────────────────────────────────────┘ |
                     +----------------------------------------------+
                             │                              │
                Read/Write Cached Queries          Primary Data Store
                             │                              │
                             ▼                              ▼
                 +-----------------------+      +-----------------------+
                 |     Upstash Redis     |      |     MongoDB Atlas     |
                 | (Session/Search Cache)|      | (Document Database)   |
                 +-----------------------+      +-----------------------+
                                                            ▲
                                                            │ Ingests Cleansed Data
                                                            │
                     +----------------------------------------------+
                     |         Automated Scraper Engine             |
                     |  [ BeautifulSoup4 ]    [ Selenium WebDriver] |
                     |         Rate Limiter & Duplicate Filter      |
                     +----------------------------------------------+
                                            │
                             Periodic HTTP/HTTPS Crawls
                                            │
                                            ▼
                     +----------------------------------------------+
                     |     6 Public Sector Data Sources (PK)        |
                     |   HEC | NJP | BNIP | SMEDA | NAVTTC | YOUTH  |
                     +----------------------------------------------+
```

---

## 8. Success Metrics & Key Performance Indicators (KPIs)

- **Coverage:** Minimum 10 active opportunities across every major category at all times.
- **Accuracy:** > 99% accuracy in official redirect URLs and eligibility constraints.
- **Uptime & Latency:** 99.9% uptime with 95th-percentile API response time < 250ms.
- **Localization:** 100% UI coverage in both English and Urdu.
- **Data Freshness:** Scraper execution cycle completed at least once every 24 hours for daily portals.
