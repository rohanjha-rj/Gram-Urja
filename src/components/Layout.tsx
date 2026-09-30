import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Zap, LayoutDashboard, Home, Sun, Leaf,
  Lightbulb, Bot, Menu, X, Activity, LogOut,
  ChevronLeft, ChevronRight, Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  // Mobile overlay toggle
  const [mobileOpen, setMobileOpen] = useState(false);
  // Desktop collapsed state
  const [collapsed, setCollapsed] = useState(false);

  const { role, signOut } = useAuth();
  const { language, setLanguage, t, isHindi } = useLanguage();
  const navigate = useNavigate();

  const navItems = [
    { to: '/overview', icon: <Home className="w-4 h-4" />, label: t('navOverview'), roles: ['official', 'citizen', 'guest'] },
    { to: '/household', icon: <Activity className="w-4 h-4" />, label: t('navMyDashboard'), roles: ['citizen'] },
    { to: '/village', icon: <LayoutDashboard className="w-4 h-4" />, label: t('navVillageDashboard'), roles: ['official', 'guest'] },
    { to: '/solar', icon: <Sun className="w-4 h-4" />, label: t('navSolar'), roles: ['official', 'citizen', 'guest'] },
    { to: '/waste', icon: <Leaf className="w-4 h-4" />, label: t('navWaste'), roles: ['official', 'citizen', 'guest'] },
    { to: '/recommendations', icon: <Lightbulb className="w-4 h-4" />, label: t('navRecommendations'), roles: ['official', 'citizen', 'guest'] },
  ];

  const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    official: { label: t('roleOfficial'), color: 'bg-green-100 text-green-700' },
    citizen: { label: t('roleCitizen'), color: 'bg-blue-100 text-blue-700' },
    guest: { label: t('roleGuest'), color: 'bg-gray-100 text-gray-600' },
  };

  const visibleNav = navItems.filter((item) => item.roles.includes(role));
  const roleInfo = ROLE_LABELS[role] ?? ROLE_LABELS['guest'];

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  return (
    // ── Root: flex row, page bg, full viewport ───────────────────────────────
    <div className="flex h-screen overflow-hidden bg-[#f3f7f4]">

      {/* ── Global ambient particle layer (fixed, z-0) ─────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {[
          { left: '8%',  top: '-2%',  delay: '0s',   dur: '14s', size: 5 },
          { left: '22%', top: '-5%',  delay: '3.2s', dur: '17s', size: 4 },
          { left: '41%', top: '-3%',  delay: '1.5s', dur: '12s', size: 6 },
          { left: '63%', top: '-6%',  delay: '5.1s', dur: '16s', size: 4 },
          { left: '78%', top: '-2%',  delay: '2.7s', dur: '13s', size: 5 },
          { left: '90%', top: '-4%',  delay: '7.3s', dur: '18s', size: 3 },
        ].map((p, i) => (
          <div key={`photon-${i}`} className="gu-ambient-photon absolute rounded-full"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size,
              background: 'radial-gradient(circle,#fbbf24 0%,#f59e0b 100%)',
              animationDuration: p.dur, animationDelay: p.delay,
              boxShadow: `0 0 ${p.size * 2}px ${p.size}px rgba(251,191,36,0.4)` }} />
        ))}
        {[
          { left: '5%',  delay: '0s',  dur: '20s', opacity: 0.18 },
          { left: '35%', delay: '6s',  dur: '24s', opacity: 0.12 },
          { left: '55%', delay: '11s', dur: '19s', opacity: 0.15 },
          { left: '80%', delay: '4s',  dur: '22s', opacity: 0.13 },
        ].map((p, i) => (
          <div key={`leaf-${i}`} className="gu-ambient-leaf absolute text-green-500 select-none"
            style={{ left: p.left, top: '-30px', fontSize: '16px', opacity: p.opacity,
              animationDuration: p.dur, animationDelay: p.delay }}>🍃</div>
        ))}
        {[
          { left: '15%', delay: '0s', dur: '8s',  size: 4 },
          { left: '48%', delay: '3s', dur: '10s', size: 3 },
          { left: '72%', delay: '6s', dur: '9s',  size: 5 },
        ].map((p, i) => (
          <div key={`drop-${i}`} className="gu-ambient-drop absolute rounded-full"
            style={{ left: p.left, bottom: '-10px', width: p.size, height: p.size * 1.3,
              background: 'radial-gradient(ellipse,#38bdf8 0%,#0284c7 100%)',
              animationDuration: p.dur, animationDelay: p.delay, opacity: 0.25 }} />
        ))}
        {[
          { left: '2%',  top: '30%', delay: '0s',   dur: '5s' },
          { right: '3%', top: '60%', delay: '2.5s', dur: '5s' },
          { left: '50%', top: '80%', delay: '1.2s', dur: '6s' },
        ].map((p, i) => (
          <div key={`ring-${i}`} className="gu-ambient-ring absolute rounded-full border border-green-400/20"
            style={{ ...p, width: 60, height: 60, marginLeft: -30, marginTop: -30,
              animationDuration: p.dur, animationDelay: p.delay }} />
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════════════════════════ */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-40 flex flex-col
          transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:flex-shrink-0
          ${collapsed ? 'lg:w-16' : 'lg:w-64'}
          w-64
        `}
        style={{
          background: 'rgba(243,247,244,0.88)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRight: '1px solid rgba(16,185,129,0.12)',
          boxShadow: '4px 0 24px rgba(5,46,22,0.06)',
        }}
      >
        {/* ── Logo + collapse toggle ── */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-4"
          style={{ borderBottom: '1px solid rgba(16,185,129,0.10)' }}>
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-emerald-500/20 bg-emerald-950 flex items-center justify-center">
            <img src="/gramurja_logo.jpg" alt="GramUrja Logo" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 text-base leading-tight truncate">GramUrja</div>
              <div className="text-[11px] text-emerald-600 font-medium truncate">{t('brandTagline')}</div>
            </div>
          )}
          {/* Mobile close */}
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-emerald-100 text-gray-400 hover:text-emerald-700 transition-colors ml-auto flex-shrink-0"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* ── Language Switcher + Role badge ── */}
        {!collapsed && (
          <div className="flex-shrink-0 px-4 py-3 space-y-2"
            style={{ borderBottom: '1px solid rgba(16,185,129,0.10)' }}>
            
            {/* Language toggle pill */}
            <div className="flex items-center justify-between bg-emerald-500/10 p-1 rounded-xl border border-emerald-500/20">
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 text-xs font-semibold py-1 rounded-lg transition-all ${
                  language === 'en' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-800 hover:bg-emerald-500/10'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`flex-1 text-xs font-semibold py-1 rounded-lg transition-all ${
                  language === 'hi' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-800 hover:bg-emerald-500/10'
                }`}
              >
                हिन्दी
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
              <button onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                title={t('logout')}>
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold tracking-wide">
              {t('regionName')}
            </div>
          </div>
        )}

        {/* ── Collapsed: language & logout icons only ── */}
        {collapsed && (
          <div className="flex-shrink-0 flex flex-col items-center gap-2 py-3"
            style={{ borderBottom: '1px solid rgba(16,185,129,0.10)' }}>
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="p-1.5 text-xs font-bold text-emerald-700 rounded-lg hover:bg-emerald-100"
              title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            >
              {language === 'en' ? 'HI' : 'EN'}
            </button>
            <button onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
              title={t('logout')}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Nav items — independent scroll ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                isActive
                  ? `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ` +
                    'bg-emerald-100 text-emerald-800 border-l-4 border-emerald-500 shadow-sm'
                  : `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ` +
                    'text-slate-600 hover:bg-[#E8F2EC] hover:text-emerald-900 border-l-4 border-transparent'
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="flex-1 min-w-0 truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* ── Footer ── */}
        {!collapsed && (
          <div className="flex-shrink-0 px-4 py-3"
            style={{ borderTop: '1px solid rgba(16,185,129,0.10)' }}>
            <div className="text-[11px] text-gray-400 text-center font-medium">
              GramUrja · {isHindi ? 'संवहनीय मंच' : 'Sustainability Platform'}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Main content — takes remaining width, scrolls independently ── */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* Top bar — mobile menu toggle and quick language switch */}
        <header className="flex-shrink-0 z-20 flex items-center justify-between px-4 h-12 lg:hidden"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(16,185,129,0.10)',
            boxShadow: '0 1px 8px rgba(5,46,22,0.05)',
          }}>
          <button onClick={() => setMobileOpen(true)}
            className="text-gray-500 hover:text-gray-700 flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"
            >
              <Globe className="w-3 h-3 text-emerald-600" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>
          </div>
        </header>

        {/* Page content — this scrolls, sidebar stays fixed */}
        <main id="main-scroll" className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* ── Floating Manu AI button (bottom-right, always visible) ── */}
      <button
        onClick={() => navigate('/ai')}
        title={t('chatWithManu')}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-full shadow-xl transition-all duration-200 pl-2 pr-5 py-2 border border-emerald-400/30 group"
        style={{ boxShadow: '0 6px 24px rgba(16,185,129,0.45)' }}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-300/60 shadow-inner shrink-0 bg-emerald-950 flex items-center justify-center group-hover:scale-105 transition-transform">
          <img src="/manu_ai_logo.jpg" alt="Manu AI" className="w-full h-full object-cover" />
        </div>
        <span className="text-sm font-semibold leading-none tracking-wide">{t('aiName')}</span>
      </button>
    </div>
  );
}
