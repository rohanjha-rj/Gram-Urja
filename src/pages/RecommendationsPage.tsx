import React, { useState } from 'react';

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
  const [initiated, setInitiated] = useState(false);
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
          </div>
          <div className="text-right text-xs shrink-0 ml-4">
            <div className="text-green-700 font-bold text-base">₹{(rec.costSavingsINRPerMonth / 1000).toFixed(1)}k</div>
            <div className="text-gray-400">savings/mo</div>
            <div className="text-red-600 font-semibold mt-1">{(rec.co2ImpactKgPerMonth / 1000).toFixed(1)} t CO₂</div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-5 bg-white">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">The Problem</div>
              <p className="text-sm text-gray-700">{rec.problem}</p>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">The Solution</div>
              <p className="text-sm text-gray-800 font-medium">{rec.intervention}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Impact Comparison</div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                <div className="p-4">
                  <div className="text-xs text-red-500 font-bold uppercase tracking-wider mb-1">Current State</div>
                  <div className="text-sm text-gray-700">{rec.currentValue}</div>
                </div>
                <div className="p-4 bg-green-50/50">
                  <div className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Expected Result</div>
                  <div className="text-sm text-green-800 font-medium">{rec.expectedValue}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 font-medium mb-1">Energy Saving</div>
              <div className="font-extrabold text-xl text-blue-600">{rec.energySavingsKWhPerMonth.toLocaleString()} <span className="text-sm font-medium text-blue-600/70">kWh</span></div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 font-medium mb-1">Cost Saving</div>
              <div className="font-extrabold text-xl text-green-600">₹{rec.costSavingsINRPerMonth.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 font-medium mb-1">Investment</div>
              <div className="font-extrabold text-xl text-amber-600">₹{(rec.investmentINR / 100000).toFixed(1)}L</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 font-medium mb-1">Payback</div>
              <div className="font-extrabold text-xl text-purple-600">{rec.paybackMonths} <span className="text-sm font-medium text-purple-600/70">mo</span></div>
            </div>
          </div>
          
          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
             <div className="flex gap-4 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-400" /> {rec.beneficiaries}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> {rec.implementationTime}</span>
             </div>
             <button 
               onClick={(e) => { e.stopPropagation(); setInitiated(true); }}
               disabled={initiated}
               className={`px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors ${initiated ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
               {initiated ? 'Project Initiated ✓' : 'Begin Project'}
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export default function RecommendationsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(DEMO_RECOMMENDATIONS[0].id);
  const [selectedAreaId, setSelectedAreaId] = useState('motipur');
  const filtered = DEMO_RECOMMENDATIONS
    .filter((r) => r.areaId === selectedAreaId)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);



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
          <AreaSelector selectedAreaId={selectedAreaId} onSelect={(id) => { setSelectedAreaId(id); }} />
        </div>
      </div>


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
