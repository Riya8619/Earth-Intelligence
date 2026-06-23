import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #F4F8FB 0%, #EEF5F9 45%, #E3F2FD 100%)' }}>
      {/* Atmospheric background layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full animate-atmospheric"
          style={{ background: 'radial-gradient(circle, rgba(72,202,228,0.2) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full animate-atmospheric"
          style={{ animationDelay: '6s', background: 'radial-gradient(circle, rgba(0,150,199,0.14) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-16 w-[480px] h-[480px] rounded-full animate-atmospheric"
          style={{ animationDelay: '12s', background: 'radial-gradient(circle, rgba(0,184,148,0.1) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(144,224,239,0.07) 0%, transparent 65%)' }}
        />
        {/* Subtle geographic grid */}
        <svg className="absolute inset-0 w-full h-full animate-grid" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="geo-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0096C7" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo-grid)" />
        </svg>
      </div>

      <Navbar />

      <main className="relative z-10 pt-16">
        <Outlet />
      </main>

      <footer
        className="relative z-10 mt-24 py-10 border-t"
        style={{
          borderColor: 'rgba(217,230,239,0.8)',
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
              <span
                className="font-orbitron text-xs font-bold tracking-widest"
                style={{ background: 'linear-gradient(135deg, #0077B6, #0096C7, #00B894)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                EARTH INTELLIGENCE X
              </span>
            </div>
            <p className="text-xs font-space" style={{ color: '#64748B' }}>
              © {new Date().getFullYear()} — AI-Powered Planetary Monitoring System
            </p>
            <div className="flex items-center gap-3 text-xs font-space" style={{ color: '#94A3B8' }}>
              <span>Real-time Data</span>
              <span style={{ color: '#D9E6EF' }}>|</span>
              <span>AI Analysis</span>
              <span style={{ color: '#D9E6EF' }}>|</span>
              <span>Global Coverage</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}