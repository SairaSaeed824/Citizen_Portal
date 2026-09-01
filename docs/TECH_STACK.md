# Tech Stack Specification & Setup Guide

## 1. Complete Technology Matrix

| Layer | Technology | Version | Purpose & Rationale |
|---|---|---|---|
| **Frontend Core** | React.js | `^18.2.0` | Declarative UI library providing reactive state management and fast component rendering. |
| **Build Tool** | Vite | `^5.0.0` | Ultra-fast HMR and optimized production bundling for modern web apps. |
| **State Management** | Redux Toolkit (RTK) | `^2.0.0` | Predictable centralized state container for global filters, favorites, auth, and search cache. |
| **Styling** | Tailwind CSS | `^3.4.0` | Utility-first CSS framework enabling rapid, highly responsive, and accessible dark/light and RTL theming. |
| **HTTP Client** | Axios | `^1.6.0` | Promise-based HTTP client with global interceptors for JWT injection and automated error retry. |
| **Localization** | i18next & react-i18next | `^23.7.0` | Complete internationalization support for English and Urdu (with RTL font switching). |
| **Icons** | Lucide React | `^0.300.0` | Lightweight, scalable vector icons with consistent stroke and design aesthetic. |
| **Backend Core** | Python FastAPI | `^0.109.0` | Asynchronous high-performance web framework based on Starlette and Pydantic with automated OpenAPI documentation. |
| **ASGI Server** | Uvicorn (standard) | `^0.27.0` | Lightning-fast ASGI server implementation using `uvloop` and `httptools`. |
| **Primary Database** | MongoDB Atlas | `v7.0+` | Scalable NoSQL document database suited for semi-structured opportunity records and flexible querying. |
| **Database ODM/Driver** | Motor / PyMongo | `^3.3.0` | Async Python driver for MongoDB allowing non-blocking database queries inside FastAPI event loop. |
| **In-Memory Cache** | Upstash Redis | `v7.0+` | Serverless Redis instance for query result caching, API rate limiting, and session tracking. |
| **Data Validation** | Pydantic v2 | `^2.6.0` | High-speed data parsing and validation using Python type annotations. |
| **Security & Auth** | PyJWT / Passlib (Bcrypt) | `^2.8.0 / ^1.7.4` | Stateless JSON Web Token authentication with industry-standard bcrypt password hashing. |
| **Web Scraping** | BeautifulSoup4 + Requests | `^4.12.0 / ^2.31.0` | Fast DOM parsing and extraction for static HTML government portals. |
| **Dynamic Scraping** | Selenium WebDriver | `^4.17.0` | Headless browser automation for JavaScript-rendered SPA portals (e.g., NJP / BNIP). |
| **Background Scheduler** | APScheduler | `^3.10.0` | In-process cron scheduling for automated periodic scraping and opportunity expiry cleanup. |
| **Frontend Hosting** | Vercel | Production | Global Edge Network CDN with instant CI/CD deployment from Git repository. |
| **Backend Hosting** | Railway.app | Production | Cloud container platform offering seamless Python ASGI deployment with persistent environment management. |

---

## 2. Architecture & Data Flow

```
[ Browser / Client (React + Redux) ]
                │
         HTTPS Requests (Axios)
                │
                ▼
[ Edge CDN / Vercel Host ]
                │
        Proxy / Direct API
                │
                ▼
[ Railway.app — FastAPI Application ]
   ├── Authentication Middleware (JWT + Bcrypt)
   ├── Rate Limiting Middleware (Redis Token Bucket)
   ├── Route Handlers (/api/v1/opportunities, /api/v1/admin)
   │        ├── Read Path: Check Upstash Redis Cache ──[Hit]──> Return JSON
   │        └── Cache Miss: Query MongoDB Atlas ────> Update Cache ──> Return JSON
   │
   └── Background Task Runner (APScheduler)
            │
            ▼
     [ Scraper Engine ]
     ├── Static Fetcher (Requests + BS4)
     └── Dynamic Fetcher (Selenium Headless Chrome)
            │
            ▼
     [ Target Gov Portals (HEC, NJP, BNIP, SMEDA, NAVTTC, Youth) ]
```

---

## 3. Local Development Prerequisites

- **Node.js:** `v18.18.0` or higher (LTS recommended)
- **npm:** `v9.8.0` or higher (or `pnpm` / `yarn`)
- **Python:** `v3.11.x` (Recommended: Python 3.11 for optimal FastAPI & PyMongo async performance)
- **Google Chrome & ChromeDriver:** Required for dynamic Selenium scrapers
- **MongoDB Instance:** Local MongoDB or free MongoDB Atlas cluster connection URI
- **Redis Instance:** Local Redis or Upstash Redis REST/TCP credentials

---

## 4. Environment Variables Configuration

### 4.1 Backend Environment (`backend/.env`)

```env
# Application Settings
ENVIRONMENT=development
PROJECT_NAME="Citizen Opportunities Portal API"
API_V1_PREFIX=/api/v1
PORT=8000
HOST=0.0.0.0
DEBUG=True

# Security & Authentication
SECRET_KEY=citizenopportunities_super_secret_jwt_key_2026_x89a_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ADMIN_DEFAULT_EMAIL=admin@citizenportal.gov.pk
ADMIN_DEFAULT_PASSWORD=AdminSecurePassword2026!

# Database Configuration
MONGODB_URI=mongodb+srv://portal_admin:SecurePass2026@cluster0.abcde.mongodb.net/citizen_portal?retryWrites=true&w=majority
DATABASE_NAME=citizen_portal

# Cache Configuration (Upstash Redis)
REDIS_HOST=upstash-redis-endpoint.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=YourUpstashPasswordToken
REDIS_SSL=True
REDIS_CACHE_TTL_SECONDS=3600

# Scraper Settings
SCRAPER_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (CitizenPortalBot/1.0; +https://citizenportal.gov.pk/bot)"
SCRAPER_REQUEST_TIMEOUT=30
SELENIUM_HEADLESS=True

# CORS Allowed Origins
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","https://citizen-opportunities-portal.vercel.app"]
```

### 4.2 Frontend Environment (`frontend/.env`)

```env
# API Base Endpoint
VITE_API_BASE_URL=http://localhost:8000/api/v1

# App Meta Details
VITE_APP_NAME="Citizen Opportunities Portal"
VITE_DEFAULT_LANGUAGE=en
VITE_ENABLE_ANALYTICS=false
```

---

## 5. Step-by-Step Local Setup Instructions

### 5.1 Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # On Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # On Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Upgrade `pip` and install dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Create your `.env` file from the template:
   ```bash
   cp .env.example .env
   ```

5. Initialize database indexes and seed default categories/provinces:
   ```bash
   python -m app.db.init_db
   ```

6. Start the development server with live reload:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   Interactive OpenAPI documentation is accessible at: `http://localhost:8000/docs`

---

### 5.2 Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install all npm dependencies:
   ```bash
   npm install
   ```

3. Verify environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Launch the local Vite development server:
   ```bash
   npm run dev
   ```
   The client application will run at: `http://localhost:5173`

---

## 6. Dependency Manifests

### 6.1 `backend/requirements.txt`
```text
fastapi>=0.109.0,<0.110.0
uvicorn[standard]>=0.27.0,<0.28.0
pydantic>=2.6.0,<3.0.0
pydantic-settings>=2.1.0,<3.0.0
motor>=3.3.2,<4.0.0
pymongo>=4.6.1,<5.0.0
redis>=5.0.1,<6.0.0
python-jose[cryptography]>=3.3.0,<4.0.0
passlib[bcrypt]>=1.7.4,<2.0.0
python-multipart>=0.0.6
beautifulsoup4>=4.12.3
requests>=2.31.0
selenium>=4.17.2
webdriver-manager>=4.0.1
apscheduler>=3.10.4
httpx>=0.26.0
python-dotenv>=1.0.1
pytest>=8.0.0
pytest-asyncio>=0.23.5
```

### 6.2 Key `frontend/package.json` Dependencies
```json
{
  "dependencies": {
    "@reduxjs/toolkit": "^2.1.0",
    "axios": "^1.6.7",
    "clsx": "^2.1.0",
    "i18next": "^23.8.2",
    "i18next-browser-languagedetector": "^7.2.0",
    "lucide-react": "^0.323.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-i18next": "^14.0.5",
    "react-redux": "^9.1.0",
    "react-router-dom": "^6.22.0",
    "tailwind-merge": "^2.2.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.0"
  }
}
```
