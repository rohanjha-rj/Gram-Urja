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

// ─── Animated SVG Panel Simulator ────────────────────────────────────────────
function PanelSimulator({
  panelCount, availAreaSqFt, totalCapacity, monthlyGen, offsetPct
}: {
  panelCount: number; availAreaSqFt: number; totalCapacity: number;
  monthlyGen: number; offsetPct: number;
}) {
  const PANEL_AREA_SQFT = 10;
  const usedArea = Math.min(panelCount * PANEL_AREA_SQFT, availAreaSqFt);
  const remainingArea = Math.max(0, availAreaSqFt - usedArea);
  const maxDisplay = Math.min(panelCount, 100);

  // SVG panel grid
  const SVG_W = 540;
  const SVG_H = 200;
  const COLS = 10;
  const PANEL_W = 46;
  const PANEL_H = 30;
  const GAP = 4;
  const GRID_X = 20;
  const GRID_Y = 30;
  const ROWS = Math.ceil(100 / COLS);

  const panels = Array.from({ length: 100 }, (_, i) => i < maxDisplay);

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl">
      {/* Animated sun header */}
      <div className="relative h-16 flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(to bottom, #1e3a5f, #1e40af)' }}>
        <svg viewBox="0 0 540 64" className="absolute inset-0 w-full h-full">
          {/* Spinning outer ring */}
          <g className="sun-spin" style={{ transformOrigin: '490px 32px' }}>
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((a, i) => (
              <line key={i}
                x1={490 + 22 * Math.cos(a * Math.PI / 180)}
                y1={32 + 22 * Math.sin(a * Math.PI / 180)}
                x2={490 + 28 * Math.cos(a * Math.PI / 180)}
                y2={32 + 28 * Math.sin(a * Math.PI / 180)}
                stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            ))}
          </g>
          <circle cx="490" cy="32" r="16" fill="#fbbf24" className="solar-glow" />
          <circle cx="490" cy="32" r="10" fill="#f59e0b" />
          {/* Energy flow lines */}
          <line x1="462" y1="32" x2="20" y2="32" stroke="#fbbf24" strokeWidth="1.5"
            strokeDasharray="8 4" className="energy-flow" opacity="0.5" />
          <text x="20" y="20" fill="#93c5fd" fontSize="10" fontWeight="600">☀️ Solar Array — Roof Simulator</text>
        </svg>
      </div>

      {/* Panel grid */}
      <div className="p-4">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
          {/* Roof background */}
          <rect x="10" y="10" width={SVG_W - 20} height={SVG_H - 20} fill="#1e293b" rx="8" />
          <rect x="10" y="10" width={SVG_W - 20} height={SVG_H - 20} fill="none" stroke="#334155" strokeWidth="1" rx="8" />
          <text x="20" y="26" fill="#64748b" fontSize="9">Available Roof / Land Area · {availAreaSqFt.toLocaleString()} sq ft</text>

          {/* Panels */}
          {panels.map((active, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const x = GRID_X + col * (PANEL_W + GAP);
            const y = GRID_Y + row * (PANEL_H + GAP);
            return (
              <g key={i}>
                <rect
                  x={x} y={y} width={PANEL_W} height={PANEL_H}
                  fill={active ? '#1d4ed8' : '#1e293b'}
                  stroke={active ? '#60a5fa' : '#334155'}
                  strokeWidth={active ? 1.5 : 0.5}
                  rx="2"
                  style={{
                    opacity: active ? 1 : 0.3,
                    animation: active ? `panelAppear 0.3s ease-out ${Math.min(i * 50, 2000)}ms both` : 'none',
                  }}
                />
                {active && (
                  <>
                    {/* Panel grid lines */}
                    <line x1={x+15} y1={y+3} x2={x+15} y2={y+PANEL_H-3} stroke="#3b82f6" strokeWidth="0.5" opacity="0.5" />
                    <line x1={x+30} y1={y+3} x2={x+30} y2={y+PANEL_H-3} stroke="#3b82f6" strokeWidth="0.5" opacity="0.5" />
                    <line x1={x+3} y1={y+12} x2={x+PANEL_W-3} y2={y+12} stroke="#3b82f6" strokeWidth="0.5" opacity="0.5" />
                    {/* Shine */}
                    <circle cx={x+8} cy={y+8} r="2.5" fill="#93c5fd" opacity="0.6"
                      style={{ animation: `glow ${1.5 + (i % 5) * 0.3}s ease-in-out infinite` }} />
                  </>
                )}
              </g>
            );
          })}

          {/* House icon at right */}
          <g transform="translate(510, 80)">
            <polygon points="15,0 30,15 0,15" fill="#16a34a" opacity="0.8" />
            <rect x="3" y="15" width="24" height="18" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
            <rect x="10" y="22" width="10" height="11" fill="#bbf7d0" stroke="#16a34a" strokeWidth="0.5" />
            {/* Energy flow to house */}
            <line x1="-70" y1="12" x2="0" y2="12" stroke="#fbbf24" strokeWidth="1.5"
              strokeDasharray="5 3" className="energy-flow" opacity="0.7" />
          </g>

          {/* Area bar */}
          <rect x="10" y={SVG_H - 14} width={SVG_W - 20} height="6" fill="#1e293b" rx="3" />
          <rect x="10" y={SVG_H - 14} width={Math.min(((usedArea / availAreaSqFt) * (SVG_W - 20)), SVG_W - 20)} height="6" fill="#16a34a" rx="3" />
          <text x="20" y={SVG_H - 16} fill="#64748b" fontSize="8">Area used</text>
          <text x={SVG_W - 80} y={SVG_H - 16} fill="#64748b" fontSize="8">
            {((usedArea / availAreaSqFt) * 100).toFixed(0)}% filled
          </text>
        </svg>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 px-4 pb-4">
        {[
          { label: 'Area Used', value: usedArea.toLocaleString(), unit: 'sq ft', color: 'text-blue-300' },
          { label: 'Remaining', value: remainingArea.toLocaleString(), unit: 'sq ft', color: 'text-gray-400' },
          { label: 'Installed', value: totalCapacity.toFixed(1), unit: 'kW', color: 'text-amber-300' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-700/50 rounded-xl p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400">{s.unit}</div>
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
        <div className="glass-card rounded-2xl p-5 mb-6 fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sun className="w-6 h-6 text-amber-500" /> Solar Potential Calculator
              </h1>
              <p className="text-gray-500 text-sm mt-1">Interactive panel simulator · Before/after analysis · Area comparison</p>
            </div>
            <DemoBadge />
          </div>
          <div className="mt-4">
            <AreaSelector selectedAreaId={selectedAreaId} onSelect={setSelectedAreaId} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Input controls */}
          <div className="glass-card rounded-2xl p-5 fade-up delay-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Sun className="w-4 h-4 text-amber-500" /> Configuration
            </h2>
            <div className="space-y-4 text-sm">
              {/* Panel count with presets */}
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
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
              <div className="font-semibold mb-1">📐 Planning Assumptions</div>
              <div>1 panel = 400W = 10 sq ft</div>
              <div>1 kW generates ~{irradiation} kWh/day</div>
              <div>Cost: ₹60,000/kW (est.)</div>
              <div className="text-amber-600 italic">Demo values — replace with actual data</div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4 fade-up delay-200">
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

          {/* Panel simulator */}
          <div className="fade-up delay-300">
            <PanelSimulator
              panelCount={panelCount}
              availAreaSqFt={availAreaSqFt}
              totalCapacity={totalCapacity}
              monthlyGen={monthlyGenKWh}
              offsetPct={offsetPct}
            />
          </div>
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
