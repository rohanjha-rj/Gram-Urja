import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun, Leaf, Zap,
  TrendingUp, Wind, ChevronRight, ArrowRight,
  Activity
} from 'lucide-react';
import { getAllAreaAnalyses } from '../services/energyService';
import { ASSUMPTIONS } from '../calculations/engine';
import { useLanguage } from '../context/LanguageContext';

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
  const co2DailyKg = Math.round(
    analyses.reduce((s, a) => s + a.co2KgPerMonth, 0) / 30,
  );
  const biogasDailyKWh = Math.round(
    analyses.reduce((s, a) => s + a.wasteAnalysis.electricityKWhPerDay, 0),
  );
  const existingSolarDailyKWh = Math.round(
    analyses.reduce((s, a) => s + a.area.infrastructure.solar.installedCapacity * ASSUMPTIONS.solarKWhPerKWPerDay, 0),
  );
  const energyGenKWh = biogasDailyKWh + existingSolarDailyKWh;
  return { solarDailyKWh, wasteTonsPerDay, co2DailyKg, energyGenKWh };
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
  { url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=900&q=80&auto=format&fit=crop', labelEn: '☀️ Solar Panels · Clean Energy', labelHi: '☀️ सौर पैनल · स्वच्छ ऊर्जा' },
  { url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80&auto=format&fit=crop', labelEn: '🌿 Green Fields · Rural India', labelHi: '🌿 हरे-भरे खेत · ग्रामीण भारत' },
  { url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=900&q=80&auto=format&fit=crop', labelEn: '🔋 Clean Storage · Sustainable Grid', labelHi: '🔋 स्वच्छ भंडारण · संवहनीय ग्रिड' },
  { url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=900&q=80&auto=format&fit=crop', labelEn: '⚡ Renewable Energy · Villages', labelHi: '⚡ नवीकरणीय ऊर्जा · ग्राम' },
];

function VillageScene({ isHindi }: { isHindi: boolean }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % HERO_PHOTOS.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/10' }}>
      {HERO_PHOTOS.map((photo, i) => (
        <img key={photo.url} src={photo.url} alt={isHindi ? photo.labelHi : photo.labelEn} loading={i === 0 ? 'eager' : 'lazy'}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === active ? 1 : 0 }} />
      ))}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg,rgba(0,0,0,0.28) 0%,transparent 50%,rgba(0,0,0,0.35) 100%)' }} />
      {[
        { pos: 'top-3 left-3',      bg: 'bg-amber-400/90',   textEn: '☀️ Solar',  textHi: '☀️ सौर' },
        { pos: 'top-3 right-3',     bg: 'bg-emerald-500/90', textEn: '🌿 Biogas', textHi: '🌿 बायोगैस' },
        { pos: 'bottom-12 right-3', bg: 'bg-green-600/90',   textEn: '⚡ Power',  textHi: '⚡ ऊर्जा' },
      ].map(b => (
        <div key={b.pos}
          className={`absolute ${b.pos} ${b.bg} text-white text-xs font-bold px-2.5 py-1 rounded-full gu-hero-badge`}
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
          {isHindi ? b.textHi : b.textEn}
        </div>
      ))}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {HERO_PHOTOS.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'bg-white w-5' : 'bg-white/50 w-1.5'}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Impact stat card ─────────────────────────────────────────────────────────
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
  isHindi: boolean;
}

function ImpactCard({ icon, iconBg, label, sublabel, value, unit, trendPct, accentBar, inView, duration = 1800, decimals = 0, isHindi }: ImpactCardProps) {
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
      <div className={`h-1 w-full ${accentBar}`} />
      <div className="p-5">
        <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${iconBg} mb-4`}>
          {icon}
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <span className="gu-live-dot" />
          <span className="text-[10px] text-gray-400 font-semibold tracking-wide">LIVE</span>
        </div>
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span className="text-3xl font-extrabold text-gray-900 tabular-nums leading-none">{displayVal}</span>
          <span className="text-sm font-semibold text-gray-400">{unit}</span>
        </div>
        <div className="text-sm font-bold text-gray-800 mb-0.5">{label}</div>
        <div className="text-xs text-gray-400 mb-3">{sublabel}</div>
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <TrendingUp className="w-3 h-3" />
          ↑ {trendPct}% {isHindi ? 'इस माह' : 'this month'}
          {liveDelta > 0 && <span className="ml-1 text-green-600 gu-co2-save">+{liveDelta}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Flow diagram ─────────────────────────────────────────────────────────────
function ConservationFlow({ impact, isHindi }: { impact: ReturnType<typeof getLiveImpact>; isHindi: boolean }) {
  const [flowRef, flowInView] = useInView(0.1);

  const FLOW_NODES = [
    {
      icon: '☀️',
      title: isHindi ? 'सौर ऊर्जा' : 'Solar Energy',
      desc: isHindi ? `${impact.solarDailyKWh} kWh/दिन क्षमता` : `${impact.solarDailyKWh} kWh/day potential`,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      accent: 'text-amber-700',
      dot: 'bg-amber-400',
    },
    {
      icon: '🌿',
      title: isHindi ? 'जैविक अपशिष्ट' : 'Organic Waste',
      desc: isHindi ? `${impact.wasteTonsPerDay} टन/दिन संकलित` : `${impact.wasteTonsPerDay}t/day collected`,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      accent: 'text-emerald-700',
      dot: 'bg-emerald-400',
    },
    {
      icon: '⚡',
      title: isHindi ? 'स्वच्छ विद्युत' : 'Clean Energy',
      desc: isHindi ? `${impact.energyGenKWh} kWh/दिन उत्पादन` : `${impact.energyGenKWh} kWh/day generated`,
      bg: 'bg-green-50',
      border: 'border-green-200',
      accent: 'text-green-700',
      dot: 'bg-green-400',
    },
    {
      icon: '🏘️',
      title: isHindi ? 'सामुदायिक लाभ' : 'Community Benefit',
      desc: isHindi ? 'कम खर्च · शून्य उत्सर्जन' : 'Lower cost · less CO₂',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      accent: 'text-purple-700',
      dot: 'bg-purple-400',
    },
  ];

  return (
    <div ref={flowRef} className="relative">
      {/* Desktop: horizontal flow */}
      <div className="hidden md:flex items-stretch gap-0">
        {FLOW_NODES.map((node, i) => (
          <React.Fragment key={node.title}>
            <div
              className={`flex-1 flex flex-col items-center text-center p-5 rounded-2xl border-2 ${node.border} ${node.bg} shadow-sm
                transition-all duration-500 ${flowInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3 border-2 ${node.border} bg-white shadow-sm`}>
                {node.icon}
              </div>
              <div className={`text-sm font-bold mb-1 ${node.accent}`}>{node.title}</div>
              <div className="text-xs text-gray-500 leading-snug">{node.desc}</div>
              <div className="flex items-center gap-1 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${node.dot} animate-pulse`} />
                <span className="text-[10px] text-gray-400 font-semibold">LIVE</span>
              </div>
            </div>
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

      <div className="mt-5 text-center">
        <span className="inline-flex items-center gap-2 text-xs text-gray-500 border border-gray-200 bg-white rounded-full px-4 py-1.5">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          {isHindi ? 'बंद चक्रीय मॉडल — प्रत्येक उत्पाद अगले चरण को ऊर्जा प्रदान करता है' : 'Closed-loop circular model — each output feeds the next input'}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { t, isHindi } = useLanguage();
  const [impactRef, impactInView] = useInView(0.15);
  const impact = getLiveImpact();

  const impactCards: ImpactCardProps[] = [
    {
      icon: <Sun className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-100',
      label: t('solarPotentialLabel'),
      sublabel: t('solarPotentialSub'),
      value: impact.solarDailyKWh,
      unit: 'kWh/' + (isHindi ? 'दिन' : 'day'),
      trendPct: 12,
      accentBar: 'bg-amber-400',
      inView: impactInView,
      duration: 1400,
      isHindi,
    },
    {
      icon: <Leaf className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-100',
      label: t('wasteCollectedLabel'),
      sublabel: t('wasteCollectedSub'),
      value: Math.round(impact.wasteTonsPerDay * 10),
      unit: (isHindi ? 'टन/दिन' : 'tons/day'),
      trendPct: 18,
      accentBar: 'bg-emerald-400',
      inView: impactInView,
      duration: 1550,
      decimals: 1,
      isHindi,
    },
    {
      icon: <Wind className="w-5 h-5 text-teal-600" />,
      iconBg: 'bg-teal-100',
      label: t('co2MitigatedLabel'),
      sublabel: t('co2MitigatedSub'),
      value: impact.co2DailyKg,
      unit: 'kg/' + (isHindi ? 'दिन' : 'day'),
      trendPct: 22,
      accentBar: 'bg-teal-400',
      inView: impactInView,
      duration: 1700,
      isHindi,
    },
    {
      icon: <Zap className="w-5 h-5 text-green-600" />,
      iconBg: 'bg-green-100',
      label: t('energyGeneratedLabel'),
      sublabel: t('energyGeneratedSub'),
      value: impact.energyGenKWh,
      unit: 'kWh/' + (isHindi ? 'दिन' : 'day'),
      trendPct: 16,
      accentBar: 'bg-green-400',
      inView: impactInView,
      duration: 1850,
      isHindi,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#f0fdf4 0%,#f7fdf9 100%)' }}>

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO + MISSION
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col overflow-hidden"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(160deg,#030d07 0%,#052e16 25%,#14532d 55%,#0d2e1e 80%,#020a05 100%)',
        }}
      >
        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'300\' height=\'300\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundSize: '200px' }} />

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <svg width="100%" height="100%"><defs><pattern id="gu-dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1.5" fill="#16a34a" /></pattern></defs><rect width="100%" height="100%" fill="url(#gu-dots)" /></svg>
        </div>

        {/* Radial glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 20%,rgba(250,204,21,0.12) 0%,transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 20% 80%,rgba(16,185,129,0.10) 0%,transparent 60%)' }} />

        {/* Leaf particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {[{ x: '8%', delay: '0s', size: 10 }, { x: '18%', delay: '2.3s', size: 8 }, { x: '75%', delay: '1.1s', size: 12 }, { x: '88%', delay: '3.5s', size: 9 }].map((p, i) => (
            <div key={i} className="absolute gu-leaf-fall" style={{ left: p.x, top: '-20px', animationDelay: p.delay, fontSize: p.size + 'px' }}>🌿</div>
          ))}
        </div>

        {/* ── Inner container ── */}
        <div className="relative z-10 flex-1 min-h-0 py-10">
          <div className="max-w-7xl mx-auto w-full px-6 flex flex-col justify-between" style={{ minHeight: '100%' }}>

            {/* ── HERO COPY + VISUAL ── */}
            <div className="grid lg:grid-cols-2 gap-8 items-center py-6">

              {/* Left: copy */}
              <div className="gu-hero-text space-y-5">
                <div className="inline-flex items-center gap-2 border border-green-400/30 bg-green-400/10 rounded-full px-3 py-1 text-xs font-semibold text-green-300 uppercase tracking-widest backdrop-blur-md">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {t('heroLiveRegion')}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.15] text-white drop-shadow-md">
                  {isHindi ? (
                    <>
                      ग्राम सशक्तीकरण<br />
                      <span className="text-amber-300">कचरा</span>
                      <span className="text-white">, </span>
                      <span className="text-green-300">जल</span>
                      <span className="text-white"> एवं </span>
                      <span className="text-yellow-300">सूर्य</span>
                      <span className="text-white"> से</span>
                    </>
                  ) : (
                    <>
                      Powering Villages<br />
                      with{' '}
                      <span className="text-amber-300">Waste</span>
                      <span className="text-white">,{' '}</span>
                      <span className="text-green-300">Water</span>
                      <span className="text-white">{' '}&amp;{' '}</span>
                      <span className="text-yellow-300">Sun</span>
                    </>
                  )}
                </h1>

                <p className="text-green-100/90 text-base leading-relaxed max-w-xl">
                  {t('heroSubtitle')}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link to="/login"
                    className="group inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 hover:-translate-y-0.5 text-sm">
                    <Zap className="w-4 h-4" />
                    {t('getStarted')}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <a href="#impact"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-5 py-3.5 rounded-xl transition-all duration-200 backdrop-blur-md text-sm">
                    <Activity className="w-4 h-4 text-emerald-300" />
                    {isHindi ? 'लाइव प्रभाव देखें' : 'View Live Impact'}
                  </a>
                </div>
              </div>

              {/* Right: photo scene */}
              <div className="gu-hero-visual lg:pl-4">
                <VillageScene isHindi={isHindi} />
                <div className="flex justify-center mt-3 gap-5 flex-wrap">
                  {[{ dot: 'bg-amber-400', labelEn: 'Solar Energy', labelHi: 'सौर ऊर्जा' }, { dot: 'bg-emerald-400', labelEn: 'Biogas', labelHi: 'बायोगैस' }, { dot: 'bg-cyan-400', labelEn: 'Clean Water', labelHi: 'स्वच्छ जल' }].map(l => (
                    <div key={l.labelEn} className="flex items-center gap-1.5 text-xs text-green-300/90 font-medium">
                      <span className={`w-2 h-2 rounded-full ${l.dot}`} />{isHindi ? l.labelHi : l.labelEn}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── MISSION STRIP ── */}
            <div className="border-t border-white/10 pt-8 mt-6 grid lg:grid-cols-2 gap-8 items-start">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-400/15 border border-green-400/25 text-green-300 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3">
                  🌱 {t('ourMission')}
                </div>
                <h2 className="text-xl font-extrabold text-white leading-snug mb-2">
                  {t('missionHeading')}
                </h2>
                <p className="text-green-100/80 text-xs leading-relaxed mb-3">
                  {t('missionText')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { n: '5', label: t('areasTracked') },
                    { n: '100%', label: t('formulaTransparency') },
                    { n: '2', label: t('cleanEnergyPillars') },
                    { n: '₹0', label: t('zeroToStart') }
                  ].map(s => (
                    <div key={s.label} className="bg-white/10 border border-white/15 backdrop-blur-md rounded-xl px-3 py-2 text-center">
                      <div className="text-base font-extrabold text-white">{s.n}</div>
                      <div className="text-[10px] text-green-300 font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { icon: <Sun className="w-4 h-4 text-amber-400" />, title: t('solarUntapped'), desc: t('solarUntappedDesc'), accent: 'border-amber-400/30' },
                  { icon: <Leaf className="w-4 h-4 text-emerald-400" />, title: t('wasteProblemPower'), desc: t('wasteProblemPowerDesc'), accent: 'border-emerald-400/30' },
                  { icon: <Zap className="w-4 h-4 text-green-400" />, title: t('energyEfficiencyGrid'), desc: t('energyEfficiencyGridDesc'), accent: 'border-green-400/30' },
                ].map(card => (
                  <div key={card.title} className={`bg-white/10 border ${card.accent} backdrop-blur-md rounded-xl p-3 flex gap-3 hover:bg-white/15 transition-colors`}>
                    <div className="flex-shrink-0 p-1.5 bg-white/10 rounded-lg h-fit">{card.icon}</div>
                    <div>
                      <div className="font-bold text-white text-xs mb-0.5">{card.title}</div>
                      <div className="text-green-200/80 text-[11px] leading-relaxed">{card.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Wave divider to next section */}
        <div className="w-full pointer-events-none mt-auto">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-10">
            <path d="M0,40 C360,70 1080,10 1440,40 L1440,60 L0,60 Z" fill="#f0fdf4" />
          </svg>
        </div>
      </section>

      {/* ═══ IMPACT METRICS ═════════════════════════════════════════════════ */}
      <section id="impact" className="max-w-7xl mx-auto px-6 py-14" ref={impactRef}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {t('liveVillageImpact')}
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{t('realNumbersRealChange')}</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            {t('aggregatedImpactDesc')}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {impactCards.map(card => (
            <ImpactCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      {/* ═══ HOW GRAM URJA WORKS ════════════════════════════════════════════ */}
      <section className="bg-white border-y border-gray-100 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
              <Wind className="w-3.5 h-3.5" />
              {t('circularModel')}
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{t('howGramUrjaWorks')}</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              {t('circularModelDesc')}
            </p>
          </div>
          <ConservationFlow impact={impact} isHindi={isHindi} />
        </div>
      </section>
    </div>
  );
}
