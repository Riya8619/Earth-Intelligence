import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useLiveIntelligence } from "@/hooks/useLiveIntelligence";
import HeroSection from "../components/HeroSection";
import AlertsPanel from "../components/AlertsPanel";
import DashboardStats from "../components/DashboardStats";
import AnalyticsCharts from "../components/AnalyticsCharts";

// Same formula DashboardStats uses, so the hero card and the status ring
// below it never show two different Earth Health numbers again.
function computeHealthScore(events) {
  const critical = events.filter((e) => e.severity === "critical").length;
  const high = events.filter((e) => e.severity === "high").length;
  return Math.max(5, 100 - critical * 12 - high * 6 - Math.max(0, events.length - 10));
}

export default function Home() {
  useLiveIntelligence();

  const { data, isError } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await api.get("/events/");
      return res.data;
    },
    retry: 1,
    refetchInterval: 30000,
  });
  const events = data?.events || data || [];

  const stats = useMemo(
    () => ({ healthScore: computeHealthScore(events) }),
    [events]
  );

  return (
    <div>
      {isError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Couldn't reach the Earth IX backend, so live data isn't loading. Check your connection
            and try refreshing — if this keeps happening, open the browser console for details.
          </div>
        </div>
      )}
      <HeroSection events={events} stats={stats} />
      <DashboardStats events={events} />
      <AlertsPanel events={events} />
      <AnalyticsCharts />
    </div>
  );
}
