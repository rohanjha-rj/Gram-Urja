import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Droplets, Zap, Leaf } from 'lucide-react';
import {
  calculateWaterDemand, calculateRainwaterHarvesting, calculatePumpingEnergy,
  calculateWaterSavings, ASSUMPTIONS
} from '../calculations/engine';
import { SectionCard, KpiCard, DemoBadge, AssumptionBox, StatRow, ProgressBar } from '../components/ui';
import { getAllAreaAnalyses } from '../services/energyService';
import AreaSelector from '../components/AreaSelector';
import { DEMO_AREAS } from '../data/demoData';

const areas = getAllAreaAnalyses();

const RAINFALL_MONTHS = [
  { month: 'Jan', mm: 10 }, { month: 'Feb', mm: 12 }, { month: 'Mar', mm: 15 },
  { month: 'Apr', mm: 18 }, { month: 'May', mm: 30 }, { month: 'Jun', mm: 120 },
  { month: 'Jul', mm: 200 }, { month: 'Aug', mm: 180 }, { month: 'Sep', mm: 130 },
  { month: 'Oct', mm: 60 }, { month: 'Nov', mm: 20 }, { month: 'Dec', mm: 5 },
];

export default function WaterPage() {
  const [selectedAreaId, setSelectedAreaId] = useState('suryapur');
  const [population, setPopulation] = useState(1200);
  const [lpcd, setLpcd] = useState<number>(ASSUMPTIONS.waterLpcdRural);
  const [catchmentAreaM2, setCatchmentAreaM2] = useState(500);
  const [rainfallMmPerYear, setRainfallMmPerYear] = useState(800);
  const [runoffCoeff, setRunoffCoeff] = useState<number>(ASSUMPTIONS.rainwaterRunoffCoeff * 100);
  const [pumpCountInput, setPumpCount] = useState(4);
  const [pumpPowerKW, setPumpPowerKW] = useState(1.5);
  const [pumpHoursPerDay, setPumpHoursPerDay] = useState(6);
  const [leakagePct, setLeakagePct] = useState(15);

  // Sync area data
  useEffect(() => {
    const area = DEMO_AREAS.find((a) => a.id === selectedAreaId);
    if (area) {
      setPopulation(area.population);
      setRainfallMmPerYear(area.rainfallMmPerYear);
      setCatchmentAreaM2(area.rainwaterCatchmentAreaM2);
      setPumpCount(area.infrastructure.waterPumps.count);
      setPumpPowerKW(area.infrastructure.waterPumps.powerEach);
      setPumpHoursPerDay(area.infrastructure.waterPumps.hoursPerDay);
    }
  }, [selectedAreaId]);

  const dailyDemand = calculateWaterDemand(population, lpcd);
  const monthlyDemand = dailyDemand * 30;
  const rainwaterAnnual = calculateRainwaterHarvesting(rainfallMmPerYear, catchmentAreaM2, runoffCoeff / 100);
  const rainwaterMonthly = Math.round(rainwaterAnnual / 12);
  const rainwaterOffsetPct = Math.min(100, +(rainwaterMonthly / monthlyDemand * 100).toFixed(1));
  const pumpEnergyPerMonth = pumpCountInput * pumpPowerKW * pumpHoursPerDay * 30;
  const leakageLossDaily = dailyDemand * leakagePct / 100;
  const withoutLeakageDemand = dailyDemand * (1 - leakagePct / 100);
  const leakageSavings = leakageLossDaily * 30;

  const monthlyRainfall = RAINFALL_MONTHS.map((m) => ({
    ...m,
    harvested: Math.round((m.mm / 1000) * catchmentAreaM2 * 1000 * runoffCoeff / 100),
  }));

  // Area water comparison
  const areaWater = areas.map((a) => ({
    name: a.area.name,
    'Daily Demand (kL)': +(a.waterAnalysis.dailyDemandLitres / 1000).toFixed(1),
    'Rainwater (kL/mo)': +(a.waterAnalysis.rainwaterPotentialLitresPerYear / 12000).toFixed(1),
  }));

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(180deg, #0c4a6e 0%, #0369a1 35%, #0284c7 65%, #075985 100%)' }}>
      {/* Animated waves */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden h-32">
        <svg viewBox="0 0 1200 80" className="wave-drift absolute bottom-0" style={{ width: '200%' }} preserveAspectRatio="none">
          <path d="M0,40 C200,10 400,70 600,40 C800,10 1000,70 1200,40 L1200,80 L0,80 Z" fill="rgba(255,255,255,0.06)" />
          <path d="M0,50 C200,20 400,80 600,50 C800,20 1000,80 1200,50 L1200,80 L0,80 Z" fill="rgba(255,255,255,0.04)" />
        </svg>
      </div>
      {/* Floating droplets */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[10, 30, 55, 75, 85].map((left, i) => (
          <div key={i} className="absolute droplet-float text-blue-200 text-lg"
            style={{ left: `${left}%`, bottom: '15%', animationDelay: `${i * 0.8}s`, animationDuration: `${3 + i * 0.5}s` }}>
            💧
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
      <div className="glass-card rounded-2xl p-5 mb-6 fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Droplets className="w-6 h-6 text-cyan-500" /> Water Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">Demand analysis · Rainwater harvesting · Pump energy</p>
          </div>
          <DemoBadge />
        </div>
        <div className="mt-4">
          <AreaSelector selectedAreaId={selectedAreaId} onSelect={setSelectedAreaId} />
        </div>
      </div>

      {/* Input sliders */}
      <SectionCard title="Configuration" subtitle="Adjust parameters to model your area" className="mb-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Population ({population.toLocaleString()})</label>
            <input type="range" min="100" max="5000" step="50" value={population}
              onChange={(e) => setPopulation(+e.target.value)} className="w-full accent-cyan-600" />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">LPCD ({lpcd} L/person/day)</label>
            <input type="range" min="30" max="135" step="5" value={lpcd}
              onChange={(e) => setLpcd(+e.target.value)} className="w-full accent-cyan-600" />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Catchment Area ({catchmentAreaM2} m²)</label>
            <input type="range" min="50" max="2000" step="50" value={catchmentAreaM2}
              onChange={(e) => setCatchmentAreaM2(+e.target.value)} className="w-full accent-cyan-600" />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Annual Rainfall ({rainfallMmPerYear} mm)</label>
            <input type="range" min="200" max="2000" step="50" value={rainfallMmPerYear}
              onChange={(e) => setRainfallMmPerYear(+e.target.value)} className="w-full accent-cyan-600" />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Runoff Efficiency ({runoffCoeff}%)</label>
            <input type="range" min="40" max="95" step="5" value={runoffCoeff}
              onChange={(e) => setRunoffCoeff(+e.target.value)} className="w-full accent-cyan-600" />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Pump Count ({pumpCountInput})</label>
            <input type="range" min="1" max="15" step="1" value={pumpCountInput}
              onChange={(e) => setPumpCount(+e.target.value)} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Pump Power ({pumpPowerKW} kW each)</label>
            <input type="range" min="0.5" max="5" step="0.5" value={pumpPowerKW}
              onChange={(e) => setPumpPowerKW(+e.target.value)} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Distribution Loss ({leakagePct}%)</label>
            <input type="range" min="0" max="40" step="1" value={leakagePct}
              onChange={(e) => setLeakagePct(+e.target.value)} className="w-full accent-red-500" />
          </div>
        </div>
      </SectionCard>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Daily Water Demand" value={(dailyDemand / 1000).toFixed(1)} unit="kL/day"
          icon={<Droplets className="w-5 h-5 text-cyan-600" />} iconBg="bg-cyan-100"
          formula={`Population (${population}) × LPCD (${lpcd} L/person/day)`}
          source="WHO/GoI standard" dataType="Estimated" />
        <KpiCard title="Rainwater Offset" value={rainwaterOffsetPct.toFixed(1)} unit="%"
          icon={<Droplets className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-100"
          formula="Rainwater annual ÷ 12 ÷ monthly demand × 100"
          source="Demo" dataType="Calculated" />
        <KpiCard title="Pump Energy" value={pumpEnergyPerMonth.toFixed(0)} unit="kWh/mo"
          icon={<Zap className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-100"
          formula={`${pumpCountInput} pumps × ${pumpPowerKW} kW × ${pumpHoursPerDay} hrs × 30`}
          source="Demo" dataType="Estimated" />
        <KpiCard title="Distribution Loss" value={(leakageLossDaily / 1000).toFixed(1)} unit="kL/day"
          icon={<Droplets className="w-5 h-5 text-red-500" />} iconBg="bg-red-100"
          formula={`Daily demand × ${leakagePct}% loss factor`}
          source="Demo" dataType="Estimated" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Rainwater calculator */}
        <SectionCard title="Rainwater Harvesting Calculator" subtitle="Annual collection potential" icon={<Droplets className="w-4 h-4" />}>
          <DemoBadge className="mb-4" />
          <StatRow label="Annual Rainfall" value={rainfallMmPerYear} unit="mm/year" />
          <StatRow label="Catchment Area" value={catchmentAreaM2} unit="m²" />
          <StatRow label="Runoff Efficiency" value={runoffCoeff + '%'} />
          <StatRow label="Annual Harvest Potential" value={(rainwaterAnnual / 1000).toFixed(0)} unit="kL/year" highlight />
          <StatRow label="Monthly Average" value={(rainwaterMonthly / 1000).toFixed(1)} unit="kL/month" />
          <StatRow label="Demand Offset" value={rainwaterOffsetPct + '%'} highlight />
          <AssumptionBox items={[
            { label: 'Formula', value: 'Rainfall(m) × Area(m²) × 1000 × Runoff' },
            { label: 'Runoff coeff', value: '0.80 (80% efficiency)' },
            { label: 'Source', value: 'Jal Jeevan Mission guidelines' },
          ]} />
        </SectionCard>

        {/* Leakage analysis */}
        <SectionCard title="Leakage & Loss Analysis" subtitle="Distribution network efficiency" icon={<Droplets className="w-4 h-4" />}>
          <DemoBadge className="mb-4" />
          <StatRow label="Gross Daily Demand" value={(dailyDemand / 1000).toFixed(2)} unit="kL" />
          <StatRow label="Loss Rate" value={leakagePct + '%'} />
          <StatRow label="Daily Water Lost" value={(leakageLossDaily / 1000).toFixed(2)} unit="kL" />
          <StatRow label="Monthly Loss" value={(leakageSavings / 1000).toFixed(1)} unit="kL/month" />
          <StatRow label="Effective Demand" value={(withoutLeakageDemand / 1000).toFixed(2)} unit="kL/day" highlight />
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-1">System Efficiency</div>
            <ProgressBar
              value={100 - leakagePct}
              color={leakagePct < 10 ? 'bg-green-500' : leakagePct < 20 ? 'bg-amber-500' : 'bg-red-500'}
              label={`Distribution efficiency: ${(100 - leakagePct).toFixed(0)}%`}
            />
          </div>
          <AssumptionBox items={[
            { label: 'BIS standard', value: 'Max 15% NRW acceptable' },
            { label: 'Recommendation', value: 'Below 10% is excellent' },
          ]} />
        </SectionCard>
      </div>

      {/* Monthly rainfall harvest chart */}
      <SectionCard title="Monthly Rainwater Harvest Potential" subtitle="Based on Suryapur region rainfall pattern" className="mb-6">
        <DemoBadge className="mb-4" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyRainfall} margin={{ left: -10 }}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number, name: string) => [name === 'mm' ? `${v} mm` : `${v} L`, name]} />
            <Bar dataKey="mm" name="Rainfall (mm)" fill="#0284c7" opacity={0.5} radius={[3, 3, 0, 0]} />
            <Bar dataKey="harvested" name="Harvested (L)" fill="#0284c7" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Area comparison */}
      <SectionCard title="Water Analysis — All Areas" subtitle="Daily demand vs rainwater potential">
        <DemoBadge className="mb-4" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={areaWater} margin={{ left: -10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [`${v} kL`, '']} />
            <Bar dataKey="Daily Demand (kL)" fill="#0284c7" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Rainwater (kL/mo)" fill="#67e8f9" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
      </div>
    </div>
  );
}
