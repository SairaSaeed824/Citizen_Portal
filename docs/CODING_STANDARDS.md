# Coding Standards & Engineering Guidelines

## 1. Core Engineering Principles

1. **Security First:** Never trust external input. Always sanitize, validate with Pydantic/Zod, parameterize database queries, and strictly guard secrets.
2. **Explicit over Implicit:** Write self-documenting code with comprehensive type annotations (Python Type Hints and TypeScript/JSDoc).
3. **No Hardcoded Constants:** Every URL, credential, timeout, threshold, and port must reside in environment variables or structured config modules.
4. **Resilient Error Handling:** Catch specific exceptions, return meaningful standard HTTP error responses, and preserve stack traces in centralized logs.
5. **DRY (Don't Repeat Yourself):** Abstract shared logic into reusable utility modules and custom React hooks.

---

## 2. Python Coding Standards (FastAPI & Scrapers)

### 2.1 Style & Formatting
- Adhere strictly to **PEP 8** standards.
- Formatted using **Black** (line length: 88) and **Flake8** linting.
- Imports must be sorted alphabetically using **isort** into three sections: standard library, third-party libraries, local application modules.

### 2.2 Naming Conventions
| Element | Convention | Example |
|---|---|---|
| Variables & Functions | `snake_case` | `calculate_eligibility_score()`, `user_token` |
| Classes & Models | `PascalCase` | `OpportunityResponse`, `ScraperEngine` |
| Constants & Enums | `UPPER_SNAKE_CASE` | `MAX_SEARCH_LIMIT`, `PROVINCE_CODES` |
| Modules & Files | `snake_case.py` | `auth_service.py`, `hec_scraper.py` |
| Private Methods | `_leading_underscore` | `_init_robots_txt()`, `_generate_hash()` |

### 2.3 Type Hinting & Async Best Practices
- Every function must declare parameter and return types:
```python
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

async def fetch_active_opportunities(
    category_slug: str,
    limit: int = 10,
    min_deadline: Optional[datetime] = None
) -> List[OpportunityResponse]:
    """Retrieve active opportunities filtered by category and deadline threshold."""
    # Async non-blocking database query execution
    results = await db.opportunities.find({
        "category_slug": category_slug,
        "status": "ACTIVE"
    }).limit(limit).to_list(length=limit)
    
    return [OpportunityResponse(**item) for item in results]
```

### 2.4 Error Handling & Custom Exceptions
- Avoid bare `except:` clauses. Always handle specific exceptions and map them to standard HTTP exceptions:
```python
from fastapi import HTTPException, status
from pymongo.errors import PyMongoError
import logging

logger = logging.getLogger(__name__)

async def get_opportunity_by_id(opportunity_id: str) -> dict:
    try:
        obj_id = ObjectId(opportunity_id)
        doc = await db.opportunities.find_one({"_id": obj_id})
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Opportunity with ID '{opportunity_id}' not found."
            )
        return doc
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ObjectId format."
        )
    except PyMongoError as err:
        logger.error(f"Database error while querying opportunity {opportunity_id}: {err}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal database communication failure."
        )
```

---

## 3. JavaScript & React Coding Standards

### 3.1 Naming Conventions
| Element | Convention | Example |
|---|---|---|
| Variables & Functions | `camelCase` | `fetchOpportunityList`, `isDrawerOpen` |
| React Components | `PascalCase` | `OpportunityCard.jsx`, `FilterSidebar.jsx` |
| Custom Hooks | `useCamelCase` | `useEligibilityFilter.js`, `useDebounce.js` |
| Redux Slices & Actions | `camelCase` | `opportunitySlice.js`, `setFilters` |
| CSS Utility Classes | Tailwind standard | `className="flex items-center gap-4 p-4"` |

### 3.2 Component Architecture & State Management
- Utilize functional components with React Hooks exclusively.
- Extract complex UI components into modular atomic units in `src/components/common/`.
- Handle global state via Redux Toolkit slices:

```javascript
// src/redux/slices/opportunitySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { opportunityService } from '../../services/opportunityService';

export const fetchOpportunities = createAsyncThunk(
  'opportunities/fetchAll',
  async (filterParams, { rejectWithValue }) => {
    try {
      const response = await opportunityService.getAll(filterParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch opportunities');
    }
  }
);

const opportunitySlice = createSlice({
  name: 'opportunities',
  initialState: {
    items: [],
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpportunities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpportunities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalPages = action.payload.total_pages;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchOpportunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = opportunitySlice.actions;
export default opportunitySlice.reducer;
```

---

## 4. API Client & Axios Interceptors

Centralized Axios client located in `src/services/api.js` ensures uniform authorization and error toast triggers:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Bearer Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 5. Security & Hygiene Checklist

- [ ] **No Secrets in Source:** `.env` files are in `.gitignore`.
- [ ] **JWT Validation:** Admin endpoints strictly verify token signature and expiry.
- [ ] **XSS Prevention:** User-generated and scraped content is sanitized before rendering in DOM.
- [ ] **CORS Configuration:** Backend explicitly whitelists only frontend domains (Vercel & localhost).
- [ ] **Rate Limiting:** Protect against scraping and brute-force via Redis Token Bucket.
- [ ] **Input Constraints:** All Pydantic models enforce string length and enum checks.
