"""
Neo4j read/query functions.

Stub — will be expanded in Phase 3+ with RAG context queries,
compliance lookups, pattern matching, etc.
"""

from app.graph.driver import get_driver


def get_all_equipment():
    """Return a list of all Equipment nodes."""
    driver = get_driver()
    with driver.session() as session:
        result = session.run("MATCH (e:Equipment) RETURN e")
        return [record["e"] for record in result]


def get_graph_stats():
    """Return basic graph statistics for health checks."""
    driver = get_driver()
    with driver.session() as session:
        node_count = session.run("MATCH (n) RETURN count(n) AS count").single()["count"]
        rel_count = session.run("MATCH ()-[r]->() RETURN count(r) AS count").single()["count"]
        return {"nodes": node_count, "relationships": rel_count}
