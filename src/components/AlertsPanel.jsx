import { motion } from "framer-motion";
import { AlertTriangle, Flame, CloudLightning, Waves, Wind } from "lucide-react";
import SeverityBadge from "./SeverityBadge";

const typeIcons = {
  earthquake: AlertTriangle,
  wildfire: Flame,
  cyclone: CloudLightning,
  flood: Waves,
  pollution: Wind,
  storm: CloudLightning,
  tsunami: Waves,
  volcanic: Flame,
};

export default function AlertsPanel({ events = [] }) {
  const activeAlerts = events
    .filter(e => e.status === "active")
    .sort((a, b) => {
      const order = { critical: 0, high: 1, moderate: 2, low: 3 };
      return (order[a.severity] || 3) - (order[b.severity] || 3);
    })
    .slice(0, 6);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <h2 className="font-orbitron font-bold text-2xl mb-2" style={{ background: 'linear-gradient(135deg, #DC2626, #FB8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            LIVE ALERT SYSTEM
          </h2>
          <p className="text-sm text-muted-foreground font-space">Active environmental threats detected by AI</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeAlerts.map((alert, i) => {
            const Icon = typeIcons[alert.type || alert.event_type] || AlertTriangle;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -3 }}
                className="rounded-2xl p-5 cursor-pointer group transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(217,230,239,0.7)',
                  boxShadow: '0 4px 20px rgba(0,119,182,0.06)',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-xl" style={{ background: alert.severity === 'critical' ? 'rgba(220,38,38,0.08)' : alert.severity === 'high' ? 'rgba(251,140,0,0.08)' : alert.severity === 'moderate' ? 'rgba(245,158,11,0.08)' : 'rgba(0,150,199,0.08)' }}>
                    <Icon className="w-5 h-5" style={{ color: alert.severity === 'critical' ? '#DC2626' : alert.severity === 'high' ? '#FB8C00' : alert.severity === 'moderate' ? '#F59E0B' : '#0096C7' }} />
                  </div>
                  <SeverityBadge severity={alert.severity} />
                </div>
                <h3 className="font-space font-semibold text-sm mb-1 transition-colors group-hover:text-[#0096C7]" style={{ color: '#0F172A' }}>
                  {alert.title}
                </h3>
                <p className="text-xs text-muted-foreground font-space">{alert.location || alert.region || alert.location_name}</p>
                {alert.risk_score && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${alert.risk_score}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ background: alert.risk_score > 75 ? '#DC2626' : alert.risk_score > 50 ? '#FB8C00' : '#0096C7' }}
                      />
                    </div>
                    <span className="text-xs font-orbitron text-muted-foreground">{alert.risk_score}%</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {activeAlerts.length === 0 && null}
      </div>
    </section>
  );
}
