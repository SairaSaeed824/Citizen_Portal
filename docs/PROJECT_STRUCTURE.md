# Project Structure & Architecture Layout

## 1. Directory Tree Overview

```text
Citizen_Portal/
│
├── frontend/                              # React.js SPA Application
│   ├── public/                            # Static assets, favicon, localization JSONs
│   │   ├── locales/                       # Bilingual translation bundles
│   │   │   ├── en/translation.json        # English translation dictionary
│   │   │   └── ur/translation.json        # Urdu translation dictionary (Nastaliq support)
│   │   └── favicon.ico                    # Web favicon
│   │
│   ├── src/                               # Frontend source root
│   │   ├── assets/                        # Local images, SVG illustrations, logos
│   │   ├── components/                    # Modular UI components
│   │   │   ├── common/                    # Reusable primitives (Buttons, Inputs, Badges)
│   │   │   │   ├── Navbar.jsx             # Top navigation with language & theme toggle
│   │   │   │   ├── Footer.jsx             # Global footer with disclaimers and links
│   │   │   │   ├── Card.jsx               # Opportunity card preview with deadline badge
│   │   │   │   ├── Pagination.jsx         # Accessible pagination control
│   │   │   │   └── SearchBar.jsx          # Debounced instant search input
│   │   │   ├── filters/                   # Filter panel & drawer components
│   │   │   │   ├── FilterSidebar.jsx      # Desktop multi-facet filter bar
│   │   │   │   └── MobileFilterDrawer.jsx # Slide-out touch filter sheet
│   │   │   ├── ai/                        # AI Assistant & Tool widgets
│   │   │   │   ├── ChatbotDrawer.jsx      # Floating conversational assistant
│   │   │   │   └── EligibilityModal.jsx   # Interactive qualification questionnaire
│   │   │   └── admin/                     # Admin dashboard components
│   │   │       ├── OpportunityForm.jsx    # Add/Edit Opportunity form with validation
│   │   │       ├── LogViewerTable.jsx     # Scraper execution audit log grid
│   │   │       └── ScraperControlCard.jsx # On-demand scraper trigger card
│   │   │
│   │   ├── pages/                         # Route-level views
│   │   │   ├── HomePage.jsx               # Hero banner, category highlights & search
│   │   │   ├── OpportunityListPage.jsx    # Paginated opportunity grid with sidebar
│   │   │   ├── OpportunityDetailPage.jsx  # Full details, eligibility, and Apply Now CTA
│   │   │   ├── FavoritesPage.jsx          # Saved bookmarks with countdown indicators
│   │   │   ├── EligibilityCalculator.jsx  # Dedicated multi-step eligibility wizard
│   │   │   ├── AdminLoginPage.jsx         # Administrative login form
│   │   │   ├── AdminDashboardPage.jsx     # Stats, CRUD tables, and scraper monitors
│   │   │   └── NotFoundPage.jsx           # Custom 404 page
│   │   │
│   │   ├── redux/                         # Centralized State Management (RTK)
│   │   │   ├── store.js                   # Configured Redux store
│   │   │   └── slices/                    # Modular state slices
│   │   │       ├── authSlice.js           # Admin auth token & session state
│   │   │       ├── opportunitySlice.js    # Filtered opportunities & pagination state
│   │   │       ├── filterSlice.js         # Active category, province, and search query
│   │   │       ├── favoriteSlice.js       # Bookmarked opportunity IDs & sync
│   │   │       └── uiSlice.js             # Language toggle, theme, drawer states
│   │   │
│   │   ├── services/                      # HTTP API Integration Layer
│   │   │   ├── api.js                     # Configured Axios instance with interceptors
│   │   │   ├── authService.js             # Login & token refresh API calls
│   │   │   ├── opportunityService.js      # Public opportunity fetching & searching
│   │   │   ├── aiService.js               # Chatbot & eligibility calculator API calls
│   │   │   └── adminService.js            # CRUD & scraper trigger endpoints
│   │   │
│   │   ├── utils/                         # Helper functions & formatters
│   │   │   ├── dateFormatter.js           # Date and deadline countdown utilities
│   │   │   ├── constants.js               # Category metadata, province lists
│   │   │   └── i18n.js                    # i18next configuration & initialization
│   │   │
│   │   ├── App.jsx                        # Main router and route definitions
│   │   ├── main.jsx                       # React DOM entry point with Redux Provider
│   │   └── index.css                      # Tailwind base, components, and custom CSS
│   │
│   ├── .env.example                       # Frontend environment template
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
