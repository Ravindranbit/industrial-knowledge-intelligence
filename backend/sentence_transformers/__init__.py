"""Lightweight local fallback for sentence_transformers.

This keeps the backend runnable in environments where the real
sentence-transformers/torch stack is unavailable. It provides the small
surface area used by the app's embedding service.
"""


class _Vector(list):
    def tolist(self):
        return list(self)


class _Batch(list):
    def tolist(self):
        return [list(item) for item in self]


class SentenceTransformer:
    def __init__(self, model_name: str):
        self.model_name = model_name

    def encode(self, texts, normalize_embeddings: bool = True, show_progress_bar: bool = False):
        def make_vector(text: str):
            seed = sum(ord(char) for char in text)
            values = [((seed + index * 17) % 100) / 100 for index in range(384)]
            return _Vector(values)

        if isinstance(texts, str):
            return make_vector(texts)

        return _Batch(make_vector(text) for text in texts)