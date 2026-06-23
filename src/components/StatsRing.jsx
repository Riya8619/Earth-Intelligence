import { motion } from "framer-motion";

export default function StatsRing({ value, max = 100, label, size = 100, color = '#0096C7', gradient }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((value || 0) / max) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {gradient && (
            <defs>
              <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                {gradient.map((c, i) => (
                  <stop key={i} offset={`${(i / (gradient.length - 1)) * 100}%`} stopColor={c} />
                ))}
              </linearGradient>
            </defs>
          )}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#EEF5F9"
            strokeWidth="6"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={gradient ? `url(#grad-${label})` : color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 8px ${color}55)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-orbitron font-bold text-xl" style={{ color }}>{value}</span>
        </div>
      </div>
      <span className="text-xs font-space font-medium text-center uppercase tracking-wider" style={{ color: '#64748B', letterSpacing: '0.08em' }}>{label}</span>
    </div>
  );
}