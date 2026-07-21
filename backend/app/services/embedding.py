"""
Embedding service — generates vector embeddings for text chunks.
Uses sentence-transformers (all-MiniLM-L6-v2) for fast, lightweight embeddings.
"""

from sentence_transformers import SentenceTransformer

# Singleton model instance — loaded once on first use
_model = None


def _get_model() -> SentenceTransformer:
    """Lazy-load the embedding model."""
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Success: Embedding model loaded (all-MiniLM-L6-v2, dim=384)")
    return _model


def embed_text(text: str) -> list[float]:
    """Generate an embedding vector for a single text string."""
    model = _get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Generate embedding vectors for a batch of text strings."""
    model = _get_model()
    embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return embeddings.tolist()
