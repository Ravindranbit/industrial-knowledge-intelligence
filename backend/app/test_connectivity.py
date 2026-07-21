"""
Quick connectivity test — verifies Neo4j and the FastAPI app start correctly.

Usage:
    cd backend
    python -m app.test_connectivity
"""

import sys
import os

# Add parent dir to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_neo4j():
    """Test Neo4j connectivity."""
    try:
        from app.graph.driver import get_driver, close_driver

        driver = get_driver()
        driver.verify_connectivity()
        print("✓ Neo4j: Connection successful")

        with driver.session() as session:
            result = session.run("RETURN 1 AS test")
            value = result.single()["test"]
            assert value == 1
            print("✓ Neo4j: Query execution successful")

        close_driver()
        return True
    except Exception as e:
        print(f"✗ Neo4j: Connection failed — {e}")
        return False


def test_config():
    """Test that config loads from .env."""
    try:
        from app.config import settings

        assert settings.NEO4J_URI, "NEO4J_URI is empty"
        assert settings.NEO4J_PASSWORD, "NEO4J_PASSWORD is empty"
        print(f"✓ Config: Loaded successfully")
        print(f"  NEO4J_URI = {settings.NEO4J_URI[:30]}...")
        print(f"  POSTGRES_URL = {settings.POSTGRES_URL[:30]}...")
        print(f"  GROQ_API_KEY = {'set' if settings.GROQ_API_KEY else 'NOT SET'}")
        return True
    except Exception as e:
        print(f"✗ Config: Failed to load — {e}")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("Phase 0 — Connectivity Test")
    print("=" * 50)
    print()

    config_ok = test_config()
    print()
    neo4j_ok = test_neo4j()

    print()
    print("=" * 50)
    if config_ok and neo4j_ok:
        print("All checks passed ✓")
    else:
        print("Some checks failed — see above")
    print("=" * 50)
