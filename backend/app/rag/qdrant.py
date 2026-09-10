import os
from functools import lru_cache
from typing import Any, Dict, List

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "citizen_opportunities")


@lru_cache(maxsize=1)
def get_qdrant() -> QdrantClient:
    url = os.getenv("QDRANT_URL")
    api_key = os.getenv("QDRANT_API_KEY")
    if not url:
        raise RuntimeError("QDRANT_URL is not configured")
    return QdrantClient(url=url, api_key=api_key or None)


def ensure_collection(vector_size: int) -> None:
    client = get_qdrant()
    collections = client.get_collections().collections
    if any(c.name == COLLECTION_NAME for c in collections):
        return
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
    )


def get_indexed_hashes() -> Dict[int, str]:
    client = get_qdrant()
    try:
        if not any(c.name == COLLECTION_NAME for c in client.get_collections().collections):
            return {}
        points, _ = client.scroll(
            collection_name=COLLECTION_NAME,
            limit=10000,
            with_vectors=False,
            with_payload=["embedding_hash"],
        )
        return {
            int(point.id): str((point.payload or {}).get("embedding_hash", ""))
            for point in points
        }
    except Exception:
        return {}


def upsert_opportunity(opportunity_id: int, vector: List[float], payload: Dict[str, Any]) -> None:
    ensure_collection(len(vector))
    get_qdrant().upsert(
        collection_name=COLLECTION_NAME,
        points=[PointStruct(id=int(opportunity_id), vector=vector, payload=payload)],
    )


def search_opportunities(vector: List[float], limit: int = 8) -> List[Dict[str, Any]]:
    ensure_collection(len(vector))
    results = get_qdrant().query_points(
        collection_name=COLLECTION_NAME,
        query=vector,
        limit=limit,
        with_payload=True,
    ).points
    return [{"score": point.score, **(point.payload or {})} for point in results]
