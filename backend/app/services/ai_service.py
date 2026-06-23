import datetime
import json
import logging
from typing import Any, Dict, List, Optional

try:
    import requests
except ModuleNotFoundError:
    requests = None
from app.config import settings

OPENAI_URL = "https://api.openai.com/v1/chat/completions"


def _openai_headers() -> Dict[str, str]:
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        return {}
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }


def _build_prompt(environment: Dict[str, Any], earth_health_score: int, query: Optional[str] = None) -> str:
    events_text = json.dumps(environment.get("events", []), indent=2)
    risk_text = json.dumps(environment.get("risk_alerts", []), indent=2)
    weather_text = json.dumps(environment.get("weather", []), indent=2)
    aqi_text = json.dumps(environment.get("aqi", []), indent=2)
    quake_text = json.dumps(environment.get("earthquakes", []), indent=2)

    prompt = (
        "You are Earth Intelligence X, a planetary intelligence assistant. "
        "Analyze the latest environmental data and produce a concise, structured briefing.\n\n"
        f"Earth Health Score: {earth_health_score}\n"
        f"Recent earthquakes:\n{quake_text}\n"
        f"Weather anomalies:\n{weather_text}\n"
        f"Air quality observations:\n{aqi_text}\n"
        f"Risk alerts:\n{risk_text}\n"
        f"Recent events:\n{events_text}\n"
    )

    if query:
        prompt += f"\nUser query: {query}\n"

    prompt += (
        "\nProduce only valid JSON with the keys: summary, risks, events, recommendations, generatedAt. "
        "Use concise but authoritative language. Do not include markdown formatting. "
        "For risks and events, return arrays of objects. "
        "For recommendations, return an array of short, actionable guidance statements."
    )

    return prompt


def _parse_openai_response(response: Dict[str, Any]) -> Dict[str, Any]:
    content = response.get("choices", [])[0].get("message", {}).get("content", "")
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end != -1:
            try:
                return json.loads(content[start : end + 1])
            except json.JSONDecodeError:
                pass
    return {
        "summary": content.strip(),
        "risks": [],
        "events": [],
        "recommendations": [],
    }


def generate_briefing(environment: Dict[str, Any], earth_health_score: int, query: Optional[str] = None) -> Dict[str, Any]:
    logger = logging.getLogger(__name__)

    if requests is None:
        logger.error("requests package is unavailable; cannot call OpenAI")
        raise RuntimeError("requests package is unavailable")

    headers = _openai_headers()
    if not headers.get("Authorization"):
        logger.warning("OpenAI API key is missing; skipping OpenAI call")
        raise ValueError("OpenAI API key is missing")

    prompt = _build_prompt(environment, earth_health_score, query)
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are Earth Intelligence X, a planetary intelligence assistant."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 800,
        "top_p": 1,
        "frequency_penalty": 0.0,
        "presence_penalty": 0.0,
    }

    try:
        response = requests.post(OPENAI_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        return _parse_openai_response(response.json())
    except Exception as exc:
        # Log the full exception so failures are diagnosable
        logger.exception("OpenAI briefing generation failed: %s", exc)
        # Re-raise to allow the caller to fallback as appropriate
        raise


def generate_fallback_briefing(environment: Dict[str, Any], earth_health_score: int, query: Optional[str] = None) -> Dict[str, Any]:
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
        summary_parts.append("No major environmental emergencies are reported in the current timeframe.")

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
