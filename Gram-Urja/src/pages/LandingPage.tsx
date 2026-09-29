import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun, Droplets, Leaf, Zap, LayoutDashboard, Activity,
  Lightbulb, Bell, Award, Bot, ArrowRight, TrendingUp,
  Wind, Flame, Users, ChevronRight,
} from 'lucide-react';
import { getAllAreaAnalyses, getRegionTotals } from '../services/energyService';
import { ASSUMPTIONS } from '../calculations/engine';

// ─── Derived live-impact metrics ─────────────────────────────────────────────
function getLiveImpact() {
  const analyses = getAllAreaAnalyses();
  const solarDailyKWh = Math.round(
    analyses.reduce((s, a) => s + a.solarPotential.monthlyGenerationKWh, 0) / 30,
  );
  const wasteTonsPerDay = +(
    analyses.reduce((s, a) =>
      s + a.area.cowDungKgPerDay + a.area.foodWasteKgPerDay + a.area.agriWasteKgPerDay, 0
    ) / 1000
  ).toFixed(1);
  const waterSavedLDay = Math.round(
    analyses.reduce((s, a) => s + a.waterAnalysis.rainwaterPotentialLitresPerYear, 0) / 365,
  );
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

// ─── Intersection observer hook ──────────────────────────────────────────────
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

// ─── Hero photo slideshow ────────────────────────────────────────────────────
const HERO_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=900&q=80&auto=format&fit=crop', label: '☀️ Solar Panels · Clean Energy' },
  { url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80&auto=format&fit=crop', label: '🌿 Green Fields · Rural India' },
  { url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&q=80&auto=format&fit=crop', label: '💧 Water Resources · Sustainability' },
  { url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=900&q=80&auto=format&fit=crop', label: '⚡ Renewable Energy · Villages' },
];

function VillageScene() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % HERO_PHOTOS.length), 4000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative w-full max-w-2xl mx-auto select-none rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/10' }}>
      {HERO_PHOTOS.map((photo, i) => (
        <img key={photo.url} src={photo.url} alt={photo.label} loading={i === 0 ? 'eager' : 'lazy'}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === active ? 1 : 0 }} />
      ))}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg,rgba(0,0,0,0.28) 0%,transparent 50%,rgba(0,0,0,0.35) 100%)' }} />
      {/* Corner resource badges — blur + shadow for readability over any image */}
      {[
        { pos: 'top-3 left-3',     bg: 'bg-amber-400/90',   text: '☀️ Solar' },
        { pos: 'top-3 right-3',    bg: 'bg-emerald-500/90', text: '🌿 Biogas' },
        { pos: 'bottom-12 left-3', bg: 'bg-cyan-500/90',    text: '💧 Water' },
        { pos: 'bottom-12 right-3', bg: 'bg-green-600/90',  text: '⚡ Power' },
      ].map(b => (
        <div key={b.text}
          className={`absolute ${b.pos} ${b.bg} text-white text-xs font-bold px-2.5 py-1 rounded-full gu-hero-badge`}
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.25)' }}>
          {b.text}
        </div>
      ))}
      {/* Dot nav */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {HERO_PHOTOS.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'bg-white w-5' : 'bg-white/50 w-1.5'}`} />
        ))}
      </div>
    </div>
  );
}

// ─── ① ENHANCED Impact Stat Card ─────────────────────────────────────────────
interface ImpactCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  sublabel: string;
  value: number;
  unit: string;
  trendPct: number;
  accentBar: string;
  inView: boolean;
  duration?: number;
  decimals?: number;
}

function ImpactCard({ icon, iconBg, label, sublabel, value, unit, trendPct, accentBar, inView, duration = 1800, decimals = 0 }: ImpactCardProps) {
  const animated = useCountUp(Math.round(value), duration, inView);
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
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${accentBar}`} />
      <div className="p-5">
        {/* Icon container */}
        <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${iconBg} mb-4`}>
          {icon}
        </div>
        {/* Live badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <span className="gu-live-dot" />
          <span className="text-[10px] text-gray-400 font-semibold tracking-wide">LIVE</span>
        </div>
        {/* Stat value */}
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span className="text-3xl font-extrabold text-gray-900 tabular-nums leading-none">{displayVal}</span>
          <span className="text-sm font-semibold text-gray-400">{unit}</span>
        </div>
        {/* Label */}
        <div className="text-sm font-bold text-gray-800 mb-0.5">{label}</div>
        {/* Sub-label */}
        <div className="text-xs text-gray-400 mb-3">{sublabel}</div>
        {/* Trend */}
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <TrendingUp className="w-3 h-3" />
          ↑ {trendPct}% this month
          {liveDelta > 0 && <span className="ml-1 text-green-600 gu-co2-save">+{liveDelta}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Live conservation ticker ─────────────────────────────────────────────────
const impact = getLiveImpact();

function ConservationTicker() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const solarPerSec  = +(impact.solarDailyKWh  / 86400).toFixed(4);
  const waterPerSec  = +(impact.waterSavedLDay  / 86400).toFixed(2);
  const wastePerSec  = +(impact.wasteTonsPerDay / 86400 * 1000).toFixed(4);
  const energyPerSec = +(impact.energyGenKWh    / 86400).toFixed(4);
  const items = [
    { icon: '☀️', label: 'Solar harvested', val: (solarPerSec  * seconds).toFixed(2), unit: 'kWh', color: 'text-amber-600'   },
    { icon: '💧', label: 'Water saved',     val: (waterPerSec  * seconds).toFixed(1), unit: 'L',   color: 'text-cyan-600'    },
    { icon: '🌿', label: 'Waste processed', val: (wastePerSec  * seconds).toFixed(2), unit: 'kg',  color: 'text-emerald-600' },
    { icon: '⚡', label: 'Energy generated',val: (energyPerSec * seconds).toFixed(2), unit: 'kWh', color: 'text-green-600'   },
  ];
  return (
    <div className="bg-white border border-green-100 rounded-2xl px-5 py-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="gu-live-dot" />
        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
          Happening right now · since you opened this page ({seconds}s)
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map(it => (
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

// ─── ③ HORIZONTAL FLOW DIAGRAM ───────────────────────────────────────────────
const FLOW_NODES = [
  {
    icon: '☀️',
    title: 'Solar Energy',
    desc: `${impact.solarDailyKWh} kWh/day potential`,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    accent: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  {
    icon: '🌿',
    title: 'Organic Waste',
    desc: `${impact.wasteTonsPerDay}t/day collected`,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    accent: 'text-emerald-700',
    dot: 'bg-emerald-400',
  },
  {
    icon: '💧',
    title: 'Water Harvesting',
    desc: `${Math.round(impact.waterSavedLDay / 1000)}kL/day saved`,
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    accent: 'text-cyan-700',
    dot: 'bg-cyan-400',
  },
  {
    icon: '⚡',
    title: 'Clean Energy',
    desc: `${impact.energyGenKWh} kWh/day generated`,
    bg: 'bg-green-50',
    border: 'border-green-200',
    accent: 'text-green-700',
    dot: 'bg-green-400',
  },
  {
    icon: '🏘️',
    title: 'Community Benefit',
    desc: 'Lower cost · less CO₂',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    accent: 'text-purple-700',
    dot: 'bg-purple-400',
  },
];

function ConservationFlow() {
  const [flowRef, flowInView] = useInView(0.1);
  return (
    <div ref={flowRef} className="relative">
      {/* Desktop: horizontal flow */}
      <div className="hidden md:flex items-stretch gap-0">
        {FLOW_NODES.map((node, i) => (
          <React.Fragment key={node.title}>
            {/* Node card */}
            <div
              className={`flex-1 flex flex-col items-center text-center p-5 rounded-2xl border-2 ${node.border} ${node.bg} shadow-sm
                transition-all duration-500 ${flowInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Icon circle */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3 border-2 ${node.border} bg-white shadow-sm`}>
                {node.icon}
              </div>
              <div className={`text-sm font-bold mb-1 ${node.accent}`}>{node.title}</div>
              <div className="text-xs text-gray-500 leading-snug">{node.desc}</div>
              {/* Live dot */}
              <div className="flex items-center gap-1 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${node.dot} animate-pulse`} />
                <span className="text-[10px] text-gray-400 font-semibold">LIVE</span>
              </div>
            </div>
            {/* Arrow connector */}
            {i < FLOW_NODES.length - 1 && (
              <div className={`flex items-center px-1 transition-all duration-500 ${flowInView ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${i * 100 + 60}ms` }}>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-6 h-px bg-gray-300" />
                  <ChevronRight className="w-5 h-5 text-gray-400 -my-0.5" />
                  <div className="w-6 h-px bg-gray-300" />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex flex-col gap-3 md:hidden">
        {FLOW_NODES.map((node, i) => (
          <React.Fragment key={node.title}>
            <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${node.border} ${node.bg} shadow-sm
              transition-all duration-500 ${flowInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: `${i * 80}ms` }}>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl border-2 ${node.border} bg-white shadow-sm flex-shrink-0`}>
                {node.icon}
              </div>
              <div>
                <div className={`text-sm font-bold ${node.accent}`}>{node.title}</div>
                <div className="text-xs text-gray-500">{node.desc}</div>
              </div>
            </div>
            {i < FLOW_NODES.length - 1 && (
              <div className="flex justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-px h-2 bg-gray-300" />
                  <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
                  <div className="w-px h-2 bg-gray-300" />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Loop label */}
      <div className="mt-5 text-center">
        <span className="inline-flex items-center gap-2 text-xs text-gray-500 border border-gray-200 bg-white rounded-full px-4 py-1.5">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Closed-loop circular model — each output feeds the next input
        </span>
      </div>
    </div>
  );
}

// ─── ④ FEATURE CARDS ─────────────────────────────────────────────────────────
const featureCards = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    iconBg: 'bg-green-100 text-green-700',
    accentBorder: 'border-l-green-500',
    title: 'Village Dashboard',
    description: 'Multi-area command centre with priority index, energy breakdowns and insights across all 6 areas.',
    to: '/village',
    tag: 'Official',
    tagColor: 'bg-green-100 text-green-700',
  },
  {
    icon: <Activity className="w-5 h-5" />,
    iconBg: 'bg-blue-100 text-blue-700',
    accentBorder: 'border-l-blue-500',
    title: 'Household Dashboard',
    description: 'Appliance-level energy analysis with cost breakdown, timer tracking and sustainability score.',
    to: '/household',
    tag: 'Citizen',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    icon: <Sun className="w-5 h-5" />,
    iconBg: 'bg-amber-100 text-amber-700',
    accentBorder: 'border-l-amber-500',
    title: 'Solar Potential',
    description: 'Interactive panel simulator with before/after analysis. Visualise roof + land solar coverage.',
    to: '/solar',
    tag: 'Energy',
    tagColor: 'bg-amber-100 text-amber-700',
  },
  {
    icon: <Droplets className="w-5 h-5" />,
    iconBg: 'bg-cyan-100 text-cyan-700',
    accentBorder: 'border-l-cyan-500',
    title: 'Water Management',
    description: 'Demand calculator, rainwater harvesting potential, and water-energy pump nexus.',
    to: '/water',
    tag: 'Water',
    tagColor: 'bg-cyan-100 text-cyan-700',
  },
  {
    icon: <Leaf className="w-5 h-5" />,
    iconBg: 'bg-emerald-100 text-emerald-700',
    accentBorder: 'border-l-emerald-500',
    title: 'Waste & Biogas',
    description: 'Biogas recovery from organic waste. Community vs household scale energy calculations.',
    to: '/waste',
    tag: 'Waste',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    iconBg: 'bg-yellow-100 text-yellow-700',
    accentBorder: 'border-l-yellow-500',
    title: 'Recommendations',
    description: 'Data-driven action plans with investment, payback, CO₂ impact and priority ranking.',
    to: '/recommendations',
    tag: 'Insights',
    tagColor: 'bg-yellow-100 text-yellow-700',
  },
  {
    icon: <Bell className="w-5 h-5" />,
    iconBg: 'bg-red-100 text-red-700',
    accentBorder: 'border-l-red-500',
    title: 'Alerts Centre',
    description: 'Anomaly detection for consumption spikes, equipment faults and missed opportunities.',
    to: '/alerts',
    tag: 'Alerts',
    tagColor: 'bg-red-100 text-red-700',
  },
  {
    icon: <Award className="w-5 h-5" />,
    iconBg: 'bg-purple-100 text-purple-700',
    accentBorder: 'border-l-purple-500',
    title: 'Sustainability Score',
    description: '0–100 score with category breakdown, weighted formulas, radar chart and 6-month trend.',
    to: '/score',
    tag: 'Score',
    tagColor: 'bg-purple-100 text-purple-700',
  },
  {
    icon: <Bot className="w-5 h-5" />,
    iconBg: 'bg-indigo-100 text-indigo-700',
    accentBorder: 'border-l-indigo-500',
    title: 'AI Assistant',
    description: 'Ask questions in English or Hindi. Smart navigation and calculation retrieval.',
    to: '/ai',
    tag: 'AI',
    tagColor: 'bg-indigo-100 text-indigo-700',
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [impactRef, impactInView] = useInView(0.15);

  const impactCards: ImpactCardProps[] = [
    {
      icon: <Sun className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-100',
      label: 'Solar Potential',
      sublabel: 'Feasible daily generation across all areas',
      value: impact.solarDailyKWh,
      unit: 'kWh/day',
      trendPct: 12,
      accentBar: 'bg-amber-400',
      inView: impactInView,
      duration: 1400,
    },
    {
      icon: <Leaf className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-100',
      label: 'Waste Collected',
      sublabel: 'Organic waste available for biogas recovery',
      value: Math.round(impact.wasteTonsPerDay * 10),
      unit: 'tons/day',
      trendPct: 18,
      accentBar: 'bg-emerald-400',
      inView: impactInView,
      duration: 1550,
      decimals: 1,
    },
    {
      icon: <Droplets className="w-5 h-5 text-cyan-600" />,
      iconBg: 'bg-cyan-100',
      label: 'Water Saved',
      sublabel: 'Rainwater harvesting potential per day',
      value: impact.waterSavedLDay,
      unit: 'L/day',
      trendPct: 22,
      accentBar: 'bg-cyan-400',
      inView: impactInView,
      duration: 1700,
    },
    {
      icon: <Zap className="w-5 h-5 text-green-600" />,
      iconBg: 'bg-green-100',
      label: 'Energy Generated',
      sublabel: 'Biogas + existing solar combined',
      value: impact.energyGenKWh,
      unit: 'kWh/day',
      trendPct: 16,
      accentBar: 'bg-green-400',
      inView: impactInView,
      duration: 1850,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#f0fdf4 0%,#f7fdf9 100%)' }}>

      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#052e16 0%,#14532d 45%,#1a5c38 75%,#0f3d28 100%)' }}>

        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'300\' height=\'300\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundSize: '200px' }} />

        {/* Radial glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 20%,rgba(250,204,21,0.12) 0%,transparent 65%)' }} />

        {/* Leaf particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {[{ x: '8%', delay: '0s', size: 10 }, { x: '18%', delay: '2.3s', size: 8 }, { x: '75%', delay: '1.1s', size: 12 }, { x: '88%', delay: '3.5s', size: 9 }].map((p, i) => (
            <div key={i} className="absolute gu-leaf-fall" style={{ left: p.x, top: '-20px', animationDelay: p.delay, fontSize: p.size + 'px' }}>🌿</div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-14 pb-20 lg:pt-16 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* ── Left: copy ── */}
            <div className="gu-hero-text space-y-5">

              {/* Live region pill */}
              <div className="inline-flex items-center gap-2 border border-green-400/30 bg-green-400/10 rounded-full px-4 py-1.5 text-xs font-semibold text-green-300 uppercase tracking-widest">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live · Suryapur Sustainability Region
              </div>

              {/* Headline — fix "Waste , Water" punctuation spacing */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.1] text-white">
                Powering Villages<br />
                with{' '}
                <span className="text-amber-300">Waste</span>
                <span className="text-white">,{' '}</span>
                <span className="text-green-300">Water</span>
                <span className="text-white">{' '}&amp;{' '}</span>
                <span className="text-yellow-300">Sun</span>
              </h1>

              {/* Subtitle */}
              <p className="text-green-100/80 text-lg leading-relaxed max-w-xl">
                Gram Urja transforms local village resources into clean energy,
                efficient water systems and measurable community impact —
                one village at a time.
              </p>

              {/* ① PRIMARY CTA — directly below subtitle */}
              <div>
                <Link to="/login"
                  className="group inline-flex items-center gap-2 bg-green-400 hover:bg-green-300 text-green-950 font-bold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-green-900/40 hover:shadow-green-900/60 hover:-translate-y-0.5">
                  <Zap className="w-4 h-4" />
                  Get Started — Choose Your Role
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* ① PILL META BAR — equal gap, aligned flex-wrap row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[
                  { icon: '☀️', text: '6 villages monitored' },
                  { icon: '♻️', text: 'Biogas + solar recovery' },
                  { icon: '💧', text: 'Rainwater optimised' },
                  { icon: '📊', text: '100% formula transparent' },
                ].map(chip => (
                  <span key={chip.text}
                    className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs text-green-200 font-medium whitespace-nowrap">
                    <span>{chip.icon}</span>{chip.text}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right: photo scene ── */}
            <div className="gu-hero-visual lg:pl-4">
              <VillageScene />
              <div className="flex justify-center mt-4 gap-6 flex-wrap">
                {[{ dot: 'bg-amber-400', label: 'Solar Energy' }, { dot: 'bg-emerald-400', label: 'Biogas' }, { dot: 'bg-cyan-400', label: 'Water' }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs text-green-300/80 font-medium">
                    <span className={`w-2.5 h-2.5 rounded-full ${l.dot}`} />{l.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12">
            <path d="M0,40 C360,70 1080,10 1440,40 L1440,60 L0,60 Z" fill="#f0fdf4" />
          </svg>
        </div>
      </section>

      {/* ═══ LIVE TICKER ════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-2">
        <ConservationTicker />
      </section>

      {/* ═══ ② IMPACT METRICS ══════════════════════════════════════════════ */}
      <section id="impact" className="max-w-7xl mx-auto px-6 py-14" ref={impactRef}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Village Impact
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Real Numbers. Real Change.</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            Aggregated daily impact across all 6 areas of Suryapur region — calculated from live data using transparent formulas.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {impactCards.map(card => (
            <ImpactCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      {/* ═══ ③ HOW GRAM URJA WORKS — HORIZONTAL FLOW ══════════════════════ */}
      <section className="bg-white border-y border-gray-100 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
              <Wind className="w-3.5 h-3.5" />
              Circular Sustainability Model
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">How Gram Urja Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              Village resources flow through a closed-loop system — each input becomes an output that feeds the next.
            </p>
          </div>
          <ConservationFlow />
        </div>
      </section>

      {/* ═══ ④ FEATURE CARDS ═══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Complete Sustainability Intelligence</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm">
            Every module is powered by transparent calculations, live data badges and actionable recommendations — built for panchayats, officials and households.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map(card => (
            <Link key={card.to} to={card.to}
              className={`group bg-white rounded-2xl border border-gray-200 border-l-4 ${card.accentBorder} p-6
                hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
              <div className="flex items-start justify-between mb-4">
                {/* Icon container */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg} flex-shrink-0`}>
                  {card.icon}
                </div>
                {/* Tag */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${card.tagColor}`}>{card.tag}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1.5 group-hover:text-green-700 transition-colors">{card.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ MISSION SECTION ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-16"
        style={{ background: 'linear-gradient(135deg,#052e16 0%,#14532d 60%,#0d4a23 100%)' }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%"><defs><pattern id="gu-dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1.5" fill="#16a34a" /></pattern></defs><rect width="100%" height="100%" fill="url(#gu-dots)" /></svg>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-400/15 border border-green-400/25 text-green-300 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
                🌱 Our Mission
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-snug mb-5">
                Small steps create <span className="text-green-300">big change</span> for our villages.
              </h2>
              <p className="text-green-100/80 text-base leading-relaxed mb-6">
                Every Indian village already possesses the three ingredients for sustainable energy —
                <strong className="text-amber-300"> sunlight</strong>,{' '}
                <strong className="text-emerald-300"> organic waste</strong>, and{' '}
                <strong className="text-cyan-300"> water</strong>.
                Gram Urja turns this untapped potential into measurable environmental and community benefit.
              </p>
              <div className="flex flex-wrap gap-3">
                {[{ n: '6', label: 'Areas tracked' }, { n: '100%', label: 'Formula transparency' }, { n: '3', label: 'Resource types' }, { n: '₹0', label: 'To get started' }].map(s => (
                  <div key={s.label} className="bg-white/8 border border-white/12 rounded-xl px-5 py-3 text-center">
                    <div className="text-2xl font-extrabold text-white">{s.n}</div>
                    <div className="text-xs text-green-300 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: <Sun className="w-5 h-5 text-amber-400" />, title: 'Solar — Untapped Potential', desc: 'Most village rooftops have enough area to offset 30–60% of electricity demand. Gram Urja shows exactly how many panels and at what cost.', accent: 'border-amber-400/30' },
                { icon: <Leaf className="w-5 h-5 text-emerald-400" />, title: 'Waste — From Problem to Power', desc: 'Cow dung, food and agricultural residue generate biogas for cooking and electricity. Every kg treated prevents CO₂.', accent: 'border-emerald-400/30' },
                { icon: <Droplets className="w-5 h-5 text-cyan-400" />, title: 'Water — Smarter Use', desc: 'Rainwater harvesting and demand management cut pump energy costs while building resilience against seasonal scarcity.', accent: 'border-cyan-400/30' },
              ].map(card => (
                <div key={card.title} className={`bg-white/6 border ${card.accent} backdrop-blur-sm rounded-2xl p-5 flex gap-4 hover:bg-white/10 transition-colors`}>
                  <div className="flex-shrink-0 mt-0.5 p-2 bg-white/10 rounded-xl h-fit">{card.icon}</div>
                  <div>
                    <div className="font-bold text-white text-sm mb-1.5">{card.title}</div>
                    <div className="text-green-200/70 text-xs leading-relaxed">{card.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 50" preserveAspectRatio="none" className="w-full h-10">
            <path d="M0,30 C480,55 960,5 1440,30 L1440,50 L0,50 Z" fill="#f0fdf4" />
          </svg>
        </div>
      </section>

      {/* ═══ DATA TRANSPARENCY FOOTER BAR ══════════════════════════════════ */}
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
