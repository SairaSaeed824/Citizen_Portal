# Data Validation Rules & Quality Assurance Engine

## 1. Overview & Quality Mandates

The **Citizen Opportunities Portal** enforces data integrity constraints across both the ingestion pipeline (scrapers) and manual administrative inputs. Invalid or malformed listings are automatically intercepted, logged, and rejected.

```
                  [ Raw Data Source / Admin Form ]
                                │
                                ▼
         +─────────────────────────────────────────────+
         |        Pydantic v2 Validation Pipeline      |
         +─────────────────────────────────────────────+
         |  1. Title Length: 10-100 characters         |
         |  2. Official URL: Valid HTTPS Only          |
         |  3. Deadline: Future Date Constraint        |
         |  4. Category: Allowed Enum Values           |
         |  5. Content Hash: SHA-256 Deduplication     |
         +─────────────────────────────────────────────+
                 │                             │
              [ Passes ]                   [ Fails ]
                 │                             │
                 ▼                             ▼
    [ Insert to MongoDB Atlas ]    [ Log to Rejection Audit ]
                 │
                 ▼
    [ Expiry & Threshold Engine ]
    - Auto-expire passed deadlines
    - Alert if active count < 10
```

---

## 2. Core Validation Rules Matrix

| Rule Identifier | Field / Attribute | Condition / Constraint | Action on Failure |
|---|---|---|---|
| **VAL-01** | `title` | Length between **10 and 100 characters**, sanitized from raw HTML tags. | Reject record. Log `STRING_LENGTH_INVALID`. |
| **VAL-02** | `official_url` | Must be a syntactically valid URL with `https://` protocol only. | Reject record. Log `INSECURE_OR_INVALID_URL`. |
| **VAL-03** | `deadline` | Timestamp must be strictly **greater than the current UTC time** at ingestion. | Reject record. Log `DEADLINE_IN_PAST`. |
| **VAL-04** | `category_slug` | Must match one of: `jobs`, `scholarships`, `internships`, `loans`, `training`. | Reject record. Log `INVALID_CATEGORY_ENUM`. |
| **VAL-05** | `content_hash` | SHA-256 hash of `(title + official_url + deadline)` must be unique. | Update `updated_at` / Skip duplicate insertion. |
| **VAL-06** | `province_codes`| Array of valid ISO/Local codes: `PUNJAB`, `SINDH`, `KPK`, `BALOCHISTAN`, `GB`, `AJK`, `FEDERAL`, or `ALL`. | Reject record. Log `INVALID_PROVINCE_CODE`. |
| **VAL-07** | `age_min` / `age_max` | If present, `14 <= age_min <= age_max <= 70`. | Reject record. Log `AGE_RANGE_INVALID`. |
| **VAL-08** | **Auto-Expiry** | Hourly cron transitions status to `EXPIRED` if `deadline < UTC_NOW`. | Database status update to `EXPIRED`. |
| **VAL-09** | **Active Threshold**| System must maintain **at least 10 active opportunities** per category. | Trigger admin alert & initiate urgent scrape. |

---

## 3. Pydantic v2 Implementation Model (`backend/app/models/opportunity.py`)

```python
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl, field_validator, model_validator
import hashlib

class CategoryEnum(str, Enum):
    JOBS = "jobs"
    SCHOLARSHIPS = "scholarships"
    INTERNSHIPS = "internships"
    LOANS = "loans"
    TRAINING = "training"

class ProvinceEnum(str, Enum):
    PUNJAB = "PUNJAB"
    SINDH = "SINDH"
    KPK = "KPK"
    BALOCHISTAN = "BALOCHISTAN"
    GB = "GB"
    AJK = "AJK"
    FEDERAL = "FEDERAL"
    ALL = "ALL"

class EducationEnum(str, Enum):
    MATRIC = "Matric"
    INTERMEDIATE = "Intermediate"
    BACHELORS = "Bachelors"
    MASTERS = "Masters"
    PHD = "PhD"
    NONE = "None"

class GenderQuotaEnum(str, Enum):
    ALL = "ALL"
    MALE_ONLY = "MALE_ONLY"
    FEMALE_ONLY = "FEMALE_ONLY"
    TRANSGENDER = "TRANSGENDER"

class OpportunityCreateSchema(BaseModel):
    title: str = Field(
        ...,
        min_length=10,
        max_length=100,
        description="Opportunity title between 10 and 100 characters"
    )
    title_ur: Optional[str] = Field(None, max_length=150)
    description: str = Field(..., min_length=20, max_length=5000)
    description_ur: Optional[str] = Field(None, max_length=5000)
    category_slug: CategoryEnum
    province_codes: List[ProvinceEnum] = Field(default=[ProvinceEnum.ALL])
    organization: str = Field(..., min_length=2, max_length=100)
    official_url: HttpUrl = Field(..., description="Official HTTPS redirect URL")
    deadline: datetime = Field(..., description="UTC deadline timestamp")
    eligibility_criteria: str = Field(..., min_length=5, max_length=1000)
    minimum_education: EducationEnum = Field(default=EducationEnum.NONE)
    age_min: Optional[int] = Field(None, ge=14, le=70)
    age_max: Optional[int] = Field(None, ge=14, le=70)
    gender_quota: GenderQuotaEnum = Field(default=GenderQuotaEnum.ALL)
    benefits_stipend: Optional[str] = Field(None, max_length=500)
    source_portal: str = Field(..., max_length=50)

    @field_validator("official_url")
    @classmethod
    def validate_https_url(cls, v: HttpUrl) -> HttpUrl:
        if v.scheme != "https":
            raise ValueError("Official URL must use the secure HTTPS protocol.")
        return v

    @field_validator("deadline")
    @classmethod
    def validate_future_deadline(cls, v: datetime) -> datetime:
        now_utc = datetime.now(timezone.utc)
        target = v if v.tzinfo else v.replace(tzinfo=timezone.utc)
        if target <= now_utc:
            raise ValueError(f"Deadline must be a future date (received {target.isoformat()} vs current {now_utc.isoformat()}).")
        return target

    @model_validator(mode="after")
    def validate_age_range(self) -> "OpportunityCreateSchema":
        if self.age_min is not None and self.age_max is not None:
            if self.age_min > self.age_max:
                raise ValueError(f"age_min ({self.age_min}) cannot be greater than age_max ({self.age_max}).")
        return self

    def generate_content_hash(self) -> str:
        """Compute SHA-256 fingerprint for deduplication."""
        raw_key = f"{self.title.strip().lower()}|{str(self.official_url).strip().lower()}|{self.deadline.isoformat()}"
        return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
```

---

## 4. Automated Expiry & Minimum Threshold Workers

### 4.1 Expiry Lifecycle Worker (`backend/app/services/expiry_manager.py`)
Runs every hour via APScheduler to transition out-of-date opportunities:

```python
import logging
from datetime import datetime, timezone
from app.db.session import get_database

logger = logging.getLogger("ExpiryWorker")

async def expire_outdated_opportunities() -> int:
    db = await get_database()
    now_utc = datetime.now(timezone.utc)
    
    result = await db.opportunities.update_many(
        {
            "status": "ACTIVE",
            "deadline": {"$lt": now_utc}
        },
        {
            "$set": {
                "status": "EXPIRED",
                "updated_at": now_utc
            }
        }
    )
    logger.info(f"[ExpiryManager] Successfully expired {result.modified_count} opportunities.")
    return result.modified_count
```

### 4.2 Minimum 10 Opportunities Threshold Monitor
Ensures citizen service continuity across every category:

```python
async def check_category_thresholds(min_threshold: int = 10) -> None:
    db = await get_database()
    categories = ["jobs", "scholarships", "internships", "loans", "training"]
    
    for cat in categories:
        count = await db.opportunities.count_documents({
            "category_slug": cat,
            "status": "ACTIVE"
        })
        if count < min_threshold:
            logger.warning(
                f"[ThresholdAlert] Category '{cat}' has only {count} active listings (Minimum required: {min_threshold})! Initiating scraper trigger."
            )
            # Automatically dispatch scraper task
```
