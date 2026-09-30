import React, { useState } from 'react';

import { Lightbulb, Sun, Droplets, Leaf, Zap, Users, Clock, TrendingDown, MapPin, FlaskConical, BotMessageSquare } from 'lucide-react';
import { DEMO_RECOMMENDATIONS, HOUSEHOLD_RECOMMENDATIONS } from '../data/recommendations';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge, DemoBadge, SectionCard, StatRow } from '../components/ui';
import AreaSelector from '../components/AreaSelector';
import { useLanguage } from '../context/LanguageContext';
import { DEMO_AREAS } from '../data/demoData';
import { calculateSolarGeneration, calculateBiogas, ASSUMPTIONS } from '../calculations/engine';
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

const CATEGORY_LABELS_HI: Record<RecommendationCategory, string> = {
  solar: 'सौर',
  water: 'जल',
  waste: 'कचरा',
  lighting: 'प्रकाश',
  appliance: 'उपकरण',
  behavior: 'व्यवहार',
};

function RecCard({ rec, expanded, onToggle, isHindi }: { rec: Recommendation; expanded: boolean; onToggle: () => void; isHindi: boolean }) {
  const [initiated, setInitiated] = useState(false);
  return (
    <div className={`bg-white rounded-xl border-2 ${CATEGORY_COLORS[rec.category]} overflow-hidden transition-all`}>
      <button onClick={onToggle} className="w-full text-left p-5 hover:bg-gray-50/50 transition-colors">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{CATEGORY_ICONS[rec.category]}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <PriorityBadge priority={rec.priority} />
              <span className="text-xs text-gray-400 capitalize bg-gray-100 rounded px-2 py-0.5">
                {isHindi ? CATEGORY_LABELS_HI[rec.category] : rec.category}
              </span>
              <span className="text-xs text-gray-400">{rec.areaId}</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{rec.title}</h3>
          </div>
          <div className="text-right text-xs shrink-0 ml-4">
            <div className="text-green-700 font-bold text-base">₹{(rec.costSavingsINRPerMonth / 1000).toFixed(1)}k</div>
            <div className="text-gray-400">{isHindi ? 'मासिक बचत' : 'savings/mo'}</div>
            <div className="text-red-600 font-semibold mt-1">{(rec.co2ImpactKgPerMonth / 1000).toFixed(1)} t CO₂</div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-5 bg-white">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {isHindi ? 'समस्या' : 'The Problem'}
              </div>
              <p className="text-sm text-gray-700">{rec.problem}</p>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {isHindi ? 'समाधान' : 'The Solution'}
              </div>
              <p className="text-sm text-gray-800 font-medium">{rec.intervention}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {isHindi ? 'प्रभाव तुलना' : 'Impact Comparison'}
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                <div className="p-4">
                  <div className="text-xs text-red-500 font-bold uppercase tracking-wider mb-1">
                    {isHindi ? 'वर्तमान स्थिति' : 'Current State'}
                  </div>
                  <div className="text-sm text-gray-700">{rec.currentValue}</div>
                </div>
                <div className="p-4 bg-green-50/50">
                  <div className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">
                    {isHindi ? 'अपेक्षित परिणाम' : 'Expected Result'}
                  </div>
                  <div className="text-sm text-green-800 font-medium">{rec.expectedValue}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 font-medium mb-1">{isHindi ? 'ऊर्जा बचत' : 'Energy Saving'}</div>
              <div className="font-extrabold text-xl text-blue-600">{rec.energySavingsKWhPerMonth.toLocaleString()} <span className="text-sm font-medium text-blue-600/70">kWh</span></div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 font-medium mb-1">{isHindi ? 'लागत बचत' : 'Cost Saving'}</div>
              <div className="font-extrabold text-xl text-green-600">₹{rec.costSavingsINRPerMonth.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 font-medium mb-1">{isHindi ? 'निवेश' : 'Investment'}</div>
              <div className="font-extrabold text-xl text-amber-600">₹{(rec.investmentINR / 100000).toFixed(1)}L</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 font-medium mb-1">{isHindi ? 'वसूली अवधि' : 'Payback'}</div>
              <div className="font-extrabold text-xl text-purple-600">{rec.paybackMonths} <span className="text-sm font-medium text-purple-600/70">{isHindi ? 'माह' : 'mo'}</span></div>
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
               {initiated
                 ? (isHindi ? 'परियोजना शुरू ✓' : 'Project Initiated ✓')
                 : (isHindi ? 'परियोजना शुरू करें' : 'Begin Project')}
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

// ─── Energy priority calculation helpers ─────────────────────────────────────

interface VillageEnergyPriority {
  id: string;
  name: string;
  solarKWh: number;
  wasteKWh: number;
  totalRenewable: number;
  consumption: number;
  deficit: number;
  coverage: number;
  level: 'high' | 'medium' | 'low';
}

function computeEnergyPriorities(): VillageEnergyPriority[] {
  const results = DEMO_AREAS.map((area) => {
    // Solar: use full feasible capacity (rooftop + land)
    const roofSqFt = area.infrastructure.solar.roofAreaSqFt ?? 0;
    const landSqFt = area.infrastructure.solar.openLandSqFt ?? 0;
    const roofCap = ((roofSqFt * 0.0929) * 0.7 * 0.9) / 10;
    const landCap = ((landSqFt * 0.0929) * 0.8 * 0.95) / 10;
    const solarKWh = calculateSolarGeneration(roofCap + landCap, ASSUMPTIONS.solarKWhPerKWPerDay, 30);

    // Waste-to-energy: electricity monthly
    const biogasPerDay = calculateBiogas(area.cowDungKgPerDay, area.agriWasteKgPerDay, area.foodWasteKgPerDay);
    const wasteKWh = Math.round(biogasPerDay * ASSUMPTIONS.biogasElectricKWhPerM3 * 30);

    const totalRenewable = solarKWh + wasteKWh;
    const consumption = area.monthlyElectricity;
    const deficit = Math.max(0, consumption - totalRenewable);
    const coverage = consumption > 0 ? Math.min(200, +((totalRenewable / consumption) * 100).toFixed(1)) : 0;

    const level: 'high' | 'medium' | 'low' =
      coverage < 60 ? 'high' : coverage < 90 ? 'medium' : 'low';

    return { id: area.id, name: area.name, solarKWh, wasteKWh, totalRenewable, consumption, deficit, coverage, level };
  });

  // Sort: high first, then medium, then low; within same level sort by deficit desc
  const levelOrder = { high: 0, medium: 1, low: 2 };
  return results.sort((a, b) =>
    levelOrder[a.level] !== levelOrder[b.level]
      ? levelOrder[a.level] - levelOrder[b.level]
      : b.deficit - a.deficit,
  );
}

const LEVEL_META = {
  high:   { dot: '🔴', label: 'HIGH PRIORITY',   labelHi: 'उच्च प्राथमिकता',   border: 'border-red-300',    bg: 'bg-red-50',    badge: 'bg-red-100 text-red-700 border-red-300',    bar: 'bg-red-400' },
  medium: { dot: '🟡', label: 'MEDIUM PRIORITY', labelHi: 'मध्यम प्राथमिकता', border: 'border-amber-300',  bg: 'bg-amber-50',  badge: 'bg-amber-100 text-amber-700 border-amber-300', bar: 'bg-amber-400' },
  low:    { dot: '🟢', label: 'LOW PRIORITY',    labelHi: 'कम प्राथमिकता',    border: 'border-emerald-300', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700 border-emerald-300', bar: 'bg-emerald-400' },
};

function EnergyPriorityCard({ vp, isHindi }: { vp: VillageEnergyPriority; isHindi: boolean }) {
  const meta = LEVEL_META[vp.level];
  const coverageDisplay = vp.coverage >= 100 ? '100%+' : `${vp.coverage}%`;
  const deficitDisplay = vp.deficit === 0 ? '0' : vp.deficit.toLocaleString();

  const recommendation =
    vp.level === 'high'
      ? (isHindi ? 'उच्च ऊर्जा घाटे को पूरा करने के लिए सौर + बायोगैस क्षमता विस्तार की प्राथमिक अनुशंसा है।' : 'Allocate additional solar & biogas capacity — largest unmet energy demand in this region.')
      : vp.level === 'medium'
      ? (isHindi ? 'मध्यम घाटे के लिए नवीकरणीय ऊर्जा की मध्यम अतिरिक्त आपूर्ति की अनुशंसा।' : 'Moderate additional renewable allocation recommended to close the remaining energy gap.')
      : (isHindi ? 'स्थानीय नवीकरणीय उत्पादन वर्तमान मांग को पूरा कर रहा है। अधिशेष निर्यात या भंडारण का अन्वेषण करें।' : 'Local renewable generation currently meets demand. Explore surplus export or storage.');

  return (
    <div className={`rounded-2xl border-2 ${meta.border} ${meta.bg} p-5 shadow-sm`}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${meta.badge} tracking-wider`}>
          {meta.dot} {isHindi ? meta.labelHi : meta.label}
        </span>
        <span className="text-base font-bold text-gray-900">{vp.name}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-gray-500">{isHindi ? '⚡ ऊर्जा मांग' : '⚡ Energy Demand'}</span>
          <span className="font-semibold text-gray-800">{vp.consumption.toLocaleString()} kWh/mo</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{isHindi ? '☀️ सौर उत्पादन' : '☀️ Solar Generation'}</span>
          <span className="font-semibold text-amber-700">{vp.solarKWh.toLocaleString()} kWh/mo</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{isHindi ? '♻️ कचरा-ऊर्जा' : '♻️ Waste-to-Energy'}</span>
          <span className="font-semibold text-green-700">{vp.wasteKWh.toLocaleString()} kWh/mo</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{isHindi ? '🔋 कुल नवीकरणीय' : '🔋 Total Renewable'}</span>
          <span className="font-semibold text-emerald-700">{vp.totalRenewable.toLocaleString()} kWh/mo</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-3">
        <div className="flex-1 min-w-[130px] bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm">
          <div className="text-xs text-gray-500 mb-0.5">{isHindi ? 'ऊर्जा घाटा' : 'Energy Deficit'}</div>
          <div className={`text-lg font-extrabold ${vp.deficit > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {deficitDisplay} <span className="text-xs font-medium">kWh/mo</span>
          </div>
        </div>
        <div className="flex-1 min-w-[130px] bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm">
          <div className="text-xs text-gray-500 mb-0.5">{isHindi ? 'नवीकरणीय कवरेज' : 'Renewable Coverage'}</div>
          <div className={`text-lg font-extrabold ${vp.coverage >= 100 ? 'text-emerald-600' : vp.coverage >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
            {coverageDisplay}
          </div>
        </div>
      </div>

      {/* Coverage bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{isHindi ? 'नवीकरणीय कवरेज' : 'Renewable Coverage'}</span>
          <span>{coverageDisplay}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${meta.bar}`}
            style={{ width: `${Math.min(100, vp.coverage)}%` }}
          />
        </div>
      </div>

      <div className="text-xs text-gray-600 bg-white/70 rounded-lg px-3 py-2 border border-gray-100">
        → <span className="font-medium">{isHindi ? 'अनुशंसित:' : 'Recommended:'}</span> {recommendation}
      </div>
    </div>
  );
}

const energyPriorities = computeEnergyPriorities();

export default function RecommendationsPage() {
  const { t, isHindi } = useLanguage();
  const { role } = useAuth();
  const isCitizen = role === 'citizen';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState('motipur');
  
  const recommendationsSource = isCitizen ? HOUSEHOLD_RECOMMENDATIONS : DEMO_RECOMMENDATIONS;
  const filtered = recommendationsSource
    .filter((r) => isCitizen ? true : r.areaId === selectedAreaId)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  return (
    <div className="min-h-screen bg-gray-50" style={{
      backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(22,163,74,0.03) 40px, rgba(22,163,74,0.03) 80px)'
    }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border-l-4 border-green-600 fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('recommendationsTitle')}</h1>
            <p className="text-gray-500 text-sm mt-1">{t('recommendationsSubtitle')}</p>
          </div>
          <DemoBadge />
        </div>
        {!isCitizen ? (
          <div className="mt-4">
            <AreaSelector selectedAreaId={selectedAreaId} onSelect={(id) => { setSelectedAreaId(id); }} />
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2">
             <span className="text-sm font-medium text-gray-500">{isHindi ? 'के लिए डेटा देख रहे हैं:' : 'Viewing data for:'}</span>
             <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 text-sm font-bold flex items-center gap-1.5 shadow-sm">
                <Users className="w-4 h-4" /> {isHindi ? 'आपका परिवार' : 'Your Household'}
             </span>
          </div>
        )}
      </div>

      {/* ── AI Energy Distribution Priority (official only) ── */}
      {!isCitizen && (
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 fade-up">
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2 rounded-xl bg-violet-100 text-violet-600 shadow-sm">
              <BotMessageSquare className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isHindi ? '🤖 AI ऊर्जा वितरण प्राथमिकता' : '🤖 AI Energy Allocation Priority'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isHindi
                  ? 'ऊर्जा खपत, सौर उत्पादन, कचरा-ऊर्जा और ऊर्जा घाटे के आधार पर गतिशील रूप से गणना की गई।'
                  : 'Priority is dynamically calculated from energy consumption, solar generation, waste-to-energy generation and the resulting energy deficit.'}
              </p>
            </div>
          </div>

          {/* Flow legend */}
          <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5 mb-5 border border-gray-100 mt-4">
            <span className="font-semibold text-gray-700">{isHindi ? 'प्रवाह:' : 'Flow:'}</span>
            <span>☀️ {isHindi ? 'सौर' : 'Solar'}</span>
            <span className="text-gray-300">+</span>
            <span>♻️ {isHindi ? 'कचरा-ऊर्जा' : 'Waste-to-Energy'}</span>
            <span className="text-gray-300">→</span>
            <span>🔋 {isHindi ? 'कुल नवीकरणीय' : 'Total Renewable'}</span>
            <span className="text-gray-300">→</span>
            <span>⚡ {isHindi ? 'मांग से तुलना' : 'Compare vs Demand'}</span>
            <span className="text-gray-300">→</span>
            <span>🤖 {isHindi ? 'AI प्राथमिकता इंजन' : 'AI Priority Engine'}</span>
          </div>

          <div className="space-y-4">
            {energyPriorities
              .filter((vp) => vp.id === selectedAreaId)
              .map((vp) => (
                <EnergyPriorityCard key={vp.id} vp={vp} isHindi={isHindi} />
              ))}
          </div>
        </div>
      )}

      {/* Recommendation cards */}
      <div className="space-y-4">
        {filtered.map((rec) => (
          <RecCard
            key={rec.id}
            rec={rec}
            expanded={expandedId === rec.id}
            onToggle={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
            isHindi={isHindi}
          />
        ))}
      </div>
      </div>
    </div>
  );
}
