# Project Structure & Architecture Layout

## 1. Directory Tree Overview

```text
Citizen_Portal/
│
├── frontend/                              # Vite + React.js Client
│   ├── public/                            # Static assets, favicon, emblems
│   ├── src/                               # Frontend source root
│   │   ├── components/                    # UI Components
│   │   │   ├── Navbar.jsx                 # Top bar with Urdu, Dark mode & Admin triggers
│   │   │   ├── Footer.jsx                 # Matching green minimal legal footer
│   │   │   ├── HeroSection.jsx            # Animated floating orbs, glow search bar
│   │   │   ├── CivicStatsDashboard.jsx    # Real-time counter metrics
│   │   │   ├── CategoryNav.jsx            # Jobs, Scholarships, Loans, Training, Internships
│   │   │   ├── OpportunityCard.jsx        # Category colored cards with flame urgency badges
│   │   │   ├── SmallBanners.jsx           # Flagship initiative banners with zoom effects
│   │   │   ├── OpportunityDetailModal.jsx # WhatsApp share, countdown timers, detail modal
│   │   │   └── DisclaimerBanner.jsx       # Non-governmental transparency notice
│   │   │
│   │   ├── screens/                       # Main Views
│   │   │   ├── HomeScreen.jsx             # Search, category navigation & listing cards
│   │   │   ├── GuideScreen.jsx            # Interactive data flow simulator & 5-step journey
│   │   │   ├── ChatbotScreen.jsx          # Madadgar AI Assistant with wave typing indicator
│   │   │   ├── SubmitOpportunityScreen.jsx# Crowdsource submission form with character count
│   │   │   └── AdminScreen.jsx            # Executive Control Deck & scraper monitors
│   │   │
│   │   ├── services/                      # Single Data Service Layer
│   │   │   └── opportunitiesService.js    # Ingest, query, filter, chatbot and submission APIs
│   │   │
│   │   ├── i18n/                          # Bilingual Localization
│   │   │   └── translations.js            # English & Urdu translation dictionary
│   │   │
│   │   ├── App.jsx                        # State router and screen controller
│   │   ├── main.jsx                       # React DOM entry point
│   │   └── index.css                      # Tailwind v4, custom keyframes, Dark Mode tokens
│   │
│   ├── package.json                       # Dependencies (React, Lucide, Tailwind v4)
│   └── vite.config.js                     # Vite build configuration
│
├── backend/                               # FastAPI / Python Scraper Services
│   ├── app/
│   │   ├── scrapers/                      # Python automated scrapers (HEC, NJP, NAVTTC, SMEDA)
│   │   └── main.py                        # FastAPI endpoints and database connectors
│   └── requirements.txt                   # Python dependencies (FastAPI, BeautifulSoup, Selenium)
│
└── docs/                                  # Project Architecture & Guidelines
```
│   ├── index.html                         # HTML template
│   ├── package.json                       # Dependencies & build scripts
│   ├── postcss.config.js                  # PostCSS plugins
│   ├── tailwind.config.js                 # Tailwind themes, colors, and typography
│   └── vite.config.js                     # Vite build configuration
│
├── backend/                               # Python FastAPI REST API Backend
│   ├── app/                               # Core Application Root
│   │   ├── main.py                        # FastAPI entry point, middleware & lifespan
│   │   ├── core/                          # Global Settings & Security
│   │   │   ├── config.py                  # Pydantic Settings & `.env` parsing
│   │   │   ├── security.py                # Password hashing (bcrypt) & JWT utilities
│   │   │   └── redis_client.py            # Upstash Redis connection & caching layer
│   │   │
│   │   ├── db/                            # MongoDB Atlas Database Connectivity
│   │   │   ├── session.py                 # Motor async client & database connection
│   │   │   └── init_db.py                 # Index creation & initial seed data script
│   │   │
│   │   ├── models/                        # Pydantic Schemas & MongoDB Entities
│   │   │   ├── common.py                  # PyObjectId, generic API response models
│   │   │   ├── user.py                    # User & authentication schemas
│   │   │   ├── opportunity.py             # Opportunity create, update & response models
│   │   │   ├── category.py                # Category domain models
│   │   │   ├── province.py                # Province domain models
│   │   │   └── log.py                     # Scraper audit log schema
│   │   │
│   │   ├── routes/                        # FastAPI Route Controllers (Endpoints)
│   │   │   ├── api.py                     # Main API router aggregating all endpoints
│   │   │   ├── auth.py                    # Authentication routes (/auth/login)
│   │   │   ├── opportunities.py           # Public opportunity routes (/opportunities)
│   │   │   ├── search.py                  # Full-text search route (/search)
│   │   │   ├── categories.py              # Category listings (/categories)
│   │   │   ├── provinces.py               # Province listings (/provinces)
│   │   │   ├── ai.py                      # Chatbot & eligibility routes (/ai/chat)
│   │   │   └── admin.py                   # Protected CRUD & log routes (/admin/*)
│   │   │
│   │   └── services/                      # Business Logic & Orchestration
│   │       ├── auth_service.py            # Admin credential validation & JWT generation
│   │       ├── opportunity_service.py     # Aggregation queries, pagination & filters
│   │       ├── search_service.py          # MongoDB full-text index scoring & filtering
│   │       ├── ai_service.py              # Assistant query resolver & eligibility engine
│   │       ├── expiry_manager.py          # Automatic status transition for past deadlines
│   │       ├── pipeline.py                # Scraper ingestion, validation & DB upsert
│   │       └── scheduler.py               # APScheduler recurring cron manager
│   │
│   ├── scrapers/                          # Web Scraping Engine
│   │   ├── __init__.py                    # Scraper package initialization
│   │   ├── base.py                        # BaseScraper abstract class with rate limiter
│   │   ├── hec_scraper.py                 # HEC Scholarships parser (BS4)
│   │   ├── njp_scraper.py                 # National Job Portal parser (Selenium)
│   │   ├── bnip_scraper.py                # BNIP Internship parser (Selenium)
│   │   ├── smeda_scraper.py               # SMEDA Business Loans parser (BS4)
│   │   ├── navttc_scraper.py              # NAVTTC Technical Training parser (BS4)
│   │   └── youth_scraper.py               # PM Youth Affairs parser (BS4)
│   │
│   ├── tests/                             # Automated Test Suites
│   │   ├── conftest.py                    # Pytest fixtures & mock MongoDB/Redis
│   │   ├── test_auth.py                   # Auth endpoints & JWT verification tests
│   │   ├── test_opportunities.py          # Opportunity CRUD & query filter tests
│   │   ├── test_validation.py             # Pydantic schema validation tests
│   │   └── test_scrapers.py               # Scraper HTML parser unit tests
│   │
│   ├── .env.example                       # Backend environment template
│   ├── Dockerfile                         # Production Docker container configuration
│   ├── requirements.txt                   # Production Python dependencies
│   └── pytest.ini                         # Pytest configuration settings
│
└── docs/                                  # Project Documentation Catalog
```

---

## 2. Layered Separation of Concerns

1. **Presentation Layer (`frontend/src/pages` & `components`):** Responsible purely for rendering UI, capturing user events, and dispatching Redux actions.
2. **State & Network Layer (`frontend/src/redux` & `services`):** Encapsulates API communication, JWT caching, and centralized client state.
3. **API Routing Layer (`backend/app/routes`):** Handles HTTP request parsing, status codes, query validation, and routing to service functions.
4. **Service & Domain Layer (`backend/app/services`):** Contains pure business logic, database queries, eligibility calculations, and background scheduling.
5. **Data Ingestion Layer (`backend/scrapers`):** Isolated scraping workers that harvest external HTML/DOM, normalize fields, and pass data into the ingestion pipeline.
