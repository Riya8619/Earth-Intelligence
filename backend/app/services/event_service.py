from datetime import datetime, timedelta
from typing import Any, Dict, List

try:
    import requests
except ModuleNotFoundError:
    requests = None
from sqlalchemy.orm import Session

from app.config import settings
from app.models.event import Event, SeverityEnum

DEFAULT_USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"

EVENT_TYPES = {
    "earthquake",
    "storm",
    "cyclone",
    "wildfire",
    "pollution",
    "flood",
    "heatwave",
    "volcanic",
}

SEVERITY_RANK = {"low": 1, "medium": 2, "moderate": 2, "high": 3, "critical": 4}


def _iso(value: datetime | None) -> str:
    return (value or datetime.utcnow()).replace(microsecond=0).isoformat() + "Z"


def _status_for(severity: str, timestamp: datetime | None) -> str:
    age_hours = (datetime.utcnow() - (timestamp or datetime.utcnow())).total_seconds() / 3600
    if severity == "critical" or age_hours <= 18:
        return "active"
    if severity == "high" or age_hours <= 48:
        return "monitoring"
    return "resolved"


def _region_from_place(place: str | None) -> str:
    if not place:
        return "Global monitoring sector"
    return place.split(",")[-1].strip() or place


def _severity_from_magnitude(magnitude: float | None) -> str:
    magnitude = magnitude or 0
    if magnitude >= 7:
        return "critical"
    if magnitude >= 6:
        return "high"
    if magnitude >= 4.5:
        return "medium"
    return "low"


def generate_mock_events(min_count: int = 10) -> List[Dict[str, Any]]:
    now = datetime.utcnow()
    templates = [
        ("earthquake", "M6.1 earthquake monitoring near Honshu", "high", "USGS Synthetic", 38.4, 142.1, "Japan Trench", "Seismic sensors report strong offshore movement with aftershock potential."),
        ("cyclone", "Cyclone formation watch in the Bay of Bengal", "critical", "OpenWeather Synthetic", 15.2, 88.9, "Bay of Bengal", "Warm surface waters and rotating wind bands indicate rapid intensification risk."),
        ("wildfire", "Wildfire growth risk across British Columbia", "high", "NASA FIRMS Synthetic", 53.7, -124.8, "British Columbia, Canada", "Thermal anomaly clusters and dry wind patterns show elevated fire spread potential."),
        ("pollution", "Air quality emergency in Delhi NCR", "critical", "AQICN Synthetic", 28.6, 77.2, "Delhi, India", "Fine particulate concentrations remain above emergency response thresholds."),
        ("flood", "River flood warning along the Danube basin", "high", "OpenWeather Synthetic", 47.5, 19.0, "Central Europe", "Heavy rainfall and upstream runoff increase flood probability across low-lying districts."),
        ("storm", "Severe thunderstorm corridor over the US Midwest", "medium", "OpenWeather Synthetic", 39.1, -94.6, "Central United States", "Convective cells are producing damaging wind and localized hail signatures."),
        ("heatwave", "Urban heat stress alert for Southern Spain", "high", "OpenWeather Synthetic", 37.4, -5.9, "Andalusia, Spain", "Persistent high temperatures and low overnight cooling raise public health risk."),
        ("volcanic", "Volcanic ash advisory near Mount Etna", "medium", "GDACS Synthetic", 37.7, 15.0, "Sicily, Italy", "Ash plume observations require aviation and respiratory exposure monitoring."),
        ("pollution", "Industrial smog alert in the Yangtze River Delta", "high", "AQICN Synthetic", 31.2, 121.5, "Shanghai, China", "Stagnant air and industrial emissions are degrading regional visibility and air quality."),
        ("storm", "Atmospheric river impact watch for Chile", "medium", "OpenWeather Synthetic", -39.8, -73.2, "Los Rios, Chile", "Moisture transport is increasing landslide and flash-flood potential."),
        ("earthquake", "Aftershock sequence watch near the Aleutians", "medium", "USGS Synthetic", 52.1, -174.2, "Aleutian Islands", "A shallow offshore quake sequence continues to generate regional monitoring alerts."),
        ("wildfire", "Mediterranean wildfire preparedness alert", "medium", "Copernicus Synthetic", 39.6, 2.9, "Balearic Islands", "Low humidity and gusting winds support fast-moving surface fire conditions."),
    ]

    events = []
    for index, (event_type, title, severity, source, lat, lon, region, description) in enumerate(templates[:max(min_count, 10)]):
        timestamp = now - timedelta(hours=index * 3 + 1)
        events.append(
            {
                "id": f"ops-{event_type}-{index + 1}",
                "title": title,
                "type": event_type,
                "event_type": event_type,
                "severity": severity,
                "source": source,
                "latitude": lat,
                "longitude": lon,
                "timestamp": _iso(timestamp),
                "occurred_at": _iso(timestamp),
                "description": description,
                "region": region,
                "location": region,
                "location_name": region,
                "status": _status_for(severity, timestamp),
                "risk_score": min(98, 45 + SEVERITY_RANK.get(severity, 2) * 13 + index),
            }
        )
    return events


def parse_timeframe(timeframe: str) -> datetime:
    timeframe = timeframe.lower().strip()
    if timeframe.endswith("h") and timeframe[:-1].isdigit():
        hours = int(timeframe[:-1])
    elif timeframe.endswith("d") and timeframe[:-1].isdigit():
        hours = int(timeframe[:-1]) * 24
    else:
        hours = 24
    return datetime.utcnow() - timedelta(hours=hours)


def get_recent_events(db: Session, timeframe: str = "24h") -> List[Event]:
    cutoff = parse_timeframe(timeframe)
    return (
        db.query(Event)
        .filter(Event.occurred_at >= cutoff)
        .order_by(Event.occurred_at.desc())
        .all()
    )


def summarize_event(event: Event) -> Dict[str, Any]:
    severity = event.severity.value if isinstance(event.severity, SeverityEnum) else str(event.severity or "medium")
    event_type = (event.event_type or "storm").lower()
    if event_type not in EVENT_TYPES:
        event_type = "storm"
    region = event.location_name or getattr(event, "location", None) or "Unknown region"
    return {
        "id": event.id,
        "title": event.title,
        "type": event_type,
        "event_type": event_type,
        "severity": severity,
        "latitude": event.latitude,
        "longitude": event.longitude,
        "timestamp": _iso(event.occurred_at),
        "occurred_at": _iso(event.occurred_at),
        "source": event.source or "Earth IX",
        "description": event.description or "Operational monitoring event generated from platform data.",
        "region": region,
        "location": region,
        "location_name": region,
        "status": _status_for(severity, event.occurred_at),
        "summary": event.description or "Operational monitoring event generated from platform data.",
        "risk_score": min(99, 35 + SEVERITY_RANK.get(severity, 2) * 15),
    }


def normalize_events(events: List[Event]) -> List[Dict[str, Any]]:
    return [summarize_event(event) for event in events]


def fetch_usgs_earthquakes(timeframe: str = "24h") -> List[Dict[str, Any]]:
    if requests is None:
        return []

    url = settings.USGS_API_URL or DEFAULT_USGS_URL
    cutoff = parse_timeframe(timeframe)
    try:
        response = requests.get(
            url,
            params={
                "format": "geojson",
                "starttime": cutoff.strftime("%Y-%m-%dT%H:%M:%S"),
                "minmagnitude": 4.0,
                "orderby": "time",
                "limit": 25,
            },
            timeout=4,
        )
        response.raise_for_status()
        data = response.json()
        events = []
        for feature in data.get("features", []):
            props = feature.get("properties", {})
            coords = (feature.get("geometry") or {}).get("coordinates") or [None, None]
            magnitude = props.get("mag")
            occurred = datetime.utcfromtimestamp(props.get("time", 0) / 1000.0) if props.get("time") else datetime.utcnow()
            severity = _severity_from_magnitude(magnitude)
            place = props.get("place") or "USGS seismic region"
            events.append(
                {
                    "id": f"usgs-{feature.get('id')}",
                    "title": props.get("title") or f"M{magnitude} earthquake near {place}",
                    "type": "earthquake",
                    "event_type": "earthquake",
                    "severity": severity,
                    "source": "USGS",
                    "latitude": coords[1],
                    "longitude": coords[0],
                    "timestamp": _iso(occurred),
                    "occurred_at": _iso(occurred),
                    "description": f"Magnitude {magnitude} seismic event reported by USGS near {place}.",
                    "region": _region_from_place(place),
                    "location": place,
                    "location_name": place,
                    "status": _status_for(severity, occurred),
                    "magnitude": magnitude,
                    "url": props.get("url"),
                    "risk_score": min(99, int((magnitude or 4) * 12)),
                }
            )
        return events
    except Exception:
        return []


def get_operational_events(db: Session, timeframe: str = "24h", min_count: int = 10) -> List[Dict[str, Any]]:
    db_events = normalize_events(get_recent_events(db, timeframe))
    usgs_events = fetch_usgs_earthquakes(timeframe)
    events = db_events + usgs_events

    seen = set()
    unique_events = []
    for event in events:
        key = (event.get("source"), event.get("title"), event.get("timestamp"))
        if key in seen:
            continue
        seen.add(key)
        unique_events.append(event)

    if len(unique_events) < min_count:
        unique_events.extend(generate_mock_events(min_count - len(unique_events)))

    return sorted(
        unique_events,
        key=lambda item: item.get("timestamp") or "",
        reverse=True,
    )[: max(min_count, len(unique_events))]


def gather_environmental_data(db: Session, timeframe: str = "24h") -> Dict[str, Any]:
    events = get_operational_events(db, timeframe, min_count=10)
    earthquakes = []
    weather = []
    aqi = []
    risk_alerts = []
    active_alerts = []

    for summary in events:
        event_type = (summary.get("type") or summary.get("event_type") or "").lower()

        if any(keyword in event_type for keyword in ["earthquake", "seismic", "tremor"]):
            earthquakes.append(summary)
        elif any(keyword in event_type for keyword in ["storm", "hurricane", "cyclone", "weather", "flood", "drought"]):
            weather.append(summary)
        elif any(keyword in event_type for keyword in ["aqi", "air quality", "pollution", "smog", "ozone"]):
            aqi.append(summary)
        elif any(keyword in event_type for keyword in ["alert", "risk", "wildfire", "landslide", "volcano"]):
            risk_alerts.append(summary)

        if summary.get("severity") in ("high", "critical") or summary.get("status") == "active":
            active_alerts.append(summary)

    return {
        "timeframe": timeframe,
        "earthquakes": earthquakes,
        "weather": weather,
        "aqi": aqi,
        "risk_alerts": risk_alerts,
        "active_alerts": active_alerts,
        "events": events,
    }
