import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Globe2, Menu, X, Zap } from "lucide-react";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Events", path: "/events" },
  { label: "Missions", path: "/missions" },
  { label: "Intelligence Feed", path: "/intelligence" },
  { label: "About Us", path: "/about" },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'shadow-lg border-b'
          : 'border-b'
      }`}
      style={{
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(244,248,251,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(217,230,239,0.8)',
        boxShadow: scrolled ? '0 4px 24px rgba(0,119,182,0.08)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Globe2 className="w-8 h-8 text-primary transition-transform duration-500 group-hover:rotate-180" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-orbitron font-bold text-lg tracking-wider" style={{ background: 'linear-gradient(135deg, #0077B6, #0096C7, #00B894)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              EARTH IX
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative px-4 py-2 text-sm font-space font-medium transition-colors group"
                style={{ color: location.pathname === link.path ? '#0096C7' : '#475569' }}
              >
                {link.label}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #0096C7, #00B894)' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary/20 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
              </Link>
            ))}
          </div>

          {/* Launch Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/intelligence"
              className="relative overflow-hidden px-5 py-2 rounded-full font-orbitron text-xs font-semibold tracking-wider text-white transition-all duration-300 hover:scale-105 group"
              style={{ background: 'linear-gradient(135deg, #0077B6, #0096C7, #48CAE4)', boxShadow: '0 4px 15px rgba(0,150,199,0.3)' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                LAUNCH SYSTEM
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-secondary via-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg glass-card"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t border-white/20"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-space font-medium transition-all ${
                    location.pathname === link.path
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-white/40"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/intelligence"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-orbitron font-semibold text-center text-white bg-gradient-to-r from-primary to-accent"
              >
                LAUNCH SYSTEM
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}