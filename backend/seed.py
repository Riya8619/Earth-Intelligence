import json
from datetime import datetime

from app.database import Base, engine, SessionLocal

from app.models.user import User
from app.models.event import Event
from app.models.mission import Mission
from app.models.intelligence import IntelligenceFeed

Base.metadata.create_all(bind=engine)

db = SessionLocal()

if db.query(Event).count() == 0:

    with open("data/seed_events.json") as f:
        events = json.load(f)

        for e in events:
            e["occurred_at"] = datetime.fromisoformat(
                e["occurred_at"].replace("Z", "+00:00")
            )
            db.add(Event(**e))

    with open("data/seed_missions.json") as f:
        missions = json.load(f)

        for m in missions:
            db.add(Mission(**m))

    with open("data/seed_intelligence.json") as f:
        intel = json.load(f)

        for i in intel:
            db.add(IntelligenceFeed(**i))

    db.commit()

db.close()

print("Database seeded successfully")