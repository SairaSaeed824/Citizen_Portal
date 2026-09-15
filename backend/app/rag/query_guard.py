import re
from typing import Tuple

# These are intentionally broad. The guard must reject obvious off-topic
# questions without requiring another LLM/API call.
OPPORTUNITY_TERMS = {
    "job", "jobs", "career", "careers", "employment", "vacancy", "vacancies",
    "scholarship", "scholarships", "funding", "fellowship", "fellowships",
    "loan", "loans", "finance", "financial", "training", "trainings", "course",
    "courses", "internship", "internships", "project", "projects", "opportunity",
    "opportunities", "program", "programs", "programme", "programmes",
    "apply", "application", "applications", "deadline", "deadlines", "eligibility",
    "eligible", "requirements", "requirement", "opening", "openings", "position",
    "positions", "hiring", "recruitment", "grant", "grants",
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
    "need", "want", "help", "which", "what", "where", "how", "can", "any",
}


def _words(message: str) -> set[str]:
    return set(re.sub(r"[^a-z\s]", " ", message.lower()).split())


def check_query_relevance(message: str) -> Tuple[bool, str]:
    """Cheap local relevance gate. Never calls Gemini or another external API."""
    words = _words(message)
    if not words:
        return False, "Please enter a question related to Citizen Portal opportunities."

    opportunity_hits = words & OPPORTUNITY_TERMS
    pakistan_hits = words & PAKISTAN_TERMS
    target_hits = words & TARGET_TERMS
    intent_hits = words & INTENT_TERMS

    score = 0
    score += min(len(opportunity_hits) * 3, 6)
    score += min(len(pakistan_hits) * 2, 2)
    score += min(len(target_hits), 2)
    score += min(len(intent_hits), 1)

    # Explicit opportunity/domain language is enough on its own.
    if opportunity_hits:
        return True, "opportunity terms detected"

    # Allow natural queries such as "financial support for Pakistani students"
    # even when they do not contain the literal word scholarship/loan.
    if (pakistan_hits or target_hits) and intent_hits:
        return True, "citizen/opportunity intent detected"

    # Broad domain signals can also be sufficient for questions like
    # "What is available in Punjab?".
    if score >= 3:
        return True, "domain relevance detected"

    return False, "question is outside Citizen Portal opportunity scope"
