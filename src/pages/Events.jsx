import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CloudLightning,
  Filter,
  Flame,
  Mountain,
  Search,
  Waves,
  Wind,
} from "lucide-react";

import api from "@/lib/api";
import { useLiveIntelligence } from "@/hooks/useLiveIntelligence";
import SeverityBadge from "../components/SeverityBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const typeIcons = {
  earthquake: AlertTriangle,
  wildfire: Flame,
  cyclone: CloudLightning,
  flood: Waves,
  pollution: Wind,
  storm: CloudLightning,
  heatwave: Flame,
  volcanic: Mountain,
};

const eventTypes = [
  "earthquake",
  "wildfire",
  "cyclone",
  "flood",
  "pollution",
  "storm",
  "heatwave",
  "volcanic",
];

const severities = ["low", "medium", "high", "critical"];

function getEvents(data) {
  if (Array.isArray(data)) return data;
  return data?.events || [];
}

function getLocation(event) {
  return event.region || event.location_name || event.location || "Global monitoring sector";
}

function EventCard({ event, index }) {
  const eventType = event.type || event.event_type || "storm";
  const Icon = typeIcons[eventType] || AlertTriangle;

  return (
    <motion.div
      key={event.id}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            <span className="text-xs uppercase text-muted-foreground">{eventType}</span>
          </div>
          <SeverityBadge severity={event.severity} />
        </div>

        <h3 className="font-semibold">{event.title}</h3>
        <p className="text-xs text-muted-foreground">{getLocation(event)}</p>

        <p className="text-xs mt-2 text-muted-foreground line-clamp-2">
          {event.description}
        </p>

        <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>{event.status}</span>
          <span>{event.source}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Events() {
  useLiveIntelligence();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await api.get("/events/");
      return res.data;
    },
    retry: 1,
    refetchInterval: 30000,
  });

  const events = getEvents(data);
  const filtered = events.filter((event) => {
    const eventType = event.type || event.event_type;
    const location = getLocation(event).toLowerCase();
    const text = `${event.title || ""} ${location}`.toLowerCase();

    if (search && !text.includes(search.toLowerCase())) return false;
    if (filterType !== "all" && eventType !== filterType) return false;
    if (filterSeverity !== "all" && event.severity !== filterSeverity) return false;
    return true;
  });

  const sections = [
    ["Active Events", filtered.filter((event) => event.status === "active")],
    ["Critical Events", filtered.filter((event) => event.severity === "critical")],
    ["Recent Events", filtered.slice(0, 6)],
    ["Resolved Events", filtered.filter((event) => ["monitoring", "resolved"].includes(event.status))],
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-orbitron font-bold text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ENVIRONMENTAL EVENTS
            </h1>
            <p className="text-sm text-muted-foreground font-space mt-1">
              Global threat monitoring and intelligence tracking
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search events..."
              className="pl-10 bg-white/50 border-white/30 rounded-xl"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px] bg-white/50 border-white/30 rounded-xl">
              <Filter className="w-3.5 h-3.5 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-[160px] bg-white/50 border-white/30 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              {severities.map((severity) => (
                <SelectItem key={severity} value={severity} className="capitalize">
                  {severity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Couldn't load events from the backend. Check your connection and try again — if this
          keeps happening, open the browser console for details.
        </div>
      ) : (
        <div className="grid gap-8">
          {sections.map(([label, items]) => (
            <section key={label}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-orbitron text-sm tracking-widest text-muted-foreground">
                  {label}
                </h2>
                <span className="text-xs font-orbitron text-primary">{items.length}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {items.slice(0, 9).map((event, index) => (
                    <EventCard key={`${label}-${event.id}`} event={event} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
