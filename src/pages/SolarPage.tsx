import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sun, Zap, Leaf, TrendingDown, ArrowRight, ChevronDown, ChevronUp, Lightbulb, Clock, BatteryCharging, TreePine, Sparkles, ShieldCheck } from 'lucide-react';
import {
  calculateSolarCapacity, calculateSolarGeneration, calculateSolarOffset,
  calculateSolarCO2Avoided, calculateBeforeAfterScenario, calculateElectricityCost, ASSUMPTIONS
} from '../calculations/engine';
import { SectionCard, KpiCard, DemoBadge, AssumptionBox, StatRow, ProgressBar } from '../components/ui';
import { getAllAreaAnalyses } from '../services/energyService';
import AreaSelector from '../components/AreaSelector';
import { DEMO_AREAS } from '../data/demoData';
import { useAuth } from '../context/AuthContext';
import { useHousehold } from '../context/HouseholdContext';

const areas = getAllAreaAnalyses();

// ─── Animated Counter Hook ────────────────────────────────────────────────────
function useCountUp(target: number, duration = 600): number {
  const [current, setCurrent] = useState(target);
  const frameRef = useRef<number>();
  const startRef = useRef<number>(0);
  const startValRef = useRef<number>(target);

  useEffect(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    startValRef.current = current;
    startRef.current = performance.now();
    const animate = (now: number) => {
      const pct = Math.min((now - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setCurrent(startValRef.current + (target - startValRef.current) * eased);
      if (pct < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target]);

  return current;
}

function AnimatedNum({ value, decimals = 0, prefix = '', suffix = '' }: {
  value: number; decimals?: number; prefix?: string; suffix?: string;
}) {
  const animated = useCountUp(value);
  return (
    <span className="tabular-nums count-up">
      {prefix}{animated.toFixed(decimals)}{suffix}
    </span>
  );
}

// ─── Realistic Panel ─────────────────────────────────────────────────────────
function RealisticPanel({
  x, y, w, h, active, delay,
}: { x: number; y: number; w: number; h: number; active: boolean; delay: number }) {
  const FRAME = 2;
  const CELL_COLS = 6;
  const CELL_ROWS = 4;
  const innerW = w - FRAME * 2;
  const innerH = h - FRAME * 2;
  const cellW = innerW / CELL_COLS;
  const cellH = innerH / CELL_ROWS;
  const gap = 1;

  return (
    <g style={{
      opacity: active ? 1 : 0.18,
      animation: active ? `panelAppear 0.35s cubic-bezier(0.34,1.56,0.64,1) ${Math.min(delay, 2400)}ms both` : 'none',
    }}>
      {active && (
        <rect x={x+3} y={y+4} width={w} height={h} fill="rgba(0,0,0,0.35)" rx="3"/>
      )}
      <rect x={x} y={y} width={w} height={h}
        fill={active ? '#94a3b8' : '#334155'} rx="3"/>
      {active && <>
        <line x1={x+1} y1={y+1} x2={x+w-1} y2={y+1} stroke="#cbd5e1" strokeWidth="1" opacity="0.6"/>
        <line x1={x+1} y1={y+1} x2={x+1} y2={y+h-1} stroke="#cbd5e1" strokeWidth="1" opacity="0.6"/>
        <line x1={x+1} y1={y+h-1} x2={x+w-1} y2={y+h-1} stroke="#475569" strokeWidth="1" opacity="0.8"/>
        <line x1={x+w-1} y1={y+1} x2={x+w-1} y2={y+h-1} stroke="#475569" strokeWidth="1" opacity="0.8"/>
      </>}
      <rect x={x+FRAME} y={y+FRAME} width={innerW} height={innerH}
        fill={active ? '#1e3a8a' : '#1e293b'} rx="1"/>
      {Array.from({ length: CELL_ROWS }, (_, row) =>
        Array.from({ length: CELL_COLS }, (_, col) => {
          const cx = x + FRAME + col * cellW + gap / 2;
          const cy = y + FRAME + row * cellH + gap / 2;
          const cw = cellW - gap;
          const ch = cellH - gap;
          return (
            <g key={`${row}-${col}`}>
              <rect x={cx} y={cy} width={cw} height={ch}
                fill={active ? '#1d4ed8' : '#1e3a5f'} rx="0.5"/>
              {active && <>
                <line x1={cx+1} y1={cy+ch*0.33} x2={cx+cw-1} y2={cy+ch*0.33}
                  stroke="#93c5fd" strokeWidth="0.5" opacity="0.55"/>
                <line x1={cx+1} y1={cy+ch*0.66} x2={cx+cw-1} y2={cy+ch*0.66}
                  stroke="#93c5fd" strokeWidth="0.5" opacity="0.55"/>
                {[0.2, 0.5, 0.8].map(t => (
                  <line key={t} x1={cx+cw*t} y1={cy+1} x2={cx+cw*t} y2={cy+ch-1}
                    stroke="#bfdbfe" strokeWidth="0.3" opacity="0.35"/>
                ))}
              </>}
            </g>
          );
        })
      )}
      {active && (
        <rect x={x} y={y + h/2 - 1} width={w} height="2" fill="#475569" opacity="0.5"/>
      )}
      {active && (
        <polygon
          points={`${x+FRAME},${y+FRAME} ${x+FRAME+innerW*0.38},${y+FRAME} ${x+FRAME},${y+FRAME+innerH*0.42}`}
          fill="white" opacity="0.06"/>
      )}
      {active && (
        <rect x={x+w/2-3} y={y+h-FRAME-3} width="6" height="4" fill="#475569" rx="1"/>
      )}
    </g>
  );
}

// ─── Panel Simulator SVG ──────────────────────────────────────────────────────
function PanelSimulator({
  panelCount, availAreaSqFt, totalCapacity, monthlyGen, offsetPct, irradiation,
  showFooterStats = true,
  customSunAngle,
}: {
  panelCount: number; availAreaSqFt: number; totalCapacity: number;
  monthlyGen: number; offsetPct: number; irradiation: number;
  showFooterStats?: boolean;
  customSunAngle?: number;
}) {
  const PANEL_AREA_SQFT = 10;
  const usedArea      = Math.min(panelCount * PANEL_AREA_SQFT, availAreaSqFt);
  const remainingArea = Math.max(0, availAreaSqFt - usedArea);
  const maxDisplay    = Math.min(panelCount, 120);

  const W = 800; const H = 460; const SKY_H = 130;
  const ROOF_TL = { x: 70,  y: SKY_H };
  const ROOF_TR = { x: 730, y: SKY_H };
  const ROOF_BR = { x: 770, y: H - 42 };
  const ROOF_BL = { x: 30,  y: H - 42 };

  const COLS = 10;
  const ROWS = Math.ceil(120 / COLS);
  const GRID_LEFT = 70;  const GRID_TOP = SKY_H + 18;
  const GRID_W    = W - 140;
  const GRID_H    = H - SKY_H - 64;
  const PANEL_W   = (GRID_W - (COLS + 1) * 3) / COLS;
  const PANEL_H   = (GRID_H - (ROWS + 1) * 5) / ROWS;
  const GAP_X = 3; const GAP_Y = 5;

  const [autoSunAngle, setAutoSunAngle] = useState(45);
  const rafRef = useRef<number>();
  const t0 = useRef(Date.now());
  useEffect(() => {
    if (customSunAngle !== undefined) return;
    const tick = () => {
      const elapsed = (Date.now() - t0.current) / 1000;
      setAutoSunAngle(45 + Math.sin(elapsed * 0.08) * 25);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [customSunAngle]);

  const activeSunAngle = customSunAngle !== undefined ? customSunAngle : autoSunAngle;

  const SUN_R  = 115;
  const SUN_CX = 400 + SUN_R * Math.cos((activeSunAngle - 90) * Math.PI / 180);
  const SUN_CY = SKY_H / 2 + SUN_R * Math.sin((activeSunAngle - 90) * Math.PI / 180) + 15;

  const sparks = useMemo(() =>
    Array.from({ length: Math.min(maxDisplay, 14) }, (_, i) => {
      const col = (i * 7) % COLS;
      const row = Math.floor((i * 7) / COLS) % ROWS;
      const bx  = GRID_LEFT + col * (PANEL_W + GAP_X) + PANEL_W / 2;
      const by  = GRID_TOP  + row * (PANEL_H + GAP_Y) + PANEL_H / 2;
      return { x: bx, y: by, delay: (i * 0.35) % 2.5 };
    }), [maxDisplay, PANEL_W, PANEL_H]);

  const fillPct = Math.min((usedArea / availAreaSqFt) * 100, 100);

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 flex flex-col h-full"
      style={{ background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)' }}>

      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-white/8 gap-2"
        style={{ background: 'rgba(15,23,42,0.85)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"/>
          <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">
            Live Roof Simulator · {availAreaSqFt.toLocaleString()} sq ft
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{totalCapacity.toFixed(1)} kW System</span>
          <span className="text-slate-500">|</span>
          <span className="text-green-300 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">{monthlyGen.toFixed(0)} kWh/mo</span>
          <span className="text-slate-500">|</span>
          <span className="text-blue-300 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{offsetPct.toFixed(1)}% offset</span>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-2 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-h-[500px]" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="ps-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={irradiation > 4 ? '#0ea5e9' : '#1e3a5f'}/>
              <stop offset="100%" stopColor={irradiation > 4 ? '#38bdf8' : '#1e40af'}/>
            </linearGradient>
            <linearGradient id="ps-roof" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#78350f"/>
              <stop offset="50%"  stopColor="#92400e"/>
              <stop offset="100%" stopColor="#7c2d12"/>
            </linearGradient>
            <radialGradient id="ps-sun-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#fef08a" stopOpacity="0.95"/>
              <stop offset="50%"  stopColor="#fbbf24" stopOpacity="0.45"/>
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="ps-energy" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#fbbf24" stopOpacity="0"/>
              <stop offset="50%"  stopColor="#fbbf24" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#4ade80"  stopOpacity="0.6"/>
            </linearGradient>
            <clipPath id="ps-roof-clip">
              <polygon points={`${ROOF_TL.x},${ROOF_TL.y} ${ROOF_TR.x},${ROOF_TR.y} ${ROOF_BR.x},${ROOF_BR.y} ${ROOF_BL.x},${ROOF_BL.y}`}/>
            </clipPath>
            <filter id="ps-glow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Sky background */}
          <rect x="0" y="0" width={W} height={SKY_H} fill="url(#ps-sky)"/>
          <rect x="0" y={SKY_H - 20} width={W} height="20" fill="url(#ps-sky)" opacity="0.5"/>

          {/* Sun & Light effect */}
          <circle cx={SUN_CX} cy={SUN_CY} r="60" fill="url(#ps-sun-glow)" opacity="0.75"/>
          <g className="sun-spin" style={{ transformOrigin: `${SUN_CX}px ${SUN_CY}px` }}>
            {[0,20,40,60,80,100,120,140,160,180,200,220,240,260,280,300,320,340].map((a, i) => (
              <line key={i}
                x1={SUN_CX + 24 * Math.cos(a * Math.PI / 180)}
                y1={SUN_CY + 24 * Math.sin(a * Math.PI / 180)}
                x2={SUN_CX + 38 * Math.cos(a * Math.PI / 180)}
                y2={SUN_CY + 38 * Math.sin(a * Math.PI / 180)}
                stroke="#fbbf24" strokeWidth="1.75" strokeLinecap="round" opacity="0.75"/>
            ))}
          </g>
          <circle cx={SUN_CX} cy={SUN_CY} r="22" fill="#fef08a" className="solar-glow"/>
          <circle cx={SUN_CX} cy={SUN_CY} r="15" fill="#fbbf24"/>
          <circle cx={SUN_CX} cy={SUN_CY} r="9"  fill="#f59e0b"/>
          <text x={SUN_CX + 30} y={SUN_CY - 10} fill="#fef08a" fontSize="10" fontWeight="700" opacity="0.9">
            {irradiation} kWh/kW·day
          </text>

          {irradiation < 4.5 && (
            <g opacity={0.5 - (irradiation - 3) * 0.2} className="gu-cloud-1">
              <ellipse cx="220" cy="55" rx="55" ry="20" fill="white"/>
              <ellipse cx="195" cy="52" rx="32" ry="16" fill="white"/>
              <ellipse cx="248" cy="50" rx="26" ry="13" fill="white"/>
            </g>
          )}

          {/* Roof 3D Plane */}
          <polygon
            points={`${ROOF_TL.x},${ROOF_TL.y} ${ROOF_TR.x},${ROOF_TR.y} ${ROOF_BR.x},${ROOF_BR.y} ${ROOF_BL.x},${ROOF_BL.y}`}
            fill="url(#ps-roof)"/>
          {Array.from({ length: 8 }, (_, i) => {
            const ty     = ROOF_TL.y + (i + 1) * ((H - 42 - SKY_H) / 9);
            const leftX  = ROOF_TL.x + (ROOF_BL.x - ROOF_TL.x) * ((i + 1) / 9);
            const rightX = ROOF_TR.x + (ROOF_BR.x - ROOF_TR.x) * ((i + 1) / 9);
            return <line key={i} x1={leftX} y1={ty} x2={rightX} y2={ty} stroke="#7c2d12" strokeWidth="1.5" opacity="0.4"/>;
          })}

          {/* Mounting rails */}
          {Array.from({ length: ROWS }, (_, row) => {
            const y1 = GRID_TOP + row * (PANEL_H + GAP_Y) + PANEL_H * 0.3;
            const y2 = GRID_TOP + row * (PANEL_H + GAP_Y) + PANEL_H * 0.7;
            return (
              <g key={row}>
                <line x1={GRID_LEFT - 10} y1={y1} x2={GRID_LEFT + GRID_W + 10} y2={y1} stroke="#64748b" strokeWidth="3" opacity="0.5"/>
                <line x1={GRID_LEFT - 10} y1={y2} x2={GRID_LEFT + GRID_W + 10} y2={y2} stroke="#64748b" strokeWidth="3" opacity="0.5"/>
              </g>
            );
          })}

          {/* Realistic Panels Grid */}
          {Array.from({ length: Math.min(ROWS * COLS, 120) }, (_, i) => {
            const col    = i % COLS;
            const row    = Math.floor(i / COLS);
            const px     = GRID_LEFT + col * (PANEL_W + GAP_X);
            const py     = GRID_TOP  + row * (PANEL_H + GAP_Y);
            const active = i < maxDisplay;
            return <RealisticPanel key={i} x={px} y={py} w={PANEL_W} h={PANEL_H} active={active} delay={i * 35}/>;
          })}

          {/* Sparks */}
          {maxDisplay > 0 && sparks.map((sp, i) => (
            <circle key={i} cx={sp.x} cy={sp.y} r="3.5" fill="#fbbf24" filter="url(#ps-glow)"
              style={{ animation: `guSparkTravel 2.2s ease-in-out ${sp.delay}s infinite`, transformOrigin: `${sp.x}px ${sp.y}px` }}/>
          ))}

          {/* Inverter Unit */}
          <g transform={`translate(${W - 115}, ${H - 84})`}>
            <rect width="84" height="46" fill="#1e293b" stroke="#334155" strokeWidth="1.5" rx="6"/>
            <rect x="6" y="6" width="72" height="34" fill="#0f172a" rx="3"/>
            <text x="42" y="19" textAnchor="middle" fill="#4ade80" fontSize="7.5" fontWeight="700">INVERTER</text>
            <circle cx="42" cy="29" r="3" fill="#4ade80" className="solar-glow"/>
            <text x="42" y="38" textAnchor="middle" fill="#94a3b8" fontSize="6.5">{totalCapacity.toFixed(1)} kW AC</text>
            <line x1="-32" y1="23" x2="0" y2="23" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 3" className="energy-flow" opacity="0.7"/>
          </g>

          {/* Powered House */}
          <g transform={`translate(${W - 215}, ${H - 100})`}>
            <rect x="0" y="30" width="54" height="44" fill="#fefce8" stroke="#d1d5db" strokeWidth="1.5" rx="2"/>
            <polygon points="-5,30 59,30 27,4" fill="#16a34a"/>
            {maxDisplay > 0 && (
              <rect x="3" y="33" width="48" height="38" fill="#fbbf24" rx="1" opacity="0.08"
                style={{ animation: 'glow 2s ease-in-out infinite' }}/>
            )}
            <rect x="20" y="48" width="14" height="26" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" rx="1"/>
            <rect x="5"  y="38" width="12" height="10" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
            <rect x="37" y="38" width="12" height="10" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
            <text x="27" y="76" textAnchor="middle" fill="#166534" fontSize="6.5" fontWeight="700">✓ POWERED</text>
          </g>

          {/* Energy Beams from Sun */}
          {maxDisplay > 0 && (
            <line x1={SUN_CX} y1={SUN_CY} x2={GRID_LEFT + GRID_W / 2} y2={GRID_TOP + PANEL_H}
              stroke="#fbbf24" strokeWidth="2" strokeDasharray="10 6" className="energy-flow" opacity="0.4"/>
          )}

          {/* Roof Baseline & Coverage Bar */}
          <rect x="0" y={H - 42} width={W} height="42" fill="#166534" opacity="0.75"/>
          <rect x="0" y={H - 42} width={W} height="6"  fill="#15803d"/>
          <rect x="40" y={H - 28} width={W - 80} height="9" fill="#0f172a" rx="4.5"/>
          <rect x="40" y={H - 28}
            width={Math.max(8, ((fillPct / 100) * (W - 80)))} height="9"
            fill={fillPct < 50 ? '#16a34a' : fillPct < 80 ? '#f59e0b' : '#ef4444'} rx="4.5"
            style={{ transition: 'width 0.5s ease' }}/>
          <text x="44"     y={H - 33} fill="#94a3b8" fontSize="8.5">Roof coverage</text>
          <text x={W - 44} y={H - 33} textAnchor="end" fill="#94a3b8" fontSize="8.5">
            {fillPct.toFixed(0)}% of {availAreaSqFt.toLocaleString()} sq ft ({usedArea} sq ft used)
          </text>
          <text x={W / 2} y={GRID_TOP - 4} textAnchor="middle" fill="#cbd5e1" fontSize="9.5" fontWeight="600">
            {maxDisplay} / {Math.min(ROWS * COLS, 120)} panels rendered  ·  {panelCount} total configured ({totalCapacity.toFixed(1)} kW)
          </text>
        </svg>
      </div>

      {/* Footer stats */}
      {showFooterStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-4 border-t border-white/8 bg-slate-900/60">
          {[
            { label: 'Panels Installed', value: panelCount.toString(),         unit: 'panels', color: 'text-amber-300' },
            { label: 'Area Used',        value: usedArea.toLocaleString(),      unit: 'sq ft',  color: 'text-blue-300'  },
            { label: 'Area Remaining',   value: remainingArea.toLocaleString(), unit: 'sq ft',  color: 'text-slate-400' },
            { label: 'Capacity',         value: totalCapacity.toFixed(1),       unit: 'kW',     color: 'text-green-300' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className={`text-xl font-extrabold tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-400 font-medium">{s.unit}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Before/After ─────────────────────────────────────────────────────────────
function BeforeAfterSection({ before, after, savedPct, savedKWh, savedINR, savedCO2 }: {
  before: number; after: number; savedPct: number; savedKWh: number; savedINR: number; savedCO2: number;
}) {
  const animBefore = useCountUp(before / 1000);
  const animAfter  = useCountUp(after  / 1000);
  const animSaved  = useCountUp(savedINR / 1000);
  const animCO2    = useCountUp(savedCO2 / 1000);

  return (
    <div className="grid sm:grid-cols-3 gap-4 items-center">
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 text-center">
        <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">BEFORE Solar</div>
        <div className="text-4xl font-extrabold text-red-700 mb-1">{animBefore.toFixed(1)}k</div>
        <div className="text-sm text-red-500">kWh/month</div>
        <div className="text-xs text-red-400 mt-1">₹{(calculateElectricityCost(before) / 1000).toFixed(1)}k/month</div>
      </div>
      <div className="text-center">
        <div className="inline-flex flex-col items-center gap-2">
          <div className="text-4xl font-extrabold text-green-600">–{savedPct}%</div>
          <div className="flex items-center gap-2 text-green-600">
            <div className="h-0.5 w-16 bg-green-400"/>
            <ArrowRight className="w-5 h-5"/>
          </div>
          <div className="text-sm font-semibold text-green-700">{(savedKWh / 1000).toFixed(1)}k kWh saved</div>
          <div className="text-sm text-emerald-600">₹{animSaved.toFixed(1)}k saved/mo</div>
          <div className="text-xs text-gray-500">{animCO2.toFixed(2)} t CO₂ avoided</div>
        </div>
      </div>
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
        <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">AFTER Solar</div>
        <div className="text-4xl font-extrabold text-green-700 mb-1">{animAfter.toFixed(1)}k</div>
        <div className="text-sm text-green-500">kWh/month</div>
        <div className="text-xs text-green-400 mt-1">₹{(calculateElectricityCost(after) / 1000).toFixed(1)}k/month</div>
      </div>
    </div>
  );
}

// ─── Government Solar Schemes data ───────────────────────────────────────────
const SOLAR_SCHEMES = [
  {
    id: 'pm-surya-ghar',
    name: 'PM Surya Ghar: Muft Bijli Yojana',
    ministry: 'Ministry of New & Renewable Energy (MNRE)',
    tag: 'Rooftop Solar', tagColor: 'bg-amber-100 text-amber-700',
    description: 'Provides free electricity up to 300 units per month to 1 crore households by installing rooftop solar panels. The government offers a subsidy of ₹30,000 for 1 kW, ₹60,000 for 2 kW, and ₹78,000 for 3 kW or above systems.',
    eligibility: [
      'Indian resident household with a valid electricity connection',
      'Available rooftop / terrace area for panel installation',
      'Registration through the national portal (pmsuryaghar.gov.in)',
      'DISCOM approval required prior to installation',
    ],
    subsidy: '₹30,000 – ₹78,000 per household (capacity-linked)',
    link: 'https://pmsuryaghar.gov.in',
  },
  {
    id: 'pm-kusum',
    name: 'PM-KUSUM (Kisan Urja Suraksha evam Utthaan Mahabhiyan)',
    ministry: 'Ministry of New & Renewable Energy (MNRE)',
    tag: 'Agriculture Solar', tagColor: 'bg-green-100 text-green-700',
    description: 'Aimed at energy security for farmers. Component A: 10,000 MW decentralised ground/stilt-mounted plants. Component B: standalone solar-powered agriculture pumps. Component C: solarisation of grid-connected agriculture pumps.',
    eligibility: [
      'Farmers, panchayats, cooperatives, FPOs owning barren/wasteland',
      'Existing diesel pump operators (for Component B & C)',
      'Individual farmers with grid-connected pumps (Component C)',
      'Application through state nodal agencies (SNAs)',
    ],
    subsidy: '30% central + 30% state financial assistance; farmers pay only 40%',
    link: 'https://mnre.gov.in/pm-kusum',
  },
  {
    id: 'grid-solar-power',
    name: 'Grid-Connected Rooftop Solar Programme (Phase II)',
    ministry: 'Ministry of New & Renewable Energy (MNRE)',
    tag: 'Rooftop Solar', tagColor: 'bg-amber-100 text-amber-700',
    description: 'Central Financial Assistance (CFA) for residential rooftop solar installations. Target: 40,000 MW of rooftop solar capacity. Supports residential, institutional, social, government, and commercial/industrial sectors.',
    eligibility: [
      'Residential consumers in any state / UT',
      'Must install through MNRE-empanelled vendors',
      'Applicable for systems from 1 kW to 500 kW',
      'Net metering facility must be available from DISCOM',
    ],
    subsidy: '40% CFA for up to 3 kW; 20% CFA for 3–10 kW (residential)',
    link: 'https://solarrooftop.gov.in',
  },
  {
    id: 'solar-park',
    name: 'Development of Solar Parks & Ultra Mega Solar Power Projects',
    ministry: 'Ministry of New & Renewable Energy (MNRE)',
    tag: 'Utility Scale', tagColor: 'bg-blue-100 text-blue-700',
    description: 'Scheme to develop solar parks of 500 MW or more to facilitate large-scale solar projects in a plug-and-play model. CFA of ₹25 lakh per park or ₹20/W for development support (whichever is lower).',
    eligibility: [
      'State governments / State PSUs / SPVs as implementing agencies',
      'Land made available by state, preferably wasteland or degraded land',
      'Minimum park capacity: 500 MW',
    ],
    subsidy: '₹25 lakh per park or ₹20/W (whichever is lower)',
    link: 'https://mnre.gov.in/solar/solar-parks',
  },
  {
    id: 'cpsu-scheme',
    name: 'CPSU Scheme Phase II (Central Public Sector Undertakings)',
    ministry: 'Ministry of New & Renewable Energy (MNRE)',
    tag: 'Government Solar', tagColor: 'bg-purple-100 text-purple-700',
    description: 'Deployment of 12,000 MW of solar capacity by CPSUs/government entities using domestically manufactured solar cells and modules, with viability gap funding (VGF) support.',
    eligibility: [
      'Central / State Government departments and CPSUs',
      'Must use domestically manufactured solar cells & modules (ALMM list)',
      'Projects to be set up on government land or rooftops',
    ],
    subsidy: 'Viability Gap Funding (VGF) up to ₹0.50/kWh',
    link: 'https://mnre.gov.in',
  },
  {
    id: 'resco-model',
    name: 'RESCO Model for Rooftop Solar',
    ministry: 'MNRE / State DISCOMs',
    tag: 'Zero Capex', tagColor: 'bg-teal-100 text-teal-700',
    description: 'Renewable Energy Service Company (RESCO) model allows consumers to get solar installed at zero upfront cost. The RESCO owns the system and the consumer buys solar power at a pre-agreed tariff lower than the grid rate.',
    eligibility: [
      'Residential, commercial, or institutional consumers',
      'Adequate rooftop area and good solar irradiation',
      'Willing to sign a Power Purchase Agreement (PPA) for 15–25 years',
    ],
    subsidy: 'No direct subsidy; savings through reduced tariff',
    link: 'https://mnre.gov.in',
  },
  {
    id: 'nabard-solar',
    name: 'NABARD Refinance for Solar Energy Projects',
    ministry: 'NABARD / Ministry of Finance',
    tag: 'Rural Finance', tagColor: 'bg-rose-100 text-rose-700',
    description: 'NABARD provides refinance support to cooperative banks and regional rural banks for financing solar energy projects in rural areas including solar pumps, home lighting systems, and small rooftop solar systems.',
    eligibility: [
      'Rural households, farmers, and small enterprises',
      'Projects channelled through cooperative/rural banks',
      'Preference for activities aligned with agricultural use',
    ],
    subsidy: 'Concessional interest rate refinance; lower EMIs for rural borrowers',
    link: 'https://nabard.org',
  },
];

function SolarSchemeCard({ scheme }: { scheme: typeof SOLAR_SCHEMES[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card border border-gray-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-amber-50/40 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scheme.tagColor}`}>{scheme.tag}</span>
            <span className="text-xs text-gray-400">{scheme.ministry}</span>
          </div>
          <div className="font-semibold text-gray-900 text-sm leading-snug">{scheme.name}</div>
          {!open && <div className="text-xs text-gray-500 mt-1 line-clamp-1">{scheme.description}</div>}
        </div>
        <div className="shrink-0 mt-0.5 text-amber-500">
          {open ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <p className="text-sm text-gray-700 mt-3 mb-3 leading-relaxed">{scheme.description}</p>
          <div className="mb-3">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Eligibility</div>
            <ul className="space-y-1">
              {scheme.eligibility.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"/>
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5">
              <span className="font-semibold">Subsidy / Benefit: </span>{scheme.subsidy}
            </div>
            <a href={scheme.link} target="_blank" rel="noopener noreferrer"
              className="text-xs text-amber-600 hover:underline font-medium">
              Official Portal ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared page background + cloud decorations ───────────────────────────────
function SolarBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(180deg, #78350f 0%, #b45309 12%, #f59e0b 25%, #1e3a5f 55%, #0f172a 100%)'
    }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl pointer-events-none">
        <svg viewBox="0 0 400 120" className="w-full opacity-30">
          <g className="sun-spin" style={{ transformOrigin: '200px 30px' }}>
            {Array.from({ length: 16 }, (_, i) => i * 22.5).map((a, i) => (
              <line key={i}
                x1={200 + 40 * Math.cos(a * Math.PI / 180)} y1={30 + 40 * Math.sin(a * Math.PI / 180)}
                x2={200 + 70 * Math.cos(a * Math.PI / 180)} y2={30 + 70 * Math.sin(a * Math.PI / 180)}
                stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
            ))}
          </g>
          <circle cx="200" cy="30" r="30" fill="#fbbf24" className="solar-glow"/>
          <circle cx="200" cy="30" r="20" fill="#f59e0b"/>
        </svg>
      </div>
      <div className="absolute top-8 left-10 opacity-20 pointer-events-none" style={{ animation: 'waveDrift 20s linear infinite' }}>
        <svg viewBox="0 0 120 40" width="120"><ellipse cx="60" cy="25" rx="50" ry="18" fill="white"/><ellipse cx="40" cy="22" rx="30" ry="14" fill="white"/><ellipse cx="80" cy="20" rx="25" ry="12" fill="white"/></svg>
      </div>
      <div className="absolute top-16 right-20 opacity-15 pointer-events-none" style={{ animation: 'waveDrift 30s linear infinite reverse' }}>
        <svg viewBox="0 0 80 30" width="80"><ellipse cx="40" cy="18" rx="35" ry="12" fill="white"/><ellipse cx="25" cy="15" rx="20" ry="10" fill="white"/></svg>
      </div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VILLAGE OFFICIAL VIEW  — original layout, fully unchanged
// ═══════════════════════════════════════════════════════════════════════════════
function VillageSolarView() {
  const [selectedAreaId, setSelectedAreaId] = useState(areas[0].area.id);
  const [panelCount, setPanelCount]         = useState(25);
  const [availAreaSqFt, setAvailAreaSqFt]   = useState(8000);
  const [irradiation, setIrradiation]       = useState<number>(ASSUMPTIONS.solarKWhPerKWPerDay);

  useEffect(() => {
    const area = DEMO_AREAS.find(a => a.id === selectedAreaId);
    if (area) {
      const roof = area.infrastructure.solar.roofAreaSqFt ?? 0;
      const land = area.infrastructure.solar.openLandSqFt ?? 0;
      setAvailAreaSqFt(roof + land);
    }
  }, [selectedAreaId]);

  const areaAnalysis  = areas.find(a => a.area.id === selectedAreaId) ?? areas[0];
  const consumption   = areaAnalysis.area.monthlyElectricity;

  const PANEL_KW        = 0.4;
  const PANEL_AREA_SQFT = 10;
  const totalCapacity   = panelCount * PANEL_KW;
  const usedAreaSqFt    = panelCount * PANEL_AREA_SQFT;
  const monthlyGenKWh   = calculateSolarGeneration(totalCapacity, irradiation, 30);
  const annualGenKWh    = calculateSolarGeneration(totalCapacity, irradiation, 365);
  const offsetPct       = calculateSolarOffset(monthlyGenKWh, consumption);
  const co2Avoided      = calculateSolarCO2Avoided(monthlyGenKWh);
  const investment      = Math.round(totalCapacity * ASSUMPTIONS.solarCostINRPerKW);
  const annualSavings   = calculateElectricityCost(annualGenKWh);
  const payback         = annualSavings > 0 ? (investment / annualSavings).toFixed(1) : '—';
  const beforeAfter     = calculateBeforeAfterScenario(consumption, monthlyGenKWh);

  const areaCompare = areas.map(a => ({
    name: a.area.name,
    'Current Gen': +(a.area.infrastructure.solar.installedCapacity * irradiation * 30).toFixed(0),
    'Potential':   +calculateSolarGeneration(a.solarPotential.feasibleCapacityKW, irradiation, 30).toFixed(0),
  }));

  return (
    <SolarBackground>
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Configuration + metrics */}
        <div className="glass-card rounded-2xl p-5 mb-4 fade-up">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left — sliders */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Sun className="w-4 h-4 text-amber-500"/> Configuration
                </h2>
                <DemoBadge/>
              </div>
              <div className="mb-4">
                <AreaSelector selectedAreaId={selectedAreaId} onSelect={setSelectedAreaId}/>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-gray-700">Number of Panels</label>
                    <span className="text-lg font-bold text-amber-600">{panelCount}</span>
                  </div>
                  <input type="range" min="1" max="200" step="1" value={panelCount}
                    onChange={e => setPanelCount(+e.target.value)} className="w-full accent-amber-500 mb-2"/>
                  <div className="flex gap-1.5">
                    {[10, 25, 50, 100].map(n => (
                      <button key={n} onClick={() => setPanelCount(n)}
                        className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors ${
                          panelCount === n ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}>{n}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-gray-700">Available Area</label>
                    <span className="text-sm text-gray-500">{availAreaSqFt.toLocaleString()} sq ft</span>
                  </div>
                  <input type="range" min="500" max="30000" step="500" value={availAreaSqFt}
                    onChange={e => setAvailAreaSqFt(+e.target.value)} className="w-full accent-green-600"/>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-gray-700">Irradiation</label>
                    <span className="text-sm text-gray-500">{irradiation} kWh/kW/day</span>
                  </div>
                  <input type="range" min="3.0" max="6.5" step="0.1" value={irradiation}
                    onChange={e => setIrradiation(+e.target.value)} className="w-full accent-yellow-500"/>
                </div>
              </div>
            </div>

            {/* Right — capacity + metrics */}
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #b45309, #f59e0b)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-5 h-5"/>
                  <span className="font-semibold text-sm">Installed Capacity</span>
                  <DemoBadge className="bg-white/20 text-white border-white/30 ml-auto"/>
                </div>
                <div className="text-5xl font-extrabold mb-1">
                  <AnimatedNum value={totalCapacity} decimals={1}/> kW
                </div>
                <div className="text-sm opacity-80">{panelCount} panels × 400W each</div>
                <div className="text-sm opacity-80">Uses {usedAreaSqFt} sq ft of {availAreaSqFt.toLocaleString()} sq ft</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Monthly Gen',    value: monthlyGenKWh,       unit: ' kWh',   decimals: 0, color: 'text-blue-700' },
                  { label: 'Demand Offset',  value: offsetPct,            unit: '%',      decimals: 1, color: 'text-green-700' },
                  { label: 'CO₂ Avoided',   value: co2Avoided / 1000,    unit: ' t/mo',  decimals: 2, color: 'text-emerald-700' },
                  { label: 'Annual Savings', value: annualSavings / 1000, unit: 'k ₹',   decimals: 1, color: 'text-purple-700', prefix: '₹' },
                ].map(s => (
                  <div key={s.label} className="glass-card border border-gray-200 rounded-xl p-3 text-center">
                    <div className={`text-xl font-bold ${s.color}`}>
                      <AnimatedNum value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.unit}/>
                    </div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="glass-card border border-gray-200 rounded-xl p-4 space-y-2">
                <StatRow label="Investment"        value={`₹${(investment / 100000).toFixed(1)}L`}/>
                <StatRow label="Payback Period"    value={payback} unit="years" highlight/>
                <StatRow label="Annual Generation" value={`${(annualGenKWh / 1000).toFixed(1)}k kWh`}/>
              </div>
            </div>
          </div>
        </div>

        {/* Live Roof Simulator — separate card with footer stats */}
        <div className="mb-6 fade-up delay-200">
          <PanelSimulator
            panelCount={panelCount}
            availAreaSqFt={availAreaSqFt}
            totalCapacity={totalCapacity}
            monthlyGen={monthlyGenKWh}
            offsetPct={offsetPct}
            irradiation={irradiation}
            showFooterStats={true}
          />
        </div>

        {/* Before/After */}
        <div className="glass-card rounded-2xl p-6 mb-6 fade-up delay-200">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-green-600"/> Before / After Solar Scenario
            <DemoBadge className="ml-auto"/>
          </h2>
          <BeforeAfterSection
            before={beforeAfter.beforeKWh} after={beforeAfter.afterKWh}
            savedPct={beforeAfter.savedPercent} savedKWh={beforeAfter.savedKWh}
            savedINR={beforeAfter.savedINR}    savedCO2={beforeAfter.savedCO2Kg}
          />
        </div>

        {/* Current vs Potential chart */}
        <div className="glass-card rounded-2xl p-6 fade-up delay-300">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500"/> Current vs Potential · All Areas
          </h2>
          <DemoBadge className="mb-4"/>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={areaCompare} margin={{ left: -10 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }}/>
              <YAxis tick={{ fontSize: 11 }}/>
              <Tooltip formatter={(v: number) => [`${v.toFixed(0)} kWh`, '']}/>
              <Bar dataKey="Current Gen" fill="#f59e0b" radius={[3,3,0,0]}/>
              <Bar dataKey="Potential"   fill="#16a34a" opacity={0.6} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SolarBackground>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOUSEHOLD MEMBER VIEW  — all 9 requested changes applied
// ═══════════════════════════════════════════════════════════════════════════════
function HouseholdSolarView() {
  const { totalKWh } = useHousehold();

  const PANEL_KW        = 0.4;
  const PANEL_AREA_SQFT = 10;
  const IRRADIATION     = ASSUMPTIONS.solarKWhPerKWPerDay;

  const [availAreaSqFt, setAvailAreaSqFt] = useState(1200);
  const [panelCount, setPanelCount]       = useState(10);
  const [sunPreset, setSunPreset]         = useState<'auto' | 'morning' | 'noon' | 'afternoon' | 'evening'>('auto');

  const consumption   = totalKWh;
  const totalCapacity = panelCount * PANEL_KW;
  const usedAreaSqFt  = panelCount * PANEL_AREA_SQFT;
  const monthlyGenKWh = calculateSolarGeneration(totalCapacity, IRRADIATION, 30);
  const annualGenKWh  = calculateSolarGeneration(totalCapacity, IRRADIATION, 365);
  const offsetPct     = calculateSolarOffset(monthlyGenKWh, consumption);
  const investment    = Math.round(totalCapacity * ASSUMPTIONS.solarCostINRPerKW);
  const annualSavings = calculateElectricityCost(annualGenKWh);
  const payback       = annualSavings > 0 ? (investment / annualSavings).toFixed(1) : '—';
  const beforeAfter   = calculateBeforeAfterScenario(consumption, monthlyGenKWh);

  const suggestedPanels = useMemo(() => {
    if (IRRADIATION <= 0) return 0;
    return Math.ceil(consumption / (IRRADIATION * 30) / PANEL_KW);
  }, [consumption]);

  const maxPanelsByArea = Math.floor(availAreaSqFt / PANEL_AREA_SQFT);

  // Sun angle calculation based on preset
  const customSunAngle = useMemo(() => {
    switch (sunPreset) {
      case 'morning':   return 25;
      case 'noon':      return 90;
      case 'afternoon': return 135;
      case 'evening':   return 165;
      default:          return undefined; // auto tick
    }
  }, [sunPreset]);

  // Derived environmental & lifetime calculations
  const dailyGenKWh     = (monthlyGenKWh / 30);
  const co2AvoidedKg    = Math.round(annualGenKWh * 0.82);
  const treesPlanted    = Math.max(1, Math.round(co2AvoidedKg / 21));
  const lifetimeSavings = Math.max(0, (annualSavings * 25) - investment);
  const directSelfUse   = Math.min(monthlyGenKWh, consumption);
  const gridExportUnits = Math.max(0, monthlyGenKWh - consumption);

  return (
    <SolarBackground>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Merged Configuration + Live Roof Simulator — side by side ── */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 fade-up shadow-xl border border-gray-200/80">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2.5 text-base sm:text-lg tracking-wide">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-600 shadow-sm">
                <Sun className="w-5 h-5"/>
              </span>
              Solar Configuration &amp; Live Interactive Roof Simulator
            </h2>
            <DemoBadge/>
          </div>

          {/* Side-by-side Grid: config left (5 cols), simulator + live telemetry right (7 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* ── Left column: inputs & configuration ── */}
            <div className="lg:col-span-5 flex flex-col gap-4 text-sm">

              {/* Energy consumption — linked from My Dashboard */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-blue-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Zap className="w-4 h-4 text-blue-600"/> Household Energy Consumption
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-lg">
                    {consumption.toFixed(0)} kWh/mo
                  </span>
                </div>
                <p className="text-xs text-blue-700/80 leading-relaxed">
                  Linked from appliances in <strong>My Dashboard</strong>. Auto-calculates your solar offset requirements.
                </p>
              </div>

              {/* Available Roof Area */}
              <div className="bg-white/60 border border-gray-200/80 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-gray-800 flex items-center gap-1.5">
                    Available Roof Area
                  </label>
                  <span className="text-sm font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                    {availAreaSqFt.toLocaleString()} sq ft
                  </span>
                </div>
                <input type="range" min="100" max="10000" step="100" value={availAreaSqFt}
                  onChange={e => setAvailAreaSqFt(+e.target.value)} className="w-full accent-green-600 h-2 bg-gray-200 rounded-lg cursor-pointer"/>
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                  <span>Capacity: fits up to <strong>{maxPanelsByArea}</strong> panels</span>
                  <span className="text-gray-400">10 sq ft/panel</span>
                </div>
              </div>

              {/* Number of Panels */}
              <div className="bg-white/60 border border-gray-200/80 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-gray-800">Number of Solar Panels</label>
                  <span className="text-base font-extrabold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                    {panelCount} panels
                  </span>
                </div>
                <input type="range" min="1" max={Math.max(maxPanelsByArea, 1)} step="1" value={panelCount}
                  onChange={e => setPanelCount(+e.target.value)} className="w-full accent-amber-500 h-2 bg-gray-200 rounded-lg cursor-pointer mb-3"/>
                <div className="flex gap-2">
                  {[5, 10, 20, 50].map(n => (
                    <button key={n} onClick={() => setPanelCount(Math.min(n, maxPanelsByArea))}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all shadow-xs ${
                        panelCount === n
                          ? 'bg-amber-500 text-white shadow-amber-200 ring-2 ring-amber-400'
                          : 'bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100/80'
                      }`}>{n} Panels</button>
                  ))}
                </div>
              </div>

              {/* Suggested panels */}
              <div className="rounded-xl border border-amber-300/80 bg-gradient-to-br from-amber-50 to-orange-50/40 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                    <Lightbulb className="w-4 h-4"/>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-900 text-xs uppercase tracking-wider">Recommended Sizing</span>
                      <span className="text-xl font-extrabold text-amber-700">{suggestedPanels} panels</span>
                    </div>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      Matches your <strong>{consumption.toFixed(0)} kWh/mo</strong> demand at <strong>{IRRADIATION} kWh/kW/day</strong> irradiation (~{(suggestedPanels * PANEL_AREA_SQFT).toLocaleString()} sq ft).
                      {suggestedPanels > maxPanelsByArea && (
                        <span className="block mt-1 text-red-600 font-semibold">
                          ⚠ Fits {maxPanelsByArea} panels maximum ({((maxPanelsByArea / suggestedPanels) * 100).toFixed(0)}% coverage).
                        </span>
                      )}
                    </p>
                    <button onClick={() => setPanelCount(Math.min(suggestedPanels, maxPanelsByArea))}
                      className="mt-2.5 text-xs font-bold text-amber-800 bg-amber-200/70 hover:bg-amber-300/80 border border-amber-400/60 px-3.5 py-1.5 rounded-lg transition-all">
                      Apply Suggestion
                    </button>
                  </div>
                </div>
              </div>

              {/* Installed capacity banner */}
              <div className="rounded-2xl p-4 text-white shadow-lg relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)' }}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-100">
                      <Sun className="w-4 h-4"/> Installed Solar Capacity
                    </span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white font-medium">400W High Efficiency</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black mb-1">
                    <AnimatedNum value={totalCapacity} decimals={1}/> kW
                  </div>
                  <div className="text-xs text-amber-100 flex items-center justify-between font-medium">
                    <span>{panelCount} panels · {usedAreaSqFt} sq ft</span>
                    <span>{((usedAreaSqFt / availAreaSqFt) * 100).toFixed(0)}% roof occupied</span>
                  </div>
                </div>
              </div>

              {/* Key metric summary rows */}
              <div className="bg-white/80 border border-gray-200/80 rounded-xl p-3.5 space-y-2 text-sm shadow-sm">
                <StatRow label="Monthly Generation" value={`${monthlyGenKWh.toFixed(0)} kWh`}/>
                <StatRow label="Annual Electricity Savings" value={`₹${(annualSavings / 1000).toFixed(1)}k`}/>
                <StatRow label="Estimated System Investment" value={`₹${(investment / 100000).toFixed(1)} Lakhs`}/>
                <StatRow label="Estimated Payback Period" value={payback} unit="years" highlight/>
                <StatRow label="Annual Solar Output" value={`${(annualGenKWh / 1000).toFixed(1)}k kWh`}/>
                <StatRow label="Grid Demand Offset" value={`${offsetPct.toFixed(1)}%`}/>
              </div>

            </div>

            {/* ── Right column: Enlarged Simulator & Live Telemetry ── */}
            <div className="lg:col-span-7 flex flex-col gap-4">

              {/* Enlarged Panel Simulator */}
              <div className="flex-1 min-h-[420px]">
                <PanelSimulator
                  panelCount={panelCount}
                  availAreaSqFt={availAreaSqFt}
                  totalCapacity={totalCapacity}
                  monthlyGen={monthlyGenKWh}
                  offsetPct={offsetPct}
                  irradiation={IRRADIATION}
                  showFooterStats={true}
                  customSunAngle={customSunAngle}
                />
              </div>

              {/* Live Solar Control & Diagnostics Bar */}
              <div className="glass-card rounded-2xl p-4.5 border border-gray-200/80 bg-white/90 shadow-md space-y-4">
                
                {/* Sun Position / Time of Day Selector */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500"/>
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Interactive Sun Simulator
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl">
                    {(['auto', 'morning', 'noon', 'afternoon', 'evening'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setSunPreset(mode)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all capitalize ${
                          sunPreset === mode
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                        }`}
                      >
                        {mode === 'auto' ? '🔄 Live Orbit' : mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real-time Telemetry & Performance Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl p-3 bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200/60 text-center">
                    <div className="text-xs font-semibold text-amber-700 uppercase">Daily Yield</div>
                    <div className="text-xl font-extrabold text-amber-900 mt-0.5">
                      {dailyGenKWh.toFixed(1)} <span className="text-xs font-bold text-amber-700">kWh/day</span>
                    </div>
                    <div className="text-[11px] text-amber-700/80 mt-0.5">Avg production</div>
                  </div>

                  <div className="rounded-xl p-3 bg-gradient-to-br from-blue-50 to-blue-100/60 border border-blue-200/60 text-center">
                    <div className="text-xs font-semibold text-blue-700 uppercase">Direct Usage</div>
                    <div className="text-xl font-extrabold text-blue-900 mt-0.5">
                      {directSelfUse.toFixed(0)} <span className="text-xs font-bold text-blue-700">kWh/mo</span>
                    </div>
                    <div className="text-[11px] text-blue-700/80 mt-0.5">Self-consumed</div>
                  </div>

                  <div className="rounded-xl p-3 bg-gradient-to-br from-green-50 to-green-100/60 border border-green-200/60 text-center">
                    <div className="text-xs font-semibold text-green-700 uppercase">Grid Export</div>
                    <div className="text-xl font-extrabold text-green-900 mt-0.5">
                      {gridExportUnits > 0 ? gridExportUnits.toFixed(0) : '0'} <span className="text-xs font-bold text-green-700">kWh/mo</span>
                    </div>
                    <div className="text-[11px] text-green-700/80 mt-0.5">Net-meter credit</div>
                  </div>

                  <div className="rounded-xl p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200/60 text-center">
                    <div className="text-xs font-semibold text-emerald-700 uppercase">25-Yr Savings</div>
                    <div className="text-xl font-extrabold text-emerald-900 mt-0.5">
                      ₹{(lifetimeSavings / 100000).toFixed(1)} <span className="text-xs font-bold text-emerald-700">L</span>
                    </div>
                    <div className="text-[11px] text-emerald-700/80 mt-0.5">Net lifetime ROI</div>
                  </div>
                </div>

                {/* Eco & Environmental Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl">
                  <div className="flex items-center gap-2 text-xs">
                    <Leaf className="w-4 h-4 text-emerald-400"/>
                    <span className="text-slate-300">Clean Energy Impact:</span>
                    <strong className="text-emerald-300 font-bold">{co2AvoidedKg.toLocaleString()} kg CO₂ avoided/yr</strong>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <TreePine className="w-4 h-4 text-green-400"/>
                    <span className="text-slate-300">Equivalent to:</span>
                    <strong className="text-green-300 font-bold">~{treesPlanted} Trees planted/yr</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400"/>
                    25-Year Panel Warranty
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Before / After */}
        <div className="glass-card rounded-2xl p-6 fade-up delay-200">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-green-600"/> Before / After Solar Scenario
            <DemoBadge className="ml-auto"/>
          </h2>
          <BeforeAfterSection
            before={beforeAfter.beforeKWh} after={beforeAfter.afterKWh}
            savedPct={beforeAfter.savedPercent} savedKWh={beforeAfter.savedKWh}
            savedINR={beforeAfter.savedINR}    savedCO2={beforeAfter.savedCO2Kg}
          />
        </div>

        {/* Government Solar Schemes */}
        <div className="glass-card rounded-2xl p-6 fade-up delay-300">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500"/> Government Solar Schemes
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Indian government subsidies and programmes for solar adoption — click any scheme to expand eligibility &amp; details.
          </p>
          <div className="space-y-3">
            {SOLAR_SCHEMES.map(scheme => (
              <SolarSchemeCard key={scheme.id} scheme={scheme}/>
            ))}
          </div>
        </div>

      </div>
    </SolarBackground>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTER — branches on role
// ═══════════════════════════════════════════════════════════════════════════════
export default function SolarPage() {
  const { role } = useAuth();
  return role === 'citizen' ? <HouseholdSolarView /> : <VillageSolarView />;
}
