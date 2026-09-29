import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend,
  PieChart, Pie,
} from 'recharts';
import { Leaf, Zap, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import {
  calculateBiogas, calculateWasteEnergy, calculateCO2, calculateElectricityCost, ASSUMPTIONS,
} from '../calculations/engine';
import { SectionCard, KpiCard, DemoBadge, AssumptionBox, StatRow } from '../components/ui';
import { getAllAreaAnalyses } from '../services/energyService';
import AreaSelector from '../components/AreaSelector';
import { DEMO_AREAS } from '../data/demoData';
import { useAuth } from '../context/AuthContext';
import { useHousehold } from '../context/HouseholdContext';
import { useLanguage } from '../context/LanguageContext';

// ─── Village view (unchanged from original) ──────────────────────────────────

const areas = getAllAreaAnalyses();
const COLORS = ['#16a34a', '#059669', '#f59e0b', '#84cc16'];

function VillageWasteView() {
  const { isHindi } = useLanguage();
  const [selectedAreaId, setSelectedAreaId] = useState('motipur');
  const [cowDung, setCowDung] = useState(500);
  const [foodWaste, setFoodWaste] = useState(300);
  const [agriWaste, setAgriWaste] = useState(200);
  React.useEffect(() => {
    const area = DEMO_AREAS.find((a) => a.id === selectedAreaId);
    if (area) {
      setCowDung(area.cowDungKgPerDay);
      setFoodWaste(area.foodWasteKgPerDay);
      setAgriWaste(area.agriWasteKgPerDay);
    }
  }, [selectedAreaId]);

  const totalBiogasM3PerDay = calculateBiogas(cowDung, agriWaste, foodWaste);
  const thermalPerDay = calculateWasteEnergy(totalBiogasM3PerDay);
  const electricityPerDay = +(totalBiogasM3PerDay * ASSUMPTIONS.biogasElectricKWhPerM3).toFixed(2);
  const electricityPerMonth = electricityPerDay * 30;
  const co2OffsetPerMonth = calculateCO2(electricityPerMonth);
  const monthlySavings = calculateElectricityCost(electricityPerMonth);

  // Donut chart data for energy recovery by waste source
  const recoveryDonutData = [
    { name: isHindi ? 'गोबर' : 'Cow Dung', value: +(cowDung * ASSUMPTIONS.cowDungBiogasM3PerKg).toFixed(3), fill: '#16a34a' },
    { name: isHindi ? 'भोजन अपशिष्ट' : 'Food Waste', value: +(foodWaste * ASSUMPTIONS.foodWasteBiogasM3PerKg).toFixed(3), fill: '#f59e0b' },
    { name: isHindi ? 'कृषि अपशिष्ट' : 'Agri Waste', value: +(agriWaste * ASSUMPTIONS.agriWasteBiogasM3PerKg).toFixed(3), fill: '#ca8a04' },
  ];

  const areaWaste = areas.map((a) => ({
    name: a.area.name,
    'Biogas m³/day': +a.wasteAnalysis.biogasM3PerDay.toFixed(1),
    'kWh/day': +a.wasteAnalysis.electricityKWhPerDay.toFixed(1),
  }));

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(160deg, #052e16 0%, #065f46 50%, #052e16 100%)' }}>
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
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="glass-card rounded-2xl p-5 mb-6 fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Leaf className="w-6 h-6 text-green-600" /> {isHindi ? 'कचरा एवं ऊर्जा' : 'Waste & Energy'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">{isHindi ? 'जैविक कचरा → बायोगैस → बिजली उत्पादन क्षमता' : 'Organic waste → biogas → electricity potential'}</p>
            </div>
            <DemoBadge />
          </div>
          <div className="mt-4">
            <AreaSelector selectedAreaId={selectedAreaId} onSelect={setSelectedAreaId} />
          </div>
        </div>

        {/* Input sliders with icon thumbs */}
        <div className="glass-card rounded-2xl p-5 mb-6 fade-up">
          <div className="mb-4">
            <h2 className="font-bold text-gray-900 text-base">{isHindi ? 'जैविक कचरा इनपुट' : 'Organic Waste Inputs'}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{isHindi ? 'ग्राम स्तर पर दैनिक जैविक कचरा (किग्रा/दिन) समायोजित करें' : 'Adjust village-level daily organic waste (kg/day)'}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            <IconSlider
              label={isHindi ? 'गोबर' : 'Cow Dung'}
              sublabel={isHindi ? '0.04 m³ बायोगैस प्रति किग्रा' : '0.04 m³ biogas per kg'}
              value={cowDung}
              displayValue={`${cowDung} kg/day`}
              min={0} max={2000} step={10}
              onChange={setCowDung}
              accentColor="text-green-700 bg-green-50 border-green-200"
              trackColor="#16a34a"
              labelColor="text-green-800"
              icon={<CowIcon size={26} />}
              hint={isHindi ? '0.04 m³ बायोगैस प्रति किग्रा' : '0.04 m³ biogas per kg'}
            />
            <IconSlider
              label={isHindi ? 'भोजन अपशिष्ट' : 'Food Waste'}
              sublabel={isHindi ? '0.06 m³ बायोगैस प्रति किग्रा' : '0.06 m³ biogas per kg'}
              value={foodWaste}
              displayValue={`${foodWaste} kg/day`}
              min={0} max={1000} step={10}
              onChange={setFoodWaste}
              accentColor="text-amber-700 bg-amber-50 border-amber-200"
              trackColor="#f59e0b"
              labelColor="text-amber-800"
              icon={<FoodIcon size={26} />}
              hint={isHindi ? '0.06 m³ बायोगैस प्रति किग्रा' : '0.06 m³ biogas per kg'}
            />
            <IconSlider
              label={isHindi ? 'कृषि अपशिष्ट' : 'Agri Waste'}
              sublabel={isHindi ? '0.02 m³ बायोगैस प्रति किग्रा' : '0.02 m³ biogas per kg'}
              value={agriWaste}
              displayValue={`${agriWaste} kg/day`}
              min={0} max={1000} step={10}
              onChange={setAgriWaste}
              accentColor="text-yellow-700 bg-yellow-50 border-yellow-200"
              trackColor="#ca8a04"
              labelColor="text-yellow-800"
              icon={<CropIcon size={26} />}
              hint={isHindi ? '0.02 m³ बायोगैस प्रति किग्रा' : '0.02 m³ biogas per kg'}
            />
          </div>
        </div>

        {/* ── Waste-to-Energy Journey Animation ── */}
        <WasteJourneyAnimation
          biogas={totalBiogasM3PerDay}
          thermal={thermalPerDay}
          electricity={electricityPerMonth}
          savings={monthlySavings}
          isHindi={isHindi}
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard title={isHindi ? 'दैनिक बायोगैस' : 'Daily Biogas'} value={totalBiogasM3PerDay.toFixed(2)} unit="m³/day"
            icon={<Leaf className="w-5 h-5 text-green-600" />} iconBg="bg-green-100"
            formula="Σ(input_kg × biogas_factor_m³/kg)" source="MNRE biogas guidelines" dataType="Calculated" />
          <KpiCard title={isHindi ? 'तापीय ऊर्जा' : 'Thermal Energy'} value={thermalPerDay.toFixed(2)} unit="kWh/day"
            icon={<Zap className="w-5 h-5 text-orange-600" />} iconBg="bg-orange-100"
            formula={`Biogas (m³) × ${ASSUMPTIONS.biogasThermalKWhPerM3} kWh/m³`} source="MNRE" dataType="Calculated" />
          <KpiCard title={isHindi ? 'बिजली उत्पादन क्षमता' : 'Electricity Potential'} value={electricityPerMonth.toFixed(1)} unit="kWh/mo"
            icon={<Zap className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-100"
            formula={`Biogas × ${ASSUMPTIONS.biogasElectricKWhPerM3} kWh/m³ × 30`} source="MNRE" dataType="Calculated" />
          <KpiCard title={isHindi ? 'मासिक बचत' : 'Monthly Saving'} value={'₹' + monthlySavings.toLocaleString()}
            icon={<Leaf className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-100"
            formula={`Electricity × ₹${ASSUMPTIONS.tariffINRPerKWh}/kWh`} source="Standard tariff" dataType="Estimated" />
        </div>

        {/* Energy Recovery Summary - Hollow Donut Chart */}
        <div className="mb-6">
          <div className="glass-card rounded-2xl p-5 fade-up">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-gray-900">{isHindi ? 'ऊर्जा पुनर्चक्रण सारांश' : 'Energy Recovery Summary'}</h2>
            </div>
            <p className="text-xs text-gray-500 mb-2">{isHindi ? 'कचरे से ऊर्जा तक की पूरी शृंखला' : 'Full chain from waste to energy'}</p>
            <DemoBadge className="mb-4" />
            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* Hollow Pie Chart */}
              <div className="relative">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={recoveryDonutData}
                      cx="50%"
                      cy="45%"
                      innerRadius={70}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {recoveryDonutData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} m³/day`, isHindi ? 'बायोगैस' : 'Biogas']} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: 40 }}>
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-emerald-800">{totalBiogasM3PerDay.toFixed(2)}</div>
                    <div className="text-[11px] text-gray-500 font-medium">{isHindi ? 'm³/दिन बायोगैस' : 'm³/day biogas'}</div>
                  </div>
                </div>
              </div>
              {/* Key metrics */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                  <span className="text-sm text-green-800 font-medium">{isHindi ? 'कुल कचरा इनपुट' : 'Total Waste Input'}</span>
                  <span className="text-sm font-bold text-green-900">{(cowDung + foodWaste + agriWaste).toFixed(0)} kg/{isHindi ? 'दिन' : 'day'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-sm text-emerald-800 font-medium">{isHindi ? 'मासिक बायोगैस' : 'Monthly Biogas'}</span>
                  <span className="text-sm font-bold text-emerald-900">{(totalBiogasM3PerDay * 30).toFixed(1)} m³</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-xl">
                  <span className="text-sm text-orange-800 font-medium">{isHindi ? 'तापीय ऊर्जा' : 'Thermal Energy'}</span>
                  <span className="text-sm font-bold text-orange-900">{thermalPerDay.toFixed(2)} kWh/{isHindi ? 'दिन' : 'day'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-sm text-blue-800 font-medium">{isHindi ? 'बिजली (मासिक)' : 'Electricity (monthly)'}</span>
                  <span className="text-sm font-bold text-blue-900">{electricityPerMonth.toFixed(1)} kWh</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <span className="text-sm text-purple-800 font-medium">{isHindi ? 'CO₂ निवारण' : 'CO₂ Offset'}</span>
                  <span className="text-sm font-bold text-purple-900">{(co2OffsetPerMonth / 1000).toFixed(3)} t/{isHindi ? 'माह' : 'month'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-sm text-amber-800 font-medium">{isHindi ? 'अनुमानित मूल्य' : 'Estimated Value'}</span>
                  <span className="text-sm font-bold text-amber-900">₹{monthlySavings.toLocaleString()}/{isHindi ? 'माह' : 'month'}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <strong>{isHindi ? 'नोट:' : 'Note:'}</strong> {isHindi ? 'वास्तविक बायोगैस उत्पादन डाइजेस्टर डिज़ाइन, तापमान, मिश्रण और प्रतिधारण समय पर निर्भर करता है। ये MNRE दिशानिर्देशों पर आधारित सैद्धांतिक अनुमान हैं।' : 'Actual biogas yield depends on digester design, temperature, feed mix, and retention time. These are theoretical estimates using MNRE guidelines.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Custom SVG slider thumb icons ────────────────────────────────────────────

function CowIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="19" rx="9" ry="7" fill="#16a34a" />
      <circle cx="16" cy="11" r="5" fill="#16a34a" />
      {/* ears */}
      <ellipse cx="10.5" cy="10" rx="2.5" ry="1.5" fill="#16a34a" transform="rotate(-20 10.5 10)" />
      <ellipse cx="21.5" cy="10" rx="2.5" ry="1.5" fill="#16a34a" transform="rotate(20 21.5 10)" />
      {/* horns */}
      <path d="M12 7 Q9 3 7 5" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M20 7 Q23 3 25 5" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* eyes */}
      <circle cx="14" cy="10.5" r="1" fill="white" />
      <circle cx="18" cy="10.5" r="1" fill="white" />
      <circle cx="14.3" cy="10.7" r="0.4" fill="#052e16" />
      <circle cx="18.3" cy="10.7" r="0.4" fill="#052e16" />
      {/* nostrils */}
      <circle cx="14.5" cy="13.5" r="0.7" fill="#065f46" opacity="0.6" />
      <circle cx="17.5" cy="13.5" r="0.7" fill="#065f46" opacity="0.6" />
      {/* legs */}
      <rect x="10" y="24" width="3" height="5" rx="1.5" fill="#16a34a" />
      <rect x="19" y="24" width="3" height="5" rx="1.5" fill="#16a34a" />
      {/* tail */}
      <path d="M25 22 Q29 20 27 25" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function FoodIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* bowl */}
      <path d="M5 16 Q5 26 16 26 Q27 26 27 16 Z" fill="#f59e0b" />
      <rect x="4" y="14" width="24" height="3" rx="1.5" fill="#d97706" />
      {/* steam lines */}
      <path d="M11 11 Q12 8 11 5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M16 10 Q17 7 16 4" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M21 11 Q22 8 21 5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* food lumps */}
      <circle cx="13" cy="16" r="2" fill="#fde68a" />
      <circle cx="19" cy="15.5" r="2" fill="#fde68a" />
      <circle cx="16" cy="17" r="1.5" fill="#fef3c7" />
    </svg>
  );
}

function CropIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* stalk */}
      <line x1="16" y1="28" x2="16" y2="8" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round"/>
      {/* wheat grains left */}
      <ellipse cx="11" cy="10" rx="3" ry="5" fill="#eab308" transform="rotate(-20 11 10)" />
      <ellipse cx="9" cy="15" rx="3" ry="5" fill="#ca8a04" transform="rotate(-25 9 15)" />
      <ellipse cx="10" cy="20" rx="3" ry="4.5" fill="#eab308" transform="rotate(-15 10 20)" />
      {/* wheat grains right */}
      <ellipse cx="21" cy="10" rx="3" ry="5" fill="#eab308" transform="rotate(20 21 10)" />
      <ellipse cx="23" cy="15" rx="3" ry="5" fill="#ca8a04" transform="rotate(25 23 15)" />
      <ellipse cx="22" cy="20" rx="3" ry="4.5" fill="#eab308" transform="rotate(15 22 20)" />
      {/* top grain */}
      <ellipse cx="16" cy="7" rx="2.5" ry="4" fill="#fde047" />
      {/* awn tips */}
      <line x1="11" y1="7" x2="9" y2="3" stroke="#ca8a04" strokeWidth="1" strokeLinecap="round"/>
      <line x1="16" y1="4" x2="16" y2="1" stroke="#ca8a04" strokeWidth="1" strokeLinecap="round"/>
      <line x1="21" y1="7" x2="23" y2="3" stroke="#ca8a04" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Custom styled slider with icon thumb ─────────────────────────────────────

interface IconSliderProps {
  label: string;
  sublabel: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  accentColor: string;
  trackColor: string;
  labelColor: string;
  icon: React.ReactNode;
  hint: string;
}

function IconSlider({ label, sublabel, value, displayValue, min, max, step, onChange, accentColor, trackColor, labelColor, icon, hint }: IconSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className={`font-semibold text-sm ${labelColor} flex items-center gap-1.5`}>
          {label}
        </label>
        <span className={`text-sm font-bold px-2 py-0.5 rounded-lg border ${accentColor}`}>{displayValue}</span>
      </div>
      <div className="relative flex items-center h-10">
        <div className="absolute left-0 right-0 h-2 rounded-full" style={{ background: '#e5e7eb' }}>
          <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: trackColor }} />
        </div>
        {/* icon thumb */}
        <div
          className="absolute -translate-x-1/2 pointer-events-none drop-shadow-md"
          style={{ left: `${pct}%`, zIndex: 10 }}>
          <div className="bg-white rounded-full p-0.5 border-2 shadow-md" style={{ borderColor: trackColor }}>
            {icon}
          </div>
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(+e.target.value)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-10"
          style={{ zIndex: 20 }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">{hint}</div>
      {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
    </div>
  );
}

// ─── Government Biogas / Waste Schemes ────────────────────────────────────────

const BIOGAS_SCHEMES = [
  {
    id: 'gobardhan',
    name: 'GOBARdhan Yojana (Galvanising Organic Bio-Agro Resources Dhan)',
    ministry: 'Ministry of Jal Shakti / MoPNG / MNRE',
    tag: 'Biogas & CBG', tagColor: 'bg-green-100 text-green-700',
    description: 'Flagship scheme to convert cattle dung, agricultural residue, and other biodegradable waste into biogas and Compressed Bio-Gas (CBG). Supports setting up biogas plants at household, cluster, and community levels. Promotes circular economy and clean cooking fuel in rural areas.',
    eligibility: [
      'Individual farmers & rural households with cattle or agriculture waste',
      'Self-Help Groups (SHGs), FPOs, Panchayats, Cooperatives',
      'Entrepreneurs interested in setting up CBG plants (min 100 TPD feedstock)',
      'Applications through state nodal agencies or GOBARdhan portal',
    ],
    subsidy: 'Central subsidy up to ₹10,000 per household biogas plant; CBG plants under SATAT get assured offtake',
    link: 'https://gobardhan.gov.in',
  },
  {
    id: 'mnre-biogas',
    name: 'New National Biogas and Organic Manure Programme (NNBOMP)',
    ministry: 'Ministry of New & Renewable Energy (MNRE)',
    tag: 'Biogas Subsidy', tagColor: 'bg-emerald-100 text-emerald-700',
    description: 'Provides central financial assistance for installation of family-type biogas plants (1 m³ to 25 m³). Programme also supports training, awareness, and quality supervision. Ensures clean cooking fuel and organic manure for rural families.',
    eligibility: [
      'Families with 2+ cattle in rural or semi-urban areas',
      'Must have space for plant installation and water availability',
      'Installation through MNRE-approved trained masons/agencies',
      'Preference for SC/ST households and difficult terrain',
    ],
    subsidy: '₹7,000–₹12,000 central subsidy per plant (varies by state/category); additional top-up by states',
    link: 'https://mnre.gov.in/bio-energy/biogas',
  },
  {
    id: 'satat',
    name: 'SATAT Initiative (Sustainable Alternative Towards Affordable Transportation)',
    ministry: 'Ministry of Petroleum & Natural Gas (MoPNG)',
    tag: 'Compressed Bio-Gas', tagColor: 'bg-blue-100 text-blue-700',
    description: 'Promotes setting up of Compressed Bio-Gas (CBG) plants using municipal solid waste, agricultural residue, sugarcane press mud, and cattle dung. CBG produced is purchased by PSU Oil Marketing Companies (OMCs) for use as vehicle fuel or piped gas.',
    eligibility: [
      'Entrepreneurs, FPOs, cooperatives, and private entities',
      'Minimum feedstock availability of ~2,000 kg/day for viable plant',
      'Must obtain Letter of Intent (LoI) from OMC (IOCL, BPCL, HPCL)',
      'Feedstock: MSW, cattle dung, agri residue, industrial organic waste',
    ],
    subsidy: 'Assured off-take by OMCs at ₹46/kg CBG; priority bank finance under Priority Sector Lending',
    link: 'https://mopng.gov.in/satat',
  },
  {
    id: 'pmuy-biogas',
    name: 'Pradhan Mantri Ujjwala Yojana (PMUY) — Biogas Linkage',
    ministry: 'Ministry of Petroleum & Natural Gas (MoPNG)',
    tag: 'Clean Cooking', tagColor: 'bg-orange-100 text-orange-700',
    description: 'While PMUY primarily covers LPG connections, rural biogas plants can serve as clean cooking fuel alternatives. Some states link PMUY beneficiaries with GOBARdhan biogas plants to reduce LPG dependence and save costs.',
    eligibility: [
      'BPL (Below Poverty Line) households, especially women-headed',
      'Scheduled Caste / Scheduled Tribe households',
      'Households already using cow dung or agri waste as cooking fuel',
      'Eligible through integration with state GOBARdhan programme',
    ],
    subsidy: 'Linked subsidy through GOBARdhan; reduces LPG costs by 60–80% for rural households',
    link: 'https://pmuy.gov.in',
  },
  {
    id: 'swachh-biogas',
    name: 'Swachh Bharat Mission (Gramin) — Waste-to-Energy Component',
    ministry: 'Ministry of Jal Shakti',
    tag: 'Rural Sanitation', tagColor: 'bg-teal-100 text-teal-700',
    description: 'Under SBM-G Phase II, solid & liquid waste management includes biogas from community-level organic waste processing. Villages can install community biogas digesters as part of the ODF+ and ODF++ models.',
    eligibility: [
      'Gram Panchayats in rural areas',
      'Villages that have achieved ODF (Open Defecation Free) status',
      'Panchayats willing to manage community-level waste systems',
      'Can be linked with GOBARdhan for additional central assistance',
    ],
    subsidy: 'Covered under SBM-G funding envelope; up to ₹90 per household per year for solid waste management',
    link: 'https://swachhbharatmission.gov.in',
  },
  {
    id: 'nabard-biogas',
    name: 'NABARD Refinance for Biogas & Renewable Energy',
    ministry: 'NABARD / Ministry of Finance',
    tag: 'Rural Finance', tagColor: 'bg-rose-100 text-rose-700',
    description: 'NABARD provides refinance to cooperative banks and Regional Rural Banks (RRBs) for financing biogas plants, small waste-to-energy systems, and related rural clean energy projects. Enables soft loans for farmers and rural households.',
    eligibility: [
      'Farmers, rural households with cattle or agricultural land',
      'Projects channelled through RRBs or cooperative banks',
      'Small & medium biogas plants eligible; community plants also covered',
      'Allied with GOBARdhan or NNBOMP subsidy for combined benefit',
    ],
    subsidy: 'Concessional interest rate refinance; EMIs 2–3% lower than commercial bank rates',
    link: 'https://nabard.org',
  },
];

function BiogasSchemeCard({ scheme }: { scheme: typeof BIOGAS_SCHEMES[0] }) {
  const { isHindi } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card border border-gray-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-green-50/40 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scheme.tagColor}`}>{scheme.tag}</span>
            <span className="text-xs text-gray-400">{scheme.ministry}</span>
          </div>
          <div className="font-semibold text-gray-900 text-sm leading-snug">{scheme.name}</div>
          {!open && <div className="text-xs text-gray-500 mt-1 line-clamp-1">{scheme.description}</div>}
        </div>
        <div className="shrink-0 mt-0.5 text-green-500">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <p className="text-sm text-gray-700 mt-3 mb-3 leading-relaxed">{scheme.description}</p>
          <div className="mb-3">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{isHindi ? 'पात्रता' : 'Eligibility'}</div>
            <ul className="space-y-1">
              {scheme.eligibility.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5">
              <span className="font-semibold">{isHindi ? 'सब्सिडी / लाभ: ' : 'Subsidy / Benefit: '}</span>{scheme.subsidy}
            </div>
            <a href={scheme.link} target="_blank" rel="noopener noreferrer"
              className="text-xs text-green-600 hover:underline font-medium">
              {isHindi ? 'आधिकारिक पोर्टल ↗' : 'Official Portal ↗'}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Waste Journey Animation ──────────────────────────────────────────────────
// Shared by both VillageWasteView and HouseholdWasteView
//
// Cycle (auto-loops forever):
//   PHASE 1 "loading"  (1.2s) — truck at waste pile, loading
//   PHASE 2 "driving"  (3.4s) — truck slides left→right toward plant
//   PHASE 3 "arrived"  (3.5s) — truck at plant, bubbles pop one-by-one from chimney
//   PHASE 4 "returning"(2.6s) — truck slides right→left (mirrored) back to pile
//   → loop back to PHASE 1

interface WasteJourneyProps {
  biogas: number; thermal: number; electricity: number; savings: number; isHindi: boolean;
}

// SVG coordinate constants — truck base X positions
const TRUCK_START_X = 140;   // parked at waste pile
const TRUCK_END_X   = 302;   // parked at plant inlet
const TRUCK_WIDTH   = 156;

function WasteJourneyAnimation({ biogas, thermal, electricity, savings, isHindi }: WasteJourneyProps) {
  type Phase = 'loading' | 'driving' | 'arrived' | 'returning';
  const [phase, setPhase]   = useState<Phase>('loading');
  const [truckX, setTruckX] = useState(TRUCK_START_X);
  const [flipped, setFlipped] = useState(false);          // false = facing right (to plant), true = facing left (to waste)
  const [bubbles, setBubbles] = useState([false,false,false,false]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const after = (ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms); timers.current.push(t); return t;
  };

  const runCycle = React.useCallback(() => {
    clearAll();
    // ── Phase 1: loading at pile (1.2s) — truck faces right toward plant, parked at start ──
    setPhase('loading');
    setTruckX(TRUCK_START_X);
    setFlipped(false);
    setBubbles([false, false, false, false]);

    // ── Phase 2: drive right to plant (3.2s) ──
    after(1200, () => {
      setPhase('driving');
      setTruckX(TRUCK_END_X);
    });

    // ── Phase 3: arrived at plant (t = 4400ms) ──
    after(4400, () => {
      setPhase('arrived');
    });

    // Sequential bubble releases on every trip:
    // Bubble 0: Biogas (t = 4600ms)
    after(4600, () => {
      setBubbles([true, false, false, false]);
    });
    // Bubble 1: Thermal Energy (t = 5150ms)
    after(5150, () => {
      setBubbles([true, true, false, false]);
    });
    // Bubble 2: Electricity Potential (t = 5700ms)
    after(5700, () => {
      setBubbles([true, true, true, false]);
    });
    // Bubble 3: Savings (t = 6250ms)
    after(6250, () => {
      setBubbles([true, true, true, true]);
    });

    // All 4 bubbles stay fully active and visible together from 6250ms to 9250ms (3.0s display)

    // ── Phase 4: switch to left-facing truck at TRUCK_END_X & return (t = 9250ms) ──
    after(9250, () => {
      setBubbles([false, false, false, false]);
      setFlipped(true);
      setTruckX(TRUCK_END_X);
    });
    // Tiny delay so React applies the snap before starting the transition
    after(9300, () => {
      setPhase('returning');
      setTruckX(TRUCK_START_X);
    });

    // ── Loop back to Phase 1 for the next trip (t = 12000ms) ──
    after(12000, () => runCycle());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(runCycle, 400);
    return () => { clearTimeout(t); clearAll(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMoving   = phase === 'driving' || phase === 'returning';
  const moveDur    = phase === 'driving' ? '3.2s' : phase === 'returning' ? '2.6s' : '0.001s';
  const wheelSpeed = isMoving ? '0.9s' : '0s';

  // Real-time formatted metrics synced with calculated data
  const fmtBiogas   = biogas >= 10 ? biogas.toFixed(1) : biogas.toFixed(2);
  const fmtThermal  = thermal >= 10 ? thermal.toFixed(1) : thermal.toFixed(2);
  const fmtElectric = electricity >= 100 ? Math.round(electricity).toLocaleString() : electricity.toFixed(1);
  const fmtSavings  = `₹${Math.round(savings).toLocaleString()}`;

  const bubbleData = [
    {
      label: isHindi ? 'बायोगैस' : 'Biogas',
      value: `${fmtBiogas} m³/d`,
      sub: isHindi ? 'दैनिक उत्पादन' : 'Daily Yield',
      color: '#16a34a',
    },
    {
      label: isHindi ? 'तापीय ऊर्जा' : 'Thermal Energy',
      value: `${fmtThermal} kWh/d`,
      sub: isHindi ? 'दैनिक ऊष्मा' : 'Daily Heat',
      color: '#f59e0b',
    },
    {
      label: isHindi ? 'बिजली क्षमता' : 'Electricity Potential',
      value: `${fmtElectric} kWh/mo`,
      sub: isHindi ? 'मासिक क्षमता' : 'Monthly Pot.',
      color: '#2563eb',
    },
    {
      label: isHindi ? 'मासिक बचत' : 'Savings',
      value: `${fmtSavings}/mo`,
      sub: isHindi ? 'अनुमानित बचत' : 'Monthly Est.',
      color: '#7c3aed',
    },
  ];

  // Bubble positions: fan arched cleanly above the chimney (x=554, y=58)
  const bPos = [
    { x: 450, y: 72, r: 38 },
    { x: 516, y: 44, r: 38 },
    { x: 586, y: 44, r: 38 },
    { x: 650, y: 72, r: 38 },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 mb-6 fade-up overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">♻️</span>
        <h2 className="font-bold text-gray-900 text-sm">
          {isHindi ? 'कचरे से ऊर्जा — यात्रा' : 'Waste-to-Energy Journey'}
        </h2>
        <span className="text-xs text-gray-500 ml-auto italic">
          {phase === 'loading'   && (isHindi ? '📦 लोड हो रहा है…'   : '📦 Loading waste…')}
          {phase === 'driving'   && (isHindi ? '🚛 संयंत्र की ओर…'   : '🚛 Heading to plant…')}
          {phase === 'arrived'   && (isHindi ? '⚡ ऊर्जा उत्पन्न!'    : '⚡ Energy generated!')}
          {phase === 'returning' && (isHindi ? '🔄 वापस आ रहा है…'   : '🔄 Returning for more…')}
        </span>
      </div>

      {/* ── SVG Scene — viewBox 700×230 ── */}
      <div className="relative w-full" style={{ height: 230 }}>
        <svg viewBox="0 0 700 230" width="100%" height="230"
          xmlns="http://www.w3.org/2000/svg" style={{ display:'block', overflow:'visible' }}>

          <defs>
            <linearGradient id="wj-gnd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bbf7d0"/>
              <stop offset="100%" stopColor="#86efac"/>
            </linearGradient>
            <linearGradient id="wj-cab" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#1d4ed8"/>
            </linearGradient>
            <linearGradient id="wj-cargo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa"/>
              <stop offset="100%" stopColor="#2563eb"/>
            </linearGradient>
            <linearGradient id="wj-plant" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80"/>
              <stop offset="100%" stopColor="#15803d"/>
            </linearGradient>
          </defs>

          {/* Global keyframes */}
          <style>{`
            @keyframes wj-wobble  { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
            @keyframes wj-bob     { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-4px)} }
            @keyframes wj-wheel   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            @keyframes wj-wheel-rev { from{transform:rotate(360deg)} to{transform:rotate(0deg)} }
            @keyframes wj-chimsmk {
              0%  { transform:translate(0,0)       scale(0.45); opacity:0.9; }
              100%{ transform:translate(-6px,-34px) scale(1.8);  opacity:0; }
            }
            @keyframes wj-bubblepop {
              0%  { transform:scale(0);    opacity:0;    }
              40% { transform:scale(1.18); opacity:1;    }
              70% { transform:scale(0.96); opacity:1;    }
              100%{ transform:scale(1);    opacity:0.95; }
            }
            @keyframes wj-loadpulse {
              0%,100%{ opacity:0.5; transform:scaleY(0.9); }
              50%    { opacity:1;   transform:scaleY(1.1); }
            }
            .wj-waste1 { animation: wj-wobble 1.9s ease-in-out infinite; transform-origin: 78px 130px; }
            .wj-waste2 { animation: wj-bob    2.3s ease-in-out infinite; }
            .wj-waste3 { animation: wj-wobble 2.7s ease-in-out infinite 0.5s; transform-origin: 118px 131px; }
            .wj-cs1 { animation: wj-chimsmk 1.7s ease-out infinite 0s;    }
            .wj-cs2 { animation: wj-chimsmk 1.7s ease-out infinite 0.55s; }
            .wj-cs3 { animation: wj-chimsmk 1.7s ease-out infinite 1.1s;  }
            .wj-loadbar { animation: wj-loadpulse 0.7s ease-in-out infinite; }
            /* Wheel spin: transform-box:fill-box makes transform-origin relative to
               the element's own bounding box, so "center" = the wheel's own centre. */
            .wj-spin {
              transform-box: fill-box;
              transform-origin: center;
              animation: wj-wheel ${wheelSpeed} linear infinite;
            }
            .wj-spin-rev {
              transform-box: fill-box;
              transform-origin: center;
              animation: wj-wheel-rev ${wheelSpeed} linear infinite;
            }
          `}</style>

          {/* ── Ground + road ── */}
          <rect x="0" y="185" width="700" height="45" fill="url(#wj-gnd)" rx="0" opacity="0.55"/>
          {[50,115,180,245,310,375,440,505,570,635].map(x => (
            <rect key={x} x={x} y="192" width="42" height="6" rx="3" fill="#fff" opacity="0.4"/>
          ))}
          {/* kerb lines */}
          <line x1="0" y1="186" x2="700" y2="186" stroke="#86efac" strokeWidth="1.5" opacity="0.6"/>

          {/* ══════ LEFT — WASTE PILE ══════ */}
          <ellipse cx="95" cy="188" rx="62" ry="9" fill="#15803d" opacity="0.2"/>

          {/* Wheelie bin */}
          <rect x="48" y="148" width="42" height="40" rx="5" fill="#475569"/>
          <rect x="44" y="143" width="50" height="9"  rx="4" fill="#334155"/>
          <rect x="46" y="137" width="46" height="8"  rx="3" fill="#1e293b"/>
          {/* bin wheels */}
          <circle cx="56"  cy="190" r="5" fill="#1e293b" stroke="#475569" strokeWidth="1.5"/>
          <circle cx="82"  cy="190" r="5" fill="#1e293b" stroke="#475569" strokeWidth="1.5"/>
          {/* bin label */}
          <text x="69" y="173" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="700">♻</text>

          {/* waste item 1 – green organic bag */}
          <g className="wj-waste1">
            <ellipse cx="78" cy="137" rx="16" ry="12" fill="#4ade80"/>
            <line x1="78" y1="125" x2="78" y2="119" stroke="#16a34a" strokeWidth="2.5"/>
            <circle cx="78" cy="118" r="3" fill="#16a34a"/>
            <ellipse cx="72" cy="138" rx="5" ry="3" fill="#22c55e" opacity="0.5"/>
          </g>
          {/* waste item 2 – orange food container */}
          <g className="wj-waste2" style={{ transform: 'translateX(0)' }}>
            <rect x="98" y="142" width="26" height="18" rx="5" fill="#fb923c"/>
            <rect x="98" y="142" width="26" height="7"  rx="3" fill="#f97316"/>
            <circle cx="111" cy="140" r="4" fill="#ea580c"/>
          </g>
          {/* waste item 3 – yellow crop stalks */}
          <g className="wj-waste3">
            <rect x="102" y="143" width="9" height="22" rx="2" fill="#ca8a04" transform="rotate(-12,106,154)"/>
            <rect x="112" y="140" width="9" height="24" rx="2" fill="#a16207" transform="rotate(6,116,152)"/>
            <rect x="122" y="144" width="8" height="20" rx="2" fill="#ca8a04" transform="rotate(-6,126,154)"/>
          </g>

          {/* Loading indicator (shown when phase==='loading') */}
          {phase === 'loading' && (
            <g>
              <rect x="58" y="130" width="22" height="6" rx="3" fill="#fbbf24" className="wj-loadbar"/>
              <text x="60" y="126" fontSize="9" fill="#92400e">{isHindi ? 'लोड…' : 'Load…'}</text>
            </g>
          )}

          {/* label */}
          <text x="80" y="218" textAnchor="middle" fontSize="12" fill="#166534" fontWeight="700">
            {isHindi ? 'कचरा स्थल' : 'Waste Site'}
          </text>

          {/* ══════ TRUCK ══════
            • Going to plant (!flipped):   Front faces RIGHT (cab on right, cargo on left).
            • Returning to waste (flipped): Front faces LEFT (cab on left, cargo on right).
            Text on the cargo container remains properly aligned, centered, and readable.
          */}
          {(() => {
            const offset = truckX - TRUCK_START_X;

            // ── Shared wheel renderer ──
            const Wheel = ({ cx, cy, reverse = false }: { cx: number; cy: number; reverse?: boolean }) => (
              <g className={isMoving ? (reverse ? 'wj-spin-rev' : 'wj-spin') : ''}>
                <circle cx={cx} cy={cy} r="14" fill="#1f2937" stroke="#4b5563" strokeWidth="2.5"/>
                <circle cx={cx} cy={cy} r="5"  fill="#6b7280"/>
                {/* 4-spoke cross */}
                <line x1={cx} y1={cy-14} x2={cx} y2={cy+14} stroke="#374151" strokeWidth="2"/>
                <line x1={cx-14} y1={cy} x2={cx+14} y2={cy} stroke="#374151" strokeWidth="2"/>
                <line x1={cx-10} y1={cy-10} x2={cx+10} y2={cy+10} stroke="#374151" strokeWidth="1.5" opacity="0.55"/>
                <line x1={cx+10} y1={cy-10} x2={cx-10} y2={cy+10} stroke="#374151" strokeWidth="1.5" opacity="0.55"/>
              </g>
            );

            if (!flipped) {
              // ── RIGHT-FACING TRUCK (cab right, cargo left) ──
              // Drives forward toward the processing plant
              return (
                <g style={{
                  transform: `translateX(${TRUCK_START_X + offset}px)`,
                  transition: `transform ${moveDur} cubic-bezier(0.45,0,0.55,1)`,
                }}>
                  {/* ── CARGO (left / rear) ── */}
                  <rect x="0"  y="143" width="84" height="44" rx="5" fill="url(#wj-cargo)"/>
                  {/* Vertical decorative panel ribs */}
                  <line x1="14" y1="145" x2="14" y2="185" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.35"/>
                  <line x1="70" y1="145" x2="70" y2="185" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.35"/>

                  {/* Centered cargo badge container */}
                  <rect x="12" y="153" width="60" height="22" rx="4" fill="#1e3a8a" opacity="0.65"/>
                  {/* Cargo text — centered alignment horizontally & vertically */}
                  <text
                    x="42"
                    y="164"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="10"
                    fill="#e0f2fe"
                    fontWeight="700"
                    letterSpacing="0.05em"
                  >
                    {isHindi ? 'बायोगैस' : 'BIOGAS'}
                  </text>

                  {/* Exhaust pipe on rear (left edge) */}
                  <rect x="0" y="132" width="7"  height="16" rx="3" fill="#374151"/>
                  <rect x="0" y="129" width="11" height="5"  rx="2" fill="#1f2937"/>
                  {/* Connector ridge between cargo and cab */}
                  <rect x="84" y="143" width="6" height="44" rx="2" fill="#1d4ed8"/>

                  {/* ── CAB (right / front facing plant) ── */}
                  <rect x="90" y="145" width="66" height="42" rx="6" fill="url(#wj-cab)"/>
                  {/* Windshield on RIGHT side (front) */}
                  <rect x="130" y="149" width="24" height="20" rx="3" fill="#bfdbfe" opacity="0.9"/>
                  <rect x="138" y="151" width="8"  height="5"  rx="2" fill="#fff"    opacity="0.5"/>
                  {/* Door window */}
                  <rect x="100" y="151" width="18" height="14" rx="3" fill="#93c5fd" opacity="0.7"/>
                  <rect x="98"  y="162" width="8"  height="2"  rx="1" fill="#1e40af"/>
                  {/* Front bumper and headlight facing right */}
                  <rect x="154" y="177" width="10" height="8"  rx="2" fill="#1e3a8a"/>
                  <rect x="152" y="166" width="6"  height="5"  rx="1" fill="#fef9c3"/>
                  {isMoving && (
                    <polygon points="158,165 190,158 190,178 158,172" fill="#fef08a" opacity="0.25"/>
                  )}

                  {/* ── WHEELS (spinning clockwise forward) ── */}
                  <Wheel cx={42}  cy={189} />
                  <Wheel cx={133} cy={189} />
                </g>
              );
            } else {
              // ── LEFT-FACING TRUCK (cab left, cargo right) ──
              // Drives forward returning toward the waste site
              return (
                <g style={{
                  transform: `translateX(${TRUCK_START_X + offset}px)`,
                  transition: `transform ${moveDur} cubic-bezier(0.45,0,0.55,1)`,
                }}>
                  {/* ── CAB (left / front facing waste site) ── */}
                  <rect x="0"  y="145" width="66" height="42" rx="6" fill="url(#wj-cab)"/>
                  {/* Windshield on LEFT side (front) */}
                  <rect x="2"  y="149" width="24" height="20" rx="3" fill="#bfdbfe" opacity="0.9"/>
                  <rect x="5"  y="151" width="8"  height="5"  rx="2" fill="#fff"    opacity="0.5"/>
                  {/* Door window */}
                  <rect x="38" y="151" width="18" height="14" rx="3" fill="#93c5fd" opacity="0.7"/>
                  <rect x="50" y="162" width="8"  height="2"  rx="1" fill="#1e40af"/>
                  {/* Front bumper and headlight facing left */}
                  <rect x="-8" y="177" width="10" height="8"  rx="2" fill="#1e3a8a"/>
                  <rect x="-2" y="166" width="6"  height="5"  rx="1" fill="#fef9c3"/>
                  {isMoving && (
                    <polygon points="-8,165 -40,158 -40,178 -8,172" fill="#fef08a" opacity="0.25"/>
                  )}
                  {/* Connector ridge between cab and cargo */}
                  <rect x="66" y="143" width="6"  height="44" rx="2" fill="#1d4ed8"/>

                  {/* ── CARGO (right / rear) ── */}
                  <rect x="72" y="143" width="84" height="44" rx="5" fill="url(#wj-cargo)"/>
                  {/* Vertical decorative panel ribs */}
                  <line x1="86"  y1="145" x2="86"  y2="185" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.35"/>
                  <line x1="142" y1="145" x2="142" y2="185" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.35"/>

                  {/* Centered cargo badge container */}
                  <rect x="84" y="153" width="60" height="22" rx="4" fill="#1e3a8a" opacity="0.65"/>
                  {/* Cargo text — centered alignment horizontally & vertically */}
                  <text
                    x="114"
                    y="164"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="10"
                    fill="#e0f2fe"
                    fontWeight="700"
                    letterSpacing="0.05em"
                  >
                    {isHindi ? 'बायोगैस' : 'BIOGAS'}
                  </text>

                  {/* Exhaust pipe on rear (right edge) */}
                  <rect x="149" y="132" width="7"  height="16" rx="3" fill="#374151"/>
                  <rect x="145" y="129" width="11" height="5"  rx="2" fill="#1f2937"/>

                  {/* ── WHEELS (spinning counter-clockwise forward) ── */}
                  <Wheel cx={23}  cy={189} reverse={true} />
                  <Wheel cx={114} cy={189} reverse={true} />
                </g>
              );
            }
          })()}

          {/* ══════ RIGHT — BIOGAS PLANT ══════ */}
          {/*
            Plant centered around x=555.
            Building: 130px wide, 80px tall.  Chimney rises ~60px above.
          */}
          <ellipse cx="557" cy="188" rx="88" ry="11" fill="#15803d" opacity="0.22"/>

          {/* building base */}
          <rect x="492" y="128" width="130" height="60" rx="8" fill="url(#wj-plant)"/>
          {/* roof arch */}
          <ellipse cx="557" cy="128" rx="65" ry="18" fill="#4ade80"/>
          {/* roof highlight */}
          <ellipse cx="540" cy="122" rx="28" ry="7" fill="#a7f3d0" opacity="0.4"/>

          {/* left side pipe inlet */}
          <rect x="474" y="148" width="22" height="14" rx="4" fill="#166534"/>
          <rect x="464" y="153" width="14" height="8"  rx="3" fill="#14532d"/>
          {/* inlet arrow */}
          <polygon points="486,152 486,164 492,158" fill="#4ade80" opacity="0.8"/>

          {/* right side output pipe */}
          <rect x="622" y="152" width="22" height="10" rx="4" fill="#166534"/>
          <rect x="642" y="150" width="18" height="14" rx="3" fill="#14532d"/>

          {/* chimney stack */}
          <rect x="543" y="68" width="22" height="62" rx="5" fill="#166534"/>
          {/* chimney cap */}
          <rect x="537" y="62" width="34" height="12" rx="4" fill="#14532d"/>
          {/* chimney band stripes */}
          <rect x="543" y="80" width="22" height="5" rx="0" fill="#14532d" opacity="0.5"/>
          <rect x="543" y="95" width="22" height="5" rx="0" fill="#14532d" opacity="0.5"/>
          <rect x="543" y="110" width="22" height="5" rx="0" fill="#14532d" opacity="0.5"/>

          {/* meter gauges on building */}
          <circle cx="520" cy="158" r="9"  fill="#14532d" stroke="#4ade80" strokeWidth="2"/>
          <line x1="516" y1="158" x2="522" y2="154" stroke="#a3e635" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="548" cy="158" r="9"  fill="#14532d" stroke="#4ade80" strokeWidth="2"/>
          <line x1="544" y1="158" x2="550" y2="154" stroke="#a3e635" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="576" cy="158" r="9"  fill="#14532d" stroke="#fbbf24" strokeWidth="2"/>
          <line x1="572" y1="158" x2="578" y2="154" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>

          {/* building name plate */}
          <rect x="500" y="135" width="114" height="18" rx="4" fill="#14532d" opacity="0.75"/>
          <text x="557" y="147" textAnchor="middle" fontSize="11" fill="#86efac" fontWeight="700">
            {isHindi ? 'बायोगैस संयंत्र' : 'Biogas Plant'}
          </text>

          {/* chimney smoke — always on */}
          <circle className="wj-cs1" cx="554" cy="60" r="7"  fill="#a3e635" opacity="0.85"/>
          <circle className="wj-cs2" cx="554" cy="60" r="6"  fill="#86efac" opacity="0.80"/>
          <circle className="wj-cs3" cx="554" cy="60" r="8"  fill="#4ade80" opacity="0.70"/>

          {/* plant label below */}
          <text x="557" y="218" textAnchor="middle" fontSize="12" fill="#166534" fontWeight="700">
            {isHindi ? 'प्रसंस्करण संयंत्र' : 'Processing Plant'}
          </text>

          {/* ══════ BUBBLES (pop sequentially from chimney after arrival) ══════ */}
          {bPos.map((bp, i) => {
            if (!bubbles[i]) return null;
            const b = bubbleData[i];
            return (
              <g key={i}
                style={{
                  animation: 'wj-bubblepop 0.55s cubic-bezier(.34,1.56,.64,1) forwards',
                  transformOrigin: `${bp.x}px ${bp.y}px`,
                }}>
                {/* Glow ring */}
                <circle cx={bp.x} cy={bp.y} r={bp.r + 3} fill={b.color} opacity="0.2"/>
                {/* Main bubble */}
                <circle cx={bp.x} cy={bp.y} r={bp.r} fill={b.color} opacity="0.94"/>
                {/* Gloss highlight */}
                <ellipse cx={bp.x - bp.r * 0.28} cy={bp.y - bp.r * 0.32}
                  rx={bp.r * 0.3} ry={bp.r * 0.18} fill="#fff" opacity="0.4"/>
                {/* Bubble stem line to chimney */}
                <line x1={bp.x} y1={bp.y + bp.r} x2="554" y2="58"
                  stroke={b.color} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.55"/>
                {/* Label */}
                <text x={bp.x} y={bp.y - 10} textAnchor="middle"
                  fontSize="8.5" fill="#fff" fontWeight="700" letterSpacing="0.2px">
                  {b.label}
                </text>
                {/* Calculated real-time value */}
                <text x={bp.x} y={bp.y + 4} textAnchor="middle"
                  fontSize="11" fill="#fff" fontWeight="800">
                  {b.value}
                </text>
                {/* Subtitle / Unit descriptor */}
                <text x={bp.x} y={bp.y + 16} textAnchor="middle"
                  fontSize="7.5" fill="#fff" opacity="0.9" fontWeight="600">
                  {b.sub}
                </text>
              </g>
            );
          })}

          {/* ══════ DASHED GUIDE PATH ══════ */}
          <path d="M 152 183 C 280 175, 360 175, 488 183"
            fill="none" stroke="#16a34a" strokeWidth="1.8"
            strokeDasharray="7 5" opacity="0.35"/>

        </svg>
      </div>
    </div>
  );
}



// ─── Household Waste View ─────────────────────────────────────────────────────

function HouseholdWasteView() {
  const { isHindi } = useLanguage();
  const { members } = useHousehold();

  // Household defaults: derived from members
  // avg 0.5 kg food waste per person/day; 1 cattle unit per 3 members; 0.3 kg agri per person
  const defaultCowDung = Math.round(members * 1.5);   // ~1.5 kg dung per member-equivalent cattle
  const defaultFood = Math.round(members * 0.5);
  const defaultAgri = Math.round(members * 0.3);

  const [cowDung, setCowDung] = useState(defaultCowDung);
  const [foodWaste, setFoodWaste] = useState(defaultFood);
  const [agriWaste, setAgriWaste] = useState(defaultAgri);

  // Sync sliders when members changes
  React.useEffect(() => {
    setCowDung(Math.round(members * 1.5));
    setFoodWaste(Math.round(members * 0.5));
    setAgriWaste(Math.round(members * 0.3));
  }, [members]);

  const totalBiogasM3PerDay = calculateBiogas(cowDung, agriWaste, foodWaste);
  const thermalPerDay = calculateWasteEnergy(totalBiogasM3PerDay);
  const electricityPerDay = +(totalBiogasM3PerDay * ASSUMPTIONS.biogasElectricKWhPerM3).toFixed(2);
  const electricityPerMonth = electricityPerDay * 30;
  const co2OffsetPerMonth = calculateCO2(electricityPerMonth);
  const monthlySavings = calculateElectricityCost(electricityPerMonth);
  const biogasPerMonth = totalBiogasM3PerDay * 30;

  // Donut chart data for energy recovery by waste source
  const recoveryDonutData = [
    { name: isHindi ? 'गोबर' : 'Cow Dung', value: +(cowDung * ASSUMPTIONS.cowDungBiogasM3PerKg).toFixed(3), fill: '#16a34a' },
    { name: isHindi ? 'भोजन अपशिष्ट' : 'Food Waste', value: +(foodWaste * ASSUMPTIONS.foodWasteBiogasM3PerKg).toFixed(3), fill: '#f59e0b' },
    { name: isHindi ? 'कृषि अपशिष्ट' : 'Agri Waste', value: +(agriWaste * ASSUMPTIONS.agriWasteBiogasM3PerKg).toFixed(3), fill: '#ca8a04' },
  ];

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(160deg, #052e16 0%, #065f46 50%, #052e16 100%)' }}>
      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="leaf-pattern-hh" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="25" stroke="#16a34a" strokeWidth="1" fill="none"/>
              <path d="M40,15 L40,65 M15,40 L65,40" stroke="#16a34a" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#leaf-pattern-hh)"/>
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="glass-card rounded-2xl p-5 mb-6 fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Leaf className="w-6 h-6 text-green-600" /> {isHindi ? 'कचरा एवं ऊर्जा' : 'Waste & Energy'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">{isHindi ? 'आपके घर का जैविक कचरा → बायोगैस → बिजली उत्पादन संभावना' : 'Your household organic waste → biogas → electricity potential'}</p>
            </div>
            <DemoBadge />
          </div>
        </div>

        {/* Members sync banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3 fade-up">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-blue-700 font-bold text-sm">{members}</span>
          </div>
          <div>
            <div className="font-semibold text-blue-900 text-sm">
              {isHindi ? `परिवार का आकार: ${members} सदस्य — डैशबोर्ड से सिंक्रनाइज़्ड` : `Household size: ${members} member${members !== 1 ? 's' : ''} — synced from My Dashboard`}
            </div>
            <div className="text-xs text-blue-700/80 mt-0.5">
              {isHindi ? 'नीचे दिए गए कचरा अनुमान आपके परिवार के आकार के अनुसार समायोजित हैं। अपने वास्तविक कचरे के अनुसार स्लाइडर बदलें।' : 'Waste estimates below are auto-calibrated to your household size. Adjust sliders to match your actual waste.'}
            </div>
          </div>
        </div>

        {/* Input sliders with icon thumbs */}
        <div className="glass-card rounded-2xl p-5 mb-6 fade-up">
          <div className="mb-4">
            <h2 className="font-bold text-gray-900 text-base">{isHindi ? 'जैविक कचरा इनपुट' : 'Organic Waste Inputs'}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{isHindi ? 'अपने परिवार का दैनिक जैविक कचरा (किग्रा/दिन) समायोजित करें' : "Adjust your household's daily organic waste (kg/day)"}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            <IconSlider
              label={isHindi ? 'गोबर' : 'Cow Dung'}
              sublabel={isHindi ? '0.04 m³ बायोगैस प्रति किग्रा' : '0.04 m³ biogas per kg'}
              value={cowDung}
              displayValue={`${cowDung} kg/day`}
              min={0} max={30} step={1}
              onChange={setCowDung}
              accentColor="text-green-700 bg-green-50 border-green-200"
              trackColor="#16a34a"
              labelColor="text-green-800"
              icon={<CowIcon size={26} />}
              hint={isHindi ? '0.04 m³ बायोगैस प्रति किग्रा' : '0.04 m³ biogas per kg'}
            />
            <IconSlider
              label={isHindi ? 'भोजन अपशिष्ट' : 'Food Waste'}
              sublabel={isHindi ? '0.06 m³ बायोगैस प्रति किग्रा' : '0.06 m³ biogas per kg'}
              value={foodWaste}
              displayValue={`${foodWaste} kg/day`}
              min={0} max={20} step={1}
              onChange={setFoodWaste}
              accentColor="text-amber-700 bg-amber-50 border-amber-200"
              trackColor="#f59e0b"
              labelColor="text-amber-800"
              icon={<FoodIcon size={26} />}
              hint={isHindi ? '0.06 m³ बायोगैस प्रति किग्रा' : '0.06 m³ biogas per kg'}
            />
            <IconSlider
              label={isHindi ? 'कृषि अपशिष्ट' : 'Agri Waste'}
              sublabel={isHindi ? '0.02 m³ बायोगैस प्रति किग्रा' : '0.02 m³ biogas per kg'}
              value={agriWaste}
              displayValue={`${agriWaste} kg/day`}
              min={0} max={15} step={1}
              onChange={setAgriWaste}
              accentColor="text-yellow-700 bg-yellow-50 border-yellow-200"
              trackColor="#ca8a04"
              labelColor="text-yellow-800"
              icon={<CropIcon size={26} />}
              hint={isHindi ? '0.02 m³ बायोगैस प्रति किग्रा' : '0.02 m³ biogas per kg'}
            />
          </div>
        </div>

        {/* ── Waste-to-Energy Journey Animation ── */}
        <WasteJourneyAnimation
          biogas={totalBiogasM3PerDay}
          thermal={thermalPerDay}
          electricity={electricityPerMonth}
          savings={monthlySavings}
          isHindi={isHindi}
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard title={isHindi ? 'दैनिक बायोगैस' : 'Daily Biogas'} value={totalBiogasM3PerDay.toFixed(3)} unit="m³/day"
            icon={<Leaf className="w-5 h-5 text-green-600" />} iconBg="bg-green-100"
            formula="Σ(input_kg × biogas_factor_m³/kg)" source="MNRE biogas guidelines" dataType="Calculated" />
          <KpiCard title={isHindi ? 'तापीय ऊर्जा' : 'Thermal Energy'} value={thermalPerDay.toFixed(3)} unit="kWh/day"
            icon={<Zap className="w-5 h-5 text-orange-600" />} iconBg="bg-orange-100"
            formula={`Biogas (m³) × ${ASSUMPTIONS.biogasThermalKWhPerM3} kWh/m³`} source="MNRE" dataType="Calculated" />
          <KpiCard title={isHindi ? 'बिजली उत्पादन क्षमता' : 'Electricity Potential'} value={electricityPerMonth.toFixed(2)} unit="kWh/mo"
            icon={<Zap className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-100"
            formula={`Biogas × ${ASSUMPTIONS.biogasElectricKWhPerM3} kWh/m³ × 30`} source="MNRE" dataType="Calculated" />
          <KpiCard title={isHindi ? 'मासिक बचत' : 'Monthly Saving'} value={'₹' + monthlySavings.toLocaleString()}
            icon={<Leaf className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-100"
            formula={`Electricity × ₹${ASSUMPTIONS.tariffINRPerKWh}/kWh`} source="Standard tariff" dataType="Estimated" />
        </div>

        {/* Energy Recovery Summary - Hollow Donut Chart */}
        <div className="mb-6">
          <div className="glass-card rounded-2xl p-5 fade-up">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-gray-900">{isHindi ? 'ऊर्जा पुनर्चक्रण — घरेलू अवलोकन' : 'Energy Recovery — Household Overview'}</h2>
            </div>
            <p className="text-xs text-gray-500 mb-2">{isHindi ? 'कचरा प्रकार द्वारा बायोगैस योगदान एवं मासिक आउटपुट मेट्रिक्स' : 'Biogas contribution by waste type and monthly output metrics'}</p>
            <DemoBadge className="mb-4" />
            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* Hollow Pie Chart */}
              <div className="relative">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={recoveryDonutData}
                      cx="50%"
                      cy="45%"
                      innerRadius={70}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {recoveryDonutData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} m³/day`, isHindi ? 'बायोगैस' : 'Biogas']} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: 40 }}>
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-emerald-800">{totalBiogasM3PerDay.toFixed(3)}</div>
                    <div className="text-[11px] text-gray-500 font-medium">{isHindi ? 'm³/दिन बायोगैस' : 'm³/day biogas'}</div>
                  </div>
                </div>
              </div>
              {/* Key metrics */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                  <span className="text-sm text-green-800 font-medium">{isHindi ? 'कुल कचरा इनपुट' : 'Total Waste Input'}</span>
                  <span className="text-sm font-bold text-green-900">{(cowDung + foodWaste + agriWaste).toFixed(1)} kg/{isHindi ? 'दिन' : 'day'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-sm text-emerald-800 font-medium">{isHindi ? 'मासिक बायोगैस' : 'Monthly Biogas'}</span>
                  <span className="text-sm font-bold text-emerald-900">{biogasPerMonth.toFixed(2)} m³</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-xl">
                  <span className="text-sm text-orange-800 font-medium">{isHindi ? 'तापीय ऊर्जा' : 'Thermal Energy'}</span>
                  <span className="text-sm font-bold text-orange-900">{thermalPerDay.toFixed(2)} kWh/{isHindi ? 'दिन' : 'day'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-sm text-blue-800 font-medium">{isHindi ? 'बिजली (मासिक)' : 'Electricity (monthly)'}</span>
                  <span className="text-sm font-bold text-blue-900">{electricityPerMonth.toFixed(1)} kWh</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <span className="text-sm text-purple-800 font-medium">{isHindi ? 'CO₂ निवारण' : 'CO₂ Offset'}</span>
                  <span className="text-sm font-bold text-purple-900">{co2OffsetPerMonth.toFixed(2)} kg/{isHindi ? 'माह' : 'month'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-sm text-amber-800 font-medium">{isHindi ? 'अनुमानित मूल्य' : 'Estimated Value'}</span>
                  <span className="text-sm font-bold text-amber-900">₹{monthlySavings.toLocaleString()}/{isHindi ? 'माह' : 'month'}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <strong>{isHindi ? 'नोट:' : 'Note:'}</strong> {isHindi ? 'वास्तविक बायोगैस उत्पादन डाइजेस्टर डिज़ाइन, तापमान, मिश्रण और प्रतिधारण समय पर निर्भर करता है। ये MNRE दिशानिर्देशों पर आधारित सैद्धांतिक अनुमान हैं।' : 'Actual biogas yield depends on digester design, temperature, feed mix, and retention time. These are theoretical estimates using MNRE guidelines.'}
            </div>
          </div>
        </div>

        {/* Government Biogas Schemes */}
        <div className="glass-card rounded-2xl p-6 fade-up">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-green-500" /> {isHindi ? 'सरकारी बायोगैस एवं कचरा-से-ऊर्जा योजनाएं' : 'Government Biogas & Waste-to-Energy Schemes'}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {isHindi ? 'बायोगैस और जैविक कचरे के लिए सरकारी सब्सिडी और कार्यक्रम — पात्रता और विवरण देखने के लिए क्लिक करें।' : 'Indian government subsidies and programmes for biogas & organic waste adoption — click any scheme to expand eligibility & details.'}
          </p>
          <div className="space-y-3">
            {BIOGAS_SCHEMES.map(scheme => (
              <BiogasSchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default function WastePage() {
  const { role } = useAuth();
  return role === 'citizen' ? <HouseholdWasteView /> : <VillageWasteView />;
}
