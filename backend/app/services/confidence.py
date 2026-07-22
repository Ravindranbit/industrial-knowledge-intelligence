"""
Confidence Tiering service.
"""

def evaluate_confidence(parsed_llm_response: dict, min_vector_distance: float = None) -> dict:
    """
    Evaluates and enforces the confidence tier for a RAG answer.
    If the vector search returns no relevant chunks (e.g. min distance is too high),
    we override the LLM's confidence tier.
    """
    tier = parsed_llm_response.get("confidence_tier", "No reliable source / escalate")
    
    # Distance threshold for all-MiniLM-L6-v2 cosine distance.
    # Cosine distance is 1 - cosine_similarity. Smaller is closer. 
    # Usually < 0.4 is a good match, > 0.6 is poor.
    DISTANCE_THRESHOLD = 0.6
    
    if min_vector_distance is not None and min_vector_distance > DISTANCE_THRESHOLD:
        tier = "No reliable source / escalate"
        
    parsed_llm_response["confidence_tier"] = tier
    return parsed_llm_response
