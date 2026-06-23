import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const earthquakeData = [
  { month: "Jan", count: 12 }, { month: "Feb", count: 19 }, { month: "Mar", count: 15 },
  { month: "Apr", count: 22 }, { month: "May", count: 28 }, { month: "Jun", count: 18 },
  { month: "Jul", count: 14 }, { month: "Aug", count: 25 }, { month: "Sep", count: 31 },
  { month: "Oct", count: 20 }, { month: "Nov", count: 16 }, { month: "Dec", count: 23 },
];

const pollutionData = [
  { region: "Asia", aqi: 142 }, { region: "Europe", aqi: 68 }, { region: "Americas", aqi: 55 },
  { region: "Africa", aqi: 89 }, { region: "Oceania", aqi: 32 },
];

const eventDist = [
  { name: "Earthquake", value: 35 }, { name: "Wildfire", value: 22 },
  { name: "Cyclone", value: 18 }, { name: "Flood", value: 15 },
  { name: "Pollution", value: 10 },
];

const COLORS = ["#0096C7", "#00B894", "#43A047", "#F59E0B", "#DC2626"];

const ChartCard = ({ title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    className="rounded-2xl p-6"
    style={{
      background: 'rgba(255,255,255,0.9)',
      border: '1px solid rgba(217,230,239,0.7)',
      boxShadow: '0 8px 32px rgba(0,119,182,0.07)',
    }}
  >
    <h3 className="font-orbitron text-xs tracking-widest mb-4 uppercase" style={{ color: '#64748B' }}>{title}</h3>
    {children}
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-xl px-3 py-2 text-xs font-space">
      <p className="font-semibold">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function AnalyticsCharts() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="font-orbitron font-bold text-2xl mb-2" style={{ background: 'linear-gradient(135deg, #0096C7, #00B894)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            PLANETARY ANALYTICS
          </h2>
          <p className="text-sm text-muted-foreground font-space">Real-time environmental intelligence metrics</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard title="Seismic Activity Trend" delay={0.1}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={earthquakeData}>
                <defs>
                  <linearGradient id="seismicGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0096C7" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0096C7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'Inter' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'Inter' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#0096C7" fill="url(#seismicGrad)" strokeWidth={2.5} name="Events" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Regional Air Quality" delay={0.2}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pollutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF5F9" />
                <XAxis dataKey="region" tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'Inter' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'Inter' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="aqi" name="AQI" radius={[8, 8, 0, 0]}>
                  {pollutionData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Event Distribution" delay={0.3}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={eventDist} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {eventDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {eventDist.map((e, i) => (
                <span key={i} className="flex items-center gap-1 text-xs font-space" style={{ color: '#64748B' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                  {e.name}
                </span>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </section>
  );
}