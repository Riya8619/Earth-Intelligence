import json
from app.database import SessionLocal
from app.models.user import User
from app.models.event import Event
from app.models.mission import Mission
from app.models.intelligence import IntelligenceFeed
from datetime import datetime

db = SessionLocal()

with open("data/seed_events.json") as f:
    for e in json.load(f):
        e["occurred_at"] = datetime.fromisoformat(e["occurred_at"].replace("Z", "+00:00"))
        db.add(Event(**e))

with open("data/seed_missions.json") as f:
    for m in json.load(f):
        db.add(Mission(**m))

with open("data/seed_intelligence.json") as f:
    for i in json.load(f):
        db.add(IntelligenceFeed(**i))

db.commit()
db.close()
print("✅ Database seeded successfully.")