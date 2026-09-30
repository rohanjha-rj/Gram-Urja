import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import {
  Plus, Minus, Zap, Droplets, Leaf, Trash2,
  ChevronDown, ChevronUp, Star, Lightbulb, Fan,
  Tv, Laptop, Monitor, Snowflake, Waves, Flame,
  Wind, Sparkles, Sliders, PieChart as PieChartIcon,
  RotateCcw, Users, Activity, ArrowUpRight
} from 'lucide-react';
import { APPLIANCE_DATABASE } from '../data/demoData';
import { calculateElectricityCost, calculateCO2, calculateBiogas, calculateWaterDemand, ASSUMPTIONS } from '../calculations/engine';
import { SectionCard, KpiCard, DemoBadge, AssumptionBox, StatRow } from '../components/ui';
import { getProductCategory } from '../data/productData';
import { useHousehold, DEFAULT_APPLIANCES } from '../context/HouseholdContext';
import { useLanguage } from '../context/LanguageContext';
import type { HouseholdAppliance } from '../types';
import type { ApplianceCategory } from '../data/productData';

const CATEGORY_COLORS: Record<string, string> = {
  lighting: '#f59e0b',
  cooling: '#0284c7',
  entertainment: '#8b5cf6',
  kitchen: '#ef4444',
  pump: '#10b981',
  other: '#6b7280',
};

const CATEGORY_BG_LIGHT: Record<string, string> = {
  lighting: 'bg-amber-50 text-amber-700 border-amber-200',
  cooling: 'bg-sky-50 text-sky-700 border-sky-200',
  entertainment: 'bg-purple-50 text-purple-700 border-purple-200',
  kitchen: 'bg-rose-50 text-rose-700 border-rose-200',
  pump: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  other: 'bg-gray-50 text-gray-700 border-gray-200',
};

function getApplianceIcon(specId: string, category: string) {
  if (specId.includes('led') || specId.includes('tube') || specId.includes('sl_')) {
    return <Lightbulb className="w-4 h-4 text-amber-500" />;
  }
  if (specId.includes('fan')) {
    return <Fan className="w-4 h-4 text-sky-500" />;
  }
  if (specId.includes('tv')) {
    return <Tv className="w-4 h-4 text-purple-500" />;
  }
  if (specId.includes('laptop')) {
    return <Laptop className="w-4 h-4 text-indigo-500" />;
  }
  if (specId.includes('desktop')) {
    return <Monitor className="w-4 h-4 text-blue-500" />;
  }
  if (specId.includes('pump')) {
    return <Droplets className="w-4 h-4 text-cyan-600" />;
  }
  if (specId.includes('cooler')) {
    return <Wind className="w-4 h-4 text-teal-500" />;
  }
  if (specId.includes('ac')) {
    return <Snowflake className="w-4 h-4 text-blue-600" />;
  }
  if (specId.includes('fridge')) {
    return <Sparkles className="w-4 h-4 text-emerald-600" />;
  }
  if (specId.includes('washing')) {
    return <Waves className="w-4 h-4 text-blue-500" />;
  }
  if (specId.includes('mixer')) {
    return <Zap className="w-4 h-4 text-orange-500" />;
  }
  if (specId.includes('iron')) {
    return <Flame className="w-4 h-4 text-rose-500" />;
  }
  switch (category) {
    case 'lighting': return <Lightbulb className="w-4 h-4 text-amber-500" />;
    case 'cooling': return <Wind className="w-4 h-4 text-sky-500" />;
    case 'entertainment': return <Tv className="w-4 h-4 text-purple-500" />;
    case 'kitchen': return <Sparkles className="w-4 h-4 text-rose-500" />;
    case 'pump': return <Droplets className="w-4 h-4 text-emerald-500" />;
    default: return <Zap className="w-4 h-4 text-emerald-600" />;
  }
}

export default function HouseholdDashboard() {
  const { appliances, setAppliances, members, setMembers, totalKWh } = useHousehold();
  const { t, isHindi } = useLanguage();
  const [addingAppliance, setAddingAppliance] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState(APPLIANCE_DATABASE[0].id);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Calculations that recompute reactively whenever appliances change
  const totalCost = calculateElectricityCost(totalKWh);
  const totalCO2 = calculateCO2(totalKWh);
  const perMemberKWh = totalKWh / Math.max(1, members);
  const waterDemand = calculateWaterDemand(members, ASSUMPTIONS.waterLpcdRural);
  const biogasKgPerDay = members * 0.5; // avg food waste per person
  const biogasM3 = calculateBiogas(0, 0, biogasKgPerDay);

  // Category breakdown for chart & summary
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    appliances.filter((a) => a.enabled).forEach((a) => {
      const kwh = a.spec.unit === 'kWh/day'
        ? a.spec.wattage * a.quantity * a.daysPerMonth
        : (a.spec.wattage * a.quantity * a.hoursPerDay * a.daysPerMonth) / 1000;
      map[a.spec.category] = (map[a.spec.category] ?? 0) + kwh;
    });
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value: +value.toFixed(1),
        percent: totalKWh > 0 ? +((value / totalKWh) * 100).toFixed(1) : 0,
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [appliances, totalKWh]);

  const topCategory = categoryBreakdown[0];

  function updateAppliance(index: number, patch: Partial<HouseholdAppliance>) {
    setAppliances((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function removeAppliance(index: number) {
    setAppliances((prev) => prev.filter((_, i) => i !== index));
  }

  function addAppliance() {
    const spec = APPLIANCE_DATABASE.find((s) => s.id === selectedSpec);
    if (!spec) return;
    setAppliances((prev) => [
      ...prev,
      {
        spec,
        quantity: 1,
        hoursPerDay: (spec as any).typicalDailyHours ?? 4,
        daysPerMonth: 30,
        enabled: true,
      },
    ]);
    setAddingAppliance(false);
  }

  function resetDefaultAppliances() {
    setAppliances(DEFAULT_APPLIANCES);
  }

  // Energy upgrade suggestions
  const upgradeCategories = useMemo(() => {
    const result = [];
    const seenCategories = new Set<string>();
    for (const app of appliances.filter((a) => a.enabled)) {
      const productCat = getProductCategory(app.spec.id);
      if (!productCat || seenCategories.has(productCat.id)) continue;
      seenCategories.add(productCat.id);
      result.push({
        ...productCat,
        currentPowerW: app.spec.wattage,
        currentEnergyKWhPerDay: app.spec.unit === 'kWh/day' ? app.spec.wattage : undefined,
        currentHoursPerDay: app.hoursPerDay,
        currentName: app.spec.name,
      });
    }
    return result;
  }, [appliances]);

  return (
    <div className="min-h-screen relative" style={{
      backgroundImage: 'url(/dashboard-bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ── Page Header ── */}
        <div className="glass-card rounded-2xl p-5 mb-6 fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    {t('householdTitle')}
                  </h1>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    {t('householdSubtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* Household profile quick controls */}
            <div className="flex flex-wrap items-center gap-3 bg-emerald-50/80 border border-emerald-200/60 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-semibold text-emerald-900">{isHindi ? 'परिवार के सदस्य:' : 'Family Members:'}</span>
                <div className="flex items-center gap-1.5 bg-white rounded-lg p-0.5 border border-emerald-200 shadow-xs">
                  <button
                    onClick={() => setMembers((m) => Math.max(1, m - 1))}
                    title="Decrease members"
                    className="w-6 h-6 rounded-md bg-gray-50 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-gray-900">{members}</span>
                  <button
                    onClick={() => setMembers((m) => m + 1)}
                    title="Increase members"
                    className="w-6 h-6 rounded-md bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-800 transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            title={isHindi ? 'मासिक बिजली खपत' : 'Monthly Consumption'}
            value={totalKWh.toFixed(1)}
            unit="kWh"
            icon={<Zap className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-100"
            formula="Sum(Power × Qty × Hours × Days / 1000)"
            source="Live Calculation"
            dataType="Live"
          />
          <KpiCard
            title={isHindi ? 'अनुमानित बिजली खर्च' : 'Estimated Cost'}
            value={'₹' + totalCost.toLocaleString()}
            unit={`@ ₹${ASSUMPTIONS.tariffINRPerKWh}/kWh`}
            icon={<Zap className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-100"
            formula={`kWh × ₹${ASSUMPTIONS.tariffINRPerKWh}`}
            source="Standard tariff"
            dataType="Estimated"
          />
          <KpiCard
            title={isHindi ? 'CO₂ उत्सर्जन' : 'CO₂ Emissions'}
            value={totalCO2.toFixed(2)}
            unit={isHindi ? 'किग्रा/माह' : 'kg/mo'}
            icon={<Leaf className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-100"
            formula={`kWh × ${ASSUMPTIONS.gridEmissionFactor} kg/kWh`}
            source="CEA 2023"
            dataType="Estimated"
          />
          <KpiCard
            title={isHindi ? 'बायोगैस उत्पादन क्षमता' : 'Biogas Potential'}
            value={(biogasM3 * 30).toFixed(1)}
            unit={isHindi ? 'm³/माह' : 'm³/mo'}
            icon={<Sparkles className="w-5 h-5 text-teal-600" />}
            iconBg="bg-teal-100"
            formula="0.5 kg waste/person × 0.06 m³/kg"
            source="GramUrja"
            dataType="Estimated"
          />
        </div>

        {/* ── MERGED UNIFIED CARD: Appliance Inventory + Consumption by Category ── */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/90 shadow-lg p-5 sm:p-6 mb-8 transition-all hover:shadow-xl">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                  <Sliders className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{isHindi ? 'उपकरण सूची एवं खपत विभाजन' : 'Appliance Inventory & Consumption Breakdown'}</h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {isHindi ? 'उपकरण संख्या या दैनिक घंटों को बदलें — चार्ट और लागत तुरंत अपडेट होंगे!' : 'Directly change appliance counts or daily hours below — chart and costs update instantly!'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {appliances.filter((a) => a.enabled).length} {isHindi ? 'सक्रिय उपकरण' : 'Active Devices'}
              </span>
              <button
                onClick={resetDefaultAppliances}
                title="Reset to default appliances"
                className="text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition font-medium"
              >
                <RotateCcw className="w-3 h-3" /> {isHindi ? 'रीसेट' : 'Reset'}
              </button>
            </div>
          </div>

          {/* Unified Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">

            {/* Left Column: Interactive Appliance Table (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {isHindi ? 'आपके घरेलू उपकरण' : 'Your Household Appliances'} ({appliances.length})
                  </div>
                  <div className="text-xs text-gray-400">
                    {isHindi ? 'सीधा नियंत्रण सक्रिय' : 'Direct controls enabled'}
                  </div>
                </div>

                {/* Appliances List with Direct Inline Steppers */}
                <div className="space-y-2.5 overflow-x-auto">
                  {appliances.map((a, idx) => {
                    const kwh = a.spec.unit === 'kWh/day'
                      ? a.spec.wattage * a.quantity * a.daysPerMonth
                      : (a.spec.wattage * a.quantity * a.hoursPerDay * a.daysPerMonth) / 1000;
                    
                    const catBg = CATEGORY_BG_LIGHT[a.spec.category] ?? 'bg-gray-50 text-gray-700 border-gray-200';

                    return (
                      <div
                        key={idx}
                        className={`group relative flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                          a.enabled
                            ? 'bg-white border-gray-200/90 hover:border-emerald-300 hover:shadow-xs'
                            : 'bg-gray-50/80 border-gray-200/50 opacity-50'
                        }`}
                      >
                        {/* Appliance Icon & Name */}
                        <div className="flex items-center gap-2.5 min-w-[140px] flex-1">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            {getApplianceIcon(a.spec.id, a.spec.category)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                              {a.spec.name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{a.spec.wattage}{a.spec.unit === 'kWh/day' ? ' kWh/d' : 'W'}</span>
                              <span className={`px-1.5 py-0.2 rounded border text-[10px] capitalize font-medium ${catBg}`}>
                                {a.spec.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Direct Stepper: Quantity */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-tight mb-1">
                            {isHindi ? 'संख्या' : 'Qty'}
                          </span>
                          <div className="flex items-center border-2 border-emerald-100 rounded-lg bg-emerald-50/50 overflow-hidden shadow-xs hover:border-emerald-300 transition-colors">
                            <button
                              onClick={() => updateAppliance(idx, { quantity: Math.max(0, a.quantity - 1) })}
                              className="w-7 h-7 bg-white hover:bg-emerald-100 flex items-center justify-center text-gray-700 transition"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max="50"
                              value={a.quantity}
                              onChange={(e) => updateAppliance(idx, { quantity: Math.max(0, parseInt(e.target.value) || 0) })}
                              className="w-9 text-center font-bold text-xs bg-transparent border-0 focus:ring-0 p-0 text-gray-900"
                            />
                            <button
                              onClick={() => updateAppliance(idx, { quantity: a.quantity + 1 })}
                              className="w-7 h-7 bg-white hover:bg-emerald-100 flex items-center justify-center text-emerald-800 transition"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Direct Stepper: Hours per day */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-tight mb-1">
                            {isHindi ? 'घंटे/दिन' : 'Hours/Day'}
                          </span>
                          {a.spec.unit === 'kWh/day' ? (
                            <div className="h-7 px-2 flex items-center text-xs text-gray-400 bg-gray-100 rounded-lg">
                              24h
                            </div>
                          ) : (
                            <div className="flex items-center border-2 border-sky-100 rounded-lg bg-sky-50/50 overflow-hidden shadow-xs hover:border-sky-300 transition-colors">
                              <button
                                onClick={() => updateAppliance(idx, { hoursPerDay: Math.max(0, +(a.hoursPerDay - 0.5).toFixed(1)) })}
                                className="w-7 h-7 bg-white hover:bg-sky-100 flex items-center justify-center text-gray-700 transition"
                                title="Decrease hours"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-11 text-center font-bold text-xs text-gray-900">
                                {a.hoursPerDay}h
                              </span>
                              <button
                                onClick={() => updateAppliance(idx, { hoursPerDay: Math.min(24, +(a.hoursPerDay + 0.5).toFixed(1)) })}
                                className="w-7 h-7 bg-white hover:bg-sky-100 flex items-center justify-center text-sky-800 transition"
                                title="Increase hours"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Calculated kWh badge & Toggle */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-bold text-blue-700">
                              {kwh.toFixed(1)} <span className="text-[10px] font-normal text-gray-500">kWh</span>
                            </div>
                            <div className="text-[10px] text-gray-400">
                              ₹{(kwh * ASSUMPTIONS.tariffINRPerKWh).toFixed(0)}/{isHindi ? 'माह' : 'mo'}
                            </div>
                          </div>

                          {/* On/Off Switch */}
                          <button
                            onClick={() => updateAppliance(idx, { enabled: !a.enabled })}
                            title={a.enabled ? 'Click to disable' : 'Click to enable'}
                            className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                              a.enabled ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`block w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                                a.enabled ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>

                          {/* Remove button */}
                          <button
                            onClick={() => removeAppliance(idx)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition"
                            title="Remove appliance"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add New Appliance inline form */}
                <div className="mt-4">
                  {addingAppliance ? (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-wrap gap-2 items-center">
                      <select
                        value={selectedSpec}
                        onChange={(e) => setSelectedSpec(e.target.value)}
                        className="flex-1 text-xs sm:text-sm border border-emerald-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-900 focus:outline-emerald-600"
                      >
                        {APPLIANCE_DATABASE.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.wattage}{s.unit === 'kWh/day' ? ' kWh/day' : 'W'} - {s.category})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={addAppliance}
                        className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700 shadow-sm transition"
                      >
                        {isHindi ? 'सूची में जोड़ें' : 'Add to Inventory'}
                      </button>
                      <button
                        onClick={() => setAddingAppliance(false)}
                        className="text-gray-500 hover:text-gray-800 text-xs px-2 py-1"
                      >
                        {isHindi ? 'रद्द करें' : 'Cancel'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingAppliance(true)}
                      className="w-full py-2.5 border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-xl text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/50 flex items-center justify-center gap-1.5 transition"
                    >
                      <Plus className="w-4 h-4" /> {isHindi ? 'अन्य घरेलू उपकरण जोड़ें' : 'Add Another Household Appliance'}
                    </button>
                  )}
                </div>
              </div>

              {/* Total Tally Summary Footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600 bg-gray-50/70 rounded-xl p-3">
                <div className="font-semibold text-gray-800">
                  {isHindi ? 'कुल सक्रिय विद्युत भार:' : 'Total Active Power Load:'}
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-emerald-700">{totalKWh.toFixed(1)} kWh/{isHindi ? 'माह' : 'month'}</span>
                  <span className="text-gray-400 ml-2">(₹{totalCost.toLocaleString()}/{isHindi ? 'माह' : 'mo'})</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Dynamic Consumption by Category Chart (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-gray-50/90 to-white/90 rounded-2xl border border-gray-200/80 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-gray-900 text-sm">{isHindi ? 'श्रेणीवार बिजली खपत' : 'Live Consumption by Category'}</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                    Live
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  {isHindi ? 'उपकरण समायोजन के साथ ऊर्जा वितरण तुरंत अपडेट होता है।' : 'Visual energy share dynamically updating with your appliance adjustments.'}
                </p>

                {/* Donut Chart */}
                <div className="h-48 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                        animationDuration={600}
                      >
                        {categoryBreakdown.map((d) => (
                          <Cell key={d.name} fill={CATEGORY_COLORS[d.name] ?? '#6b7280'} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: number) => [`${val} kWh`, isHindi ? 'खपत' : 'Consumption']}
                        contentStyle={{ borderRadius: '10px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Total inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">{isHindi ? 'कुल' : 'Total'}</span>
                    <span className="text-lg font-black text-gray-900">{totalKWh.toFixed(0)}</span>
                    <span className="text-[10px] text-gray-500 font-medium">kWh/{isHindi ? 'माह' : 'mo'}</span>
                  </div>
                </div>

                {/* Category Progress Bars & Metrics */}
                <div className="space-y-2 mt-3">
                  {categoryBreakdown.map((d) => {
                    const color = CATEGORY_COLORS[d.name] ?? '#6b7280';
                    return (
                      <div key={d.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <span className="font-semibold text-gray-700 capitalize">{d.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{d.value} kWh</span>
                            <span className="text-[11px] text-gray-400 font-medium">({d.percent}%)</span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200/80 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${d.percent}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Energy Saving Insight Box */}
              {topCategory && (
                <div className="mt-5 p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isHindi ? 'सर्वाधिक बिजली खपत:' : 'Highest Drain:'} <span className="capitalize">{topCategory.name}</span> ({topCategory.percent}%)</span>
                  </div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    {isHindi ? 'पुराने उपकरणों को 5-स्टार BEE रेटेड उपकरणों से बदलने पर 45% तक बिजली बचत संभव है।' : 'Upgrading older cooling & lighting to 5-star BEE rated equipment can save up to 45% on this category.'}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Water Usage & Food Waste / Biogas Cards ── */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <SectionCard
            title={isHindi ? 'जल उपयोग विश्लेषण' : 'Water Usage Breakdown'}
            subtitle={`${members} ${isHindi ? 'परिवार सदस्य · 55 LPCD मानक' : 'household members · 55 LPCD Standard'}`}
            icon={<Droplets className="w-4 h-4 text-cyan-600" />}
          >
            <DemoBadge className="mb-4" />
            <StatRow label={isHindi ? 'दैनिक घरेलू जल मांग' : 'Daily Household Water Demand'} value={waterDemand.toFixed(0)} unit={isHindi ? 'लीटर' : 'litres'} highlight />
            <StatRow label={isHindi ? 'मासिक जल आयतन' : 'Monthly Water Volume'} value={(waterDemand * 30 / 1000).toFixed(1)} unit="kL" />
            <StatRow label={isHindi ? 'LPCD मानक' : 'LPCD Standard'} value="55" unit="L/person/day" />
            <StatRow label={isHindi ? 'अनुमानित मासिक जल लागत' : 'Estimated Monthly Water Cost'} value={`₹${(waterDemand * 30 * 0.02).toFixed(0)}`} />
            <AssumptionBox items={[
              { label: 'Rural LPCD', value: '55 L/person/day (WHO/GoI standard)' },
              { label: 'Water rate', value: '₹0.02/litre' },
            ]} />
          </SectionCard>

          <SectionCard
            title={isHindi ? 'घरेलू कचरा एवं बायोगैस संभावना' : 'Household Waste & Biogas Potential'}
            subtitle={isHindi ? 'जैविक रसोई अपशिष्ट → स्वच्छ रसोई गैस' : 'Organic food waste → clean cooking fuel'}
            icon={<Leaf className="w-4 h-4 text-emerald-600" />}
          >
            <DemoBadge className="mb-4" />
            <StatRow label={isHindi ? 'अनुमानित दैनिक खाद्य अपशिष्ट' : 'Estimated Daily Food Waste'} value={(biogasKgPerDay).toFixed(1)} unit="kg/day" />
            <StatRow label={isHindi ? 'बायोगैस उत्पादन क्षमता' : 'Biogas Generation Potential'} value={biogasM3.toFixed(3)} unit="m³/day" highlight />
            <StatRow label={isHindi ? 'स्वच्छ तापीय ऊर्जा' : 'Clean Thermal Energy'} value={(biogasM3 * ASSUMPTIONS.biogasThermalKWhPerM3).toFixed(3)} unit="kWh/day" />
            <StatRow label={isHindi ? 'मासिक बायोगैस उत्पादन' : 'Monthly Biogas Output'} value={(biogasM3 * 30).toFixed(2)} unit="m³/month" />
            <AssumptionBox items={[
              { label: 'Food waste/person', value: '0.5 kg/day (average)' },
              { label: 'Food waste→biogas yield', value: '0.06 m³/kg' },
              { label: '1 m³ biogas equivalent', value: '6 kWh thermal / 2 kWh electric' },
            ]} />
          </SectionCard>
        </div>

        {/* ── Upgrade Recommendations ── */}
        {upgradeCategories.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3 fade-left">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-white">{isHindi ? 'ऊर्जा-कुशल उपकरण अपग्रेड सुझाव' : 'Recommended Energy Efficient Upgrades'}</h2>
              <span className="text-xs bg-amber-100 text-amber-800 border border-amber-200 rounded-full px-2.5 py-0.5 font-bold ml-1">
                {upgradeCategories.length} {isHindi ? 'सुझाव उपलब्ध' : 'upgrades available'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-200 mb-5 italic">
              {isHindi ? 'अनुमानित बचत आपके सक्रिय उपकरणों और औसत ग्रामीण शुल्क के आधार पर आंकी गई है।' : 'Estimated savings are calculated against your active inventory power specifications and average rural tariff.'}
            </p>

            <div className="space-y-5">
              {upgradeCategories.map((cat) => {
                const currentMonthlyKWh = cat.currentEnergyKWhPerDay
                  ? cat.currentEnergyKWhPerDay * 30
                  : (cat.currentPowerW * cat.currentHoursPerDay * 30) / 1000;
                const isExpanded = expandedCategory === cat.id;

                // Find best payback option
                const bestPaybackIdx = cat.options.reduce((bestIdx, opt, i) => {
                  const optMonthly = opt.energyKWhPerDay
                    ? opt.energyKWhPerDay * 30
                    : (opt.powerW * cat.currentHoursPerDay * 30) / 1000;
                  const savingKWh = currentMonthlyKWh - optMonthly;
                  const savingINR = savingKWh * ASSUMPTIONS.tariffINRPerKWh;
                  const payback = savingINR > 0 ? opt.approxCostINR / savingINR : Infinity;
                  const bestOptMonthly = cat.options[bestIdx].energyKWhPerDay
                    ? cat.options[bestIdx].energyKWhPerDay! * 30
                    : (cat.options[bestIdx].powerW * cat.currentHoursPerDay * 30) / 1000;
                  const bestSavingKWh = currentMonthlyKWh - bestOptMonthly;
                  const bestSavingINR = bestSavingKWh * ASSUMPTIONS.tariffINRPerKWh;
                  const bestPayback = bestSavingINR > 0 ? cat.options[bestIdx].approxCostINR / bestSavingINR : Infinity;
                  return payback < bestPayback ? i : bestIdx;
                }, 0);

                return (
                  <div key={cat.id} className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden scale-in">
                    {/* Category header */}
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <div className="font-bold text-gray-900">{cat.label} {isHindi ? 'अपग्रेड विकल्प' : 'Upgrade Options'}</div>
                          <div className="text-xs text-gray-500">
                            {isHindi ? 'वर्तमान:' : 'Current:'} {cat.currentName} ·{' '}
                            {cat.currentEnergyKWhPerDay
                              ? `${cat.currentEnergyKWhPerDay} kWh/day`
                              : `${cat.currentPowerW}W`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-700 font-semibold hidden sm:inline">
                          {isExpanded ? (isHindi ? 'विकल्प छिपाएं' : 'Hide options') : (isHindi ? 'उत्पाद एवं लागत वसूली देखें' : 'View products & payback')}
                        </span>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/50">
                        {/* Product cards */}
                        <div className="grid sm:grid-cols-3 gap-4 p-5">
                          {cat.options.map((opt, optIdx) => {
                            const optMonthlyKWh = opt.energyKWhPerDay
                              ? opt.energyKWhPerDay * 30
                              : (opt.powerW * cat.currentHoursPerDay * 30) / 1000;
                            const savingKWh = +(currentMonthlyKWh - optMonthlyKWh).toFixed(2);
                            const savingINR = Math.round(savingKWh * ASSUMPTIONS.tariffINRPerKWh);
                            const paybackMonths = savingINR > 0
                              ? Math.ceil(opt.approxCostINR / savingINR)
                              : null;
                            const isBestValue = optIdx === bestPaybackIdx && savingINR > 0;

                            return (
                              <div
                                key={opt.id}
                                className={`relative rounded-xl border-2 p-4 transition-all ${
                                  isBestValue
                                    ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                              >
                                {isBestValue && (
                                  <div className="absolute -top-2.5 left-3 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                                    ✨ {isHindi ? 'सर्वश्रेष्ठ विकल्प' : 'Best Value Choice'}
                                  </div>
                                )}
                                <div className="text-2xl mb-1.5">{cat.icon}</div>
                                <div className="font-bold text-gray-900 text-sm mb-1">{opt.name}</div>
                                {opt.motorType && (
                                  <div className="text-xs text-blue-600 font-semibold mb-1">{opt.motorType} Motor</div>
                                )}
                                {opt.beeStars && (
                                  <div className="flex gap-0.5 mb-2 items-center">
                                    {Array.from({ length: 5 }, (_, i) => (
                                      <Star key={i} className={`w-3 h-3 ${i < opt.beeStars! ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                                    ))}
                                    <span className="text-[10px] font-bold text-gray-500 ml-1">BEE {opt.beeStars}-Star</span>
                                  </div>
                                )}
                                <div className="space-y-1 text-xs text-gray-600 mb-3 border-t border-gray-100 pt-2">
                                  <div className="flex justify-between">
                                    <span>{isHindi ? 'पावर रेटिंग' : 'Power Rating'}</span>
                                    <span className="font-semibold text-blue-700">
                                      {opt.energyKWhPerDay ? `${opt.energyKWhPerDay} kWh/day` : `${opt.powerW}W`}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{isHindi ? 'मासिक खपत' : 'Monthly usage'}</span>
                                    <span className="font-semibold">{optMonthlyKWh.toFixed(1)} kWh</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{isHindi ? 'मासिक बचत' : 'Monthly saving'}</span>
                                    <span className="font-bold text-emerald-700">
                                      {savingKWh > 0 ? `${savingKWh} kWh (₹${savingINR})` : 'Baseline'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{isHindi ? 'वार्षिक बचत' : 'Annual saving'}</span>
                                    <span className="font-bold text-emerald-700">
                                      {savingKWh > 0 ? `₹${(savingINR * 12).toLocaleString()}` : '—'}
                                    </span>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-2.5 border border-gray-200 mb-2">
                                  <div className="text-[10px] text-gray-400 uppercase font-semibold">{isHindi ? 'अनुमानित लागत' : 'Estimated Cost'}</div>
                                  <div className="font-extrabold text-gray-900 text-sm">₹{opt.approxCostINR.toLocaleString()}</div>
                                </div>
                                {paybackMonths && (
                                  <div className="text-xs text-center font-bold text-purple-700 bg-purple-50 rounded-lg py-1.5 mb-2">
                                    {isHindi ? `लागत वसूली ~${paybackMonths} माह में` : `Payback in ~${paybackMonths} months`}
                                  </div>
                                )}
                                <details className="mt-2 text-xs">
                                  <summary className="text-emerald-700 font-semibold cursor-pointer hover:underline">
                                    {isHindi ? 'दक्षता विश्लेषण →' : 'Efficiency Analysis →'}
                                  </summary>
                                  <p className="text-gray-600 mt-1.5 leading-relaxed text-[11px] bg-white p-2 rounded-lg border border-gray-100">
                                    {opt.notes}
                                  </p>
                                </details>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
