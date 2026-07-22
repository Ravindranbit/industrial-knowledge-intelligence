import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlalchemy.orm import Session
from app.models.database import SessionLocal, ComplianceRule, init_db

RULES = [
    {
        "clause_ref": "ASHRAE-TC9.9-2021-1.4",
        "description": "Evaporator Coil Cleaning",
        "requirement_text": "Evaporator coils must be inspected and cleaned if necessary every 90 days to prevent airflow restriction and maintain heat transfer efficiency.",
        "applies_to_equipment_type": "CRAC",
        "interval_days": 90
    },
    {
        "clause_ref": "ASHRAE-TC9.9-2021-2.1",
        "description": "Air Filter Replacement",
        "requirement_text": "Air filters (MERV 8 or higher) must be replaced semi-annually or when pressure drop exceeds manufacturer specifications.",
        "applies_to_equipment_type": "CRAC",
        "interval_days": 180
    },
    {
        "clause_ref": "UPTIME-TIER-III-PM-04",
        "description": "Chilled Water Valve Actuator Test",
        "requirement_text": "Chilled water control valves and actuators must be stroked fully open and closed annually to ensure no mechanical binding.",
        "applies_to_equipment_type": "CRAC",
        "interval_days": 365
    }
]

def load_rules():
    print("Initializing database...")
    init_db()
    
    db = SessionLocal()
    try:
        existing = db.query(ComplianceRule).count()
        if existing > 0:
            print(f"Found {existing} rules already in DB. Skipping.")
            return

        for r in RULES:
            rule = ComplianceRule(**r)
            db.add(rule)
        
        db.commit()
        print(f"Successfully loaded {len(RULES)} compliance rules into Postgres.")
    finally:
        db.close()

if __name__ == "__main__":
    load_rules()
