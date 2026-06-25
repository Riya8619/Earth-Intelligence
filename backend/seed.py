import json
from datetime import datetime

from app.database import Base, engine, SessionLocal

# IMPORTANT: Import ALL models before create_all()
from app.models.user import User
from app.models.event import Event
from app.models.mission import Mission
from app.models.intelligence import IntelligenceFeed

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Seed only if empty
    if db.query(Event).count() == 0:

        with open("data/seed_events.json") as f:
            for e in json.load(f):
                e["occurred_at"] = datetime.fromisoformat(
                    e["occurred_at"].replace("Z", "+00:00")
                )
                db.add(Event(**e))

        with open("data/seed_missions.json") as f:
            for m in json.load(f):
                db.add(Mission(**m))

        with open("data/seed_intelligence.json") as f:
            for i in json.load(f):
                db.add(IntelligenceFeed(**i))

        db.commit()
        print("Database seeded successfully")

    else:
        print("Database already contains data")

except Exception as e:
    db.rollback()
    print(f"Seeding failed: {e}")
    raise

finally:
    db.close()