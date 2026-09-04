# Database Schema Documentation - Citizen Opportunities Portal

## 1. OPPORTUNITIES Table
Stores master records of all official government programs, scholarships, loans, training, and internship listings.

| Column Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | int | Primary Key (PK) | Unique identifier for each opportunity record |
| `category` | string | | Classification category (e.g., jobs, scholarships, loans, training, internships) |
| `extra_data` | json | | Flexible schema container storing dynamic attributes (e.g., stipend amount, provider, deadline, eligibility, quota) |

---

## 2. ADMINS Table
Manages administrative authentication credentials for the platform's control deck.

| Column Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | int | Primary Key (PK) | Unique administrator identifier |
| `username` | string | | Administrator login username |
| `password` | string | | Secured password credential for authentication |

---

## 3. SUBMITTED_OPPORTUNITIES Table *(Crowdsourced Submissions)*
Stores citizen-submitted listings pending administrative review before being published to the main opportunities database. *(Updated from submitted jobs to accommodate all crowdsourced program categories)*

| Column Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | int | Primary Key (PK) | Unique submission entry identifier |
| `name` | string | | Title or name of the submitted opportunity |
| `detail` | string | | Detailed description, reference links, or provider information provided by the citizen |