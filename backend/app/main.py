import asyncio
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import SessionLocal
from app.routes.auth import router as auth_router
from app.routes.events import router as events_router
from app.routes.intelligence import router as intelligence_router
from app.routes.missions import router as missions_router
from app.services.event_service import gather_environmental_data, get_operational_events
from app.services.mission_service import build_operational_missions
from app.services.risk_service import (
    calculate_earth_health_score,
    detect_environmental_risks,
    earth_health_status,
    earth_health_trend,
)

app = FastAPI()

origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(events_router)
app.include_router(missions_router)
app.include_router(intelligence_router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Earth IX API is ready."}


def build_live_snapshot():
    db = SessionLocal()
    try:
        events = get_operational_events(db, "72h", min_count=10)
        environment = gather_environmental_data(db, "72h")
        score = calculate_earth_health_score(environment)
        return {
            "type": "earth-intelligence-update",
            "generatedAt": datetime.utcnow().isoformat() + "Z",
            "events": events,
            "missions": build_operational_missions(events),
            "risks": detect_environmental_risks(environment),
            "earthHealthScore": score,
            "earthHealthStatus": earth_health_status(score),
            "trend": earth_health_trend(environment),
        }
    finally:
        db.close()


@app.websocket("/ws/intelligence")
async def intelligence_socket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json(build_live_snapshot())
            await asyncio.sleep(20)
    except WebSocketDisconnect:
        return
