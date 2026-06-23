import { motion } from "framer-motion";
import { Globe2, Brain, Shield, Satellite, Eye, Zap } from "lucide-react";

const values = [
  { icon: Globe2, title: "Planetary Awareness", desc: "Real-time monitoring of Earth's environmental systems through advanced sensor networks and satellite data." },
  { icon: Brain, title: "AI Intelligence", desc: "Machine learning models that correlate environmental patterns, predict risks, and generate actionable insights." },
  { icon: Shield, title: "Planetary Protection", desc: "Early warning systems and predictive analysis to protect communities from environmental threats." },
  { icon: Satellite, title: "Orbital Observation", desc: "Network of Earth observation satellites providing continuous global environmental coverage." },
  { icon: Eye, title: "Environmental Reasoning", desc: "Advanced correlation engine that connects environmental factors to predict cascading events." },
  { icon: Zap, title: "Rapid Response", desc: "Real-time alert systems that enable faster emergency response and disaster preparedness." },
];

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative glass-card rounded-3xl overflow-hidden mb-16">
        <img
          src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80"
          alt="Earth from space"
          className="w-full h-80 sm:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 max-w-2xl">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <h1 className="font-orbitron font-black text-4xl sm:text-5xl mb-4">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                About Earth IX
              </span>
            </h1>
            <p className="text-lg font-space text-foreground/80 leading-relaxed">
              Building the world's most advanced AI-powered planetary intelligence system — 
              because understanding Earth is the first step to protecting it.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Mission Statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center mb-20"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs font-orbitron tracking-widest text-primary mb-6">
          OUR MISSION
        </div>
        <h2 className="font-orbitron font-bold text-2xl sm:text-3xl mb-6 text-foreground">
          To create a unified intelligence layer that monitors, understands, and predicts Earth's environmental behavior in real time.
        </h2>
        <p className="text-muted-foreground font-space leading-relaxed">
          Earth Intelligence X combines satellite observation, environmental sensor networks, and advanced AI 
          to build a comprehensive understanding of our planet's health. We believe that environmental intelligence 
          should be accessible, actionable, and beautiful — a living window into the systems that sustain life on Earth.
        </p>
      </motion.div>

      {/* Values Grid */}
      <div className="mb-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-orbitron font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            CORE PRINCIPLES
          </h2>
          <p className="text-sm text-muted-foreground font-space">The pillars that drive our planetary intelligence platform</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card rounded-2xl p-6 glow-border hover:shadow-xl transition-all group"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 w-fit mb-4 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                <v.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-orbitron font-semibold text-sm tracking-wider mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground font-space leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Vision */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="glass-card rounded-3xl p-8 sm:p-12 glow-border text-center mb-16"
      >
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mx-auto mb-6 flex items-center justify-center">
            <Globe2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-orbitron font-bold text-2xl mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            OUR VISION
          </h2>
          <p className="text-muted-foreground font-space leading-relaxed text-lg">
            A world where every community has access to real-time environmental intelligence — 
            where AI helps us understand, predict, and respond to the challenges facing our planet. 
            We're building the operating system for Earth's environmental future.
          </p>
        </div>
      </motion.div>

      {/* Tech Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: "24/7", label: "Monitoring" },
          { value: "195+", label: "Countries" },
          { value: "50+", label: "Satellites" },
          { value: "< 1min", label: "Alert Time" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-6 text-center"
          >
            <p className="font-orbitron font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">{s.value}</p>
            <p className="text-xs font-space text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}