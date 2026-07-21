"""
Neo4j read/query functions for RAG context retrieval.
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


def get_equipment_history(equipment_name: str) -> dict:
    """
    Fetch all incidents and work orders related to a specific piece of equipment.
    
    Args:
        equipment_name: The name of the equipment (e.g., 'CRAC-3')
        
    Returns:
        Dict containing lists of 'incidents' and 'work_orders'.
    """
    driver = get_driver()
    history = {"incidents": [], "work_orders": []}
    
    with driver.session() as session:
        # Get Incidents linked to the equipment
        incident_query = """
        MATCH (i:Incident)-[:INVOLVES]->(e:Equipment {name: $name})
        OPTIONAL MATCH (i)-[:MATCHES_PATTERN]->(f:FailureMode)
        RETURN i.incident_id AS id, i.date AS date, i.description AS description, 
               i.severity AS severity, i.resolution AS resolution, 
               f.name AS failure_mode
        ORDER BY i.date DESC
        """
        inc_results = session.run(incident_query, name=equipment_name)
        for record in inc_results:
            history["incidents"].append({
                "id": record["id"],
                "date": record["date"],
                "description": record["description"],
                "severity": record["severity"],
                "resolution": record["resolution"],
                "failure_mode": record["failure_mode"]
            })
            
        # Get Work Orders linked to those incidents, or to the equipment's failure modes
        wo_query = """
        MATCH (w:WorkOrder)-[:ADDRESSES]->(i:Incident)-[:INVOLVES]->(e:Equipment {name: $name})
        OPTIONAL MATCH (w)-[:RESOLVED_BY]->(t:Technician)
        RETURN w.order_id AS id, w.wo_type AS type, w.completed_date AS date, 
               w.description AS description, t.name AS technician
        ORDER BY w.completed_date DESC
        """
        wo_results = session.run(wo_query, name=equipment_name)
        for record in wo_results:
            history["work_orders"].append({
                "id": record["id"],
                "type": record["type"],
                "date": record["date"],
                "description": record["description"],
                "technician": record["technician"]
            })
            
    return history


def get_equipment_context(equipment_name: str) -> dict:
    """
    Retrieve the broader semantic context around a piece of equipment for RAG enrichment.
    Includes specifications, known failure modes, and compliance rules.
    
    Args:
        equipment_name: The name of the equipment (e.g., 'CRAC-3')
        
    Returns:
        Dict containing equipment details, failure modes, and compliance rules.
    """
    driver = get_driver()
    context = {
        "equipment": {},
        "failure_modes": [],
        "compliance_rules": []
    }
    
    with driver.session() as session:
        # 1. Get Equipment properties
        eq_query = "MATCH (e:Equipment {name: $name}) RETURN e"
        eq_result = session.run(eq_query, name=equipment_name).single()
        if eq_result:
            # e is a neo4j Node object, extract its properties
            context["equipment"] = dict(eq_result["e"])
            
        # 2. Get known Failure Modes
        fm_query = """
        MATCH (e:Equipment {name: $name})-[:HAS_FAILURE_MODE]->(f:FailureMode)
        RETURN f.name AS name, f.description AS description, 
               f.severity AS severity, f.common_causes AS common_causes
        """
        fm_results = session.run(fm_query, name=equipment_name)
        for record in fm_results:
            context["failure_modes"].append({
                "name": record["name"],
                "description": record["description"],
                "severity": record["severity"],
                "common_causes": record["common_causes"]
            })
            
        # 3. Get Compliance Rules governing this equipment
        # (Assuming rules apply to equipment by type, or via explicit relation)
        cr_query = """
        MATCH (e:Equipment {name: $name})
        MATCH (e)-[:GOVERNED_BY]->(c:ComplianceRule)
        RETURN c.clause_ref AS clause, c.description AS description, 
               c.requirement AS requirement, c.interval_days AS interval
        """
        cr_results = session.run(cr_query, name=equipment_name)
        for record in cr_results:
            context["compliance_rules"].append({
                "clause": record["clause"],
                "description": record["description"],
                "requirement": record["requirement"],
                "interval_days": record["interval"]
            })
            
    return context
