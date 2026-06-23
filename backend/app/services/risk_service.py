from typing import Any, Dict, List

SEVERITY_WEIGHT = {"low": 2, "medium": 5, "moderate": 5, "high": 10, "critical": 18}


def calculate_earth_health_score(environmental_data: Dict[str, Any]) -> int:
    score = 100
    event_count = len(environmental_data.get("events", []))
    critical_count = sum(1 for event in environmental_data.get("events", []) if event.get("severity") == "critical")
    high_count = sum(1 for event in environmental_data.get("events", []) if event.get("severity") == "high")
    earthquake_count = len(environmental_data.get("earthquakes", []))
    aqi_count = len(environmental_data.get("aqi", []))
    weather_count = len(environmental_data.get("weather", []))
    alert_count = len(environmental_data.get("risk_alerts", []))

    score -= min(30, critical_count * 12)
    score -= min(20, high_count * 6)
    score -= min(15, earthquake_count * 2)
    score -= min(12, aqi_count * 2)
    score -= min(10, weather_count * 1)
    score -= min(10, alert_count * 1)
    score -= min(5, max(0, event_count - 10) * 1)

    return max(5, min(100, score))


def earth_health_status(score: int) -> str:
    if score >= 85:
        return "Healthy"
    if score >= 60:
        return "Moderate"
    if score >= 40:
        return "Risk"
    return "Critical"


def earth_health_trend(environmental_data: Dict[str, Any]) -> str:
    active = len([event for event in environmental_data.get("events", []) if event.get("status") == "active"])
    severe = len([event for event in environmental_data.get("events", []) if event.get("severity") in ("high", "critical")])
    return "worsening" if active + severe >= 8 else "improving"


def _risk(title: str, level: str, region: str, probability: int, actions: List[str], source: str) -> Dict[str, Any]:
    return {
        "title": title,
        "riskLevel": level,
        "severity": level.lower(),
        "affectedRegions": [region],
        "location": region,
        "probability": probability,
        "recommendedActions": actions,
        "source": source,
    }


def detect_environmental_risks(environmental_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    risks: List[Dict[str, Any]] = []
    events = environmental_data.get("events", [])

    for event in events:
        event_type = event.get("type") or event.get("event_type")
        severity = event.get("severity", "medium")
        region = event.get("region") or event.get("location") or "Global monitoring sector"
        probability = min(96, 45 + SEVERITY_WEIGHT.get(severity, 5) * 3)

        if event_type == "wildfire" or event_type == "heatwave":
            risks.append(
                _risk(
                    "Wildfire risk: high temperature and dry fuel conditions",
                    "Critical" if severity == "critical" else "High",
                    region,
                    probability,
                    ["Stage rapid response crews near exposed communities.", "Issue outdoor burning restrictions and air quality guidance."],
                    event.get("source", "Earth IX"),
                )
            )
        elif event_type in ("cyclone", "storm", "flood"):
            risks.append(
                _risk(
                    "Severe weather risk: flooding and wind impact corridor",
                    "Critical" if severity == "critical" else "High",
                    region,
                    probability,
                    ["Review evacuation triggers for coastal and flood-prone zones.", "Pre-position power, water, and medical response resources."],
                    event.get("source", "Earth IX"),
                )
            )
        elif event_type == "earthquake":
            risks.append(
                _risk(
                    "Seismic risk: aftershock and coastal tsunami watch",
                    "Critical" if severity == "critical" else "High",
                    region,
                    probability,
                    ["Inspect critical infrastructure and lifelines.", "Maintain tsunami watch for strong offshore events."],
                    event.get("source", "USGS"),
                )
            )
        elif event_type == "pollution":
            risks.append(
                _risk(
                    "Air quality emergency: hazardous particulate exposure",
                    "Critical" if severity == "critical" else "High",
                    region,
                    probability,
                    ["Activate public health messaging for vulnerable groups.", "Reduce outdoor operations and monitor hospital demand."],
                    event.get("source", "AQICN"),
                )
            )
        elif event_type == "volcanic":
            risks.append(
                _risk(
                    "Volcanic ash risk: aviation and respiratory exposure",
                    "High",
                    region,
                    probability,
                    ["Coordinate aviation reroutes around ash plumes.", "Distribute respiratory protection guidance downwind."],
                    event.get("source", "GDACS"),
                )
            )

    if not risks:
        risks.append(
            _risk(
                "Global watch: environmental volatility remains under active analysis",
                "Medium",
                "Global",
                52,
                ["Continue multi-source monitoring.", "Refresh mission briefings as new observations arrive."],
                "Earth IX",
            )
        )

    unique = []
    seen = set()
    for risk in risks:
        key = (risk["title"], risk["location"])
        if key in seen:
            continue
        seen.add(key)
        unique.append(risk)
    return unique[:8]


def summarize_risks(environmental_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    detected = detect_environmental_risks(environmental_data)
    if detected:
        return detected

    risks = []
    for item in environmental_data.get("risk_alerts", []):
        risks.append(
            {
                "title": item.get("title"),
                "severity": item.get("severity"),
                "location": item.get("location"),
                "source": item.get("source"),
            }
        )

    if not risks and environmental_data.get("earthquakes") and environmental_data.get("earthquakes")[0].get("magnitude"):
        top_quake = environmental_data["earthquakes"][0]
        risks.append(
            {
                "title": f"Elevated seismic activity near {top_quake.get('place')}",
                "severity": top_quake.get("severity", "medium"),
                "location": top_quake.get("place"),
                "source": "USGS",
            }
        )

    return risks


def build_recommendations(environmental_data: Dict[str, Any]) -> List[str]:
    recommendations = [
        "Maintain elevated monitoring of regions with active high-severity alerts.",
        "Coordinate response planning for urban air quality and wildfire exposure zones.",
        "Share situational summaries with emergency operations centers and local authorities.",
    ]

    if environmental_data.get("aqi"):
        recommendations.append(
            "Advise vulnerable populations to reduce outdoor activity in locations with persistent air quality spikes."
        )

    if environmental_data.get("weather"):
        recommendations.append(
            "Review storm trajectories and flood warnings for any location reporting weather anomalies."
        )

    if environmental_data.get("earthquakes"):
        recommendations.append(
            "Prepare rapid seismic response checks in regions where recent earthquakes have exceeded magnitude 5.0."
        )

    return recommendations
