import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Zap, Droplets, Leaf, Sun, TrendingUp, ArrowLeft, MapPin, Users, Home, Lightbulb, Search, Filter, Flame
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

  const potentialGeneration = solarPotential.monthlyGenerationKWh + (wasteAnalysis.electricityKWhPerDay * 30);
  const potentialCo2Avoided = solarPotential.co2AvoidedKgPerMonth + wasteAnalysis.co2OffsetKgPerMonth;
  const potentialSavingsINR = potentialGeneration * ASSUMPTIONS.tariffINRPerKWh;
  
  const optimizedCost = Math.max(0, monthlyCostINR - potentialSavingsINR);
  const optimizedCo2 = Math.max(0, co2KgPerMonth - potentialCo2Avoided);
  const optimizedRenewable = Math.min(100, renewablePercent + (potentialGeneration / area.monthlyElectricity) * 100);

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

      {/* Top Row: Comparison & Energy Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Comparison Cards (Takes 2/3) */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
          {/* Current State */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-400" /> Current Monthly Status
          </h3>
          <StatRow label="Consumption" value={(area.monthlyElectricity / 1000).toFixed(1)} unit="k kWh" />
          <StatRow label="Electricity Cost" value={'₹' + (monthlyCostINR / 1000).toFixed(1) + 'k'} />
          <StatRow label="CO₂ Emissions" value={(co2KgPerMonth / 1000).toFixed(1)} unit="t/mo" />
          <StatRow label="Renewable Energy" value={renewablePercent.toFixed(1)} unit="%" />
        </div>

        {/* Optimized State */}
        <div className="bg-green-50 rounded-xl border border-green-200 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-24 h-24 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2 relative z-10">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" /> Potential Optimized Status
          </h3>
          <StatRow label="Grid Consumption" value={(Math.max(0, area.monthlyElectricity - potentialGeneration) / 1000).toFixed(1)} unit="k kWh" highlight />
          <StatRow label="Electricity Cost" value={'₹' + (optimizedCost / 1000).toFixed(1) + 'k'} highlight />
          <StatRow label="CO₂ Emissions" value={(optimizedCo2 / 1000).toFixed(1)} unit="t/mo" highlight />
          <StatRow label="Renewable Energy" value={optimizedRenewable.toFixed(1)} unit="%" highlight />
        </div>
        </div>
        
        {/* Energy Breakdown (Takes 1/3) */}
        <div className="lg:col-span-1">
          <SectionCard title="Energy Breakdown" subtitle="Monthly consumption by category" icon={<Zap className="w-4 h-4" />}>
            <ResponsiveContainer width="100%" height={240}>
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
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Solar Opportunity Redesigned */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-500 rounded-xl text-white shadow-sm">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Solar Opportunity</h3>
                <p className="text-sm text-gray-600">Turn empty rooftops into a power plant</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 mb-6 border border-amber-100/50 shadow-sm">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Max Feasible Capacity</div>
              <div className="text-4xl font-extrabold text-amber-600 mb-2">{solarPotential.feasibleCapacityKW.toFixed(1)} <span className="text-xl text-amber-600/70">kW</span></div>
              <p className="text-sm text-gray-500">Based on {area.infrastructure.solar.roofAreaSqFt} sq.ft of available space.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-amber-100/50">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Zap className="w-4 h-4" />
                  <span className="font-bold text-sm">Free Power</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{solarPotential.monthlyGenerationKWh.toLocaleString()} <span className="text-xs text-gray-500">kWh/mo</span></div>
                <div className="text-xs font-medium text-green-600 mt-1">Offsets {solarPotential.offsetPercent.toFixed(1)}% of usage</div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-amber-100/50">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <Leaf className="w-4 h-4" />
                  <span className="font-bold text-sm">Environment</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{(solarPotential.co2AvoidedKgPerMonth / 1000).toFixed(1)} <span className="text-xs text-gray-500">tons CO₂</span></div>
                <div className="text-xs font-medium text-gray-500 mt-1">Saved every month</div>
              </div>
            </div>

            <div className="bg-gray-900 text-white rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Estimated Investment</div>
                <div className="text-xl font-bold">₹{(solarPotential.estimatedCostINR / 100000).toFixed(1)} Lakhs</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Pays for itself in</div>
                <div className="text-xl font-bold text-green-400">{solarPotential.paybackYears.toFixed(1)} Years</div>
              </div>
            </div>
          </div>
        </div>

        {/* Biogas Opportunity Redesigned */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-500 rounded-xl text-white shadow-sm">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Biogas Opportunity</h3>
                <p className="text-sm text-gray-600">Convert daily waste into valuable energy</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 mb-6 border border-green-100/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Daily Gas Production</div>
                <div className="text-4xl font-extrabold text-green-600 mb-2">{wasteAnalysis.biogasM3PerDay.toFixed(1)} <span className="text-xl text-green-600/70">m³</span></div>
              </div>
              <div className="flex flex-col gap-2 border-l border-gray-100 pl-4">
                 <div className="text-sm text-gray-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-700"></span> {area.cowDungKgPerDay} kg Dung</div>
                 <div className="text-sm text-gray-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-400"></span> {area.foodWasteKgPerDay} kg Food Waste</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-green-100/50">
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                  <Flame className="w-4 h-4" />
                  <span className="font-bold text-sm">Thermal Energy</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{wasteAnalysis.thermalEnergyKWhPerDay.toFixed(0)} <span className="text-xs text-gray-500">kWh/day</span></div>
                <div className="text-xs font-medium text-gray-500 mt-1">Useful for cooking</div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-green-100/50">
                <div className="flex items-center gap-2 text-blue-500 mb-2">
                  <Zap className="w-4 h-4" />
                  <span className="font-bold text-sm">Electricity</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{wasteAnalysis.electricityKWhPerDay.toFixed(0)} <span className="text-xs text-gray-500">kWh/day</span></div>
                <div className="text-xs font-medium text-green-600 mt-1">Alternative to thermal</div>
              </div>
            </div>
            
            <div className="bg-gray-900 text-white rounded-xl p-5 flex items-center justify-between">
               <div>
                 <div className="text-sm text-gray-400 mb-1">Environmental Impact</div>
                 <div className="text-xl font-bold text-green-400">{(wasteAnalysis.co2OffsetKgPerMonth / 1000).toFixed(1)} tons CO₂ avoided/mo</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VillageDashboard() {
  const analyses = getAllAreaAnalyses();
  const [selected, setSelected] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterState, setFilterState] = useState({
    minConsumption: '',
    maxConsumption: '',
    minPopulation: '',
    maxPopulation: '',
  });

  if (selected) {
    const detail = analyses.find((a) => a.area.id === selected);
    if (detail) return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <AreaDetailView analysis={detail} onBack={() => setSelected(null)} />
      </div>
    );
  }

  const filteredAnalyses = analyses.filter(a => {
    const matchesSearch = a.area.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const minCons = filterState.minConsumption ? Number(filterState.minConsumption) : 0;
    const maxCons = filterState.maxConsumption ? Number(filterState.maxConsumption) : Infinity;
    const minPop = filterState.minPopulation ? Number(filterState.minPopulation) : 0;
    const maxPop = filterState.maxPopulation ? Number(filterState.maxPopulation) : Infinity;

    const matchesCons = a.area.monthlyElectricity >= minCons && a.area.monthlyElectricity <= maxCons;
    const matchesPop = a.area.population >= minPop && a.area.population <= maxPop;

    return matchesSearch && matchesCons && matchesPop;
  });

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

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search village, ward or town..." 
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/10 text-white placeholder-gray-400 backdrop-blur-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-colors ${showFilters ? 'bg-green-600 text-white border-green-500' : 'bg-white/10 text-white border-transparent hover:bg-white/20'}`}
          >
            <Filter className="w-5 h-5" />
            Filters {Object.values(filterState).some(v => v !== '') && <span className="w-2 h-2 rounded-full bg-amber-400 ml-1" />}
          </button>
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Min Consumption (kWh)</label>
              <input 
                type="number" 
                placeholder="e.g. 10000"
                className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                value={filterState.minConsumption}
                onChange={e => setFilterState({...filterState, minConsumption: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Consumption (kWh)</label>
              <input 
                type="number" 
                placeholder="e.g. 50000"
                className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                value={filterState.maxConsumption}
                onChange={e => setFilterState({...filterState, maxConsumption: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Min Population</label>
              <input 
                type="number" 
                placeholder="e.g. 1000"
                className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                value={filterState.minPopulation}
                onChange={e => setFilterState({...filterState, minPopulation: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Population</label>
              <input 
                type="number" 
                placeholder="e.g. 5000"
                className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                value={filterState.maxPopulation}
                onChange={e => setFilterState({...filterState, maxPopulation: e.target.value})}
              />
            </div>
            
            <div className="col-span-full flex justify-end">
              <button 
                onClick={() => setFilterState({minConsumption: '', maxConsumption: '', minPopulation: '', maxPopulation: ''})}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Area cards grid */}
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <span className="text-sm text-gray-400">Click any area card for detailed analysis</span>
      </div>
      
      {filteredAnalyses.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white/5 rounded-xl border border-white/10">
          No areas found matching your criteria.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnalyses.map((analysis) => (
            <AreaCard key={analysis.area.id} analysis={analysis} onClick={() => setSelected(analysis.area.id)} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
