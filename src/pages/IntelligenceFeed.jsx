import { useEffect, useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Brain, Loader2, RefreshCcw, Sparkles, Zap } from "lucide-react";

import api from "@/lib/api";
import { useLiveIntelligence } from "@/hooks/useLiveIntelligence";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_TIMEFRAME = "24h";

function formatTimestamp(timestamp) {
  if (!timestamp) return "Live";
  return new Date(timestamp).toLocaleString();
}

function getEvents(data) {
  if (Array.isArray(data)) return data;
  return data?.events || [];
}

export default function IntelligenceFeed() {
  const [query, setQuery] = useState("");
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [refreshedAt, setRefreshedAt] = useState(null);

  useLiveIntelligence((snapshot) => {
    setRefreshedAt(snapshot.generatedAt);
  });

  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn: async () => (await api.get("/events/")).data,
    refetchInterval: 30000,
  });

  const events = getEvents(eventsData);
  const activeEvents = useMemo(() => events.filter((event) => event.status === "active"), [events]);
  const criticalEvents = useMemo(() => events.filter((event) => event.severity === "critical"), [events]);

  const fetchBriefing = useCallback(async () => {
    console.log("Generate clicked", { query });
    setLoading(true);
    setNotice(null);

    try {
      const res = await api.post("/intelligence/briefing", {
        timeframe: DEFAULT_TIMEFRAME,
        includeEvents: true,
        includeRisks: true,
        query: query || null,
      });

      console.log("API Response:", res);
      if (!res || !res.data || Object.keys(res.data).length === 0) {
        console.error("Intelligence API returned empty response", res);
        throw new Error("Empty intelligence response");
      }

      // Ensure new briefing replaces old
      setBriefing(res.data);
      setRefreshedAt(res.data.generatedAt || new Date().toISOString());
      console.log("Updated Briefing:", res.data);
    } catch (err) {
      console.error("Failed to fetch intelligence briefing from API; building local fallback.", err);
      setNotice("Unable to generate briefing. Please try again.");

      // Build a dynamic fallback briefing from available events
      const generatedAt = new Date().toISOString();
      const eq = events.filter((e) => (e.type || e.event_type || "").toLowerCase().includes("earthquake"));
      const weather = events.filter((e) => ["storm", "cyclone", "weather", "flood", "drought"].some(k => (e.type || e.event_type || "").toLowerCase().includes(k)));
      const aqi = events.filter((e) => [("aqi"), ("pollution"), ("smog")].some(k => (e.type || e.event_type || "").toLowerCase().includes(k)));
      const risk_alerts = events.filter((e) => ["alert", "risk", "wildfire", "landslide", "volcano"].some(k => (e.type || e.event_type || "").toLowerCase().includes(k)));

      const computeEarthHealthScore = (eventsArr, earthquakesArr, aqiArr, weatherArr, alertsArr) => {
        let score = 100;
        const event_count = eventsArr.length;
        const critical_count = eventsArr.filter(e => e.severity === "critical").length;
        const high_count = eventsArr.filter(e => e.severity === "high").length;
        const earthquake_count = earthquakesArr.length;
        const aqi_count = aqiArr.length;
        const weather_count = weatherArr.length;
        const alert_count = alertsArr.length;

        score -= Math.min(30, critical_count * 12);
        score -= Math.min(20, high_count * 6);
        score -= Math.min(15, earthquake_count * 2);
        score -= Math.min(12, aqi_count * 2);
        score -= Math.min(10, weather_count * 1);
        score -= Math.min(10, alert_count * 1);
        score -= Math.min(5, Math.max(0, event_count - 10) * 1);

        return Math.max(5, Math.min(100, score));
      };

      const earthHealthScore = computeEarthHealthScore(events, eq, aqi, weather, risk_alerts);

      const fallback = {
        status: "success",
        generatedAt,
        earthHealthScore,
        earthHealthStatus: earthHealthScore >= 85 ? "Healthy" : earthHealthScore >= 60 ? "Moderate" : earthHealthScore >= 40 ? "Risk" : "Critical",
        trend: (activeEvents.length + criticalEvents.length) >= 8 ? "worsening" : "improving",
        confidence: Math.max(60, Math.min(90, 80 - Math.floor(events.length / 2))),
        summary: `Autonomous Earth intelligence synthesis is active. ${events.length} environmental events are being tracked across seismic, atmospheric, and air quality domains.`,
        observations: [
          `${events.length} environmental events are being tracked in the operational window.`,
          "Mission priorities are being updated from event severity and active alert status.",
          "Risk scoring remains active for wildfire, cyclone, tsunami, pollution, flood, and volcanic scenarios.",
        ],
        risks: (function buildRisks() {
          const out = [];
          if (eq.length) {
            out.push({ title: `Elevated seismic activity (${eq.length} events)`, severity: "high", location: eq[0].region || eq[0].location || "Various", source: eq[0].source || "USGS" });
          }
          if (aqi.length) {
            out.push({ title: `Air quality concerns in ${aqi.length} regions`, severity: "high", location: aqi[0].region || aqi[0].location || "Various", source: aqi[0].source || "AQI" });
          }
          if (weather.length) {
            out.push({ title: `Weather hazards detected (${weather.length})`, severity: "medium", location: weather[0].region || weather[0].location || "Various", source: weather[0].source || "Weather" });
          }
          if (!out.length) {
            out.push({ title: "Global environmental watch", severity: "medium", location: "Global", source: "Earth IX" });
          }
          return out;
        })(),
        events: activeEvents.slice(0, 5),
        recommendations: [
          "Continue elevated monitoring of high-severity regions.",
          "Share situational summaries with emergency operations teams.",
          "Prepare targeted public health guidance for air quality and heat exposure zones.",
        ],
      };

      setBriefing(fallback);
      setRefreshedAt(generatedAt);
      console.log("Updated Briefing (fallback):", fallback);
    } finally {
      setLoading(false);
    }
  }, [query, events, activeEvents, criticalEvents]);

  useEffect(() => {
    fetchBriefing();
    const intervalId = window.setInterval(fetchBriefing, 5 * 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [fetchBriefing]);

  const briefingAvailable = briefing && briefing.summary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-orbitron font-bold text-3xl bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
                INTELLIGENCE FEED
              </h1>
              <p className="text-sm text-muted-foreground font-space">
                AI-powered environmental briefing for global risk, weather, and event intelligence.
              </p>
            </div>
          </div>
          <Button onClick={fetchBriefing} disabled={loading} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Refresh Briefing
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card rounded-2xl p-5 glow-border">
            <h3 className="font-orbitron text-xs tracking-widest text-muted-foreground mb-3">AI QUERY SYSTEM</h3>
            <Textarea
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask about environmental conditions, risk assessments, or planetary health..."
              className="bg-white/50 border-white/30 rounded-xl mb-3 min-h-[100px] font-space text-sm"
            />
            <Button onClick={fetchBriefing} disabled={loading} className="w-full bg-gradient-to-r from-primary to-purple-500 text-white font-orbitron text-xs tracking-wider rounded-xl">
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> ANALYZING GLOBAL ENVIRONMENTAL CONDITIONS...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> GENERATE BRIEFING</>
              )}
            </Button>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-orbitron text-xs tracking-widest text-muted-foreground mb-3">QUICK INSIGHTS</h3>
            {[
              "Global wildfire risk assessment",
              "Seismic activity correlation report",
              "Atmospheric pollution forecast",
              "Climate anomaly summary",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setQuery(item)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-space text-muted-foreground hover:bg-white/50 hover:text-foreground transition-all flex items-center gap-2"
              >
                <Zap className="w-3 h-3 text-primary flex-shrink-0" />
                {item}
              </button>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-orbitron text-xs tracking-widest text-muted-foreground mb-3">SYSTEM STATUS</h3>
            <div className="space-y-3 text-xs font-space">
              <div className="flex justify-between"><span className="text-muted-foreground">Active Events</span><span className="font-orbitron font-bold text-primary">{activeEvents.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Critical Alerts</span><span className="font-orbitron font-bold text-red-500">{criticalEvents.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last Updated</span><span className="font-orbitron font-bold text-secondary">{formatTimestamp(refreshedAt)}</span></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {loading && !briefingAvailable ? (
            <div className="glass-card rounded-2xl p-12 text-center glow-border">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-accent/30 animate-spin" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="font-orbitron text-sm text-muted-foreground tracking-wider">Generating Environmental Briefing...</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 glow-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h3 className="font-orbitron text-xs tracking-widest text-muted-foreground mb-2">AI ENVIRONMENTAL BRIEFING</h3>
                  <p className="text-sm font-space text-foreground/70">
                    Earth Health Score: <span className="font-bold text-primary">{briefing?.earthHealthScore}</span>
                    <span className="ml-2 text-xs uppercase tracking-wider">{briefing?.earthHealthStatus} / {briefing?.trend}</span>
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">Confidence: {briefing?.confidence || 82}% · Generated: {formatTimestamp(briefing?.generatedAt)}</span>
              </div>

              {notice && (
                <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-700">
                  {notice}
                </div>
              )}

              <div className="prose prose-sm max-w-none font-space text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {briefing?.summary}
              </div>

              <div className="grid gap-4 mt-8 md:grid-cols-2">
                <Panel title="KEY RISKS">
                  {(briefing?.risks || []).slice(0, 5).map((risk, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-50/80 p-3">
                      <p className="font-semibold">{risk.title}</p>
                      <p className="text-xs text-muted-foreground">{risk.location || risk.affectedRegions?.[0]} · {risk.severity || risk.riskLevel} · {risk.source}</p>
                    </div>
                  ))}
                </Panel>
                <Panel title="RECOMMENDATIONS">
                  {(briefing?.recommendations || []).map((item, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-50/80 p-3">{item}</div>
                  ))}
                </Panel>
              </div>

              <div className="grid gap-4 mt-4 md:grid-cols-2">
                <Panel title="GLOBAL OBSERVATIONS">
                  {(briefing?.observations || []).map((item, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-50/80 p-3">{item}</div>
                  ))}
                </Panel>
                <Panel title="LATEST EVENTS">
                  {(briefing?.events || events).slice(0, 5).map((event, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-50/80 p-3">
                      <p className="font-semibold">{event.title || event.type}</p>
                      <p className="text-xs text-muted-foreground">{event.location || event.region || event.location_name || "Global"} · {event.severity || "N/A"}</p>
                    </div>
                  ))}
                </Panel>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-white/20">
      <h4 className="font-orbitron text-xs tracking-widest text-muted-foreground mb-3">{title}</h4>
      <div className="space-y-3 text-sm font-space text-foreground/80">{children}</div>
    </div>
  );
}
