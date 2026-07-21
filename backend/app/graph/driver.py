"""
Neo4j driver — singleton connection management.

Usage:
    from app.graph.driver import get_driver
    driver = get_driver()
    with driver.session() as session:
        result = session.run("MATCH (n) RETURN count(n)")
"""

from neo4j import GraphDatabase
from app.config import settings

_driver = None


def get_driver():
    """Return a singleton Neo4j driver instance."""
    global _driver
    if _driver is None:
        _driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
        )
    return _driver


def close_driver():
    """Close the Neo4j driver (call on app shutdown)."""
    global _driver
    if _driver is not None:
        _driver.close()
        _driver = None
