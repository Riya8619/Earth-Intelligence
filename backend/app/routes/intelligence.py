from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.intelligence import IntelligenceFeed
from app.services.ai_service import generate_briefing, generate_fallback_briefing
from app.services.event_service import gather_environmental_data
from app.services.risk_service import (
    build_recommendations,
    calculate_earth_health_score,
    detect_environmental_risks,
    earth_health_status,
    earth_health_trend,
    summarize_risks,
)

router = APIRouter(prefix="/intelligence", tags=["Intelligence"])

import logging
logger = logging.getLogger(__name__)


class BriefingRequest(BaseModel):
    timeframe: str = Field(default="24h", description="Timeframe for environmental data aggregation")
    includeEvents: bool = Field(default=True, description="Whether to include recent events in the briefing")
    includeRisks: bool = Field(default=True, description="Whether to include active risk summaries")
    query: Optional[str] = Field(default=None, description="Optional user query for the briefing")


class BriefingResponse(BaseModel):
    status: str
    generatedAt: str
    earthHealthScore: int
    earthHealthStatus: str
    trend: str
    confidence: int
    summary: str
    risks: List[Dict[str, Any]]
    events: List[Dict[str, Any]]
    observations: List[str]
    recommendations: List[str]


@router.get("/")
def get_feed(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(IntelligenceFeed).order_by(IntelligenceFeed.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/briefing", response_model=BriefingResponse)
def create_briefing(payload: BriefingRequest, db: Session = Depends(get_db)):
    environment = gather_environmental_data(db, payload.timeframe)

    if not payload.includeEvents:
        environment["events"] = []

    if not payload.includeRisks:
        environment["risk_alerts"] = []

    earth_health_score = calculate_earth_health_score(environment)
    risks = summarize_risks(environment) if payload.includeRisks else []
    recommendations = build_recommendations(environment)
    observations = [
        f"{len(environment.get('events', []))} environmental events are inside the active intelligence window.",
        f"{len(environment.get('active_alerts', []))} alerts require active operational monitoring.",
        f"{len(environment.get('earthquakes', []))} seismic observations and {len(environment.get('weather', []))} weather observations are being tracked.",
    ]

    try:
        briefing = generate_briefing(environment, earth_health_score, payload.query)
    except Exception as exc:
        logger.exception("AI briefing generation failed; using fallback. payload=%s", payload.dict())
        briefing = generate_fallback_briefing(environment, earth_health_score, payload.query)

    # Log if environment datasets are empty to aid future debugging
    if not environment.get("events") and not environment.get("earthquakes") and not environment.get("aqi"):
        logger.warning("Environmental datasets are empty for briefing timeframe=%s", payload.timeframe)

    if not briefing.get("summary"):
        logger.warning("Generated briefing missing summary, replacing with fallback summary")
        briefing["summary"] = generate_fallback_briefing(environment, earth_health_score, payload.query)["summary"]

    briefing_risks = briefing.get("risks") or risks
    if len(briefing_risks) < len(risks):
        briefing_risks = risks

    briefing_events = briefing.get("events") or environment.get("events", [])
    if len(briefing_events) < min(5, len(environment.get("events", []))):
        briefing_events = environment.get("events", [])

    return {
        "status": "success",
        "generatedAt": briefing.get("generatedAt", datetime.utcnow().isoformat() + "Z"),
        "earthHealthScore": earth_health_score,
        "earthHealthStatus": earth_health_status(earth_health_score),
        "trend": earth_health_trend(environment),
        "confidence": 87 if environment.get("events") else 72,
        "summary": briefing.get("summary", "Environmental briefing generated successfully."),
        "risks": briefing_risks,
        "events": briefing_events,
        "observations": briefing.get("observations", observations),
        "recommendations": briefing.get("recommendations", recommendations),
    }


@router.get("/risks")
def get_risks(timeframe: str = "72h", db: Session = Depends(get_db)):
    environment = gather_environmental_data(db, timeframe)
    score = calculate_earth_health_score(environment)
    return {
        "risks": detect_environmental_risks(environment),
        "earthHealthScore": score,
        "earthHealthStatus": earth_health_status(score),
        "trend": earth_health_trend(environment),
        "generatedAt": datetime.utcnow().isoformat() + "Z",
    }
