import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useLiveIntelligence } from "@/hooks/useLiveIntelligence";
import HeroSection from "../components/HeroSection";
import AlertsPanel from "../components/AlertsPanel";
import DashboardStats from "../components/DashboardStats";
import AnalyticsCharts from "../components/AnalyticsCharts";

export default function Home() {
  useLiveIntelligence();

  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await api.get("/events/");
      return res.data;
    },
  });
  const events = data?.events || data || [];

  return (
    <div>
      <HeroSection events={events} />
      <DashboardStats events={events} />
      <AlertsPanel events={events} />
      <AnalyticsCharts />
    </div>
  );
}
