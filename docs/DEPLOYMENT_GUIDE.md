# Production Deployment Guide

## 1. Hosting Architecture & Prerequisites

The **Citizen Opportunities Portal** employs a distributed, serverless-capable cloud architecture:

```
[ Frontend: Vercel Global Edge CDN ]
                │
         HTTPS (SSL/TLS)
                │
                ▼
[ Backend: Railway.app Container ] ───> [ Upstash Redis (Serverless Cache) ]
                │
                ▼
[ Database: MongoDB Atlas Cluster ]
```

### Pre-requisites Checklist
- [ ] GitHub repository containing both `frontend/` and `backend/` directories.
- [ ] Active [MongoDB Atlas](https://www.mongodb.com/atlas) account.
- [ ] Active [Upstash](https://upstash.com/) account for Redis.
- [ ] Active [Railway.app](https://railway.app/) account.
- [ ] Active [Vercel](https://vercel.com/) account.

---

## 2. Step 1: Provision MongoDB Atlas Database

1. **Log in to MongoDB Atlas** and create a new project named `Citizen-Portal`.
2. **Deploy a Cluster:**
   - Provider: AWS / Google Cloud.
   - Tier: `M0 Sandbox` (Free) or `M10` (Production).
   - Region: `ap-south-1` (Mumbai) or `me-central-1` (UAE) for lowest latency to Pakistan.
3. **Database Access:**
   - Navigate to **Security > Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: `Password`.
   - Username: `portal_admin`.
   - Password: Generate a secure 24-character password (e.g., `SecureDbPass2026!xyz`).
   - Database User Privileges: `Read and write to any database`.
4. **Network Access:**
   - Navigate to **Security > Network Access**.
   - Click **Add IP Address** > Select **Allow Access from Anywhere** (`0.0.0.0/0`) to allow dynamic cloud container connections from Railway.
5. **Obtain Connection String:**
   - Navigate to **Deployments > Database > Connect > Drivers (Python)**.
   - Copy the URI:
     ```text
     mongodb+srv://portal_admin:SecureDbPass2026!xyz@cluster0.abcde.mongodb.net/citizen_portal?retryWrites=true&w=majority
     ```

---

## 3. Step 2: Provision Upstash Redis Cache

1. **Log in to Upstash Console** (`https://console.upstash.com`).
2. Click **Create Database**:
   - Name: `citizen-portal-cache`.
   - Type: `Regional`.
   - Region: Select region closest to your MongoDB deployment (e.g., `ap-south-1`).
   - Eviction: `No Eviction` or `volatile-lru`.
3. In the database details tab, under **Connect to your database**, select **redis-py / TCP**:
   - Note the **Endpoint** (`upstash-redis-endpoint.upstash.io`), **Port** (`6379`), and **Password**.

---

## 4. Step 3: Deploy Backend on Railway.app

1. **Log in to Railway.app** and click **New Project > Deploy from GitHub repo**.
2. Select your `Citizen_Portal` repository.
3. In the service settings:
   - **Root Directory:** Set to `/backend`.
   - **Build Command:** (Automatic via Nixpacks or Dockerfile).
   - **Start Command:**
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
4. Configure **Environment Variables** in Railway Dashboard:

| Variable Name | Example Value | Description |
|---|---|---|
| `ENVIRONMENT` | `production` | Active environment identifier |
| `PROJECT_NAME` | `Citizen Opportunities Portal API` | System Name |
| `API_V1_PREFIX` | `/api/v1` | URL API prefix |
| `SECRET_KEY` | `prod_jwt_super_secret_key_2026_98x1a!` | 64-char JWT cryptographic key |
| `ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| `1440` | Token lifetime (24 hours) |
| `ADMIN_DEFAULT_EMAIL` | `admin@citizenportal.gov.pk` | Default super-admin email |
| `ADMIN_DEFAULT_PASSWORD` | `ProductionAdminPass2026!` | Initial super-admin password |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB connection URI |
| `DATABASE_NAME` | `citizen_portal` | Mongo Database name |
| `REDIS_HOST` | `upstash-redis-endpoint.upstash.io` | Upstash host |
| `REDIS_PORT` | `6379` | Upstash port |
| `REDIS_PASSWORD` | `YourUpstashPasswordToken` | Upstash password |
| `REDIS_SSL` | `True` | Enforce SSL for Redis connection |
| `CORS_ORIGINS` | `["https://citizen-opportunities-portal.vercel.app"]` | Whitelisted frontend domains |

5. **Generate Domain:**
   - Under **Networking**, click **Generate Domain** (e.g., `https://citizen-portal-api-production.up.railway.app`).
6. **Trigger Seed Data:**
   - Open the Railway Service CLI / Shell and execute:
     ```bash
     python -m app.db.init_db
     ```

---

## 5. Step 4: Deploy Frontend on Vercel

1. **Log in to Vercel** and click **Add New > Project**.
2. Import your `Citizen_Portal` repository from GitHub.
3. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit and select `frontend`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Add **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://citizen-portal-api-production.up.railway.app/api/v1`
   - `VITE_APP_NAME`: `Citizen Opportunities Portal`
5. Click **Deploy**.
6. Ensure SPA client routing works by confirming `frontend/vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

## 6. Post-Deployment Verification Checklist

- [ ] **Backend Health Check:** Visit `https://<railway-url>/api/v1/categories` and verify JSON returns with HTTP 200.
- [ ] **Interactive Docs:** Verify `https://<railway-url>/docs` loads OpenAPI documentation.
- [ ] **Frontend Home Page:** Access `https://<vercel-url>/` and verify opportunity cards render properly.
- [ ] **Bilingual Switcher:** Click the Urdu toggle and ensure right-to-left layout and Urdu strings display.
- [ ] **Admin Authentication:** Navigate to `/login`, sign in with `admin@citizenportal.gov.pk`, and ensure JWT token is received and saved.
- [ ] **Scraper Trigger Test:** Trigger an on-demand scraper run from the Admin Dashboard and verify new log record in the Logs view.
