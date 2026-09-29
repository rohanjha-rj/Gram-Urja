import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Zap, Droplets, Leaf, Sun, TrendingUp, ArrowLeft, MapPin, Users, Home, Lightbulb
} from 'lucide-react';
import { getAllAreaAnalyses, getAreaAnalysisById } from '../services/energyService';
import { KpiCard, SectionCard, DemoBadge, PriorityBadge, AssumptionBox, ScoreRing, StatRow, ProgressBar } from '../components/ui';
import type { AreaAnalysis } from '../types';
import {
  calculateSustainabilityScoreBreakdown,
  ASSUMPTIONS,
} from '../calculations/engine';

const DONUT_COLORS = ['#16a34a', '#f59e0b', '#0284c7', '#7c3aed', '#ef4444', '#6b7280'];
const AREA_TYPE_LABEL: Record<string, string> = { village: 'Village', urban_ward: 'Urban Ward', town: 'Town' };

function AreaCard({ analysis, onClick }: { analysis: AreaAnalysis; onClick: () => void }) {
  const { area, energyBreakdown, sustainabilityScore, priorityIndex, priorityReasons, monthlyCostINR, co2KgPerMonth, renewablePercent } = analysis;
  const scoreColor = sustainabilityScore >= 60 ? 'text-green-600' : sustainabilityScore >= 40 ? 'text-amber-600' : 'text-red-600';

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-lg hover:border-green-300 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-gray-900 text-lg">{area.name}</span>
            <span className="text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">{AREA_TYPE_LABEL[area.type]}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span><Users className="inline w-3 h-3 mr-1" />{area.population.toLocaleString()}</span>
            <span><Home className="inline w-3 h-3 mr-1" />{area.households} HH</span>
          </div>
        </div>
        <div className="relative">
          <ScoreRing score={sustainabilityScore} size={56} strokeWidth={6} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${scoreColor}`}>{sustainabilityScore}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-blue-50 rounded-lg p-2">
          <div className="text-xs text-blue-500 font-medium">Consumption</div>
          <div className="text-sm font-bold text-blue-800">{(area.monthlyElectricity / 1000).toFixed(1)}k kWh</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-2">
          <div className="text-xs text-amber-500 font-medium">Monthly Cost</div>
          <div className="text-sm font-bold text-amber-800">₹{(monthlyCostINR / 1000).toFixed(1)}k</div>
        </div>
        <div className="bg-red-50 rounded-lg p-2">
          <div className="text-xs text-red-500 font-medium">CO₂</div>
          <div className="text-sm font-bold text-red-800">{(co2KgPerMonth / 1000).toFixed(1)} t</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2">
          <div className="text-xs text-green-500 font-medium">Renewable</div>
          <div className="text-sm font-bold text-green-800">{renewablePercent.toFixed(1)}%</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <PriorityBadge priority={priorityIndex >= 60 ? 'critical' : priorityIndex >= 40 ? 'high' : priorityIndex >= 25 ? 'medium' : 'low'} />
        <span className="text-xs text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">View details →</span>
      </div>

      {priorityReasons.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 truncate">{priorityReasons[0]}</div>
      )}
    </button>
  );
}

function AreaDetailView({ analysis, onBack }: { analysis: AreaAnalysis; onBack: () => void }) {
  const { area, energyBreakdown, solarPotential, waterAnalysis, wasteAnalysis, monthlyCostINR, co2KgPerMonth, renewablePercent, sustainabilityScore } = analysis;
  const scoreBreakdown = calculateSustainabilityScoreBreakdown(area, solarPotential, wasteAnalysis, waterAnalysis);

  const donutData = [
    { name: 'Households', value: energyBreakdown.households },
    { name: 'Streetlights', value: energyBreakdown.streetlights },
    { name: 'Water Pumps', value: energyBreakdown.waterPumps },
    { name: 'Schools', value: energyBreakdown.schools },
    { name: 'Hospitals', value: energyBreakdown.hospitals },
    { name: 'Other', value: energyBreakdown.other },
  ].filter(d => d.value > 0);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to overview
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 text-white rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-green-300" />
              <span className="text-green-300 text-sm">{AREA_TYPE_LABEL[area.type]}</span>
              <DemoBadge className="bg-white/10 text-white border-white/20" />
            </div>
            <h1 className="text-3xl font-bold mb-1">{area.name}</h1>
            <div className="flex gap-4 text-green-200 text-sm">
              <span>{area.population.toLocaleString()} residents</span>
              <span>{area.households} households</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-extrabold">{sustainabilityScore}</div>
            <div className="text-green-300 text-sm">Sustainability Score</div>
            <div className="text-2xl font-bold text-green-200 mt-1">{scoreBreakdown.grade}</div>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Monthly Consumption"
          value={(area.monthlyElectricity / 1000).toFixed(1) + 'k'}
          unit="kWh"
          icon={<Zap className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100"
          formula="Sum of all household + infrastructure consumption"
          source="Demo data"
          dataType="Demo"
        />
        <KpiCard
          title="Monthly Cost"
          value={'₹' + (monthlyCostINR / 1000).toFixed(1) + 'k'}
          icon={<Zap className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-100"
          formula={`Cost = kWh × ₹${ASSUMPTIONS.tariffINRPerKWh}/kWh`}
          source="Demo tariff"
          dataType="Estimated"
        />
        <KpiCard
          title="CO₂ Emissions"
          value={(co2KgPerMonth / 1000).toFixed(2)}
          unit="t/month"
          icon={<Leaf className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-100"
          formula={`CO₂ = kWh × ${ASSUMPTIONS.gridEmissionFactor} kg/kWh (CEA)`}
          source="CEA 2023"
          dataType="Estimated"
        />
        <KpiCard
          title="Renewable %"
          value={renewablePercent.toFixed(1)}
          unit="%"
          icon={<Sun className="w-5 h-5 text-amber-500" />}
          iconBg="bg-yellow-100"
          formula="Existing solar generation / total consumption × 100"
          source="Demo"
          dataType="Demo"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Energy Breakdown Donut */}
        <SectionCard title="Energy Breakdown" subtitle="Monthly consumption by category" icon={<Zap className="w-4 h-4" />}>
          <DemoBadge className="mb-4" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
              </Pie>
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`${v} kWh`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <AssumptionBox items={[
            { label: 'School/month', value: `${ASSUMPTIONS.schoolMonthlyKWh} kWh` },
            { label: 'Hospital/month', value: `${ASSUMPTIONS.hospitalMonthlyKWh} kWh` },
            { label: 'Panchayat/month', value: `${ASSUMPTIONS.panchayatMonthlyKWh} kWh` },
          ]} />
        </SectionCard>

        {/* Solar Potential */}
        <SectionCard title="Solar Potential" subtitle="Feasible installation analysis" icon={<Sun className="w-4 h-4" />}>
          <DemoBadge className="mb-4" />
          <StatRow label="Feasible Capacity" value={solarPotential.feasibleCapacityKW} unit="kW" highlight />
          <StatRow label="Monthly Generation" value={solarPotential.monthlyGenerationKWh.toLocaleString()} unit="kWh" />
          <StatRow label="Consumption Offset" value={solarPotential.offsetPercent + '%'} highlight />
          <StatRow label="CO₂ Avoided" value={(solarPotential.co2AvoidedKgPerMonth / 1000).toFixed(2)} unit="t/month" />
          <StatRow label="Est. Investment" value={'₹' + (solarPotential.estimatedCostINR / 100000).toFixed(1) + 'L'} />
          <StatRow label="Payback Period" value={solarPotential.paybackYears} unit="years" />
          <AssumptionBox items={[
            { label: '1 kW needs', value: '9.29 m²' },
            { label: 'Daily yield', value: '4.5 kWh/kW/day' },
            { label: 'Cost/kW', value: '₹60,000' },
            { label: 'Usable area', value: '70% roof, 80% land' },
          ]} />
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Water */}
        <SectionCard title="Water Analysis" subtitle="Demand, pumping, rainwater" icon={<Droplets className="w-4 h-4" />}>
          <DemoBadge className="mb-4" />
          <StatRow label="Daily Demand" value={waterAnalysis.dailyDemandLitres.toLocaleString()} unit="litres" />
          <StatRow label="Monthly Demand" value={(waterAnalysis.monthlyDemandLitres / 1000).toFixed(1)} unit="kL" />
          <StatRow label="Pump Energy" value={waterAnalysis.pumpEnergyKWhPerMonth} unit="kWh/month" />
          <StatRow label="Rainwater Potential" value={(waterAnalysis.rainwaterPotentialLitresPerYear / 1000).toFixed(0)} unit="kL/year" highlight />
          <StatRow label="Rainwater Offset" value={waterAnalysis.rainwaterOffsetPercent + '%'} />
          <AssumptionBox items={[
            { label: 'LPCD (rural)', value: '55 L/person/day' },
            { label: 'LPCD (urban)', value: '70 L/person/day' },
            { label: 'Runoff coeff', value: '80%' },
          ]} />
        </SectionCard>

        {/* Waste */}
        <SectionCard title="Waste & Biogas" subtitle="Organic waste energy potential" icon={<Leaf className="w-4 h-4" />}>
          <DemoBadge className="mb-4" />
          <StatRow label="Cow Dung Input" value={area.cowDungKgPerDay} unit="kg/day" />
          <StatRow label="Food Waste Input" value={area.foodWasteKgPerDay} unit="kg/day" />
          <StatRow label="Biogas Potential" value={wasteAnalysis.biogasM3PerDay.toFixed(1)} unit="m³/day" highlight />
          <StatRow label="Thermal Energy" value={wasteAnalysis.thermalEnergyKWhPerDay.toFixed(1)} unit="kWh/day" />
          <StatRow label="Electricity Potential" value={wasteAnalysis.electricityKWhPerDay.toFixed(1)} unit="kWh/day" />
          <StatRow label="CO₂ Offset" value={(wasteAnalysis.co2OffsetKgPerMonth / 1000).toFixed(2)} unit="t/month" />
          <AssumptionBox items={[
            { label: 'Cow dung', value: '0.04 m³/kg' },
            { label: 'Food waste', value: '0.06 m³/kg' },
            { label: 'Agri waste', value: '0.02 m³/kg' },
            { label: 'Biogas→elec', value: '2 kWh/m³' },
          ]} />
        </SectionCard>
      </div>

      {/* Score breakdown */}
      <SectionCard title="Sustainability Score Breakdown" subtitle="Weighted category analysis" icon={<TrendingUp className="w-4 h-4" />}>
        <DemoBadge className="mb-4" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scoreBreakdown.categories.map((cat) => (
            <div key={cat.name} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                <span className="text-sm font-bold text-gray-900">{cat.score}/100</span>
              </div>
              <ProgressBar value={cat.score} color={cat.score >= 60 ? 'bg-green-500' : cat.score >= 40 ? 'bg-amber-500' : 'bg-red-500'} />
              <div className="text-xs text-gray-400 mt-1">Weight: {(cat.weight * 100).toFixed(0)}%</div>
              <div className="text-xs text-gray-500 mt-0.5">{cat.rationale}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export default function VillageDashboard() {
  const analyses = getAllAreaAnalyses();
  const [selected, setSelected] = useState<string | null>(null);

  if (selected) {
    const detail = analyses.find((a) => a.area.id === selected);
    if (detail) return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <AreaDetailView analysis={detail} onBack={() => setSelected(null)} />
      </div>
    );
  }

  // Overview bar chart data
  const barData = analyses.map((a) => ({
    name: a.area.name,
    'Per HH (kWh)': Math.round(a.area.monthlyElectricity / a.area.households),
    score: a.sustainabilityScore,
  }));

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #14532d 50%, #0f172a 100%)' }}>
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg width="100%" height="100%"><defs><pattern id="vd-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#16a34a" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#vd-grid)"/></svg>
      </div>
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
      <div className="glass-card rounded-2xl p-5 mb-6 fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Community Sustainability Command Centre</h1>
            <p className="text-gray-500 text-sm mt-1">Bihar Village Sustainability Region · 5 areas monitored</p>
          </div>
          <DemoBadge />
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Consumption', value: (analyses.reduce((s, a) => s + a.area.monthlyElectricity, 0) / 1000).toFixed(0) + 'k kWh', color: 'text-blue-700 bg-blue-50', border: 'border border-blue-100' },
          { label: 'Total Cost', value: '₹' + (analyses.reduce((s, a) => s + a.monthlyCostINR, 0) / 100000).toFixed(1) + 'L', color: 'text-amber-700 bg-amber-50', border: 'border border-amber-100' },
          { label: 'Total CO₂', value: (analyses.reduce((s, a) => s + a.co2KgPerMonth, 0) / 1000).toFixed(1) + 't', color: 'text-red-700 bg-red-50', border: 'border border-red-100' },
          { label: 'Avg Score', value: Math.round(analyses.reduce((s, a) => s + a.sustainabilityScore, 0) / analyses.length) + '/100', color: 'text-green-700 bg-green-50', border: 'border border-green-100' },
        ].map((s) => (
          <div key={s.label} className={`gu-stat-card gu-kpi-live rounded-xl p-4 ${s.color} ${s.border}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="gu-live-dot" />
              <div className="text-xl font-bold gu-saving-tick">{s.value}</div>
            </div>
            <div className="text-xs font-medium opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-HH bar chart */}
      <SectionCard title="Per-Household Consumption Comparison" subtitle="Monthly kWh/household by area" className="mb-8">
        <DemoBadge className="mb-4" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} margin={{ left: -10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [`${v} kWh`, 'Per HH']} />
            <Bar dataKey="Per HH (kWh)" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Area cards grid */}
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <span className="text-sm text-gray-600">Click any area card for detailed analysis</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {analyses.map((analysis) => (
          <AreaCard key={analysis.area.id} analysis={analysis} onClick={() => setSelected(analysis.area.id)} />
        ))}
      </div>
    </div>
    </div>
  );
}
