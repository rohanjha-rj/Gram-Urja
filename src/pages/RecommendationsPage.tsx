import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Lightbulb, Sun, Droplets, Leaf, Zap, Users, Clock, TrendingDown } from 'lucide-react';
import { DEMO_RECOMMENDATIONS } from '../data/recommendations';
import { PriorityBadge, DemoBadge, SectionCard, StatRow } from '../components/ui';
import AreaSelector from '../components/AreaSelector';
import type { Recommendation, RecommendationCategory } from '../types';

const CATEGORY_ICONS: Record<RecommendationCategory, React.ReactNode> = {
  solar: <Sun className="w-4 h-4 text-amber-500" />,
  water: <Droplets className="w-4 h-4 text-blue-500" />,
  waste: <Leaf className="w-4 h-4 text-green-500" />,
  lighting: <Lightbulb className="w-4 h-4 text-yellow-500" />,
  appliance: <Zap className="w-4 h-4 text-blue-500" />,
  behavior: <Users className="w-4 h-4 text-purple-500" />,
};

const CATEGORY_COLORS: Record<RecommendationCategory, string> = {
  solar: 'bg-amber-50 border-amber-200',
  water: 'bg-blue-50 border-blue-200',
  waste: 'bg-green-50 border-green-200',
  lighting: 'bg-yellow-50 border-yellow-200',
  appliance: 'bg-indigo-50 border-indigo-200',
  behavior: 'bg-purple-50 border-purple-200',
};

function RecCard({ rec, expanded, onToggle }: { rec: Recommendation; expanded: boolean; onToggle: () => void }) {
  return (
    <div className={`bg-white rounded-xl border-2 ${CATEGORY_COLORS[rec.category]} overflow-hidden transition-all`}>
      <button onClick={onToggle} className="w-full text-left p-5 hover:bg-gray-50/50 transition-colors">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{CATEGORY_ICONS[rec.category]}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <PriorityBadge priority={rec.priority} />
              <span className="text-xs text-gray-400 capitalize bg-gray-100 rounded px-2 py-0.5">{rec.category}</span>
              <span className="text-xs text-gray-400">{rec.areaId}</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{rec.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{rec.problem}</p>
          </div>
          <div className="text-right text-xs shrink-0 ml-4">
            <div className="text-green-700 font-bold text-base">₹{(rec.costSavingsINRPerMonth / 1000).toFixed(1)}k</div>
            <div className="text-gray-400">savings/mo</div>
            <div className="text-red-600 font-semibold mt-1">{(rec.co2ImpactKgPerMonth / 1000).toFixed(1)} t CO₂</div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-5 bg-gray-50/50">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Problem</div>
              <p className="text-sm text-gray-700">{rec.problem}</p>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Root Cause</div>
              <p className="text-sm text-gray-700">{rec.rootCause}</p>
            </div>
          </div>
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Intervention</div>
            <p className="text-sm text-green-800 bg-green-50 rounded-lg p-3 border border-green-100">{rec.intervention}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">Current State</div>
              <p className="text-sm text-red-700 bg-red-50 rounded p-2">{rec.currentValue}</p>
            </div>
            <div>
              <div className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-1">Expected After</div>
              <p className="text-sm text-green-700 bg-green-50 rounded p-2">{rec.expectedValue}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
              <div className="text-xs text-gray-500">Energy Saving</div>
              <div className="font-bold text-blue-700">{rec.energySavingsKWhPerMonth.toLocaleString()} kWh</div>
              <div className="text-xs text-gray-400">/month</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
              <div className="text-xs text-gray-500">Cost Saving</div>
              <div className="font-bold text-green-700">₹{rec.costSavingsINRPerMonth.toLocaleString()}</div>
              <div className="text-xs text-gray-400">/month</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
              <div className="text-xs text-gray-500">Investment</div>
              <div className="font-bold text-amber-700">₹{(rec.investmentINR / 100000).toFixed(1)}L</div>
              <div className="text-xs text-gray-400">one-time</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
              <div className="text-xs text-gray-500">Payback</div>
              <div className="font-bold text-purple-700">{rec.paybackMonths} mo</div>
              <div className="text-xs text-gray-400">({(rec.paybackMonths / 12).toFixed(1)} yr)</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{rec.beneficiaries}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{rec.implementationTime}</span>
            <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3 text-green-500" />{(rec.co2ImpactKgPerMonth / 1000).toFixed(2)} t CO₂ avoided/month</span>
          </div>
        </div>
      )}
    </div>
  );
}

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export default function RecommendationsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(DEMO_RECOMMENDATIONS[0].id);
  const [selectedAreaId, setSelectedAreaId] = useState('suryapur');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>(selectedAreaId);
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filtered = DEMO_RECOMMENDATIONS
    .filter((r) => filterCategory === 'all' || r.category === filterCategory)
    .filter((r) => filterArea === 'all' || r.areaId === filterArea)
    .filter((r) => filterPriority === 'all' || r.priority === filterPriority)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const totalSavings = filtered.reduce((s, r) => s + r.costSavingsINRPerMonth, 0);
  const totalCO2 = filtered.reduce((s, r) => s + r.co2ImpactKgPerMonth, 0);
  const totalInvestment = filtered.reduce((s, r) => s + r.investmentINR, 0);
  const totalEnergy = filtered.reduce((s, r) => s + r.energySavingsKWhPerMonth, 0);

  const barData = filtered.map((r) => ({
    name: r.title.slice(0, 22) + '…',
    'Savings ₹k/mo': +(r.costSavingsINRPerMonth / 1000).toFixed(1),
  }));

  const areas = [...new Set(DEMO_RECOMMENDATIONS.map((r) => r.areaId))];
  const categories = [...new Set(DEMO_RECOMMENDATIONS.map((r) => r.category))];

  return (
    <div className="min-h-screen bg-gray-50" style={{
      backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(22,163,74,0.03) 40px, rgba(22,163,74,0.03) 80px)'
    }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border-l-4 border-green-600 fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recommendations Engine</h1>
            <p className="text-gray-500 text-sm mt-1">Data-driven interventions · Priority ranked · Cost + CO₂ impact</p>
          </div>
          <DemoBadge />
        </div>
        <div className="mt-4">
          <AreaSelector selectedAreaId={selectedAreaId} onSelect={(id) => { setSelectedAreaId(id); setFilterArea(id); }} />
        </div>
      </div>

      {/* Summary banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Potential Monthly Savings', value: `₹${(totalSavings / 100000).toFixed(2)}L`, color: 'bg-green-50 text-green-700 border-green-200' },
          { label: 'Energy Reduction', value: `${(totalEnergy / 1000).toFixed(1)}k kWh/mo`, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'CO₂ Impact', value: `${(totalCO2 / 1000).toFixed(1)} t/mo`, color: 'bg-red-50 text-red-700 border-red-200' },
          { label: 'Total Investment', value: `₹${(totalInvestment / 100000).toFixed(1)}L`, color: 'bg-amber-50 text-amber-700 border-amber-200' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.color}`}>
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-0.5 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
          <option value="all">All Priorities</option>
          {['critical', 'high', 'medium', 'low'].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
          <option value="all">All Areas</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className="text-xs text-gray-400 self-center">{filtered.length} recommendations</span>
      </div>

      {/* Savings bar chart */}
      <SectionCard title="Monthly Savings by Recommendation" subtitle="₹k/month potential" className="mb-6">
        <DemoBadge className="mb-3" />
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{ left: -10, bottom: 40 }}>
            <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="Savings ₹k/mo" fill="#16a34a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Recommendation cards */}
      <div className="space-y-4">
        {filtered.map((rec) => (
          <RecCard
            key={rec.id}
            rec={rec}
            expanded={expandedId === rec.id}
            onToggle={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
          />
        ))}
      </div>
      </div>
    </div>
  );
}
