import re
from typing import Tuple

# Common user typos/variants. Normalized locally so no LLM call is needed.
QUERY_NORMALIZATIONS = {
    "schoolarship": "scholarship",
    "schoolarships": "scholarships",
    "internship": "internship",
    "internhips": "internships",
    "scholorship": "scholarship",
    "scholorships": "scholarships",
}

OPPORTUNITY_TERMS = {
    "job", "jobs", "career", "careers", "employment", "vacancy", "vacancies",
    "scholarship", "scholarships", "funding", "fellowship", "fellowships",
    "loan", "loans", "finance", "financial", "training", "trainings", "course",
    "courses", "internship", "internships", "project", "projects", "opportunity",
    "opportunities", "program", "programs", "programme", "programmes", "apply",
    "application", "applications", "deadline", "deadlines", "eligibility", "eligible",
    "requirements", "requirement", "opening", "openings", "position", "positions",
    "hiring", "recruitment", "grant", "grants",
}

PAKISTAN_TERMS = {
    "pakistan", "pakistani", "punjab", "sindh", "balochistan", "kpk", "kp",
    "khyber", "pakhtunkhwa", "islamabad", "karachi", "lahore", "rawalpindi",
    "peshawar", "quetta", "multan", "faisalabad", "hyderabad", "pak",
}

TARGET_TERMS = {
    "student", "students", "graduate", "graduates", "undergraduate", "undergraduates",
    "fresh", "fresher", "freshers", "youth", "women", "woman", "applicant", "applicants",
    "developer", "developers", "engineer", "engineers", "degree", "education",
    "experience", "citizen", "citizens", "candidate", "candidates",
}

INTENT_TERMS = {
    "find", "show", "give", "list", "available", "latest", "new", "search", "looking",
    "need", "want", "help", "which", "what", "where", "how", "can", "any", "get",
}


def normalize_query(message: str) -> str:
    """Normalize common typos without making an external/API call."""
    text = message.lower().strip()
    words = text.split()
    return " ".join(QUERY_NORMALIZATIONS.get(word, word) for word in words)


def _words(message: str) -> set[str]:
    return set(re.sub(r"[^a-z\s]", " ", normalize_query(message)).split())


def check_query_relevance(message: str) -> Tuple[bool, str]:
    """Cheap local relevance gate. Never calls Gemini or another external API."""
    words = _words(message)
    if not words:
        return False, "Please enter a question related to Citizen Portal opportunities."

    opportunity_hits = words & OPPORTUNITY_TERMS
    pakistan_hits = words & PAKISTAN_TERMS
    target_hits = words & TARGET_TERMS
    intent_hits = words & INTENT_TERMS

    # Explicit Citizen Portal opportunity language is relevant.
    if opportunity_hits:
        return True, "opportunity terms detected"

    # Natural queries such as "support for Pakistani students" are relevant.
    if (pakistan_hits or target_hits) and intent_hits:
        return True, "citizen/opportunity intent detected"

    return False, "question is outside Citizen Portal opportunity scope"
