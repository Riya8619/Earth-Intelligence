import { motion } from "framer-motion";

const colorMap = {
  primary: { text: '#0096C7', bg: 'rgba(0,150,199,0.08)', border: 'rgba(0,150,199,0.2)' },
  secondary: { text: '#00B894', bg: 'rgba(0,184,148,0.08)', border: 'rgba(0,184,148,0.2)' },
  destructive: { text: '#DC2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.2)' },
  accent: { text: '#0096C7', bg: 'rgba(72,202,228,0.08)', border: 'rgba(72,202,228,0.2)' },
};

export default function FloatingCard({ icon: Icon, label, value, unit, color = "primary", delay = 0 }) {
  const c = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
      className="animate-float rounded-2xl px-4 py-3 min-w-[130px]"
      style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${c.border}`,
        boxShadow: '0 8px 32px rgba(0,119,182,0.1)',
        animationDelay: `${delay}s`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        {Icon && (
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: c.bg }}>
            <Icon className="w-3.5 h-3.5" style={{ color: c.text }} />
          </div>
        )}
        <span className="text-xs font-space font-medium" style={{ color: '#64748B' }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="font-orbitron font-bold text-xl" style={{ color: c.text }}>{value}</span>
        {unit && <span className="text-xs font-space" style={{ color: '#94A3B8' }}>{unit}</span>}
      </div>
    </motion.div>
  );
}