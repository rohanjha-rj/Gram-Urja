import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sun, Zap, Leaf, TrendingDown, ArrowRight } from 'lucide-react';
import {
  calculateSolarCapacity, calculateSolarGeneration, calculateSolarOffset,
  calculateSolarCO2Avoided, calculateBeforeAfterScenario, calculateElectricityCost, ASSUMPTIONS
} from '../calculations/engine';
import { SectionCard, KpiCard, DemoBadge, AssumptionBox, StatRow, ProgressBar } from '../components/ui';
import { getAllAreaAnalyses } from '../services/energyService';
import AreaSelector from '../components/AreaSelector';
import { DEMO_AREAS } from '../data/demoData';

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

// ─── Realistic Panel Simulator ───────────────────────────────────────────────
// Draws a perspective-correct rooftop with properly detailed PV panels:
// aluminium frame, 6×10 monocrystalline cells, busbars, glass sheen layer,
// animated energy sparks, live sun with moving rays, mounting rails.

function RealisticPanel({
  x, y, w, h, active, delay,
}: { x: number; y: number; w: number; h: number; active: boolean; delay: number }) {
  const FRAME = 2;           // aluminium frame thickness
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
      {/* Drop shadow */}
      {active && (
        <rect x={x+3} y={y+4} width={w} height={h} fill="rgba(0,0,0,0.35)" rx="3"/>
      )}
      {/* Aluminium frame */}
      <rect x={x} y={y} width={w} height={h}
        fill={active ? '#94a3b8' : '#334155'} rx="3"/>
      {/* Frame bevels */}
      {active && <>
        <line x1={x+1} y1={y+1} x2={x+w-1} y2={y+1} stroke="#cbd5e1" strokeWidth="1" opacity="0.6"/>
        <line x1={x+1} y1={y+1} x2={x+1} y2={y+h-1} stroke="#cbd5e1" strokeWidth="1" opacity="0.6"/>
        <line x1={x+1} y1={y+h-1} x2={x+w-1} y2={y+h-1} stroke="#475569" strokeWidth="1" opacity="0.8"/>
        <line x1={x+w-1} y1={y+1} x2={x+w-1} y2={y+h-1} stroke="#475569" strokeWidth="1" opacity="0.8"/>
      </>}
      {/* Glass surface — deep blue monocrystalline */}
      <rect x={x+FRAME} y={y+FRAME} width={innerW} height={innerH}
        fill={active ? '#1e3a8a' : '#1e293b'} rx="1"/>
      {/* Individual cells */}
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
                {/* Horizontal busbars */}
                <line x1={cx+1} y1={cy+ch*0.33} x2={cx+cw-1} y2={cy+ch*0.33}
                  stroke="#93c5fd" strokeWidth="0.5" opacity="0.55"/>
                <line x1={cx+1} y1={cy+ch*0.66} x2={cx+cw-1} y2={cy+ch*0.66}
                  stroke="#93c5fd" strokeWidth="0.5" opacity="0.55"/>
                {/* Finger contacts */}
                {[0.2, 0.5, 0.8].map(t => (
                  <line key={t} x1={cx+cw*t} y1={cy+1} x2={cx+cw*t} y2={cy+ch-1}
                    stroke="#bfdbfe" strokeWidth="0.3" opacity="0.35"/>
                ))}
              </>}
            </g>
          );
        })
      )}
      {/* Mounting rail (horizontal, centre) */}
      {active && (
        <rect x={x} y={y + h/2 - 1} width={w} height="2"
          fill="#475569" opacity="0.5"/>
      )}
      {/* Glass sheen — diagonal highlight */}
      {active && (
        <polygon
          points={`${x+FRAME},${y+FRAME} ${x+FRAME+innerW*0.38},${y+FRAME} ${x+FRAME},${y+FRAME+innerH*0.42}`}
          fill="white" opacity="0.06"/>
      )}
      {/* Junction box (bottom centre) */}
      {active && (
        <rect x={x+w/2-3} y={y+h-FRAME-3} width="6" height="4"
          fill="#475569" rx="1"/>
      )}
    </g>
  );
}

function PanelSimulator({
  panelCount, availAreaSqFt, totalCapacity, monthlyGen, offsetPct, irradiation,
}: {
  panelCount: number; availAreaSqFt: number; totalCapacity: number;
  monthlyGen: number; offsetPct: number; irradiation: number;
}) {
  const PANEL_AREA_SQFT = 10;
  const usedArea  = Math.min(panelCount * PANEL_AREA_SQFT, availAreaSqFt);
  const remainingArea = Math.max(0, availAreaSqFt - usedArea);
  const maxDisplay = Math.min(panelCount, 120);

  // ── Layout geometry ────────────────────────────────────────────────────────
  // Full-width SVG with a perspective-tilted roof plane + separate ground strip
  const W = 800;
  const H = 420;

  // Sky / atmosphere band
  const SKY_H = 120;
  // Roof trapezoid corners (perspective tilt — top narrower than bottom)
  const ROOF_TL = { x: 80,  y: SKY_H };
  const ROOF_TR = { x: 720, y: SKY_H };
  const ROOF_BR = { x: 760, y: H - 40 };
  const ROOF_BL = { x: 40,  y: H - 40 };

  // Panel grid — rows of panels laid in perspective
  const COLS = 10;
  const ROWS = Math.ceil(120 / COLS);
  const GRID_LEFT  = 80;
  const GRID_TOP   = SKY_H + 18;
  const GRID_W     = W - 160;
  const GRID_H     = H - SKY_H - 60;
  const PANEL_W    = (GRID_W - (COLS + 1) * 3) / COLS;
  const PANEL_H    = (GRID_H - (ROWS + 1) * 5) / ROWS;
  const GAP_X      = 3;
  const GAP_Y      = 5;

  // ── Sun position (oscillates slowly) ──────────────────────────────────────
  const [sunAngle, setSunAngle] = useState(45);
  const rafRef = useRef<number>();
  const t0 = useRef(Date.now());
  useEffect(() => {
    const tick = () => {
      const elapsed = (Date.now() - t0.current) / 1000;
      setSunAngle(45 + Math.sin(elapsed * 0.08) * 25);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const SUN_R = 110;
  const SUN_CX = 400 + SUN_R * Math.cos((sunAngle - 90) * Math.PI / 180);
  const SUN_CY = SKY_H / 2 + SUN_R * Math.sin((sunAngle - 90) * Math.PI / 180) + 20;

  // ── Energy spark positions (random, stable per panelCount) ─────────────────
  const sparks = useMemo(() =>
    Array.from({ length: Math.min(maxDisplay, 12) }, (_, i) => {
      const col = (i * 7) % COLS;
      const row = Math.floor((i * 7) / COLS) % ROWS;
      const bx = GRID_LEFT + col * (PANEL_W + GAP_X) + PANEL_W / 2;
      const by = GRID_TOP  + row * (PANEL_H + GAP_Y) + PANEL_H / 2;
      return { x: bx, y: by, delay: (i * 0.37) % 2.5 };
    }), [maxDisplay, PANEL_W, PANEL_H]);

  const fillPct = Math.min((usedArea / availAreaSqFt) * 100, 100);

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60"
      style={{ background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)' }}>

      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/8"
        style={{ background: 'rgba(15,23,42,0.8)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"/>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            Live Roof Simulator · {availAreaSqFt.toLocaleString()} sq ft
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-amber-300 font-bold">{totalCapacity.toFixed(1)} kW</span>
          <span className="text-slate-500">|</span>
          <span className="text-green-300 font-bold">{monthlyGen.toFixed(0)} kWh/mo</span>
          <span className="text-slate-500">|</span>
          <span className="text-blue-300 font-bold">{offsetPct.toFixed(1)}% offset</span>
        </div>
      </div>

      {/* ── Main SVG canvas ─────────────────────────────────────────────────── */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: 'block' }}>
        <defs>
          {/* Sky gradient — day/night driven by irradiation */}
          <linearGradient id="ps-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={irradiation > 4 ? '#0ea5e9' : '#1e3a5f'}/>
            <stop offset="100%" stopColor={irradiation > 4 ? '#38bdf8' : '#1e40af'}/>
          </linearGradient>
          {/* Roof tile gradient */}
          <linearGradient id="ps-roof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#78350f"/>
            <stop offset="50%" stopColor="#92400e"/>
            <stop offset="100%" stopColor="#7c2d12"/>
          </linearGradient>
          {/* Sun radial glow */}
          <radialGradient id="ps-sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#fef08a" stopOpacity="0.9"/>
            <stop offset="60%"  stopColor="#fbbf24" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
          </radialGradient>
          {/* Energy flow gradient */}
          <linearGradient id="ps-energy" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#fbbf24" stopOpacity="0"/>
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0.6"/>
          </linearGradient>
          {/* Clip to roof area */}
          <clipPath id="ps-roof-clip">
            <polygon points={`${ROOF_TL.x},${ROOF_TL.y} ${ROOF_TR.x},${ROOF_TR.y} ${ROOF_BR.x},${ROOF_BR.y} ${ROOF_BL.x},${ROOF_BL.y}`}/>
          </clipPath>
          <filter id="ps-glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* ── Sky ── */}
        <rect x="0" y="0" width={W} height={SKY_H} fill="url(#ps-sky)"/>

        {/* ── Atmosphere haze at horizon ── */}
        <rect x="0" y={SKY_H - 20} width={W} height="20"
          fill="url(#ps-sky)" opacity="0.5"/>

        {/* ── Sun glow halo ── */}
        <circle cx={SUN_CX} cy={SUN_CY} r="55" fill="url(#ps-sun-glow)" opacity="0.7"/>

        {/* ── Sun rays (spinning) ── */}
        <g className="sun-spin" style={{ transformOrigin: `${SUN_CX}px ${SUN_CY}px` }}>
          {[0,20,40,60,80,100,120,140,160,180,200,220,240,260,280,300,320,340].map((a, i) => (
            <line key={i}
              x1={SUN_CX + 24 * Math.cos(a * Math.PI / 180)}
              y1={SUN_CY + 24 * Math.sin(a * Math.PI / 180)}
              x2={SUN_CX + 36 * Math.cos(a * Math.PI / 180)}
              y2={SUN_CY + 36 * Math.sin(a * Math.PI / 180)}
              stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
          ))}
        </g>
        {/* Sun body */}
        <circle cx={SUN_CX} cy={SUN_CY} r="20" fill="#fef08a" className="solar-glow"/>
        <circle cx={SUN_CX} cy={SUN_CY} r="14" fill="#fbbf24"/>
        <circle cx={SUN_CX} cy={SUN_CY} r="8"  fill="#f59e0b"/>

        {/* Irradiation label */}
        <text x={SUN_CX + 28} y={SUN_CY - 8}
          fill="#fef08a" fontSize="9" fontWeight="700" opacity="0.85">
          {irradiation} kWh/kW·day
        </text>

        {/* ── Clouds (if low irradiation) ── */}
        {irradiation < 4.5 && (
          <g opacity={0.5 - (irradiation - 3) * 0.2} className="gu-cloud-1">
            <ellipse cx="220" cy="55" rx="55" ry="20" fill="white"/>
            <ellipse cx="195" cy="52" rx="32" ry="16" fill="white"/>
            <ellipse cx="248" cy="50" rx="26" ry="13" fill="white"/>
          </g>
        )}

        {/* ── Roof base (terracotta tiles) ── */}
        <polygon
          points={`${ROOF_TL.x},${ROOF_TL.y} ${ROOF_TR.x},${ROOF_TR.y} ${ROOF_BR.x},${ROOF_BR.y} ${ROOF_BL.x},${ROOF_BL.y}`}
          fill="url(#ps-roof)"/>
        {/* Tile texture lines */}
        {Array.from({ length: 8 }, (_, i) => {
          const ty = ROOF_TL.y + (i + 1) * ((H - 40 - SKY_H) / 9);
          const leftX = ROOF_TL.x + (ROOF_BL.x - ROOF_TL.x) * ((i + 1) / 9);
          const rightX = ROOF_TR.x + (ROOF_BR.x - ROOF_TR.x) * ((i + 1) / 9);
          return <line key={i} x1={leftX} y1={ty} x2={rightX} y2={ty}
            stroke="#7c2d12" strokeWidth="1.5" opacity="0.4"/>;
        })}

        {/* ── Mounting rails (horizontal, 2 per bay) ── */}
        {Array.from({ length: ROWS }, (_, row) => {
          const y1 = GRID_TOP + row * (PANEL_H + GAP_Y) + PANEL_H * 0.3;
          const y2 = GRID_TOP + row * (PANEL_H + GAP_Y) + PANEL_H * 0.7;
          return (
            <g key={row}>
              <line x1={GRID_LEFT - 10} y1={y1} x2={GRID_LEFT + GRID_W + 10} y2={y1}
                stroke="#64748b" strokeWidth="3" opacity="0.5"/>
              <line x1={GRID_LEFT - 10} y1={y2} x2={GRID_LEFT + GRID_W + 10} y2={y2}
                stroke="#64748b" strokeWidth="3" opacity="0.5"/>
            </g>
          );
        })}

        {/* ── Solar panels ── */}
        {Array.from({ length: Math.min(ROWS * COLS, 120) }, (_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const px = GRID_LEFT + col * (PANEL_W + GAP_X);
          const py = GRID_TOP  + row * (PANEL_H + GAP_Y);
          const active = i < maxDisplay;
          return (
            <RealisticPanel
              key={i}
              x={px} y={py}
              w={PANEL_W} h={PANEL_H}
              active={active}
              delay={i * 40}
            />
          );
        })}

        {/* ── Energy sparks from active panels → inverter ── */}
        {maxDisplay > 0 && sparks.map((sp, i) => (
          <circle key={i} cx={sp.x} cy={sp.y} r="3"
            fill="#fbbf24" filter="url(#ps-glow)"
            style={{
              animation: `guSparkTravel 2.2s ease-in-out ${sp.delay}s infinite`,
              transformOrigin: `${sp.x}px ${sp.y}px`,
            }}/>
        ))}

        {/* ── Inverter box (bottom right) ── */}
        <g transform={`translate(${W - 110}, ${H - 80})`}>
          <rect width="80" height="44" fill="#1e293b" stroke="#334155" strokeWidth="1.5" rx="6"/>
          <rect x="6" y="6" width="68" height="32" fill="#0f172a" rx="3"/>
          <text x="40" y="19" textAnchor="middle" fill="#4ade80" fontSize="7" fontWeight="700">INVERTER</text>
          {/* LED indicator */}
          <circle cx="40" cy="29" r="3" fill="#4ade80" className="solar-glow"/>
          <text x="40" y="38" textAnchor="middle" fill="#94a3b8" fontSize="6">{totalCapacity.toFixed(1)} kW AC</text>
          {/* Cable to house */}
          <line x1="-30" y1="22" x2="0" y2="22" stroke="#fbbf24" strokeWidth="2"
            strokeDasharray="6 3" className="energy-flow" opacity="0.7"/>
        </g>

        {/* ── House (far right) ── */}
        <g transform={`translate(${W - 200}, ${H - 95})`}>
          <rect x="0" y="30" width="50" height="40" fill="#fefce8" stroke="#d1d5db" strokeWidth="1.5" rx="2"/>
          <polygon points="-5,30 55,30 25,4" fill="#16a34a"/>
          {/* Solar-powered glow effect inside house */}
          {maxDisplay > 0 && (
            <rect x="3" y="33" width="44" height="34" fill="#fbbf24" rx="1" opacity="0.06"
              style={{ animation: 'glow 2s ease-in-out infinite' }}/>
          )}
          <rect x="18" y="46" width="14" height="22" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" rx="1"/>
          <rect x="4" y="37" width="11" height="9" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
          <rect x="35" y="37" width="11" height="9" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
          <text x="25" y="72" textAnchor="middle" fill="#166534" fontSize="6" fontWeight="700">✓ POWERED</text>
        </g>

        {/* ── Sun → panel energy ray ── */}
        {maxDisplay > 0 && (
          <line
            x1={SUN_CX} y1={SUN_CY}
            x2={GRID_LEFT + GRID_W / 2} y2={GRID_TOP + PANEL_H}
            stroke="#fbbf24" strokeWidth="1.5"
            strokeDasharray="10 6" className="energy-flow" opacity="0.35"/>
        )}

        {/* ── Ground strip ── */}
        <rect x="0" y={H - 40} width={W} height="40" fill="#166534" opacity="0.7"/>
        <rect x="0" y={H - 40} width={W} height="6"  fill="#15803d"/>

        {/* ── Area fill progress bar ── */}
        <rect x="40" y={H - 28} width={W - 80} height="8" fill="#0f172a" rx="4"/>
        <rect x="40" y={H - 28}
          width={Math.max(8, ((fillPct / 100) * (W - 80)))} height="8"
          fill={fillPct < 50 ? '#16a34a' : fillPct < 80 ? '#f59e0b' : '#ef4444'} rx="4"
          style={{ transition: 'width 0.5s ease' }}/>
        <text x="44" y={H - 32} fill="#94a3b8" fontSize="8">Roof coverage</text>
        <text x={W - 44} y={H - 32} textAnchor="end" fill="#94a3b8" fontSize="8">
          {fillPct.toFixed(0)}% of {availAreaSqFt.toLocaleString()} sq ft
        </text>

        {/* ── Panel count label ── */}
        <text x={W / 2} y={GRID_TOP - 4} textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="600">
          {maxDisplay} / {Math.min(ROWS * COLS, 120)} panels shown  ·  {panelCount} total configured
        </text>
      </svg>

      {/* ── Stats footer ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-4 border-t border-white/8">
        {[
          { label: 'Panels Installed', value: panelCount.toString(), unit: 'panels', color: 'text-amber-300' },
          { label: 'Area Used',        value: usedArea.toLocaleString(), unit: 'sq ft',  color: 'text-blue-300'  },
          { label: 'Area Remaining',   value: remainingArea.toLocaleString(), unit: 'sq ft', color: 'text-slate-400' },
          { label: 'Capacity',         value: totalCapacity.toFixed(1), unit: 'kW',     color: 'text-green-300' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3 text-center"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className={`text-xl font-extrabold tabular-nums ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 font-medium">{s.unit}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Before/After with animated counters ─────────────────────────────────────
function BeforeAfterSection({ before, after, savedPct, savedKWh, savedINR, savedCO2 }: {
  before: number; after: number; savedPct: number; savedKWh: number; savedINR: number; savedCO2: number;
}) {
  const animBefore = useCountUp(before / 1000);
  const animAfter  = useCountUp(after / 1000);
  const animSaved  = useCountUp(savedINR / 1000);
  const animCO2    = useCountUp(savedCO2 / 1000);

  return (
    <div className="grid sm:grid-cols-3 gap-4 items-center">
      {/* Before */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 text-center">
        <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">BEFORE Solar</div>
        <div className="text-4xl font-extrabold text-red-700 mb-1">{animBefore.toFixed(1)}k</div>
        <div className="text-sm text-red-500">kWh/month</div>
        <div className="text-xs text-red-400 mt-1">
          ₹{(calculateElectricityCost(before) / 1000).toFixed(1)}k/month
        </div>
      </div>

      {/* Arrow */}
      <div className="text-center">
        <div className="inline-flex flex-col items-center gap-2">
          <div className="text-4xl font-extrabold text-green-600">–{savedPct}%</div>
          <div className="flex items-center gap-2 text-green-600">
            <div className="h-0.5 w-16 bg-green-400" />
            <ArrowRight className="w-5 h-5" />
          </div>
          <div className="text-sm font-semibold text-green-700">{(savedKWh / 1000).toFixed(1)}k kWh saved</div>
          <div className="text-sm text-emerald-600">₹{animSaved.toFixed(1)}k saved/mo</div>
          <div className="text-xs text-gray-500">{animCO2.toFixed(2)} t CO₂ avoided</div>
        </div>
      </div>

      {/* After */}
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
        <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">AFTER Solar</div>
        <div className="text-4xl font-extrabold text-green-700 mb-1">{animAfter.toFixed(1)}k</div>
        <div className="text-sm text-green-500">kWh/month</div>
        <div className="text-xs text-green-400 mt-1">
          ₹{(calculateElectricityCost(after) / 1000).toFixed(1)}k/month
        </div>
      </div>
    </div>
  );
}

export default function SolarPage() {
  const [selectedAreaId, setSelectedAreaId] = useState(areas[0].area.id);
  const [panelCount, setPanelCount] = useState(25);
  const [availAreaSqFt, setAvailAreaSqFt] = useState(8000);
  const [usableRoof, setUsableRoof] = useState(70);
  const [shadingFactor, setShadingFactor] = useState(90);
  const [irradiation, setIrradiation] = useState<number>(ASSUMPTIONS.solarKWhPerKWPerDay);

  // Sync area data on area change
  useEffect(() => {
    const area = DEMO_AREAS.find((a) => a.id === selectedAreaId);
    if (area) {
      const roof = area.infrastructure.solar.roofAreaSqFt ?? 0;
      const land = area.infrastructure.solar.openLandSqFt ?? 0;
      setAvailAreaSqFt(roof + land);
    }
  }, [selectedAreaId]);

  const areaAnalysis = areas.find((a) => a.area.id === selectedAreaId) ?? areas[0];
  const consumption = areaAnalysis.area.monthlyElectricity;

  // Calculate from panel count
  const PANEL_KW = 0.4; // 400W per panel
  const PANEL_AREA_SQFT = 10;
  const totalCapacity = panelCount * PANEL_KW;
  const usedAreaSqFt = panelCount * PANEL_AREA_SQFT;
  const monthlyGenKWh = calculateSolarGeneration(totalCapacity, irradiation, 30);
  const annualGenKWh = calculateSolarGeneration(totalCapacity, irradiation, 365);
  const offsetPct = calculateSolarOffset(monthlyGenKWh, consumption);
  const co2Avoided = calculateSolarCO2Avoided(monthlyGenKWh);
  const investment = Math.round(totalCapacity * ASSUMPTIONS.solarCostINRPerKW);
  const annualSavings = calculateElectricityCost(annualGenKWh);
  const payback = annualSavings > 0 ? (investment / annualSavings).toFixed(1) : '—';
  const beforeAfter = calculateBeforeAfterScenario(consumption, monthlyGenKWh);

  const areaCompare = areas.map((a) => ({
    name: a.area.name,
    'Current Gen': +(a.area.infrastructure.solar.installedCapacity * irradiation * 30).toFixed(0),
    'Potential': +calculateSolarGeneration(a.solarPotential.feasibleCapacityKW, irradiation, 30).toFixed(0),
  }));

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(180deg, #78350f 0%, #b45309 12%, #f59e0b 25%, #1e3a5f 55%, #0f172a 100%)'
    }}>
      {/* Animated sun rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl pointer-events-none">
        <svg viewBox="0 0 400 120" className="w-full opacity-30">
          <g className="sun-spin" style={{ transformOrigin: '200px 30px' }}>
            {Array.from({ length: 16 }, (_, i) => i * 22.5).map((a, i) => (
              <line key={i}
                x1={200 + 40 * Math.cos(a * Math.PI / 180)}
                y1={30 + 40 * Math.sin(a * Math.PI / 180)}
                x2={200 + 70 * Math.cos(a * Math.PI / 180)}
                y2={30 + 70 * Math.sin(a * Math.PI / 180)}
                stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
            ))}
          </g>
          <circle cx="200" cy="30" r="30" fill="#fbbf24" className="solar-glow" />
          <circle cx="200" cy="30" r="20" fill="#f59e0b" />
        </svg>
      </div>

      {/* Drifting clouds */}
      <div className="absolute top-8 left-10 opacity-20 pointer-events-none" style={{ animation: 'waveDrift 20s linear infinite' }}>
        <svg viewBox="0 0 120 40" width="120"><ellipse cx="60" cy="25" rx="50" ry="18" fill="white"/><ellipse cx="40" cy="22" rx="30" ry="14" fill="white"/><ellipse cx="80" cy="20" rx="25" ry="12" fill="white"/></svg>
      </div>
      <div className="absolute top-16 right-20 opacity-15 pointer-events-none" style={{ animation: 'waveDrift 30s linear infinite reverse' }}>
        <svg viewBox="0 0 80 30" width="80"><ellipse cx="40" cy="18" rx="35" ry="12" fill="white"/><ellipse cx="25" cy="15" rx="20" ry="10" fill="white"/></svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* ── Row 1: Configuration (left) + Installed Capacity / metrics (right) ── */}
        <div className="glass-card rounded-2xl p-5 mb-4 fade-up">
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Left — sliders */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Sun className="w-4 h-4 text-amber-500" /> Configuration
                </h2>
                <DemoBadge />
              </div>
              <div className="mb-4">
                <AreaSelector selectedAreaId={selectedAreaId} onSelect={setSelectedAreaId} />
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-gray-700">Number of Panels</label>
                    <span className="text-lg font-bold text-amber-600">{panelCount}</span>
                  </div>
                  <input type="range" min="1" max="200" step="1" value={panelCount}
                    onChange={(e) => setPanelCount(+e.target.value)}
                    className="w-full accent-amber-500 mb-2" />
                  <div className="flex gap-1.5">
                    {[10, 25, 50, 100].map((n) => (
                      <button key={n} onClick={() => setPanelCount(n)}
                        className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors ${
                          panelCount === n
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >{n}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-gray-700">Available Area</label>
                    <span className="text-sm text-gray-500">{availAreaSqFt.toLocaleString()} sq ft</span>
                  </div>
                  <input type="range" min="500" max="30000" step="500" value={availAreaSqFt}
                    onChange={(e) => setAvailAreaSqFt(+e.target.value)}
                    className="w-full accent-green-600" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-gray-700">Irradiation</label>
                    <span className="text-sm text-gray-500">{irradiation} kWh/kW/day</span>
                  </div>
                  <input type="range" min="3.0" max="6.5" step="0.1" value={irradiation}
                    onChange={(e) => setIrradiation(+e.target.value)}
                    className="w-full accent-yellow-500" />
                </div>
              </div>
            </div>

            {/* Right — Installed Capacity + metrics */}
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #b45309, #f59e0b)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-5 h-5" />
                  <span className="font-semibold text-sm">Installed Capacity</span>
                  <DemoBadge className="bg-white/20 text-white border-white/30 ml-auto" />
                </div>
                <div className="text-5xl font-extrabold mb-1">
                  <AnimatedNum value={totalCapacity} decimals={1} /> kW
                </div>
                <div className="text-sm opacity-80">{panelCount} panels × 400W each</div>
                <div className="text-sm opacity-80">Uses {usedAreaSqFt} sq ft of {availAreaSqFt.toLocaleString()} sq ft</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Monthly Gen', value: monthlyGenKWh, unit: ' kWh', decimals: 0, color: 'text-blue-700' },
                  { label: 'Demand Offset', value: offsetPct, unit: '%', decimals: 1, color: 'text-green-700' },
                  { label: 'CO₂ Avoided', value: co2Avoided / 1000, unit: ' t/mo', decimals: 2, color: 'text-emerald-700' },
                  { label: 'Annual Savings', value: annualSavings / 1000, unit: 'k ₹', decimals: 1, color: 'text-purple-700', prefix: '₹' },
                ].map((s) => (
                  <div key={s.label} className="glass-card border border-gray-200 rounded-xl p-3 text-center">
                    <div className={`text-xl font-bold ${s.color}`}>
                      <AnimatedNum value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.unit} />
                    </div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="glass-card border border-gray-200 rounded-xl p-4 space-y-2">
                <StatRow label="Investment" value={`₹${(investment / 100000).toFixed(1)}L`} />
                <StatRow label="Payback Period" value={payback} unit="years" highlight />
                <StatRow label="Annual Generation" value={`${(annualGenKWh / 1000).toFixed(1)}k kWh`} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Full-width Realistic Panel Simulator (directly below) ── */}
        <div className="mb-6 fade-up delay-200">
          <PanelSimulator
            panelCount={panelCount}
            availAreaSqFt={availAreaSqFt}
            totalCapacity={totalCapacity}
            monthlyGen={monthlyGenKWh}
            offsetPct={offsetPct}
            irradiation={irradiation}
          />
        </div>

        {/* Before/After */}
        <div className="glass-card rounded-2xl p-6 mb-6 fade-up delay-200">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-green-600" />
            Before / After Solar Scenario
            <DemoBadge className="ml-auto" />
          </h2>
          <BeforeAfterSection
            before={beforeAfter.beforeKWh}
            after={beforeAfter.afterKWh}
            savedPct={beforeAfter.savedPercent}
            savedKWh={beforeAfter.savedKWh}
            savedINR={beforeAfter.savedINR}
            savedCO2={beforeAfter.savedCO2Kg}
          />
        </div>

        {/* Area comparison */}
        <div className="glass-card rounded-2xl p-6 fade-up delay-300">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" /> Current vs Potential · All Areas
          </h2>
          <DemoBadge className="mb-4" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={areaCompare} margin={{ left: -10 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v.toFixed(0)} kWh`, '']} />
              <Bar dataKey="Current Gen" fill="#f59e0b" radius={[3,3,0,0]} />
              <Bar dataKey="Potential" fill="#16a34a" opacity={0.6} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
