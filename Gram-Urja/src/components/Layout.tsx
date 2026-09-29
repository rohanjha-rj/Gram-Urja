import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Zap, LayoutDashboard, Home, Sun, Droplets, Leaf,
  Lightbulb, Bell, Award, Bot, Menu, X, Activity, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ALL_NAV_ITEMS = [
  { to: '/', icon: <Home className="w-4 h-4" />, label: 'Overview', roles: ['official', 'citizen', 'guest'] },
  { to: '/village', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Village Dashboard', roles: ['official', 'guest'] },
  { to: '/household', icon: <Activity className="w-4 h-4" />, label: 'My Dashboard', roles: ['citizen', 'guest'] },
  { to: '/solar', icon: <Sun className="w-4 h-4" />, label: 'Solar', roles: ['official', 'citizen', 'guest'] },
  { to: '/water', icon: <Droplets className="w-4 h-4" />, label: 'Water', roles: ['official', 'citizen', 'guest'] },
  { to: '/waste', icon: <Leaf className="w-4 h-4" />, label: 'Waste & Energy', roles: ['official', 'citizen', 'guest'] },
  { to: '/recommendations', icon: <Lightbulb className="w-4 h-4" />, label: 'Recommendations', roles: ['official', 'citizen', 'guest'] },
  { to: '/alerts', icon: <Bell className="w-4 h-4" />, label: 'Alerts', badge: '6', roles: ['official', 'guest'] },
  { to: '/score', icon: <Award className="w-4 h-4" />, label: 'Sustainability Score', roles: ['official', 'citizen', 'guest'] },
  { to: '/ai', icon: <Bot className="w-4 h-4" />, label: 'AI Assistant', roles: ['official', 'citizen', 'guest'] },
];

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  official: { label: 'Village Official', color: 'bg-green-100 text-green-700' },
  citizen: { label: 'Household Member', color: 'bg-blue-100 text-blue-700' },
  guest: { label: 'Guest', color: 'bg-gray-100 text-gray-600' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role, setRole } = useAuth();
  const navigate = useNavigate();

  const visibleNav = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));
  const roleInfo = ROLE_LABELS[role] ?? ROLE_LABELS['guest'];

  function handleLogout() {
    setRole('guest');
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative">

      {/* ── Global energy conservation ambient layer ────────────────────────
          Fixed, pointer-events-none particles float across the full viewport.
          Each particle type represents a real conservation resource.
      ──────────────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">

        {/* Solar photons — amber dots drifting diagonally top-right → bottom */}
        {[
          { left: '8%',  top: '-2%',  delay: '0s',   dur: '14s', size: 5 },
          { left: '22%', top: '-5%',  delay: '3.2s', dur: '17s', size: 4 },
          { left: '41%', top: '-3%',  delay: '1.5s', dur: '12s', size: 6 },
          { left: '63%', top: '-6%',  delay: '5.1s', dur: '16s', size: 4 },
          { left: '78%', top: '-2%',  delay: '2.7s', dur: '13s', size: 5 },
          { left: '90%', top: '-4%',  delay: '7.3s', dur: '18s', size: 3 },
        ].map((p, i) => (
          <div key={`photon-${i}`}
            className="gu-ambient-photon absolute rounded-full"
            style={{
              left: p.left, top: p.top,
              width: p.size, height: p.size,
              background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)',
              animationDuration: p.dur,
              animationDelay: p.delay,
              boxShadow: `0 0 ${p.size * 2}px ${p.size}px rgba(251,191,36,0.4)`,
            }}/>
        ))}

        {/* Leaf particles — green, gentle tumbling fall */}
        {[
          { left: '5%',  delay: '0s',   dur: '20s', opacity: 0.18 },
          { left: '35%', delay: '6s',   dur: '24s', opacity: 0.12 },
          { left: '55%', delay: '11s',  dur: '19s', opacity: 0.15 },
          { left: '80%', delay: '4s',   dur: '22s', opacity: 0.13 },
        ].map((p, i) => (
          <div key={`leaf-${i}`}
            className="gu-ambient-leaf absolute text-green-500 select-none"
            style={{
              left: p.left, top: '-30px',
              fontSize: '16px',
              opacity: p.opacity,
              animationDuration: p.dur,
              animationDelay: p.delay,
            }}>🍃</div>
        ))}

        {/* Water droplets — blue, rising from bottom */}
        {[
          { left: '15%', delay: '0s',  dur: '8s',  size: 4 },
          { left: '48%', delay: '3s',  dur: '10s', size: 3 },
          { left: '72%', delay: '6s',  dur: '9s',  size: 5 },
        ].map((p, i) => (
          <div key={`drop-${i}`}
            className="gu-ambient-drop absolute rounded-full"
            style={{
              left: p.left, bottom: '-10px',
              width: p.size, height: p.size * 1.3,
              background: 'radial-gradient(ellipse, #38bdf8 0%, #0284c7 100%)',
              animationDuration: p.dur,
              animationDelay: p.delay,
              opacity: 0.25,
            }}/>
        ))}

        {/* Energy pulse rings — green, emanating from corners */}
        {[
          { left: '2%',  top: '30%', delay: '0s',   dur: '5s' },
          { right: '3%', top: '60%', delay: '2.5s', dur: '5s' },
          { left: '50%', top: '80%', delay: '1.2s', dur: '6s' },
        ].map((p, i) => (
          <div key={`ring-${i}`}
            className="gu-ambient-ring absolute rounded-full border border-green-400/20"
            style={{
              ...p,
              width: 60, height: 60,
              marginLeft: -30, marginTop: -30,
              animationDuration: p.dur,
              animationDelay: p.delay,
            }}/>
        ))}
      </div>

      {/* Sidebar */}
      <aside className={`relative z-10 fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="p-2 bg-green-600 rounded-xl">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg leading-tight">GreenGrid AI</div>
            <div className="text-xs text-gray-400">Sustainability Intelligence</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-gray-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleInfo.color}`}>
              {roleInfo.label}
            </span>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Switch Role">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-green-700 font-medium">Suryapur Sustainability Region</div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-gray-400 text-center">
            GreenGrid AI v0.1 · Demo Mode
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 flex items-center px-4 h-14 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live monitoring active
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 font-medium">
              ⚡ Demo Mode
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
