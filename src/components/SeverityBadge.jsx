export default function SeverityBadge({ severity }) {
  const config = {
    critical: { bg: 'rgba(220,38,38,0.1)', color: '#DC2626', border: 'rgba(220,38,38,0.25)', dot: '#DC2626' },
    high: { bg: 'rgba(251,140,0,0.1)', color: '#FB8C00', border: 'rgba(251,140,0,0.25)', dot: '#FB8C00' },
    medium: { bg: 'rgba(245,158,11,0.1)', color: '#B45309', border: 'rgba(245,158,11,0.25)', dot: '#F59E0B' },
    moderate: { bg: 'rgba(245,158,11,0.1)', color: '#B45309', border: 'rgba(245,158,11,0.25)', dot: '#F59E0B' },
    low: { bg: 'rgba(0,150,199,0.08)', color: '#0096C7', border: 'rgba(0,150,199,0.2)', dot: '#0096C7' },
  };
  const c = config[severity] || config.low;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-orbitron font-semibold tracking-wider uppercase"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c.dot }} />
      {severity}
    </span>
  );
}
