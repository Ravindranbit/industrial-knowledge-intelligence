"""
Neo4j write functions — create nodes and relationships.

All functions accept a Neo4j session transaction (tx) so they
can be composed inside a single transaction when needed.
"""

from app.graph.driver import get_driver


# ---------------------------------------------------------------------------
# Equipment
# ---------------------------------------------------------------------------

def create_equipment(tx, name: str, eq_type: str, location: str, **extra):
    """Create an Equipment node."""
    tx.run(
        """
        MERGE (e:Equipment {name: $name})
        SET e.type = $type, e.location = $location, e += $extra
        """,
        name=name, type=eq_type, location=location, extra=extra,
    )


# ---------------------------------------------------------------------------
# Failure Mode
# ---------------------------------------------------------------------------

def create_failure_mode(tx, name: str, description: str, **extra):
    """Create a FailureMode node."""
    tx.run(
        """
        MERGE (f:FailureMode {name: $name})
        SET f.description = $description, f += $extra
        """,
        name=name, description=description, extra=extra,
    )


# ---------------------------------------------------------------------------
# Incident
# ---------------------------------------------------------------------------

def create_incident(tx, incident_id: str, date: str, description: str,
                    severity: str, resolution: str = "", **extra):
    """Create an Incident node."""
    tx.run(
        """
        MERGE (i:Incident {incident_id: $incident_id})
        SET i.date = $date, i.description = $description,
            i.severity = $severity, i.resolution = $resolution,
            i += $extra
        """,
        incident_id=incident_id, date=date, description=description,
        severity=severity, resolution=resolution, extra=extra,
    )


# ---------------------------------------------------------------------------
# Work Order
# ---------------------------------------------------------------------------

def create_work_order(tx, order_id: str, wo_type: str, completed_date: str,
                      description: str, **extra):
    """Create a WorkOrder node."""
    tx.run(
        """
        MERGE (w:WorkOrder {order_id: $order_id})
        SET w.type = $type, w.completed_date = $completed_date,
            w.description = $description, w += $extra
        """,
        order_id=order_id, type=wo_type, completed_date=completed_date,
        description=description, extra=extra,
    )


# ---------------------------------------------------------------------------
# Technician
# ---------------------------------------------------------------------------

def create_technician(tx, name: str, role: str = "technician", **extra):
    """Create a Technician node."""
    tx.run(
        """
        MERGE (t:Technician {name: $name})
        SET t.role = $role, t += $extra
        """,
        name=name, role=role, extra=extra,
    )


# ---------------------------------------------------------------------------
# Relationships
# ---------------------------------------------------------------------------

def link_incident_to_equipment(tx, incident_id: str, equipment_name: str):
    """(Incident)-[:INVOLVES]->(Equipment)"""
    tx.run(
        """
        MATCH (i:Incident {incident_id: $incident_id}),
              (e:Equipment {name: $equipment_name})
        MERGE (i)-[:INVOLVES]->(e)
        """,
        incident_id=incident_id, equipment_name=equipment_name,
    )


def link_incident_to_failure_mode(tx, incident_id: str, failure_mode_name: str):
    """(Incident)-[:MATCHES_PATTERN]->(FailureMode)"""
    tx.run(
        """
        MATCH (i:Incident {incident_id: $incident_id}),
              (f:FailureMode {name: $failure_mode_name})
        MERGE (i)-[:MATCHES_PATTERN]->(f)
        """,
        incident_id=incident_id, failure_mode_name=failure_mode_name,
    )


def link_equipment_to_failure_mode(tx, equipment_name: str, failure_mode_name: str):
    """(Equipment)-[:HAS_FAILURE_MODE]->(FailureMode)"""
    tx.run(
        """
        MATCH (e:Equipment {name: $equipment_name}),
              (f:FailureMode {name: $failure_mode_name})
        MERGE (e)-[:HAS_FAILURE_MODE]->(f)
        """,
        equipment_name=equipment_name, failure_mode_name=failure_mode_name,
    )


def link_work_order_to_technician(tx, order_id: str, technician_name: str):
    """(WorkOrder)-[:RESOLVED_BY]->(Technician)"""
    tx.run(
        """
        MATCH (w:WorkOrder {order_id: $order_id}),
              (t:Technician {name: $technician_name})
        MERGE (w)-[:RESOLVED_BY]->(t)
        """,
        order_id=order_id, technician_name=technician_name,
    )


def link_work_order_to_incident(tx, order_id: str, incident_id: str):
    """(WorkOrder)-[:ADDRESSES]->(Incident)"""
    tx.run(
        """
        MATCH (w:WorkOrder {order_id: $order_id}),
              (i:Incident {incident_id: $incident_id})
        MERGE (w)-[:ADDRESSES]->(i)
        """,
        order_id=order_id, incident_id=incident_id,
    )
