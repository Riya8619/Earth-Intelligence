import datetime
from typing import Any, Dict, Optional


def generate_briefing(
    environment: Dict[str, Any],
    earth_health_score: int,
    query: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Main briefing generator.
    Uses fallback briefing only.
    """
    return generate_fallback_briefing(
        environment,
        earth_health_score,
        query
    )


def generate_fallback_briefing(
    environment: Dict[str, Any],
    earth_health_score: int,
    query: Optional[str] = None,
) -> Dict[str, Any]:

    events = environment.get("events", [])
    risk_alerts = environment.get("risk_alerts", [])
    earthquakes = environment.get("earthquakes", [])
    aqi = environment.get("aqi", [])
    weather = environment.get("weather", [])

    summary_parts = [
        f"Current Earth Health Score is {earth_health_score}.",
        "Environmental observations indicate a mixed global picture of risk and resilience.",
    ]

    if query:
        summary_parts.insert(0, f"Query: {query}.")

    if earthquakes:
        summary_parts.append(
            f"Recent seismic activity includes {len(earthquakes)} event(s); the highest-impact zones remain near tectonic boundaries."
        )

    if aqi:
        summary_parts.append(
            f"Air quality reports show {len(aqi)} monitored areas with degraded conditions."
        )

    if weather:
        summary_parts.append(
            f"Weather systems are producing {len(weather)} active event(s) with potential storm or flood risk."
        )

    if risk_alerts:
        summary_parts.append(
            f"There are {len(risk_alerts)} active risk alerts requiring elevated monitoring."
        )

    if not (earthquakes or aqi or weather or risk_alerts):
        summary_parts.append(
            "No major environmental emergencies are reported in the current timeframe."
        )

    def build_risk_items():
        generated = []

        for alert in risk_alerts[:5]:
            generated.append(
                {
                    "title": alert.get("title", "Active environmental risk"),
                    "severity": alert.get("severity", "medium"),
                    "location": alert.get("location"),
                    "source": alert.get("source", "data feed"),
                }
            )

        if not generated and earthquakes:
            top_quake = earthquakes[0]
            generated.append(
                {
                    "title": f"Elevated seismic activity near {top_quake.get('place', 'unknown location')}",
                    "severity": top_quake.get("severity", "medium"),
                    "location": top_quake.get("place"),
                    "source": top_quake.get("source", "USGS"),
                }
            )

        if not generated and aqi:
            generated.append(
                {
                    "title": f"Air quality concern in {aqi[0].get('location', 'affected region')}",
                    "severity": aqi[0].get("severity", "medium"),
                    "location": aqi[0].get("location"),
                    "source": aqi[0].get("source", "AQI"),
                }
            )

        if not generated and weather:
            generated.append(
                {
                    "title": f"Weather hazard detected in {weather[0].get('location', 'affected region')}",
                    "severity": weather[0].get("severity", "medium"),
                    "location": weather[0].get("location"),
                    "source": weather[0].get("source", "Weather"),
                }
            )

        if not generated:
            generated.append(
                {
                    "title": "Global environmental watch remains active",
                    "severity": "medium",
                    "location": "Global",
                    "source": "Earth IX",
                }
            )

        return generated

    risks = build_risk_items()

    recommendations = [
        "Maintain elevated monitoring of active high-severity alerts.",
        "Share situational summaries with response teams and local authorities.",
        "Update public health guidance for regions with degraded air quality or extreme weather.",
    ]

    if aqi:
        recommendations.append(
            "Advise vulnerable populations to reduce outdoor activity in locations with persistent air quality spikes."
        )

    if weather:
        recommendations.append(
            "Confirm storm preparedness and flood response readiness for weather-sensitive zones."
        )

    if earthquakes:
        recommendations.append(
            "Prepare rapid seismic response checks in regions where recent earthquakes have exceeded magnitude 5.0."
        )

    return {
        "summary": " ".join(summary_parts),
        "generatedAt": datetime.datetime.utcnow().isoformat() + "Z",
        "risks": risks,
        "events": events[:5],
        "recommendations": recommendations,
    }