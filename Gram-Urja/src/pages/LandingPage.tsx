import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun, Droplets, Leaf, Zap, LayoutDashboard, Activity,
  Lightbulb, Bell, Award, Bot, ArrowRight, TrendingUp,
  Wind, Flame, Users,
} from 'lucide-react';
import { getAllAreaAnalyses, getRegionTotals } from '../services/energyService';
import { ASSUMPTIONS } from '../calculations/engine';

// ─── Derived live-impact metrics from real engine data ───────────────────────
function getLiveImpact() {
  const analyses = getAllAreaAnalyses();
  const totals = getRegionTotals();

  // Solar potential: sum of all areas' monthly solar potential ÷ 30 → daily
  const solarDailyKWh = Math.round(
    analyses.reduce((s, a) => s + a.solarPotential.monthlyGenerationKWh, 0) / 30,
  );
  // Waste collected: all organic waste per day (kg → tons)
  const wasteTonsPerDay = +(
    analyses.reduce((s, a) =>
      s + a.area.cowDungKgPerDay + a.area.foodWasteKgPerDay + a.area.agriWasteKgPerDay, 0
    ) / 1000
  ).toFixed(1);
  // Water saved via rainwater (annual ÷ 365)
  const waterSavedLDay = Math.round(
    analyses.reduce((s, a) => s + a.waterAnalysis.rainwaterPotentialLitresPerYear, 0) / 365,
  );
  // Energy generated from biogas + existing solar
  const biogasDailyKWh = Math.round(
    analyses.reduce((s, a) => s + a.wasteAnalysis.electricityKWhPerDay, 0),
  );
  const existingSolarDailyKWh = Math.round(
    analyses.reduce((s, a) => s + a.area.infrastructure.solar.installedCapacity * ASSUMPTIONS.solarKWhPerKWPerDay, 0),
  );
  const energyGenKWh = biogasDailyKWh + existingSolarDailyKWh;

  return { solarDailyKWh, wasteTonsPerDay, waterSavedLDay, energyGenKWh };
}

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, start = false): number {
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number | null>(null);
  const raf = useRef<number>();

  useEffect(() => {
    if (!start) return;
    startTime.current = null;
    const animate = (now: number) => {
      if (startTime.current === null) startTime.current = now;
      const elapsed = now - startTime.current;
      const pct = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setCurrent(Math.round(target * eased));
      if (pct < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration, start]);

  return current;
}

// ─── Intersection observer hook ───────────────────────────────────────────────
function useInView(threshold = 0.2): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null!);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── Real Photo Village Scene ─────────────────────────────────────────────────
// Crossfading slideshow of real rural India / solar / farm photos from Unsplash
// (free-to-use, served at runtime). Animated overlay badges provide context.

const HERO_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=900&q=80&auto=format&fit=crop',
    label: '☀️ Solar Panels · Clean Energy',
    credit: 'Unsplash',
  },
  {
    url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80&auto=format&fit=crop',
    label: '🌿 Green Fields · Rural India',
    credit: 'Unsplash',
  },
  {
    url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&q=80&auto=format&fit=crop',
    label: '💧 Water Resources · Sustainability',
    credit: 'Unsplash',
  },
  {
    url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=900&q=80&auto=format&fit=crop',
    label: '⚡ Renewable Energy · Villages',
    credit: 'Unsplash',
  },
];

const OVERLAY_BADGES = [
  { pos: 'top-4 left-4',    bg: 'bg-amber-400/90',   text: '☀️ Solar Energy' },
  { pos: 'top-4 right-4',   bg: 'bg-emerald-500/90', text: '🌿 Biogas Recovery' },
  { pos: 'bottom-16 left-4', bg: 'bg-cyan-500/90',   text: '💧 Water Saved' },
  { pos: 'bottom-16 right-4', bg: 'bg-green-600/90', text: '⚡ Clean Power' },
];

function VillageScene() {
  const [active, setActive] = useState(0);

  // Auto-advance every 4 s
  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % HERO_PHOTOS.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none rounded-2xl overflow-hidden shadow-2xl"
      style={{ aspectRatio: '16/10' }}>

      {/* ── Crossfading photo slides ── */}
      {HERO_PHOTOS.map((photo, i) => (
        <img
          key={photo.url}
          src={photo.url}
          alt={photo.label}
          loading={i === 0 ? 'eager' : 'lazy'}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === active ? 1 : 0 }}
        />
      ))}

      {/* ── Dark gradient vignette so badges stay legible ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.28) 0%, transparent 50%, rgba(0,0,0,0.35) 100%)',
        }}/>

      {/* ── Animated energy-glow overlay (pulsing ring in centre) ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-20 h-20 rounded-full border-2 border-amber-400/40 gu-sun-glow"
          style={{ boxShadow: '0 0 40px 10px rgba(251,191,36,0.15)' }}/>
      </div>

      {/* ── Floating info badges ── */}
      {OVERLAY_BADGES.map((b) => (
        <div key={b.text}
          className={`absolute ${b.pos} ${b.bg} backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg gu-hero-badge`}>
          {b.text}
        </div>
      ))}

      {/* ── Current slide label ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
          {HERO_PHOTOS[active].label}
        </div>
        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {HERO_PHOTOS.map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 pointer-events-auto ${
                i === active ? 'bg-white w-5' : 'bg-white/50'
              }`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Impact Metric Card ───────────────────────────────────────────────────────
interface ImpactCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  suffix?: string;
  trendPct: number;
  accentClass: string;
  bgClass: string;
  borderClass: string;
  inView: boolean;
  duration?: number;
  decimals?: number;
}

function ImpactCard({ icon, label, value, unit, trendPct, accentClass, bgClass, borderClass, inView, duration = 1800, decimals = 0 }: ImpactCardProps) {
  const animated = useCountUp(Math.round(value), duration, inView);
  // Simulate a live incrementing value — every 3 s a small random amount is "saved"
  const [liveDelta, setLiveDelta] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setLiveDelta(d => d + Math.floor(Math.random() * 3 + 1)), 3000);
    return () => clearInterval(id);
  }, [inView]);

  const displayVal = decimals > 0
    ? ((animated + liveDelta) / (decimals === 1 ? 10 : 100)).toFixed(1)
    : (animated + liveDelta).toLocaleString();

  return (
    <div className={`gu-stat-card relative rounded-2xl border ${borderClass} ${bgClass} p-6 shadow-sm overflow-hidden gu-kpi-live`}>
      {/* Decorative glow circle */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 ${accentClass}`}/>
      {/* Live dot indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <span className="gu-live-dot"/>
        <span className="text-[10px] text-gray-400 font-medium">LIVE</span>
      </div>
      <div className={`inline-flex p-3 rounded-xl mb-4 ${accentClass} bg-opacity-10`}>
        {icon}
      </div>
      <div className="flex items-end gap-1 mb-1">
        <span className="text-3xl font-extrabold text-gray-900 tabular-nums gu-saving-tick">
          {displayVal}
        </span>
        <span className="text-base font-semibold text-gray-500 mb-1">{unit}</span>
      </div>
      <div className="text-sm font-semibold text-gray-700 mb-2">{label}</div>
      <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
        <TrendingUp className="w-3 h-3"/>
        ↑ {trendPct}% this month
        {liveDelta > 0 && (
          <span className="ml-2 text-green-600 font-bold gu-co2-save">+{liveDelta} now</span>
        )}
      </div>
    </div>
  );
}

// ─── Live conservation ticker strip ──────────────────────────────────────────
function ConservationTicker() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Real numbers from engine — per-second rates
  const solarPerSec  = +(impact.solarDailyKWh  / 86400).toFixed(4);
  const waterPerSec  = +(impact.waterSavedLDay  / 86400).toFixed(2);
  const wastePerSec  = +(impact.wasteTonsPerDay / 86400 * 1000).toFixed(4); // kg
  const energyPerSec = +(impact.energyGenKWh    / 86400).toFixed(4);

  const items = [
    { icon: '☀️', label: 'Solar harvested', val: (solarPerSec  * seconds).toFixed(2), unit: 'kWh', color: 'text-amber-600' },
    { icon: '💧', label: 'Water saved',     val: (waterPerSec  * seconds).toFixed(1), unit: 'L',   color: 'text-cyan-600'  },
    { icon: '🌿', label: 'Waste processed', val: (wastePerSec  * seconds).toFixed(2), unit: 'kg',  color: 'text-emerald-600' },
    { icon: '⚡', label: 'Energy generated',val: (energyPerSec * seconds).toFixed(2), unit: 'kWh', color: 'text-green-600' },
  ];

  return (
    <div className="bg-white/95 border border-green-100 rounded-2xl px-5 py-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="gu-live-dot"/>
        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
          Happening right now · since you opened this page ({seconds}s)
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((it) => (
          <div key={it.label} className="gu-stat-card bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <div className="text-xl mb-0.5">{it.icon}</div>
            <div className={`text-lg font-extrabold tabular-nums ${it.color}`}>
              {it.val} <span className="text-xs font-medium text-gray-400">{it.unit}</span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Animated Conservation Flow SVG ──────────────────────────────────────────
// Shows the actual circular energy conservation loop with animated flow lines
function ConservationFlow() {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-gradient-to-br from-green-950 to-slate-900 p-6 shadow-xl">
      <div className="text-center mb-4">
        <span className="gu-live-dot"/>
        <span className="text-xs font-bold text-green-300 uppercase tracking-widest ml-1">
          Real-time energy conservation loop
        </span>
      </div>
      <svg viewBox="0 0 600 220" className="w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="cf-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
          </radialGradient>
          <filter id="cf-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <marker id="cf-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#4ade80" opacity="0.7"/>
          </marker>
        </defs>

        {/* ── Sun (top centre) ── */}
        <circle cx="300" cy="32" r="28" fill="url(#cf-sun)" className="gu-sun-glow"/>
        <circle cx="300" cy="32" r="18" fill="#fef08a"/>
        <circle cx="300" cy="32" r="11" fill="#fbbf24" className="gu-sun-pulse"/>
        <g className="sun-spin" style={{ transformOrigin: '300px 32px' }}>
          {[0,45,90,135,180,225,270,315].map((a,i)=>(
            <line key={i}
              x1={300+20*Math.cos(a*Math.PI/180)} y1={32+20*Math.sin(a*Math.PI/180)}
              x2={300+28*Math.cos(a*Math.PI/180)} y2={32+28*Math.sin(a*Math.PI/180)}
              stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
          ))}
        </g>
        <text x="300" y="72" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="700">SOLAR</text>
        <text x="300" y="83" textAnchor="middle" fill="#fbbf24" fontSize="7.5" opacity="0.7">
          {impact.solarDailyKWh} kWh/day
        </text>

        {/* ── Solar → House (electricity) ── */}
        <line x1="270" y1="55" x2="120" y2="115"
          stroke="#fbbf24" strokeWidth="2" strokeDasharray="10 6"
          className="gu-flow-line" filter="url(#cf-glow)" opacity="0.8"/>
        <text x="170" y="83" fill="#fbbf24" fontSize="8" opacity="0.6" textAnchor="middle">electricity</text>

        {/* ── House (left) ── */}
        <rect x="60" y="112" width="60" height="45" fill="#1e293b" stroke="#334155" rx="4"/>
        <polygon points="55,112 125,112 90,86" fill="#16a34a"/>
        <rect x="70" y="126" width="12" height="10" fill="#bfdbfe" rx="1" opacity="0.7"/>
        <rect x="98" y="126" width="12" height="10" fill="#bfdbfe" rx="1" opacity="0.7"/>
        <rect x="78" y="137" width="14" height="18" fill="#93c5fd" rx="1" opacity="0.7"/>
        {/* solar panels on roof */}
        <rect x="70" y="93" width="12" height="8" fill="#1d4ed8" rx="1" opacity="0.9"/>
        <rect x="84" y="93" width="12" height="8" fill="#1d4ed8" rx="1" className="gu-solar-shimmer"/>
        <rect x="98" y="93" width="12" height="8" fill="#1d4ed8" rx="1" opacity="0.9"/>
        <text x="90" y="168" textAnchor="middle" fill="#94a3b8" fontSize="8">HOUSEHOLD</text>

        {/* ── Waste pile (bottom left) ── */}
        <ellipse cx="90" cy="195" rx="36" ry="14" fill="#065f46" stroke="#059669" strokeWidth="1.5"/>
        <text x="90" y="199" textAnchor="middle" fill="#6ee7b7" fontSize="8" fontWeight="700">♻ WASTE</text>
        <text x="90" y="210" textAnchor="middle" fill="#6ee7b7" fontSize="7" opacity="0.7">
          {impact.wasteTonsPerDay}t/day
        </text>
        {/* Biogas bubbles */}
        <circle cx="90" cy="184" r="3" fill="#86efac" className="gu-biogas-rise" opacity="0.6"/>
        <circle cx="100" cy="180" r="2" fill="#a7f3d0" className="gu-biogas-rise gu-biogas-rise-2" opacity="0.5"/>
        <circle cx="80" cy="177" r="2.5" fill="#86efac" className="gu-biogas-rise gu-biogas-rise-3" opacity="0.4"/>

        {/* ── Waste → Biogas plant ── */}
        <line x1="126" y1="192" x2="210" y2="185"
          stroke="#10b981" strokeWidth="2" strokeDasharray="8 5"
          className="gu-flow-line" opacity="0.7" markerEnd="url(#cf-arrow)"/>

        {/* ── Biogas plant (centre bottom) ── */}
        <ellipse cx="265" cy="192" rx="32" ry="20" fill="#064e3b" stroke="#059669" strokeWidth="1.5"/>
        <rect x="235" y="188" width="55" height="22" fill="#065f46" stroke="#059669" rx="3"/>
        <rect x="267" y="168" width="5" height="20" fill="#6b7280" rx="2"/>
        <ellipse cx="269" cy="167" rx="7" ry="4" fill="#4b5563"/>
        <text x="262" y="200" textAnchor="middle" fill="#6ee7b7" fontSize="8" fontWeight="700">BIOGAS</text>
        <text x="262" y="211" textAnchor="middle" fill="#6ee7b7" fontSize="7" opacity="0.7">
          {impact.energyGenKWh} kWh/day
        </text>

        {/* ── Biogas → Generator ── */}
        <line x1="297" y1="185" x2="370" y2="165"
          stroke="#f97316" strokeWidth="2" strokeDasharray="8 5"
          className="gu-flow-line" opacity="0.7" markerEnd="url(#cf-arrow)"/>
        <text x="340" y="168" fill="#fb923c" fontSize="7.5" opacity="0.7">power</text>

        {/* ── Generator / inverter (right) ── */}
        <rect x="370" y="140" width="58" height="40" fill="#1e293b" stroke="#334155" rx="5"/>
        <circle cx="399" cy="160" r="10" fill="#16a34a" className="gu-sun-glow" opacity="0.6"/>
        <text x="399" y="164" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700">⚡</text>
        <text x="399" y="192" textAnchor="middle" fill="#94a3b8" fontSize="8">GENERATOR</text>

        {/* ── Generator → Grid ── */}
        <line x1="430" y1="150" x2="510" y2="115"
          stroke="#4ade80" strokeWidth="2" strokeDasharray="8 5"
          className="gu-flow-line" opacity="0.7" markerEnd="url(#cf-arrow)"/>

        {/* ── Water tower (right) ── */}
        <rect x="490" y="88" width="30" height="50" fill="#0c4a6e" stroke="#0284c7" strokeWidth="1.5" rx="3"/>
        <ellipse cx="505" cy="88" rx="18" ry="8" fill="#0ea5e9" stroke="#38bdf8" strokeWidth="1.5"/>
        <rect x="495" y="90" width="20" height="25" fill="#0284c7" opacity="0.6" rx="1"/>
        {/* water drip */}
        <path d="M505 138 Q505 145 501 150 Q505 155 509 150 Q505 145 505 138"
          fill="#38bdf8" opacity="0.7" className="gu-drip"/>
        <text x="505" y="150" textAnchor="middle" fill="#38bdf8" fontSize="8">WATER</text>
        <text x="505" y="162" textAnchor="middle" fill="#38bdf8" fontSize="7" opacity="0.7">
          {Math.round(impact.waterSavedLDay/1000)}kL/day
        </text>

        {/* ── Water → Field ── */}
        <line x1="487" y1="155" x2="400" y2="195"
          stroke="#38bdf8" strokeWidth="2" strokeDasharray="8 5"
          className="gu-flow-line" opacity="0.6" markerEnd="url(#cf-arrow)"/>
        <text x="447" y="178" fill="#38bdf8" fontSize="7.5" opacity="0.6">irrigation</text>

        {/* ── Agricultural field (far right bottom) ── */}
        <rect x="390" y="196" width="80" height="22" fill="#14532d" stroke="#16a34a" strokeWidth="1" rx="3"/>
        {[0,1,2,3,4,5].map(j=>(
          <g key={j}>
            <line x1={398+j*12} y1="196" x2={398+j*12} y2="218" stroke="#4ade80" strokeWidth="1" opacity="0.4"/>
            <ellipse cx={398+j*12} cy="202" rx="4" ry="2" fill="#22c55e" opacity="0.5"/>
          </g>
        ))}
        <text x="430" y="213" textAnchor="middle" fill="#4ade80" fontSize="7.5">🌾 CROPS</text>

        {/* ── CO₂ saved label (top right) ── */}
        <rect x="490" y="20" width="95" height="38" fill="#052e16" stroke="#166534" rx="6"/>
        <text x="537" y="35" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="700">CO₂ SAVED</text>
        <text x="537" y="50" textAnchor="middle" fill="#86efac" fontSize="8" className="gu-co2-save">
          ↓ {(impact.solarDailyKWh * 0.82 / 1000).toFixed(2)} t/day
        </text>

        {/* ── Arrow: CO₂ reduced (curved upward) ── */}
        <path d="M 480 35 Q 450 20 420 35" stroke="#4ade80" strokeWidth="1.5"
          strokeDasharray="5 4" fill="none" className="gu-flow-line" opacity="0.5"/>
      </svg>
    </div>
  );
}

// ─── Feature cards (existing pages) ─────────────────────────────────────────
const featureCards = [
  {
    icon: <LayoutDashboard className="w-5 h-5"/>,
    color: 'bg-green-50 text-green-700 border-green-100',
    title: 'Village Dashboard',
    description: 'Multi-area command centre with priority index, energy breakdowns and insights across all 6 areas.',
    to: '/village',
    tag: 'Official',
    tagColor: 'bg-green-100 text-green-700',
  },
  {
    icon: <Activity className="w-5 h-5"/>,
    color: 'bg-blue-50 text-blue-700 border-blue-100',
    title: 'Household Dashboard',
    description: 'Appliance-level energy analysis with cost breakdown, timer tracking and sustainability score.',
    to: '/household',
    tag: 'Citizen',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    icon: <Sun className="w-5 h-5"/>,
    color: 'bg-amber-50 text-amber-700 border-amber-100',
    title: 'Solar Potential',
    description: 'Interactive panel simulator with before/after analysis. Visualise roof + land solar coverage.',
    to: '/solar',
    tag: 'Energy',
    tagColor: 'bg-amber-100 text-amber-700',
  },
  {
    icon: <Droplets className="w-5 h-5"/>,
    color: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    title: 'Water Management',
    description: 'Demand calculator, rainwater harvesting potential, and water-energy pump nexus.',
    to: '/water',
    tag: 'Water',
    tagColor: 'bg-cyan-100 text-cyan-700',
  },
  {
    icon: <Leaf className="w-5 h-5"/>,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    title: 'Waste & Biogas',
    description: 'Biogas recovery from organic waste. Community vs household scale energy calculations.',
    to: '/waste',
    tag: 'Waste',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: <Lightbulb className="w-5 h-5"/>,
    color: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    title: 'Recommendations',
    description: 'Data-driven action plans with investment, payback, CO₂ impact and priority ranking.',
    to: '/recommendations',
    tag: 'Insights',
    tagColor: 'bg-yellow-100 text-yellow-700',
  },
  {
    icon: <Bell className="w-5 h-5"/>,
    color: 'bg-red-50 text-red-700 border-red-100',
    title: 'Alerts Centre',
    description: 'Anomaly detection for consumption spikes, equipment faults and missed opportunities.',
    to: '/alerts',
    tag: 'Alerts',
    tagColor: 'bg-red-100 text-red-700',
  },
  {
    icon: <Award className="w-5 h-5"/>,
    color: 'bg-purple-50 text-purple-700 border-purple-100',
    title: 'Sustainability Score',
    description: '0–100 score with category breakdown, weighted formulas, radar chart and 6-month trend.',
    to: '/score',
    tag: 'Score',
    tagColor: 'bg-purple-100 text-purple-700',
  },
  {
    icon: <Bot className="w-5 h-5"/>,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    title: 'AI Assistant',
    description: 'Ask questions in English or Hindi. Smart navigation and calculation retrieval.',
    to: '/ai',
    tag: 'AI',
    tagColor: 'bg-indigo-100 text-indigo-700',
  },
];

// ─── How It Works step ────────────────────────────────────────────────────────
const workflowSteps = [
  { icon: <Sun className="w-6 h-6"/>, label: 'Solar Energy', sub: 'Rooftop & ground panels', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { icon: <Leaf className="w-6 h-6"/>, label: 'Organic Waste', sub: 'Dung, agri & food waste', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { icon: <Droplets className="w-6 h-6"/>, label: 'Water Resources', sub: 'Rainwater & demand mgmt', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { icon: <Flame className="w-6 h-6"/>, label: 'Renewable Energy', sub: 'Biogas + solar generation', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { icon: <Users className="w-6 h-6"/>, label: 'Community Benefit', sub: 'Cleaner, stronger villages', color: 'bg-green-100 text-green-700 border-green-200' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
const impact = getLiveImpact();

export default function LandingPage() {
  const [impactRef, impactInView] = useInView(0.15);
  const [workflowRef, workflowInView] = useInView(0.1);

  const impactCards = [
    {
      icon: <Sun className="w-6 h-6 text-amber-600"/>,
      label: 'Solar Potential',
      value: impact.solarDailyKWh,
      unit: 'kWh/day',
      trendPct: 12,
      accentClass: 'bg-amber-400',
      bgClass: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      borderClass: 'border-amber-200',
    },
    {
      icon: <Leaf className="w-6 h-6 text-emerald-600"/>,
      label: 'Waste Collected',
      value: Math.round(impact.wasteTonsPerDay * 10),
      unit: 'tons/day',
      trendPct: 18,
      accentClass: 'bg-emerald-400',
      bgClass: 'bg-gradient-to-br from-emerald-50 to-green-50',
      borderClass: 'border-emerald-200',
      decimals: 1,
    },
    {
      icon: <Droplets className="w-6 h-6 text-cyan-600"/>,
      label: 'Water Saved',
      value: impact.waterSavedLDay,
      unit: 'L/day',
      trendPct: 22,
      accentClass: 'bg-cyan-400',
      bgClass: 'bg-gradient-to-br from-cyan-50 to-sky-50',
      borderClass: 'border-cyan-200',
    },
    {
      icon: <Zap className="w-6 h-6 text-green-600"/>,
      label: 'Energy Generated',
      value: impact.energyGenKWh,
      unit: 'kWh/day',
      trendPct: 16,
      accentClass: 'bg-green-400',
      bgClass: 'bg-gradient-to-br from-green-50 to-teal-50',
      borderClass: 'border-green-200',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#f0fdf4 0%,#f7fdf9 100%)' }}>

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #052e16 0%, #14532d 45%, #1a5c38 75%, #0f3d28 100%)',
        }}
      >
        {/* Subtle grain texture overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'300\' height=\'300\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundSize: '200px' }}/>

        {/* Radial light from top-right */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 20%, rgba(250,204,21,0.12) 0%, transparent 65%)' }}/>

        {/* Leaf particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {[
            { x: '8%', delay: '0s', size: 10 }, { x: '18%', delay: '2.3s', size: 8 },
            { x: '75%', delay: '1.1s', size: 12 }, { x: '88%', delay: '3.5s', size: 9 },
            { x: '55%', delay: '0.7s', size: 7 }, { x: '35%', delay: '4.1s', size: 11 },
          ].map((p, i) => (
            <div
              key={i}
              className="absolute gu-leaf-fall"
              style={{ left: p.x, top: '-20px', animationDelay: p.delay, fontSize: p.size + 'px' }}
            >🌿</div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: copy */}
            <div className="gu-hero-text">
              <div className="inline-flex items-center gap-2 border border-green-400/30 bg-green-400/10 rounded-full px-4 py-1.5 text-xs font-semibold text-green-300 mb-6 uppercase tracking-widest">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                Live · Suryapur Sustainability Region
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.12] text-white mb-5">
                Powering Villages<br/>
                with{' '}
                <span className="relative">
                  <span className="text-amber-300">Waste</span>
                  <span className="text-green-300">, Water</span>
                </span>{' '}
                &amp; <span className="text-yellow-300">Sun</span>
              </h1>

              <p className="text-green-100/80 text-lg leading-relaxed mb-8 max-w-xl">
                Gram Urja transforms local village resources into clean energy,
                efficient water systems and measurable community impact — one
                village at a time.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 bg-green-400 hover:bg-green-300 text-green-950 font-bold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-green-900/40 hover:shadow-green-900/60 hover:-translate-y-0.5"
                >
                  <Zap className="w-4 h-4"/>
                  Get Started — Choose Your Role
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1"/>
                </Link>
              </div>

              {/* Trust chips */}
              <div className="flex flex-wrap gap-3 mt-8">
                {[
                  { icon: '☀️', text: '6 villages monitored' },
                  { icon: '♻️', text: 'Biogas + solar recovery' },
                  { icon: '💧', text: 'Rainwater optimised' },
                  { icon: '📊', text: '100% formula transparency' },
                ].map((chip) => (
                  <div key={chip.text}
                    className="flex items-center gap-1.5 bg-white/8 border border-white/12 rounded-full px-3 py-1.5 text-xs text-green-200 font-medium">
                    <span>{chip.icon}</span>{chip.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: village scene */}
            <div className="gu-hero-visual lg:pl-4">
              <VillageScene/>
              {/* floating caption */}
              <div className="flex justify-center mt-4 gap-6 flex-wrap">
                {[
                  { dot: 'bg-amber-400', label: 'Solar Energy' },
                  { dot: 'bg-emerald-400', label: 'Biogas' },
                  { dot: 'bg-cyan-400', label: 'Water' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs text-green-300/80 font-medium">
                    <span className={`w-2.5 h-2.5 rounded-full ${l.dot}`}/>
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,70 1080,10 1440,40 L1440,60 L0,60 Z" fill="#f0fdf4"/>
          </svg>
        </div>
      </section>

      {/* Conservation Ticker */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-2">
        <ConservationTicker />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          LIVE IMPACT METRICS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="impact" className="max-w-7xl mx-auto px-6 py-14" ref={impactRef}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
            Live Village Impact
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Real Numbers. Real Change.
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Aggregated daily impact across all 6 areas of Suryapur region — calculated from live data using transparent formulas.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {impactCards.map((card, i) => (
            <ImpactCard key={card.label} {...card} inView={impactInView} duration={1400 + i * 150}/>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW GRAM URJA WORKS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-gray-100 py-14" ref={workflowRef}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
              <Wind className="w-3.5 h-3.5"/>
              Circular Sustainability Model
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">How Gram Urja Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Village resources flow through a closed-loop system — each input becomes an output that feeds the next.
            </p>
          </div>

          {/* Animated conservation flow diagram */}
          <ConservationFlow />

          {/* Flow steps */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-0 mt-10">
            {workflowSteps.map((step, i) => (
              <React.Fragment key={step.label}>
                <div
                  className={`flex flex-col items-center text-center p-5 rounded-2xl border ${step.color} w-36 shadow-sm
                    transition-all duration-500
                    ${workflowInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
                  `}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className={`p-3 rounded-xl border mb-3 ${step.color}`}>
                    {step.icon}
                  </div>
                  <div className="text-sm font-bold leading-tight mb-1">{step.label}</div>
                  <div className="text-xs opacity-70 leading-snug">{step.sub}</div>
                </div>
                {i < workflowSteps.length - 1 && (
                  <div className="flex sm:flex-col items-center my-2 sm:my-0 sm:mx-1">
                    <div className="w-8 h-0.5 sm:w-0.5 sm:h-6 bg-gray-200"/>
                    <div className={`gu-flow-arrow transition-all duration-500 ${workflowInView ? 'opacity-100' : 'opacity-0'}`}
                      style={{ transitionDelay: `${i * 120 + 60}ms` }}>
                      <ArrowRight className="w-5 h-5 text-gray-400 sm:rotate-90 rotate-0"/>
                    </div>
                    <div className="w-8 h-0.5 sm:w-0.5 sm:h-6 bg-gray-200"/>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FEATURE CARDS — All Sections
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Complete Sustainability Intelligence</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Every module is powered by transparent calculations, live data badges and actionable recommendations — built for panchayats, local officials and households.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-green-300 transition-all duration-250 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`inline-flex p-3 rounded-xl border ${card.color}`}>
                  {card.icon}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${card.tagColor}`}>
                  {card.tag}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">{card.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight className="w-3.5 h-3.5"/>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          MISSION / STORY
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-16"
        style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 60%, #0d4a23 100%)' }}>

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="gu-dots" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="1.5" fill="#16a34a"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gu-dots)"/>
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: mission text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-green-400/15 border border-green-400/25 text-green-300 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
                🌱 Our Mission
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-snug mb-5">
                Small steps create{' '}
                <span className="text-green-300">big change</span>{' '}
                for our villages.
              </h2>
              <p className="text-green-100/80 text-base leading-relaxed mb-6">
                Every Indian village already possesses the three ingredients for sustainable energy —
                <strong className="text-amber-300"> sunlight</strong>,{' '}
                <strong className="text-emerald-300"> organic waste</strong>, and{' '}
                <strong className="text-cyan-300"> water</strong>.
                Gram Urja turns this untapped potential into measurable environmental and community benefit.
              </p>
              <p className="text-green-100/70 text-sm leading-relaxed mb-8">
                Using transparent calculations grounded in CEA, MNRE and Jal Jeevan Mission data,
                we help panchayats and households understand exactly where they stand —
                and what action will create the most impact.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { n: '6', label: 'Areas tracked' },
                  { n: '100%', label: 'Formula transparency' },
                  { n: '3', label: 'Resource types' },
                  { n: '₹0', label: 'To get started' },
                ].map((s) => (
                  <div key={s.label}
                    className="bg-white/8 border border-white/12 rounded-xl px-5 py-3 text-center">
                    <div className="text-2xl font-extrabold text-white">{s.n}</div>
                    <div className="text-xs text-green-300 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: mini village stat cards */}
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: <Sun className="w-5 h-5 text-amber-400"/>,
                  title: 'Solar — Untapped Potential',
                  desc: 'Most village rooftops and open land have enough area to offset 30–60% of their electricity demand. Gram Urja shows you exactly how many panels and at what cost.',
                  accent: 'border-amber-400/30',
                },
                {
                  icon: <Leaf className="w-5 h-5 text-emerald-400"/>,
                  title: 'Waste — From Problem to Power',
                  desc: 'Cow dung, food and agricultural residue generate biogas for cooking and electricity. Every kilogram of waste treated is a kilogram of CO₂ prevented.',
                  accent: 'border-emerald-400/30',
                },
                {
                  icon: <Droplets className="w-5 h-5 text-cyan-400"/>,
                  title: 'Water — Smarter Use',
                  desc: 'Rainwater harvesting and demand management can drastically cut pump energy costs while building resilience against seasonal water scarcity.',
                  accent: 'border-cyan-400/30',
                },
              ].map((card) => (
                <div key={card.title}
                  className={`bg-white/6 border ${card.accent} backdrop-blur-sm rounded-2xl p-5 flex gap-4 hover:bg-white/10 transition-colors`}>
                  <div className="flex-shrink-0 mt-0.5 p-2 bg-white/10 rounded-xl h-fit">
                    {card.icon}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm mb-1.5">{card.title}</div>
                    <div className="text-green-200/70 text-xs leading-relaxed">{card.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 50" preserveAspectRatio="none" className="w-full h-10">
            <path d="M0,30 C480,55 960,5 1440,30 L1440,50 L0,50 Z" fill="#f0fdf4"/>
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          BOTTOM CTA + DATA TRANSPARENCY
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-green-50 border-y border-green-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-extrabold text-green-700 mb-1">100%</div>
              <div className="font-bold text-gray-800 mb-1">Formula Transparency</div>
              <div className="text-sm text-gray-500">Every metric has a "How calculated?" button revealing the exact formula, source and assumptions.</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-amber-600 mb-1">Demo</div>
              <div className="font-bold text-gray-800 mb-1">Data Labeled</div>
              <div className="text-sm text-gray-500">Every estimated value carries a visible badge. Swap with real sensor data when available.</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-blue-600 mb-1">API</div>
              <div className="font-bold text-gray-800 mb-1">Ready to Connect</div>
              <div className="text-sm text-gray-500">Service adapter pattern for NASA POWER, CEA, BEE, MNRE and Jal Jeevan Mission APIs.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
