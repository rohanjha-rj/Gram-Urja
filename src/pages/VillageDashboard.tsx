import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import {
  Zap, Droplets, Leaf, Sun, TrendingUp, ArrowLeft, MapPin, Users, Home, Lightbulb, Search, Filter, Flame, Award
} from 'lucide-react';
import { getAllAreaAnalyses } from '../services/energyService';
import { SectionCard, DemoBadge, AssumptionBox, StatRow, ProgressBar } from '../components/ui';
import type { AreaAnalysis } from '../types';
import {
  calculateSustainabilityScoreBreakdown,
  ASSUMPTIONS,
} from '../calculations/engine';
import { useLanguage } from '../context/LanguageContext';

const DONUT_COLORS = ['#16a34a', '#f59e0b', '#0284c7', '#7c3aed', '#ef4444', '#6b7280'];

function AreaCard({ analysis, onClick, isHindi }: { analysis: AreaAnalysis; onClick: () => void; isHindi: boolean }) {
  const { area, monthlyCostINR, renewablePercent, solarPotential, wasteAnalysis } = analysis;

  const totalGenKWh = Math.round(solarPotential.monthlyGenerationKWh + (wasteAnalysis.electricityKWhPerDay * 30));

  const AREA_TYPE_LABEL: Record<string, { en: string; hi: string }> = {
    village: { en: 'Village', hi: 'ग्राम' },
    urban_ward: { en: 'Urban Ward', hi: 'शहरी वार्ड' },
    town: { en: 'Town', hi: 'कस्बा' }
  };

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-lg hover:border-emerald-400 transition-all group relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-gray-900 text-lg">{area.name}</span>
            <span className="text-xs text-gray-500 bg-gray-100 rounded-md px-2 py-0.5 font-medium">
              {isHindi ? AREA_TYPE_LABEL[area.type]?.hi : AREA_TYPE_LABEL[area.type]?.en}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
            <span><Users className="inline w-3.5 h-3.5 mr-1 text-gray-400" />{area.population.toLocaleString()} {isHindi ? 'निवासी' : 'residents'}</span>
            <span><Home className="inline w-3.5 h-3.5 mr-1 text-gray-400" />{area.households} {isHindi ? 'घर' : 'HH'}</span>
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-2.5 py-1 text-right">
          <div className="text-xs font-semibold">{isHindi ? 'नवीकरणीय' : 'Renewable'}</div>
          <div className="text-base font-extrabold">{renewablePercent.toFixed(0)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-gray-50/80 rounded-lg text-xs">
        <div>
          <span className="text-gray-400 block">{isHindi ? 'मासिक खपत' : 'Monthly Consumption'}</span>
          <span className="font-bold text-gray-800">{(area.monthlyElectricity / 1000).toFixed(1)}k kWh</span>
        </div>
        <div>
          <span className="text-gray-400 block">{isHindi ? 'स्वच्छ ऊर्जा क्षमता' : 'Clean Potential'}</span>
          <span className="font-bold text-emerald-600">{(totalGenKWh / 1000).toFixed(1)}k kWh/mo</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          {isHindi ? 'लागत:' : 'Est. Cost:'} <strong className="text-gray-800">₹{(monthlyCostINR / 1000).toFixed(1)}k/mo</strong>
        </span>
        <span className="text-xs text-emerald-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          {isHindi ? 'विवरण विश्लेषण →' : 'View analysis →'}
        </span>
      </div>
    </button>
  );
}

function AreaDetailView({ analysis, onBack }: { analysis: AreaAnalysis; onBack: () => void }) {
  const { area, energyBreakdown, solarPotential, wasteAnalysis, monthlyCostINR, co2KgPerMonth, renewablePercent } = analysis;
  const { t, isHindi } = useLanguage();

  const potentialGeneration = solarPotential.monthlyGenerationKWh + (wasteAnalysis.electricityKWhPerDay * 30);
  const potentialCo2Avoided = solarPotential.co2AvoidedKgPerMonth + wasteAnalysis.co2OffsetKgPerMonth;
  const potentialSavingsINR = potentialGeneration * ASSUMPTIONS.tariffINRPerKWh;
  
  const optimizedCost = Math.max(0, monthlyCostINR - potentialSavingsINR);
  const optimizedCo2 = Math.max(0, co2KgPerMonth - potentialCo2Avoided);
  const optimizedRenewable = Math.min(100, renewablePercent + (potentialGeneration / area.monthlyElectricity) * 100);

  const donutData = [
    { name: isHindi ? 'घर' : 'Households', value: energyBreakdown.households },
    { name: isHindi ? 'स्ट्रीटलाइट्स' : 'Streetlights', value: energyBreakdown.streetlights },
    { name: isHindi ? 'जल पंप' : 'Water Pumps', value: energyBreakdown.waterPumps },
    { name: isHindi ? 'स्कूल' : 'Schools', value: energyBreakdown.schools },
    { name: isHindi ? 'अस्पताल' : 'Hospitals', value: energyBreakdown.hospitals },
    { name: isHindi ? 'अन्य' : 'Other', value: energyBreakdown.other },
  ].filter(d => d.value > 0);

  // Radar data for Village Admin detailed analysis card
  const breakdown = calculateSustainabilityScoreBreakdown(area, solarPotential, wasteAnalysis, analysis.waterAnalysis);
  const radarData = [
    { subject: isHindi ? 'सौर उपयोग' : 'Solar Coverage', score: Math.min(100, Math.round(solarPotential.offsetPercent * 1.4)), fullMark: 100 },
    { subject: isHindi ? 'बायोगैस' : 'Biogas / Waste', score: Math.min(100, Math.round((wasteAnalysis.electricityKWhPerDay / 100) * 100)), fullMark: 100 },
    { subject: isHindi ? 'ऊर्जा दक्षता' : 'Energy Efficiency', score: Math.min(100, Math.round((1 - area.monthlyElectricity / (area.households * 350)) * 100 + 40)), fullMark: 100 },
    { subject: isHindi ? 'नवीकरणीय हिस्सा' : 'Renewable Share', score: Math.min(100, Math.round(renewablePercent * 2.5 + 20)), fullMark: 100 },
    { subject: isHindi ? 'ग्रिड आत्मनिर्भरता' : 'Grid Autonomy', score: Math.min(100, Math.round((potentialGeneration / area.monthlyElectricity) * 100)), fullMark: 100 },
    { subject: isHindi ? 'बुनियादी ढांचा' : 'Infrastructure', score: Math.min(100, Math.round((area.infrastructure.solar.installedCapacity / 20) * 100 + 30)), fullMark: 100 },
  ];

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-white/80 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('backToOverview')}
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <MapPin className="w-4 h-4 text-emerald-300" />
              <span className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">{area.type}</span>
              <DemoBadge className="bg-white/10 text-white border-white/20" />
            </div>
            <h1 className="text-3xl font-extrabold mb-1">{area.name}</h1>
            <div className="flex gap-4 text-emerald-100 text-sm">
              <span>{area.population.toLocaleString()} {isHindi ? 'निवासी' : 'residents'}</span>
              <span>·</span>
              <span>{area.households} {isHindi ? 'परिवार' : 'households'}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/15 min-w-[110px]">
              <div className="text-2xl font-black text-white">{renewablePercent.toFixed(0)}%</div>
              <div className="text-[11px] text-emerald-200">{isHindi ? 'वर्तमान नवीकरणीय' : 'Current Renewable'}</div>
            </div>
            <div className="bg-emerald-500/30 backdrop-blur-md rounded-xl p-3 text-center border border-emerald-400/40 min-w-[110px]">
              <div className="text-2xl font-black text-emerald-200">{optimizedRenewable.toFixed(0)}%</div>
              <div className="text-[11px] text-emerald-200">{isHindi ? 'संभावित नवीकरणीय' : 'Target Renewable'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Row: Comparison & Energy Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Comparison Cards (Takes 2/3) */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
          {/* Current State */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-400" /> {t('currentStatus')}
            </h3>
            <StatRow label={t('consumption')} value={(area.monthlyElectricity / 1000).toFixed(1)} unit="k kWh" />
            <StatRow label={t('electricityCost')} value={'₹' + (monthlyCostINR / 1000).toFixed(1) + 'k'} />
            <StatRow label={t('co2Emissions')} value={(co2KgPerMonth / 1000).toFixed(1)} unit={isHindi ? 'टन/माह' : 't/mo'} />
            <StatRow label={t('renewableEnergy')} value={renewablePercent.toFixed(1)} unit="%" />
          </div>

          {/* Optimized State */}
          <div className="bg-emerald-50/80 rounded-2xl border border-emerald-200 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <TrendingUp className="w-24 h-24 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-emerald-900 mb-4 flex items-center gap-2 relative z-10">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" /> {t('potentialOptimizedStatus')}
            </h3>
            <StatRow label={t('gridConsumption')} value={(Math.max(0, area.monthlyElectricity - potentialGeneration) / 1000).toFixed(1)} unit="k kWh" highlight />
            <StatRow label={t('electricityCost')} value={'₹' + (optimizedCost / 1000).toFixed(1) + 'k'} highlight />
            <StatRow label={t('co2Emissions')} value={(optimizedCo2 / 1000).toFixed(1)} unit={isHindi ? 'टन/माह' : 't/mo'} highlight />
            <StatRow label={t('renewableEnergy')} value={optimizedRenewable.toFixed(1)} unit="%" highlight />
          </div>
        </div>
        
        {/* Energy Breakdown (Takes 1/3) */}
        <div className="lg:col-span-1">
          <SectionCard title={t('energyBreakdown')} subtitle={t('energyBreakdownSub')} icon={<Zap className="w-4 h-4 text-emerald-600" />}>
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v} kWh`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <AssumptionBox items={[
              { label: isHindi ? 'स्कूल/माह' : 'School/mo', value: `${ASSUMPTIONS.schoolMonthlyKWh} kWh` },
              { label: isHindi ? 'अस्पताल/माह' : 'Hospital/mo', value: `${ASSUMPTIONS.hospitalMonthlyKWh} kWh` },
              { label: isHindi ? 'पंचायत/माह' : 'Panchayat/mo', value: `${ASSUMPTIONS.panchayatMonthlyKWh} kWh` },
            ]} />
          </SectionCard>
        </div>
      </div>

      {/* ── Radar Profile for Village Admin Detailed Analysis ── */}
      <div className="mb-6">
        <SectionCard
          title={t('radarProfileTitle')}
          subtitle={t('radarProfileSub')}
          icon={<Award className="w-4 h-4 text-emerald-600" />}
        >
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#374151' }} />
                <Radar name={area.name} dataKey="score" stroke="#059669" fill="#10b981" fillOpacity={0.35} />
                <Tooltip formatter={(val: number) => [`${val}%`, isHindi ? 'कवरेज' : 'Coverage']} />
              </RadarChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              <div className="text-xs text-gray-500 mb-2">
                {isHindi
                  ? 'यह प्रोफ़ाइल गांव के विभिन्न संसाधनों और ऊर्जा स्तंभों के बीच संतुलन को प्रदर्शित करती है:'
                  : 'This profile visualizes the resource and performance balance across key village pillars:'}
              </div>
              {radarData.map(item => (
                <div key={item.subject}>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>{item.subject}</span>
                    <span className="text-emerald-700">{item.score}%</span>
                  </div>
                  <ProgressBar value={item.score} color={item.score >= 60 ? 'bg-emerald-500' : item.score >= 40 ? 'bg-amber-500' : 'bg-blue-400'} />
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Solar & Biogas Opportunities */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Solar Opportunity */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/70 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-500 rounded-xl text-white shadow-sm">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('solarOpportunityTitle')}</h3>
                <p className="text-sm text-gray-600">{t('solarOpportunitySub')}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 mb-6 border border-amber-100/70 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t('maxFeasibleCapacity')}</div>
              <div className="text-4xl font-extrabold text-amber-600 mb-2">{solarPotential.feasibleCapacityKW.toFixed(1)} <span className="text-xl text-amber-600/70">kW</span></div>
              <p className="text-xs text-gray-500">
                {isHindi
                  ? `${area.infrastructure.solar.roofAreaSqFt} वर्ग फुट उपलब्ध छत क्षेत्र पर आधारित।`
                  : `Based on ${area.infrastructure.solar.roofAreaSqFt} sq.ft of available space.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-amber-100/70">
                <div className="flex items-center gap-2 text-amber-600 mb-1.5">
                  <Zap className="w-4 h-4" />
                  <span className="font-bold text-xs">{t('freePower')}</span>
                </div>
                <div className="text-base font-extrabold text-gray-900">{solarPotential.monthlyGenerationKWh.toLocaleString()} <span className="text-xs font-normal text-gray-500">kWh/mo</span></div>
                <div className="text-xs font-medium text-emerald-600 mt-1">
                  {isHindi ? `मांग का ${solarPotential.offsetPercent.toFixed(1)}% पूरा` : `Offsets ${solarPotential.offsetPercent.toFixed(1)}%`}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-amber-100/70">
                <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
                  <Leaf className="w-4 h-4" />
                  <span className="font-bold text-xs">{t('environment')}</span>
                </div>
                <div className="text-base font-extrabold text-gray-900">{(solarPotential.co2AvoidedKgPerMonth / 1000).toFixed(1)} <span className="text-xs font-normal text-gray-500">{isHindi ? 'टन CO₂' : 'tons CO₂'}</span></div>
                <div className="text-xs font-medium text-gray-500 mt-1">{isHindi ? 'प्रति माह बचत' : 'Saved monthly'}</div>
              </div>
            </div>

            <div className="bg-gray-900 text-white rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1">{t('estimatedInvestment')}</div>
                <div className="text-lg font-bold">₹{(solarPotential.estimatedCostINR / 100000).toFixed(1)} {isHindi ? 'लाख' : 'Lakhs'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">{t('paysForItselfIn')}</div>
                <div className="text-lg font-bold text-emerald-400">{solarPotential.paybackYears.toFixed(1)} {t('years')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Biogas Opportunity */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/70 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-sm">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('biogasOpportunityTitle')}</h3>
                <p className="text-sm text-gray-600">{t('biogasOpportunitySub')}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 mb-6 border border-emerald-100/70 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t('dailyGasProduction')}</div>
                <div className="text-4xl font-extrabold text-emerald-600 mb-2">{wasteAnalysis.biogasM3PerDay.toFixed(1)} <span className="text-xl text-emerald-600/70">m³</span></div>
              </div>
              <div className="flex flex-col gap-1.5 border-l border-gray-100 pl-4">
                 <div className="text-xs text-gray-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-700"></span> {area.cowDungKgPerDay} kg {isHindi ? 'गोबर' : 'Dung'}</div>
                 <div className="text-xs text-gray-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-400"></span> {area.foodWasteKgPerDay} kg {isHindi ? 'खाद्य अपशिष्ट' : 'Food Waste'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-emerald-100/70">
                <div className="flex items-center gap-2 text-orange-500 mb-1.5">
                  <Flame className="w-4 h-4" />
                  <span className="font-bold text-xs">{t('thermalEnergy')}</span>
                </div>
                <div className="text-base font-extrabold text-gray-900">{wasteAnalysis.thermalEnergyKWhPerDay.toFixed(0)} <span className="text-xs font-normal text-gray-500">kWh/{isHindi ? 'दिन' : 'day'}</span></div>
                <div className="text-xs font-medium text-gray-500 mt-1">{t('usefulForCooking')}</div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-emerald-100/70">
                <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
                  <Zap className="w-4 h-4" />
                  <span className="font-bold text-xs">{isHindi ? 'विद्युत' : 'Electricity'}</span>
                </div>
                <div className="text-base font-extrabold text-gray-900">{wasteAnalysis.electricityKWhPerDay.toFixed(0)} <span className="text-xs font-normal text-gray-500">kWh/{isHindi ? 'दिन' : 'day'}</span></div>
                <div className="text-xs font-medium text-emerald-600 mt-1">{isHindi ? 'स्वच्छ उत्पादन' : 'Clean generation'}</div>
              </div>
            </div>
            
            <div className="bg-gray-900 text-white rounded-xl p-5 flex items-center justify-between">
               <div>
                 <div className="text-xs text-gray-400 mb-1">{t('environmentalImpact')}</div>
                 <div className="text-base font-bold text-emerald-400">{(wasteAnalysis.co2OffsetKgPerMonth / 1000).toFixed(1)} {isHindi ? 'टन CO₂ निवारण/माह' : 'tons CO₂ avoided/mo'}</div>
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
  const { t, isHindi } = useLanguage();
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

  const avgRenewable = Math.round(analyses.reduce((s, a) => s + a.renewablePercent, 0) / analyses.length);

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
            <h1 className="text-2xl font-bold text-gray-900">{t('commandCenterTitle')}</h1>
            <p className="text-gray-500 text-sm mt-1">{t('commandCenterSubtitle')}</p>
          </div>
          <DemoBadge />
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('totalConsumption'), value: (analyses.reduce((s, a) => s + a.area.monthlyElectricity, 0) / 1000).toFixed(0) + 'k kWh', color: 'text-blue-700 bg-blue-50', border: 'border border-blue-100' },
          { label: t('totalCost'), value: '₹' + (analyses.reduce((s, a) => s + a.monthlyCostINR, 0) / 100000).toFixed(1) + 'L', color: 'text-amber-700 bg-amber-50', border: 'border border-amber-100' },
          { label: t('totalCO2'), value: (analyses.reduce((s, a) => s + a.co2KgPerMonth, 0) / 1000).toFixed(1) + 't', color: 'text-red-700 bg-red-50', border: 'border border-red-100' },
          { label: t('renewableShare'), value: avgRenewable + '%', color: 'text-emerald-700 bg-emerald-50', border: 'border border-emerald-100' },
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
              placeholder={t('searchPlaceholder')} 
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white/10 text-white placeholder-gray-400 backdrop-blur-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-colors ${showFilters ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-white/10 text-white border-transparent hover:bg-white/20'}`}
          >
            <Filter className="w-5 h-5" />
            {t('filtersBtn')} {Object.values(filterState).some(v => v !== '') && <span className="w-2 h-2 rounded-full bg-amber-400 ml-1" />}
          </button>
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('minConsumption')}</label>
              <input 
                type="number" 
                placeholder="e.g. 10000"
                className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                value={filterState.minConsumption}
                onChange={e => setFilterState({...filterState, minConsumption: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('maxConsumption')}</label>
              <input 
                type="number" 
                placeholder="e.g. 50000"
                className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                value={filterState.maxConsumption}
                onChange={e => setFilterState({...filterState, maxConsumption: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('minPopulation')}</label>
              <input 
                type="number" 
                placeholder="e.g. 1000"
                className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                value={filterState.minPopulation}
                onChange={e => setFilterState({...filterState, minPopulation: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('maxPopulation')}</label>
              <input 
                type="number" 
                placeholder="e.g. 5000"
                className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                value={filterState.maxPopulation}
                onChange={e => setFilterState({...filterState, maxPopulation: e.target.value})}
              />
            </div>
            
            <div className="col-span-full flex justify-end">
              <button 
                onClick={() => setFilterState({minConsumption: '', maxConsumption: '', minPopulation: '', maxPopulation: ''})}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {t('clearFilters')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Area cards grid */}
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <span className="text-sm text-gray-300">{t('clickAreaHint')}</span>
      </div>
      
      {filteredAnalyses.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white/5 rounded-xl border border-white/10">
          {isHindi ? 'कोई क्षेत्र नहीं मिला।' : 'No areas found matching your criteria.'}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnalyses.map((analysis) => (
            <AreaCard key={analysis.area.id} analysis={analysis} onClick={() => setSelected(analysis.area.id)} isHindi={isHindi} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
