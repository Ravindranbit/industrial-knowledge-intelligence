"""
Neo4j schema initialization — constraints and indexes.

Run once on first setup to create uniqueness constraints and
indexes for frequently queried properties.
"""

from app.graph.driver import get_driver


SCHEMA_QUERIES = [
    # Uniqueness constraints
    "CREATE CONSTRAINT equipment_name IF NOT EXISTS FOR (e:Equipment) REQUIRE e.name IS UNIQUE",
    "CREATE CONSTRAINT failure_mode_name IF NOT EXISTS FOR (f:FailureMode) REQUIRE f.name IS UNIQUE",
    "CREATE CONSTRAINT technician_name IF NOT EXISTS FOR (t:Technician) REQUIRE t.name IS UNIQUE",
    "CREATE CONSTRAINT compliance_rule_ref IF NOT EXISTS FOR (r:ComplianceRule) REQUIRE r.clause_ref IS UNIQUE",

    # Indexes for common lookups
    "CREATE INDEX incident_date IF NOT EXISTS FOR (i:Incident) ON (i.date)",
    "CREATE INDEX work_order_date IF NOT EXISTS FOR (w:WorkOrder) ON (w.completed_date)",
    "CREATE INDEX equipment_type IF NOT EXISTS FOR (e:Equipment) ON (e.type)",
]


def init_schema():
    """Create all constraints and indexes. Safe to run multiple times."""
    driver = get_driver()
    with driver.session() as session:
        for query in SCHEMA_QUERIES:
            session.run(query)
    print("✓ Neo4j schema initialized (constraints + indexes)")


if __name__ == "__main__":
    init_schema()
