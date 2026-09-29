import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Minus, Zap, Droplets, Leaf, Edit3, Save, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { APPLIANCE_DATABASE } from '../data/demoData';
import { calculateHouseholdEnergy, calculateElectricityCost, calculateCO2, calculateBiogas, calculateWaterDemand, ASSUMPTIONS } from '../calculations/engine';
import { SectionCard, KpiCard, DemoBadge, AssumptionBox, StatRow, ProgressBar } from '../components/ui';
import AreaSelector from '../components/AreaSelector';
import { PRODUCT_RECOMMENDATIONS, getProductCategory } from '../data/productData';
import type { HouseholdAppliance } from '../types';
import type { ApplianceCategory } from '../data/productData';

const DEFAULT_APPLIANCES: HouseholdAppliance[] = [
  { spec: APPLIANCE_DATABASE[0], quantity: 4, hoursPerDay: 6, daysPerMonth: 30, enabled: true },  // LED
  { spec: APPLIANCE_DATABASE[2], quantity: 3, hoursPerDay: 8, daysPerMonth: 30, enabled: true },  // Fan old
  { spec: APPLIANCE_DATABASE[5], quantity: 1, hoursPerDay: 4, daysPerMonth: 30, enabled: true },  // TV
  { spec: APPLIANCE_DATABASE[6], quantity: 1, hoursPerDay: 5, daysPerMonth: 25, enabled: true },  // Laptop
  { spec: APPLIANCE_DATABASE[13], quantity: 1, hoursPerDay: 0, daysPerMonth: 30, enabled: true }, // Fridge 2-star kWh/day
  { spec: APPLIANCE_DATABASE[16], quantity: 1, hoursPerDay: 0.25, daysPerMonth: 25, enabled: true }, // Mixer
  { spec: APPLIANCE_DATABASE[8], quantity: 1, hoursPerDay: 1, daysPerMonth: 30, enabled: true },  // Pump 0.5HP
];

const CATEGORY_COLORS: Record<string, string> = {
  lighting: '#f59e0b',
  cooling: '#0284c7',
  entertainment: '#7c3aed',
  kitchen: '#ef4444',
  pump: '#16a34a',
  other: '#6b7280',
};

export default function HouseholdDashboard() {
  const [appliances, setAppliances] = useState<HouseholdAppliance[]>(DEFAULT_APPLIANCES);
  const [members, setMembers] = useState(4);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [addingAppliance, setAddingAppliance] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState(APPLIANCE_DATABASE[0].id);

  const totalKWh = useMemo(() => calculateHouseholdEnergy(appliances), [appliances]);
  const totalCost = calculateElectricityCost(totalKWh);
  const totalCO2 = calculateCO2(totalKWh);
  const perMemberKWh = totalKWh / Math.max(1, members);
  const waterDemand = calculateWaterDemand(members, ASSUMPTIONS.waterLpcdRural);
  const biogasKgPerDay = members * 0.5; // avg food waste per person
  const biogasM3 = calculateBiogas(0, 0, biogasKgPerDay);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    appliances.filter((a) => a.enabled).forEach((a) => {
      const cat = a.spec.category;
      const kwh = a.spec.unit === 'kWh/day'
        ? a.spec.wattage * a.quantity * a.daysPerMonth
        : (a.spec.wattage * a.quantity * a.hoursPerDay * a.daysPerMonth) / 1000;
      map[cat] = (map[cat] ?? 0) + kwh;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [appliances]);

  function updateAppliance(idx: number, patch: Partial<HouseholdAppliance>) {
    setAppliances((prev) => prev.map((a, i) => i === idx ? { ...a, ...patch } : a));
  }

  function removeAppliance(idx: number) {
    setAppliances((prev) => prev.filter((_, i) => i !== idx));
  }

  function addAppliance() {
    const spec = APPLIANCE_DATABASE.find((s) => s.id === selectedSpec);
    if (!spec) return;
    setAppliances((prev) => [...prev, { spec, quantity: 1, hoursPerDay: 4, daysPerMonth: 30, enabled: true }]);
    setAddingAppliance(false);
  }

  // Score (simple)
  const hhScore = Math.round(Math.max(0, Math.min(100, 100 - (totalKWh - 50) * 0.8)));

  const [myVillageId, setMyVillageId] = useState('motipur');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Find inefficient appliances that have upgrade options
  const upgradeCategories = useMemo(() => {
    const seen = new Set<string>();
    const cats: ApplianceCategory[] = [];
    appliances.forEach((a) => {
      const cat = getProductCategory(a.spec.id);
      if (cat && !seen.has(cat.id)) {
        seen.add(cat.id);
        cats.push(cat);
      }
    });
    return cats;
  }, [appliances]);

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%)',
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(22,163,74,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(5,150,105,0.04) 0%, transparent 50%)'
    }}>
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6 fade-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Household</h1>
            <p className="text-gray-500 text-sm mt-1">Appliance-level energy analysis · Demo Household</p>
          </div>
          <DemoBadge />
        </div>
        <AreaSelector selectedAreaId={myVillageId} onSelect={setMyVillageId} label="My village:" />
      </div>

      {/* Profile setup */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex flex-wrap items-center gap-8">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Household Members</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setMembers((m) => Math.max(1, m - 1))} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center font-bold text-lg">{members}</span>
            <button onClick={() => setMembers((m) => m + 1)} className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200">
              <Plus className="w-3 h-3 text-green-700" />
            </button>
          </div>
        </div>
        <div className="h-8 border-l border-gray-200 hidden sm:block" />
        <div className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{members}</span> members ·{' '}
          <span className="font-semibold text-blue-700">{waterDemand.toFixed(0)} L/day</span> water demand
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Monthly Consumption" value={totalKWh.toFixed(1)} unit="kWh"
          icon={<Zap className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-100"
          formula="Sum(Power × Qty × Hours × Days / 1000)" source="Demo" dataType="Demo" />
        <KpiCard title="Monthly Cost" value={'₹' + totalCost.toLocaleString()}
          icon={<Zap className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-100"
          formula={`kWh × ₹${ASSUMPTIONS.tariffINRPerKWh}`} source="Demo tariff" dataType="Estimated" />
        <KpiCard title="CO₂ Emissions" value={totalCO2.toFixed(2)} unit="kg/mo"
          icon={<Leaf className="w-5 h-5 text-green-600" />} iconBg="bg-green-100"
          formula={`kWh × ${ASSUMPTIONS.gridEmissionFactor} kg/kWh`} source="CEA 2023" dataType="Estimated" />
        <KpiCard title="Sustainability Score" value={hhScore} unit="/100"
          icon={<Zap className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-100"
          formula="100 - penalty for excess consumption over 50 kWh" source="GreenGrid" dataType="Calculated" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Appliance table */}
        <SectionCard title="Appliance Inventory" subtitle="Click row to edit hours/quantity" icon={<Edit3 className="w-4 h-4" />}>
          <DemoBadge className="mb-3" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-2 text-xs text-gray-500 font-medium">Appliance</th>
                  <th className="text-center py-2 text-xs text-gray-500 font-medium">Qty</th>
                  <th className="text-center py-2 text-xs text-gray-500 font-medium">Hrs/day</th>
                  <th className="text-right py-2 text-xs text-gray-500 font-medium">kWh/mo</th>
                  <th className="text-center py-2 text-xs text-gray-500 font-medium">ON</th>
                </tr>
              </thead>
              <tbody>
                {appliances.map((a, idx) => {
                  const kwh = a.spec.unit === 'kWh/day'
                    ? a.spec.wattage * a.quantity * a.daysPerMonth
                    : (a.spec.wattage * a.quantity * a.hoursPerDay * a.daysPerMonth) / 1000;
                  return (
                    <React.Fragment key={idx}>
                      <tr
                        className={`border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${!a.enabled ? 'opacity-40' : ''}`}
                        onClick={() => setEditingIdx(editingIdx === idx ? null : idx)}
                      >
                        <td className="py-2 pr-2">
                          <div className="font-medium text-gray-800 text-xs">{a.spec.name}</div>
                          <div className="text-xs text-gray-400">{a.spec.wattage}{a.spec.unit === 'kWh/day' ? ' kWh/day' : 'W'}</div>
                        </td>
                        <td className="text-center py-2 font-semibold">{a.quantity}</td>
                        <td className="text-center py-2 text-gray-600">{a.spec.unit === 'kWh/day' ? '–' : a.hoursPerDay}</td>
                        <td className="text-right py-2 font-bold text-blue-700">{kwh.toFixed(1)}</td>
                        <td className="text-center py-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateAppliance(idx, { enabled: !a.enabled }); }}
                            className={`w-8 h-4 rounded-full transition-colors ${a.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                            <span className={`block w-3 h-3 rounded-full bg-white shadow mx-0.5 transition-transform ${a.enabled ? 'translate-x-4' : ''}`} />
                          </button>
                        </td>
                      </tr>
                      {editingIdx === idx && (
                        <tr className="bg-blue-50">
                          <td colSpan={5} className="p-3">
                            <div className="flex flex-wrap gap-3 items-center">
                              <label className="text-xs text-gray-600 font-medium">
                                Qty:
                                <input type="number" min="0" max="20" value={a.quantity}
                                  onChange={(e) => updateAppliance(idx, { quantity: +e.target.value })}
                                  className="ml-1 w-14 border border-gray-300 rounded px-1 py-0.5 text-sm" />
                              </label>
                              {a.spec.unit === 'W' && (
                                <label className="text-xs text-gray-600 font-medium">
                                  Hrs/day:
                                  <input type="number" min="0" max="24" step="0.5" value={a.hoursPerDay}
                                    onChange={(e) => updateAppliance(idx, { hoursPerDay: +e.target.value })}
                                    className="ml-1 w-14 border border-gray-300 rounded px-1 py-0.5 text-sm" />
                                </label>
                              )}
                              <label className="text-xs text-gray-600 font-medium">
                                Days/mo:
                                <input type="number" min="0" max="31" value={a.daysPerMonth}
                                  onChange={(e) => updateAppliance(idx, { daysPerMonth: +e.target.value })}
                                  className="ml-1 w-14 border border-gray-300 rounded px-1 py-0.5 text-sm" />
                              </label>
                              <button onClick={() => { removeAppliance(idx); setEditingIdx(null); }}
                                className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                                <Minus className="w-3 h-3" /> Remove
                              </button>
                              <button onClick={() => setEditingIdx(null)}
                                className="text-xs text-blue-600 flex items-center gap-1">
                                <Save className="w-3 h-3" /> Done
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={3} className="pt-2 text-sm font-semibold text-gray-700">Total</td>
                  <td className="text-right pt-2 font-bold text-blue-800">{totalKWh.toFixed(1)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Add appliance */}
          {addingAppliance ? (
            <div className="mt-3 flex gap-2 items-center bg-green-50 rounded-lg p-3">
              <select value={selectedSpec} onChange={(e) => setSelectedSpec(e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1">
                {APPLIANCE_DATABASE.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.wattage}{s.unit === 'kWh/day' ? ' kWh/day' : 'W'})</option>
                ))}
              </select>
              <button onClick={addAppliance} className="bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-700">Add</button>
              <button onClick={() => setAddingAppliance(false)} className="text-gray-400 text-xs">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setAddingAppliance(true)}
              className="mt-3 flex items-center gap-1 text-sm text-green-600 hover:text-green-800">
              <Plus className="w-4 h-4" /> Add appliance
            </button>
          )}
        </SectionCard>

        {/* Category donut */}
        <SectionCard title="Consumption by Category" subtitle="kWh/month breakdown" icon={<Zap className="w-4 h-4" />}>
          <DemoBadge className="mb-4" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {categoryBreakdown.map((d) => (
                  <Cell key={d.name} fill={CATEGORY_COLORS[d.name] ?? '#6b7280'} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v} kWh`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryBreakdown.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[d.name] ?? '#6b7280' }} />
                <span className="text-gray-600 capitalize">{d.name}</span>
                <span className="ml-auto font-semibold">{d.value} kWh</span>
              </div>
            ))}
          </div>
          <AssumptionBox items={[
            { label: 'Formula', value: 'W × Qty × Hrs × Days / 1000' },
            { label: 'Tariff', value: `₹${ASSUMPTIONS.tariffINRPerKWh}/kWh` },
            { label: 'Emission factor', value: `${ASSUMPTIONS.gridEmissionFactor} kg CO₂/kWh` },
          ]} />
        </SectionCard>
      </div>

      {/* Water + Waste */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Water Usage" subtitle={`${members} members · Rural LPCD`} icon={<Droplets className="w-4 h-4" />}>
          <DemoBadge className="mb-4" />
          <StatRow label="Daily Water Demand" value={waterDemand.toFixed(0)} unit="litres" highlight />
          <StatRow label="Monthly Demand" value={(waterDemand * 30 / 1000).toFixed(1)} unit="kL" />
          <StatRow label="LPCD Standard" value="55" unit="L/person/day" />
          <StatRow label="Monthly Water Cost (est.)" value={`₹${(waterDemand * 30 * 0.02).toFixed(0)}`} />
          <AssumptionBox items={[
            { label: 'Rural LPCD', value: '55 L/person/day (WHO/GoI standard)' },
            { label: 'Water rate', value: '₹0.02/litre (illustrative)' },
          ]} />
        </SectionCard>

        <SectionCard title="Household Waste Potential" subtitle="Food waste → biogas" icon={<Leaf className="w-4 h-4" />}>
          <DemoBadge className="mb-4" />
          <StatRow label="Est. Food Waste" value={(biogasKgPerDay).toFixed(1)} unit="kg/day" />
          <StatRow label="Biogas Potential" value={biogasM3.toFixed(3)} unit="m³/day" highlight />
          <StatRow label="Thermal Energy" value={(biogasM3 * ASSUMPTIONS.biogasThermalKWhPerM3).toFixed(3)} unit="kWh/day" />
          <StatRow label="Monthly biogas" value={(biogasM3 * 30).toFixed(2)} unit="m³/month" />
          <AssumptionBox items={[
            { label: 'Food waste/person', value: '0.5 kg/day (est.)' },
            { label: 'Food waste→biogas', value: '0.06 m³/kg' },
            { label: '1 m³ biogas', value: '6 kWh thermal / 2 kWh electric' },
          ]} />
        </SectionCard>
      </div>

      {/* ── Upgrade Recommendations ─────────────────────────────────────── */}
      {upgradeCategories.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4 fade-left">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900">Upgrade Recommendations</h2>
            <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 font-semibold ml-1">
              {upgradeCategories.length} upgrades available
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-5 italic">
            All product names, prices and specifications are illustrative planning estimates. Verify current prices
            and availability before purchasing. Check BEE star label for official energy rating.
          </p>

          <div className="space-y-6">
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
                <div key={cat.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden scale-in">
                  {/* Category header */}
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <div className="font-bold text-gray-900">{cat.label} Upgrade</div>
                        <div className="text-sm text-gray-500">
                          Current: {cat.currentName} ·{' '}
                          {cat.currentEnergyKWhPerDay
                            ? `${cat.currentEnergyKWhPerDay} kWh/day`
                            : `${cat.currentPowerW}W`}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100">
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
                            <div key={opt.id} className={`relative rounded-xl border-2 p-4 ${isBestValue ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                              {isBestValue && (
                                <div className="absolute -top-2.5 left-3 bg-green-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                                  ✨ Best Value
                                </div>
                              )}
                              <div className="text-2xl mb-2">{cat.icon}</div>
                              <div className="font-bold text-gray-900 text-sm mb-1">{opt.name}</div>
                              {opt.motorType && (
                                <div className="text-xs text-blue-600 font-medium mb-1">{opt.motorType} Motor</div>
                              )}
                              {/* BEE stars */}
                              {opt.beeStars && (
                                <div className="flex gap-0.5 mb-2">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < opt.beeStars! ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                                  ))}
                                  <span className="text-xs text-gray-500 ml-1">BEE</span>
                                </div>
                              )}
                              <div className="space-y-1 text-xs text-gray-600 mb-3">
                                <div className="flex justify-between">
                                  <span>Power</span>
                                  <span className="font-semibold text-blue-700">
                                    {opt.energyKWhPerDay ? `${opt.energyKWhPerDay} kWh/day` : `${opt.powerW}W`}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Monthly consumption</span>
                                  <span className="font-semibold">{optMonthlyKWh.toFixed(1)} kWh</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Monthly saving</span>
                                  <span className="font-semibold text-green-700">
                                    {savingKWh > 0 ? `${savingKWh} kWh (₹${savingINR})` : 'Current is efficient'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Annual saving</span>
                                  <span className="font-semibold text-green-700">
                                    {savingKWh > 0 ? `₹${(savingINR * 12).toLocaleString()}` : '—'}
                                  </span>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-2 border border-gray-200 mb-2">
                                <div className="text-xs text-gray-500">Approx. cost</div>
                                <div className="font-bold text-gray-900">₹{opt.approxCostINR.toLocaleString()}</div>
                                <div className="text-xs text-amber-600">Market estimate — verify</div>
                              </div>
                              {paybackMonths && (
                                <div className="text-xs text-center font-semibold text-purple-700 bg-purple-50 rounded-lg py-1.5">
                                  Payback: ~{paybackMonths} months
                                </div>
                              )}
                              {/* Why upgrade */}
                              <details className="mt-2">
                                <summary className="text-xs text-green-600 cursor-pointer hover:text-green-800">
                                  Why upgrade? →
                                </summary>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{opt.notes}</p>
                              </details>
                            </div>
                          );
                        })}
                      </div>

                      {/* Comparison table */}
                      <div className="px-5 pb-5 overflow-x-auto">
                        <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="text-left px-3 py-2 text-gray-600">Metric</th>
                              <th className="px-3 py-2 text-gray-600">Keep Current</th>
                              {cat.options.map((opt) => (
                                <th key={opt.id} className="px-3 py-2 text-gray-600">{opt.name.split(' ').slice(0, 3).join(' ')}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              {
                                label: 'Monthly kWh',
                                current: currentMonthlyKWh.toFixed(1),
                                vals: cat.options.map((o) => (o.energyKWhPerDay ? o.energyKWhPerDay * 30 : (o.powerW * cat.currentHoursPerDay * 30) / 1000).toFixed(1)),
                              },
                              {
                                label: 'Monthly cost (₹)',
                                current: Math.round(currentMonthlyKWh * ASSUMPTIONS.tariffINRPerKWh).toString(),
                                vals: cat.options.map((o) => {
                                  const kwh = o.energyKWhPerDay ? o.energyKWhPerDay * 30 : (o.powerW * cat.currentHoursPerDay * 30) / 1000;
                                  return Math.round(kwh * ASSUMPTIONS.tariffINRPerKWh).toString();
                                }),
                              },
                              {
                                label: 'Annual saving (₹)',
                                current: '—',
                                vals: cat.options.map((o) => {
                                  const kwh = o.energyKWhPerDay ? o.energyKWhPerDay * 30 : (o.powerW * cat.currentHoursPerDay * 30) / 1000;
                                  const saving = Math.round((currentMonthlyKWh - kwh) * ASSUMPTIONS.tariffINRPerKWh * 12);
                                  return saving > 0 ? `₹${saving.toLocaleString()}` : '—';
                                }),
                              },
                              {
                                label: 'Payback (months)',
                                current: '—',
                                vals: cat.options.map((o) => {
                                  const kwh = o.energyKWhPerDay ? o.energyKWhPerDay * 30 : (o.powerW * cat.currentHoursPerDay * 30) / 1000;
                                  const savingINR = (currentMonthlyKWh - kwh) * ASSUMPTIONS.tariffINRPerKWh;
                                  return savingINR > 0 ? `${Math.ceil(o.approxCostINR / savingINR)} mo` : '—';
                                }),
                              },
                            ].map((row) => (
                              <tr key={row.label} className="border-t border-gray-100 even:bg-gray-50">
                                <td className="px-3 py-2 font-medium text-gray-700">{row.label}</td>
                                <td className="px-3 py-2 text-center text-gray-600">{row.current}</td>
                                {row.vals.map((v, i) => (
                                  <td key={i} className={`px-3 py-2 text-center font-semibold ${i === bestPaybackIdx ? 'text-green-700' : 'text-gray-700'}`}>{v}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
