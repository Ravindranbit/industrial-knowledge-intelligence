import os
import time
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from backend/.env
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

output_dir = Path(__file__).resolve().parent.parent.parent / "data" / "synthetic"
output_dir.mkdir(parents=True, exist_ok=True)

PROMPTS = {
    "ticket": """
Generate a highly realistic, brief maintenance ticket for a data center cooling unit (e.g., CRAC, CRAH, or Chiller).
Include the following fields in plain text format (not JSON):
- Ticket ID: [Random ID]
- Date: [Recent Date]
- Equipment ID: [e.g., CRAC-1, CRAC-3, CH-2]
- Reported Symptom: [e.g., Running hot, Short-cycling, High humidity alarm]
- Technician Notes: [Detailed technical notes about what was found, action taken, and parts replaced if any]
- Status: Closed

Make it sound like it was written by a busy facility engineer.
    """,
    "pm_report": """
Generate a realistic Preventive Maintenance (PM) report for a data center cooling unit.
Include:
- Report ID: [Random ID]
- Date: [Recent Date]
- Equipment ID: [e.g., CRAC-1, CRAC-3, CH-2]
- Task: [e.g., Quarterly Coil Cleaning, Annual Filter Replacement, Refrigerant Top-off]
- Findings: [What was observed during the PM]
- Action Taken: [What was done]
- Next Scheduled PM: [Date]
    """,
    "incident": """
Generate a realistic incident/near-miss log for a data center cooling failure.
Include:
- Incident ID: [Random ID]
- Date & Time: [Date and Time]
- Equipment Involved: [e.g., CRAC-3]
- Impact: [e.g., Server rack intake temp spiked to 85F, redundant unit engaged]
- Root Cause: [Technical explanation, e.g., clogged condenser, failed compressor contactor]
- Resolution: [How it was fixed]
- Follow-up Required: [Any further action needed]
    """
}

def generate_doc(doc_type: str, count: int):
    print(f"Generating {count} {doc_type}s...")
    for i in range(count):
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a data center facility manager writing realistic documentation."},
                {"role": "user", "content": PROMPTS[doc_type]}
            ],
            temperature=0.7,
        )
        content = response.choices[0].message.content.strip()
        filename = f"{doc_type}_{i+1}.txt"
        filepath = output_dir / filename
        with open(filepath, "w") as f:
            f.write(content)
        print(f"Saved {filename}")
        time.sleep(2) # rate limit prevention

if __name__ == "__main__":
    generate_doc("ticket", 5)
    generate_doc("pm_report", 3)
    generate_doc("incident", 2)
    print("Done generating synthetic data.")
