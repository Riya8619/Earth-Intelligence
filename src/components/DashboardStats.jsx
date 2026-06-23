import { motion } from "framer-motion";
import StatsRing from "./StatsRing";

export default function DashboardStats({ events = [] }) {
  const active = events.filter(e => e.status === "active").length;
  const critical = events.filter(e => e.severity === "critical").length;
  const types = [...new Set(events.map(e => e.type || e.event_type))].length;
  const health = Math.max(
    5,
    100 -
      critical * 12 -
      events.filter(e => e.severity === "high").length * 6 -
      Math.max(0, events.length - 10)
  );

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.88)',
            border: '1px solid rgba(217,230,239,0.8)',
            boxShadow: '0 16px 50px rgba(0,119,182,0.09)',
          }}
        >
          <h2 className="font-orbitron font-bold text-lg mb-8 text-center tracking-wider" style={{ background: 'linear-gradient(135deg, #0096C7, #00B894)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            EARTH SYSTEM STATUS
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 justify-items-center">
            <StatsRing value={health} max={100} label="Health Score" color="#00B894" gradient={['#0096C7', '#00B894', '#A3E635']} size={110} />
            <StatsRing value={active} max={30} label="Active Events" color="#0096C7" size={110} />
            <StatsRing value={critical} max={10} label="Critical Alerts" color="#DC2626" size={110} />
            <StatsRing value={types} max={8} label="Event Types" color="#F59E0B" size={110} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
