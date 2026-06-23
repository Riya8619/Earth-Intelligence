from datetime import datetime
from typing import Any, Dict, List

MISSION_DEFINITIONS = [
    ("earthquake", "Earthquake Monitoring", "Track seismic clusters, aftershocks, and coastal tsunami indicators.", "Pacific Rim"),
    ("cyclone", "Cyclone Tracking", "Monitor tropical rotation, sea-surface heat, wind growth, and coastal exposure.", "Indian Ocean and Western Pacific"),
    ("wildfire", "Wildfire Surveillance", "Detect thermal anomalies, fuel dryness, wind spread, and smoke transport.", "Boreal and Mediterranean zones"),
    ("pollution", "Air Quality Intelligence", "Assess hazardous AQI, particulate spikes, and public health exposure.", "Urban industrial corridors"),
    ("heatwave", "Climate Observation", "Analyze temperature anomalies, drought stress, and climate extremes.", "Global climate hotspots"),
    ("storm", "Atmospheric Analysis", "Watch severe storm corridors, atmospheric rivers, and flood-producing systems.", "Global storm belts"),
    ("flood", "Disaster Early Warning", "Fuse flood, landslide, storm surge, and evacuation readiness signals.", "River basins and coastal cities"),
    ("volcanic", "Ocean Temperature Monitoring", "Observe ocean heat, volcanic island sectors, and coupled climate hazards.", "Island arcs and ocean basins"),
]

SEVERITY_SCORE = {"low": 35, "medium": 55, "moderate": 55, "high": 78, "critical": 94}


def _mission_status(events: List[Dict[str, Any]]) -> str:
    if any(event.get("severity") == "critical" for event in events):
        return "Critical"
    if any(event.get("status") == "active" for event in events):
        return "Active"
    if events:
        return "Monitoring"
    return "Monitoring"


def _mission_progress(events: List[Dict[str, Any]], index: int) -> int:
    if not events:
        return 48 + index * 4
    strongest = max(SEVERITY_SCORE.get(event.get("severity", "medium"), 55) for event in events)
    return min(99, strongest + len(events) * 3)


def build_operational_missions(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    now = datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
    missions = []

    for index, (event_type, name, objective, default_region) in enumerate(MISSION_DEFINITIONS):
        linked_events = [
            event
            for event in events
            if (event.get("type") or event.get("event_type")) == event_type
            or (event_type == "cyclone" and (event.get("type") or event.get("event_type")) == "storm")
        ]
        status = _mission_status(linked_events)
        progress = _mission_progress(linked_events, index)
        health = max(8, 100 - len(linked_events) * 7 - sum(SEVERITY_SCORE.get(event.get("severity", "medium"), 55) // 10 for event in linked_events[:3]))
        region = linked_events[0].get("region") if linked_events else default_region

        missions.append(
            {
                "id": f"mission-{event_type}",
                "name": name,
                "title": name,
                "status": status,
                "objective": objective,
                "description": objective,
                "region": region,
                "progress": progress,
                "activeEvents": len([event for event in linked_events if event.get("status") == "active"]),
                "active_events": len([event for event in linked_events if event.get("status") == "active"]),
                "lastUpdate": now,
                "health": health,
                "linkedEvents": linked_events[:4],
            }
        )

    return missions
