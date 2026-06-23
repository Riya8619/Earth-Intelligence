import { motion } from "framer-motion";
import { Rocket, Radio, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import EarthGlobe from "./EarthGlobe";
import FloatingCard from "./FloatingCard";

export default function HeroSection({ events = [], stats }) {
  const activeEvents = events.filter(e => e.status === "active");
  const criticalCount = events.filter(e => e.severity === "critical").length;

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(72,202,228,0.08) 0%, rgba(144,224,239,0.05) 50%, transparent 100%)' }} />
      
      {/* Subtle scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 right-0 h-px animate-pulse" style={{ top: '30%', background: 'linear-gradient(90deg, transparent, rgba(0,150,199,0.15), transparent)' }} />
        <div className="absolute left-0 right-0 h-px animate-pulse" style={{ top: '65%', animationDelay: '1s', background: 'linear-gradient(90deg, transparent, rgba(0,184,148,0.1), transparent)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-orbitron tracking-widest mb-6" style={{ background: 'rgba(0,150,199,0.08)', border: '1px solid rgba(0,150,199,0.2)', color: '#0096C7' }}>
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                SYSTEM ONLINE — MONITORING ACTIVE
              </div>

              <h1 className="font-orbitron font-black text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
                <span className="glow-text" style={{ background: 'linear-gradient(135deg, #0077B6, #0096C7, #48CAE4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  AI-Powered
                </span>
                <br />
                <span style={{ color: '#0F172A' }}>
                  Planetary Intelligence
                </span>
                <br />
                <span style={{ background: 'linear-gradient(135deg, #00B894, #43A047)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Layer
                </span>
              </h1>

              <p className="text-lg text-muted-foreground font-space max-w-lg mb-8 leading-relaxed">
                Monitoring Earth in real time through environmental AI reasoning, 
                predictive analysis, and cinematic intelligence visualization.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/intelligence"
                  className="group relative overflow-hidden px-6 py-3 rounded-2xl font-orbitron text-sm font-semibold tracking-wider text-white transition-all duration-300 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #0077B6, #0096C7)', boxShadow: '0 8px 30px rgba(0,119,182,0.3)' }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    LAUNCH SYSTEM
                  </span>
                </Link>
                <Link
                  to="/events"
                  className="px-6 py-3 rounded-2xl font-orbitron text-sm font-semibold tracking-wider transition-all duration-300 hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,150,199,0.25)', color: '#0096C7', boxShadow: '0 4px 15px rgba(0,119,182,0.08)' }}
                >
                  EXPLORE EARTH
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right: Globe + Floating cards */}
          <div className="relative h-[500px] lg:h-[600px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="absolute inset-0"
            >
              <EarthGlobe markers={activeEvents} />
            </motion.div>

            {/* Floating metric cards */}
            <div className="absolute top-4 right-4 z-20">
              <FloatingCard
                icon={Activity}
                label="Active Events"
                value={activeEvents.length}
                color="primary"
                delay={0.8}
              />
            </div>
            <div className="absolute bottom-20 left-0 z-20">
              <FloatingCard
                icon={Radio}
                label="Critical Alerts"
                value={criticalCount}
                color="destructive"
                delay={1}
              />
            </div>
            <div className="absolute top-1/3 left-0 z-20">
              <FloatingCard
                label="Earth Health"
                value={stats?.healthScore || 72}
                unit="/100"
                color="secondary"
                delay={1.2}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}