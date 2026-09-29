import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Leaf, Zap } from 'lucide-react';
import {
  calculateBiogas, calculateWasteEnergy, calculateCO2, calculateElectricityCost, ASSUMPTIONS
} from '../calculations/engine';
import { SectionCard, KpiCard, DemoBadge, AssumptionBox, StatRow } from '../components/ui';
import { getAllAreaAnalyses } from '../services/energyService';
import AreaSelector from '../components/AreaSelector';
import { DEMO_AREAS } from '../data/demoData';

const areas = getAllAreaAnalyses();

const COLORS = ['#16a34a', '#059669', '#f59e0b', '#84cc16'];

export default function WastePage() {
  const [selectedAreaId, setSelectedAreaId] = useState('motipur');
  const [cowDung, setCowDung] = useState(500);
  const [foodWaste, setFoodWaste] = useState(300);
  const [agriWaste, setAgriWaste] = useState(200);
  const [scale, setScale] = useState<'community' | 'household'>('community');

  useEffect(() => {
    const area = DEMO_AREAS.find((a) => a.id === selectedAreaId);
    if (area) {
      setCowDung(area.cowDungKgPerDay);
      setFoodWaste(area.foodWasteKgPerDay);
      setAgriWaste(area.agriWasteKgPerDay);
    }
  }, [selectedAreaId]);

  const multiplier = scale === 'household' ? 0.005 : 1;
  const cowDungInput = cowDung * multiplier;
  const foodWasteInput = foodWaste * multiplier;
  const agriWasteInput = agriWaste * multiplier;

  const totalBiogasM3PerDay = calculateBiogas(cowDungInput, agriWasteInput, foodWasteInput);
  const thermalPerDay = calculateWasteEnergy(totalBiogasM3PerDay);
  const electricityPerDay = +(totalBiogasM3PerDay * ASSUMPTIONS.biogasElectricKWhPerM3).toFixed(2);
  const electricityPerMonth = electricityPerDay * 30;
  const co2OffsetPerMonth = calculateCO2(electricityPerMonth);
  const monthlySavings = calculateElectricityCost(electricityPerMonth);

  const biogasBreakdown = [
    { name: 'Cow Dung', value: +(cowDungInput * ASSUMPTIONS.cowDungBiogasM3PerKg).toFixed(3), kg: cowDungInput },
    { name: 'Agri Waste', value: +(agriWasteInput * ASSUMPTIONS.agriWasteBiogasM3PerKg).toFixed(3), kg: agriWasteInput },
    { name: 'Food Waste', value: +(foodWasteInput * ASSUMPTIONS.foodWasteBiogasM3PerKg).toFixed(3), kg: foodWasteInput },
  ];

  // Area comparison
  const areaWaste = areas.map((a) => ({
    name: a.area.name,
    'Biogas m³/day': +a.wasteAnalysis.biogasM3PerDay.toFixed(1),
    'kWh/day': +a.wasteAnalysis.electricityKWhPerDay.toFixed(1),
  }));

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(160deg, #052e16 0%, #065f46 50%, #052e16 100%)' }}>
      {/* Recycling pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="leaf-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="25" stroke="#16a34a" strokeWidth="1" fill="none"/>
              <path d="M40,15 L40,65 M15,40 L65,40" stroke="#16a34a" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#leaf-pattern)"/>
        </svg>
      </div>
      {/* Spinning leaf */}
      <div className="absolute top-20 right-16 opacity-10 pointer-events-none">
        <svg viewBox="0 0 60 60" width="80" className="leaf-spin">
          <path d="M30,5 Q55,30 30,55 Q5,30 30,5 Z" fill="#16a34a"/>
          <line x1="30" y1="10" x2="30" y2="50" stroke="#052e16" strokeWidth="2"/>
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
      <div className="glass-card rounded-2xl p-5 mb-6 fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Leaf className="w-6 h-6 text-green-600" /> Waste & Energy
            </h1>
            <p className="text-gray-500 text-sm mt-1">Organic waste → biogas → electricity potential</p>
          </div>
          <DemoBadge />
        </div>
        <div className="mt-4">
          <AreaSelector selectedAreaId={selectedAreaId} onSelect={setSelectedAreaId} />
        </div>
      </div>

      {/* Scale toggle */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex items-center gap-6">
        <div className="font-medium text-sm text-gray-700">Scale:</div>
        {(['community', 'household'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScale(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${scale === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {s === 'community' ? 'Community (Village)' : 'Household (5 members)'}
          </button>
        ))}
      </div>

      {/* Input sliders */}
      <SectionCard title="Organic Waste Inputs" subtitle={`Per ${scale === 'community' ? 'day (village)' : 'day (household estimate)'}`} className="mb-6">
        <div className="grid sm:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block font-medium text-green-700 mb-1">🐄 Cow Dung ({(cowDung * multiplier).toFixed(1)} kg/day)</label>
            <input type="range" min="0" max="2000" step="10" value={cowDung}
              onChange={(e) => setCowDung(+e.target.value)} className="w-full accent-green-600" />
            <div className="text-xs text-gray-400 mt-1">0.04 m³ biogas per kg</div>
          </div>
          <div>
            <label className="block font-medium text-amber-700 mb-1">🍱 Food Waste ({(foodWaste * multiplier).toFixed(1)} kg/day)</label>
            <input type="range" min="0" max="1000" step="10" value={foodWaste}
              onChange={(e) => setFoodWaste(+e.target.value)} className="w-full accent-amber-500" />
            <div className="text-xs text-gray-400 mt-1">0.06 m³ biogas per kg</div>
          </div>
          <div>
            <label className="block font-medium text-yellow-700 mb-1">🌾 Agri Waste ({(agriWaste * multiplier).toFixed(1)} kg/day)</label>
            <input type="range" min="0" max="1000" step="10" value={agriWaste}
              onChange={(e) => setAgriWaste(+e.target.value)} className="w-full accent-yellow-500" />
            <div className="text-xs text-gray-400 mt-1">0.02 m³ biogas per kg</div>
          </div>
        </div>
      </SectionCard>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Daily Biogas" value={totalBiogasM3PerDay.toFixed(2)} unit="m³/day"
          icon={<Leaf className="w-5 h-5 text-green-600" />} iconBg="bg-green-100"
          formula="Σ(input_kg × biogas_factor_m³/kg)"
          source="MNRE biogas guidelines" dataType="Calculated" />
        <KpiCard title="Thermal Energy" value={thermalPerDay.toFixed(2)} unit="kWh/day"
          icon={<Zap className="w-5 h-5 text-orange-600" />} iconBg="bg-orange-100"
          formula={`Biogas (m³) × ${ASSUMPTIONS.biogasThermalKWhPerM3} kWh/m³`}
          source="MNRE" dataType="Calculated" />
        <KpiCard title="Electricity Potential" value={electricityPerMonth.toFixed(1)} unit="kWh/mo"
          icon={<Zap className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-100"
          formula={`Biogas (m³) × ${ASSUMPTIONS.biogasElectricKWhPerM3} kWh/m³ × 30`}
          source="MNRE" dataType="Calculated" />
        <KpiCard title="Monthly Cost Saving" value={'₹' + monthlySavings.toLocaleString()}
          icon={<Leaf className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-100"
          formula={`Electricity potential × ₹${ASSUMPTIONS.tariffINRPerKWh}/kWh`}
          source="Standard tariff" dataType="Estimated" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Biogas source breakdown pie */}
        <SectionCard title="Biogas by Source" subtitle="m³/day contribution" icon={<Leaf className="w-4 h-4" />}>
          <DemoBadge className="mb-4" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={biogasBreakdown} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value.toFixed(3)}`}>
                {biogasBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v.toFixed(4)} m³/day`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <AssumptionBox items={[
            { label: 'Cow dung', value: '0.04 m³ biogas/kg' },
            { label: 'Food waste', value: '0.06 m³ biogas/kg' },
            { label: 'Agri waste', value: '0.02 m³ biogas/kg' },
            { label: 'Biogas→thermal', value: '6 kWh/m³' },
            { label: 'Biogas→electric', value: '2 kWh/m³' },
          ]} />
        </SectionCard>

        {/* Detailed breakdown */}
        <SectionCard title="Energy Recovery Summary" subtitle="Full chain from waste to energy" icon={<Zap className="w-4 h-4" />}>
          <DemoBadge className="mb-4" />
          <StatRow label="Total Waste Input" value={(cowDungInput + foodWasteInput + agriWasteInput).toFixed(1)} unit="kg/day" />
          <StatRow label="Biogas Generated" value={totalBiogasM3PerDay.toFixed(3)} unit="m³/day" highlight />
          <StatRow label="Monthly Biogas" value={(totalBiogasM3PerDay * 30).toFixed(1)} unit="m³/month" />
          <StatRow label="Thermal Energy" value={thermalPerDay.toFixed(2)} unit="kWh/day" />
          <StatRow label="Electricity (monthly)" value={electricityPerMonth.toFixed(1)} unit="kWh" highlight />
          <StatRow label="CO₂ Offset" value={(co2OffsetPerMonth / 1000).toFixed(3)} unit="t/month" />
          <StatRow label="Estimated Value" value={'₹' + monthlySavings.toLocaleString()} unit="/month" highlight />
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <strong>Note:</strong> Actual biogas yield depends on digester design, temperature, feed mix, and retention time. These are theoretical estimates using MNRE guidelines.
          </div>
        </SectionCard>
      </div>

      {/* Area comparison */}
      <SectionCard title="Biogas Potential — All Areas" subtitle="Community-scale comparison">
        <DemoBadge className="mb-4" />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={areaWaste} margin={{ left: -10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="Biogas m³/day" fill="#16a34a" radius={[3, 3, 0, 0]} />
            <Bar dataKey="kWh/day" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <AssumptionBox items={[
          { label: 'Biogas bar', value: 'm³ biogas per day' },
          { label: 'kWh bar', value: 'Electricity equivalent (2 kWh/m³)' },
        ]} />
      </SectionCard>
      </div>
    </div>
  );
}
