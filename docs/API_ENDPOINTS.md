# FastAPI REST API Endpoints Specification

## 1. Overview & Base URL

The **Citizen Opportunities Portal API** is structured according to RESTful principles, featuring JSON payloads, standard HTTP response status codes, Pydantic v2 data validation, and JWT-based Bearer authentication for protected administrative routes.

- **Base URL (Local Development):** `http://localhost:8000/api/v1`
- **Base URL (Production - Railway):** `https://api.citizenportal.gov.pk/api/v1`
- **Interactive Documentation (Swagger UI):** `http://localhost:8000/docs`
- **Alternative Documentation (ReDoc):** `http://localhost:8000/redoc`

---

## 2. Authentication & Authorization

Protected endpoints require a standard Bearer Token in the HTTP Authorization header:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

## 3. Public API Endpoints

### 3.1 Get Paginated Opportunities
Retrieve a filtered and paginated list of active government opportunities.

- **Method:** `GET`
- **Path:** `/opportunities`
- **Auth Required:** No

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `page` | `integer` | No | `1` | Page number (min 1). |
| `limit` | `integer` | No | `12` | Items per page (min 1, max 100). |
| `category` | `string` | No | `null` | Filter by category slug (`jobs`, `scholarships`, `internships`, `loans`, `training`). |
| `province` | `string` | No | `null` | Filter by province code (`PUNJAB`, `SINDH`, `KPK`, `BALOCHISTAN`, `GB`, `AJK`, `FEDERAL`). |
| `min_education` | `string` | No | `null` | Education level (`Matric`, `Intermediate`, `Bachelors`, `Masters`, `PhD`). |
| `sort_by` | `string` | No | `deadline_asc`| Sorting: `deadline_asc`, `deadline_desc`, `created_desc`, `title_asc`. |

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/v1/opportunities?category=scholarships&province=PUNJAB&page=1&limit=2" \
  -H "Accept: application/json"
```

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "total_count": 24,
    "page": 1,
    "limit": 2,
    "total_pages": 12,
    "items": [
      {
        "id": "65de1004a1b2c3d4e5f60004",
        "title": "HEC Overseas Scholarship Scheme Phase-III 2026",
        "title_ur": "ایچ ای سی اوورسیز سکالرشپ سکیم فیز III",
        "slug": "hec-overseas-scholarship-phase-iii-2026-9f8a",
        "category_slug": "scholarships",
        "province_codes": ["PUNJAB", "SINDH", "KPK", "BALOCHISTAN", "GB", "AJK", "FEDERAL"],
        "organization": "Higher Education Commission (HEC)",
        "official_url": "https://www.hec.gov.pk/english/scholarships/overseas/phase3",
        "deadline": "2026-10-31T23:59:59.000Z",
        "minimum_education": "Bachelors",
        "age_min": 18,
        "age_max": 35,
        "gender_quota": "ALL",
        "benefits_stipend": "100% Tuition Fee, Monthly Living Allowance ($1,800/mo)",
        "days_remaining": 64,
        "source_portal": "HEC",
        "created_at": "2026-08-28T04:05:00.000Z"
      }
    ]
  }
}
```

---

### 3.2 Get Opportunity by ID or Slug
Retrieve comprehensive details of a single active or archived opportunity.

- **Method:** `GET`
- **Path:** `/opportunities/{identifier}`
- **Auth Required:** No

#### Path Parameters
- `identifier` (`string`): MongoDB ObjectId (24 hex characters) or unique slug string.

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "65de1004a1b2c3d4e5f60004",
    "title": "HEC Overseas Scholarship Scheme Phase-III 2026",
    "title_ur": "ایچ ای سی اوورسیز سکالرشپ سکیم فیز III",
    "slug": "hec-overseas-scholarship-phase-iii-2026-9f8a",
    "description": "Applications are invited from outstanding Pakistani/AJK nationals for the award of PhD and MS/MPhil leading to PhD scholarships in top 50 QS-ranked world universities.",
    "description_ur": "اعلیٰ تعلیمی کمیشن پاکستان کی جانب سے دنیا کی ٹاپ 50 یونیورسٹیوں میں پی ایچ ڈی کے لیے وظائف کا اعلان۔",
    "category_slug": "scholarships",
    "province_codes": ["PUNJAB", "SINDH", "KPK", "BALOCHISTAN", "GB", "AJK", "FEDERAL"],
    "organization": "Higher Education Commission (HEC)",
    "official_url": "https://www.hec.gov.pk/english/scholarships/overseas/phase3",
    "deadline": "2026-10-31T23:59:59.000Z",
    "eligibility_criteria": "Minimum 16 years of education (BS/MSc) with minimum 3.0 CGPA or 1st Division. Maximum age 35 years.",
    "minimum_education": "Bachelors",
    "age_min": 18,
    "age_max": 35,
    "gender_quota": "ALL",
    "benefits_stipend": "100% Tuition Fee, Monthly Living Allowance ($1,800/mo), Airfare, Health Insurance",
    "status": "ACTIVE",
    "source_portal": "HEC",
    "scraped_at": "2026-08-28T04:00:00.000Z",
    "created_at": "2026-08-28T04:05:00.000Z",
    "updated_at": "2026-08-28T04:05:00.000Z"
  }
}
```

---

### 3.3 Advanced Full-Text Search
Performs weighted full-text keyword search and multi-facet filtering.

- **Method:** `POST`
- **Path:** `/search`
- **Auth Required:** No

#### Request Body Schema
```json
{
  "query": "Software Engineer Internship",
  "category_slug": "internships",
  "province_codes": ["PUNJAB", "FEDERAL"],
  "min_education": "Bachelors",
  "max_age": 30,
  "gender": "ALL",
  "page": 1,
  "limit": 10
}
```

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "total_results": 14,
    "page": 1,
    "limit": 10,
    "items": [
      {
        "id": "65de1009a1b2c3d4e5f60009",
        "title": "BNIP National Digital Youth Internship 2026",
        "slug": "bnip-national-digital-youth-internship-2026-b1a2",
        "organization": "Prime Minister's Youth Programme",
        "category_slug": "internships",
        "province_codes": ["ALL"],
        "deadline": "2026-09-30T23:59:59.000Z",
        "benefits_stipend": "PKR 40,000 / Month for 6 Months",
        "relevance_score": 14.8
      }
    ]
  }
}
```

---

### 3.4 Get Categories
List all active opportunity classifications.

- **Method:** `GET`
- **Path:** `/categories`
- **Auth Required:** No

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "data": [
    {
      "id": "65de1002a1b2c3d4e5f60002",
      "slug": "jobs",
      "name_en": "Jobs & Employment",
      "name_ur": "ملازمتیں و روزگار",
      "icon_name": "Briefcase",
      "active_count": 84
    },
    {
      "id": "65de1002a1b2c3d4e5f60003",
      "slug": "scholarships",
      "name_en": "Scholarships",
      "name_ur": "وظائف و سکالرشپس",
      "icon_name": "GraduationCap",
      "active_count": 42
    }
  ]
}
```

---

### 3.5 Get Provinces
List all Pakistani provinces and administrative territories.

- **Method:** `GET`
- **Path:** `/provinces`
- **Auth Required:** No

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "data": [
    { "code": "PUNJAB", "name_en": "Punjab", "name_ur": "پنجاب", "capital": "Lahore" },
    { "code": "SINDH", "name_en": "Sindh", "name_ur": "سندھ", "capital": "Karachi" },
    { "code": "KPK", "name_en": "Khyber Pakhtunkhwa", "name_ur": "خیبر پختونخوا", "capital": "Peshawar" },
    { "code": "BALOCHISTAN", "name_en": "Balochistan", "name_ur": "بلوچستان", "capital": "Quetta" },
    { "code": "GB", "name_en": "Gilgit-Baltistan", "name_ur": "گلگت بلتستان", "capital": "Gilgit" },
    { "code": "AJK", "name_en": "Azad Jammu & Kashmir", "name_ur": "آزاد جموں و کشمیر", "capital": "Muzaffarabad" },
    { "code": "FEDERAL", "name_en": "Islamabad Capital Territory", "name_ur": "اسلام آباد", "capital": "Islamabad" }
  ]
}
```

---

### 3.6 AI Citizen Assistant (Chatbot Query)
Conversational endpoint grounded strictly in indexed database records.

- **Method:** `POST`
- **Path:** `/ai/chat`
- **Auth Required:** No

#### Request Schema
```json
{
  "message": "Are there any training programs for IT in Khyber Pakhtunkhwa?",
  "language": "en",
  "conversation_history": []
}
```

#### Response Schema (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "reply": "Yes! NAVTTC is currently offering the 'Prime Minister's Special IT Training Scheme' in Peshawar and Abbottabad. The deadline to apply is October 15, 2026, and it offers free certification with a PKR 10,000 monthly stipend.",
    "related_opportunities": [
      {
        "id": "65de1009a1b2c3d4e5f60022",
        "title": "NAVTTC High-Tech IT & AI Certification Course 2026",
        "deadline": "2026-10-15T23:59:59.000Z",
        "official_url": "https://www.navttc.org/special-it-scheme-2026"
      }
    ]
  }
}
```

---

### 3.7 AI Eligibility Calculator
Evaluates citizen demographic and educational background against all active opportunities.

- **Method:** `POST`
- **Path:** `/ai/eligibility-check`
- **Auth Required:** No

#### Request Schema
```json
{
  "age": 24,
  "education_level": "Bachelors",
  "province": "KPK",
  "gender": "FEMALE",
  "category_preference": "internships"
}
```

#### Response Schema (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "matched_count": 5,
    "top_matches": [
      {
        "opportunity_id": "65de1009a1b2c3d4e5f60009",
        "title": "BNIP National Digital Youth Internship 2026",
        "match_percentage": 100,
        "reasons": [
          "Age 24 is within range (18-30)",
          "Education requirement (Bachelors) satisfied",
          "Open to KPK domicile"
        ]
      }
    ]
  }
}
```

---

## 4. Admin API Endpoints

### 4.1 Admin Authentication (Login)
- **Method:** `POST`
- **Path:** `/auth/login`
- **Auth Required:** No (Public endpoint for admin portal)

#### Request Schema
```json
{
  "email": "admin@citizenportal.gov.pk",
  "password": "AdminSecurePassword2026!"
}
```

#### Response Schema (`200 OK`)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in_seconds": 86400,
  "user": {
    "id": "65de1001a1b2c3d4e5f60001",
    "email": "admin@citizenportal.gov.pk",
    "full_name": "Muhammad Usman Khan",
    "role": "SUPER_ADMIN"
  }
}
```

---

### 4.2 Create New Opportunity (Admin Manual Entry)
- **Method:** `POST`
- **Path:** `/admin/opportunities`
- **Auth Required:** Yes (`Bearer Token`)

#### Request Schema
```json
{
  "title": "SMEDA Youth Enterprise Subsidized Loan Phase-II",
  "title_ur": "سمیڈا یوتھ انٹرپرائز بلا سود قرضہ سکیم",
  "description": "Financial assistance program providing interest-free micro-loans up to PKR 1,500,000 for young entrepreneurs setting up tech startups and agro-processing businesses.",
  "category_slug": "loans",
  "province_codes": ["ALL"],
  "organization": "Small and Medium Enterprises Development Authority (SMEDA)",
  "official_url": "https://www.smeda.org/schemes/youth-enterprise-2026",
  "deadline": "2026-11-30T23:59:59.000Z",
  "eligibility_criteria": "Pakistani citizen aged 21-45 with viable business proposal.",
  "minimum_education": "Intermediate",
  "age_min": 21,
  "age_max": 45,
  "gender_quota": "ALL",
  "benefits_stipend": "Loan amount up to PKR 1.5 Million with 0% interest and 3-year grace period"
}
```

#### Response Schema (`201 Created`)
```json
{
  "success": true,
  "status_code": 201,
  "message": "Opportunity successfully created.",
  "data": {
    "id": "65de1005a1b2c3d4e5f60099",
    "slug": "smeda-youth-enterprise-subsidized-loan-phase-ii-4a1c",
    "status": "ACTIVE",
    "created_at": "2026-08-28T11:45:00.000Z"
  }
}
```

---

### 4.3 Update Opportunity
- **Method:** `PUT`
- **Path:** `/admin/opportunities/{id}`
- **Auth Required:** Yes (`Bearer Token`)

#### Request Schema (Partial or Full)
```json
{
  "deadline": "2026-12-15T23:59:59.000Z",
  "status": "ACTIVE",
  "benefits_stipend": "Revised: Loan amount extended up to PKR 2.0 Million"
}
```

#### Response Schema (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Opportunity updated successfully.",
  "data": {
    "id": "65de1005a1b2c3d4e5f60099",
    "updated_at": "2026-08-28T11:48:00.000Z"
  }
}
```

---

### 4.4 Delete Opportunity (Soft Delete / Archive)
- **Method:** `DELETE`
- **Path:** `/admin/opportunities/{id}`
- **Auth Required:** Yes (`Bearer Token`)

#### Response Schema (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Opportunity 65de1005a1b2c3d4e5f60099 marked as ARCHIVED."
}
```

---

### 4.5 Get Scraper Execution Logs
- **Method:** `GET`
- **Path:** `/admin/logs`
- **Auth Required:** Yes (`Bearer Token`)

#### Query Parameters
- `source_name` (`string`, optional): `HEC`, `NJP`, `BNIP`, `SMEDA`, `NAVTTC`, `YOUTH`.
- `page` (`integer`, default: `1`): Pagination index.
- `limit` (`integer`, default: `20`): Page size.

#### Response Schema (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "total_logs": 84,
    "page": 1,
    "limit": 20,
    "logs": [
      {
        "id": "65de1005a1b2c3d4e5f60005",
        "job_id": "job-njp-20260828-040001",
        "source_name": "NJP",
        "status": "SUCCESS",
        "records_extracted": 45,
        "records_inserted": 12,
        "records_updated": 30,
        "records_failed": 3,
        "duration_ms": 14250,
        "executed_at": "2026-08-28T04:00:00.000Z"
      }
    ]
  }
}
```

---

### 4.6 Manual Scraper Trigger
- **Method:** `POST`
- **Path:** `/admin/scraper/trigger`
- **Auth Required:** Yes (`Bearer Token`)

#### Request Schema
```json
{
  "source_name": "HEC",
  "force_full_refresh": false
}
```

#### Response Schema (`202 Accepted`)
```json
{
  "success": true,
  "status_code": 202,
  "message": "Scraper task for 'HEC' has been queued successfully.",
  "job_id": "job-hec-manual-20260828-115002"
}
```

---

## 5. Standard Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "status_code": 400,
  "error": "Bad Request",
  "detail": "Deadline date must be in the future (after 2026-08-28T11:35:23Z)."
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "status_code": 401,
  "error": "Unauthorized",
  "detail": "Invalid or expired Bearer authentication token."
}
```

### 422 Unprocessable Entity (Validation Error)
```json
{
  "success": false,
  "status_code": 422,
  "error": "Validation Error",
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "String should have at least 10 characters",
      "type": "string_too_short"
    },
    {
      "loc": ["body", "official_url"],
      "msg": "URL scheme must be 'https'",
      "type": "invalid_url_scheme"
    }
  ]
}
```
