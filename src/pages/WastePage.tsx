import React, { useState, useMemo } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend,
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

// ─── Village view (unchanged from original) ──────────────────────────────────

const areas = getAllAreaAnalyses();
const COLORS = ['#16a34a', '#059669', '#f59e0b', '#84cc16'];

function VillageWasteView() {
  const [selectedAreaId, setSelectedAreaId] = useState('motipur');
  const [cowDung, setCowDung] = useState(500);
  const [foodWaste, setFoodWaste] = useState(300);
  const [agriWaste, setAgriWaste] = useState(200);
  const [scale, setScale] = useState<'community' | 'household'>('community');

  React.useEffect(() => {
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
            <button key={s} onClick={() => setScale(s)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${scale === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
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
            formula="Σ(input_kg × biogas_factor_m³/kg)" source="MNRE biogas guidelines" dataType="Calculated" />
          <KpiCard title="Thermal Energy" value={thermalPerDay.toFixed(2)} unit="kWh/day"
            icon={<Zap className="w-5 h-5 text-orange-600" />} iconBg="bg-orange-100"
            formula={`Biogas (m³) × ${ASSUMPTIONS.biogasThermalKWhPerM3} kWh/m³`} source="MNRE" dataType="Calculated" />
          <KpiCard title="Electricity Potential" value={electricityPerMonth.toFixed(1)} unit="kWh/mo"
            icon={<Zap className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-100"
            formula={`Biogas (m³) × ${ASSUMPTIONS.biogasElectricKWhPerM3} kWh/m³ × 30`} source="MNRE" dataType="Calculated" />
          <KpiCard title="Monthly Cost Saving" value={'₹' + monthlySavings.toLocaleString()}
            icon={<Leaf className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-100"
            formula={`Electricity potential × ₹${ASSUMPTIONS.tariffINRPerKWh}/kWh`} source="Standard tariff" dataType="Estimated" />
        </div>
        <div className="mb-6">
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
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Eligibility</div>
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
              <span className="font-semibold">Subsidy / Benefit: </span>{scheme.subsidy}
            </div>
            <a href={scheme.link} target="_blank" rel="noopener noreferrer"
              className="text-xs text-green-600 hover:underline font-medium">
              Official Portal ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Household Waste View ─────────────────────────────────────────────────────

function HouseholdWasteView() {
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

  // Chart data for energy recovery
  const energyChartData = [
    { name: 'Cow Dung', biogas: +(cowDung * ASSUMPTIONS.cowDungBiogasM3PerKg).toFixed(3), fill: '#16a34a' },
    { name: 'Food Waste', biogas: +(foodWaste * ASSUMPTIONS.foodWasteBiogasM3PerKg).toFixed(3), fill: '#f59e0b' },
    { name: 'Agri Waste', biogas: +(agriWaste * ASSUMPTIONS.agriWasteBiogasM3PerKg).toFixed(3), fill: '#ca8a04' },
  ];

  const monthlyChart = [
    { name: 'Biogas\n(m³×10)', value: +(biogasPerMonth * 10).toFixed(1), unit: 'm³/mo ×10', fill: '#16a34a' },
    { name: 'Thermal\n(kWh)', value: +(thermalPerDay * 30).toFixed(1), unit: 'kWh/mo', fill: '#f97316' },
    { name: 'Electricity\n(kWh)', value: +electricityPerMonth.toFixed(1), unit: 'kWh/mo', fill: '#3b82f6' },
    { name: 'CO₂ Offset\n(kg)', value: +co2OffsetPerMonth.toFixed(1), unit: 'kg/mo', fill: '#8b5cf6' },
    { name: 'Savings\n(₹÷10)', value: +(monthlySavings / 10).toFixed(0), unit: '₹/mo ÷10', fill: '#059669' },
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
                <Leaf className="w-6 h-6 text-green-600" /> Waste & Energy
              </h1>
              <p className="text-gray-500 text-sm mt-1">Your household organic waste → biogas → electricity potential</p>
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
              Household size: <strong>{members} member{members !== 1 ? 's' : ''}</strong> — synced from My Dashboard
            </div>
            <div className="text-xs text-blue-700/80 mt-0.5">
              Waste estimates below are auto-calibrated to your household size. Adjust sliders to match your actual waste.
            </div>
          </div>
        </div>

        {/* Input sliders with icon thumbs */}
        <div className="glass-card rounded-2xl p-5 mb-6 fade-up">
          <div className="mb-4">
            <h2 className="font-bold text-gray-900 text-base">Organic Waste Inputs</h2>
            <p className="text-sm text-gray-500 mt-0.5">Adjust your household's daily organic waste (kg/day)</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            <IconSlider
              label="Cow Dung"
              sublabel="0.04 m³ biogas per kg"
              value={cowDung}
              displayValue={`${cowDung} kg/day`}
              min={0} max={30} step={1}
              onChange={setCowDung}
              accentColor="text-green-700 bg-green-50 border-green-200"
              trackColor="#16a34a"
              labelColor="text-green-800"
              icon={<CowIcon size={26} />}
              hint="0.04 m³ biogas per kg"
            />
            <IconSlider
              label="Food Waste"
              sublabel="0.06 m³ biogas per kg"
              value={foodWaste}
              displayValue={`${foodWaste} kg/day`}
              min={0} max={20} step={1}
              onChange={setFoodWaste}
              accentColor="text-amber-700 bg-amber-50 border-amber-200"
              trackColor="#f59e0b"
              labelColor="text-amber-800"
              icon={<FoodIcon size={26} />}
              hint="0.06 m³ biogas per kg"
            />
            <IconSlider
              label="Agri Waste"
              sublabel="0.02 m³ biogas per kg"
              value={agriWaste}
              displayValue={`${agriWaste} kg/day`}
              min={0} max={15} step={1}
              onChange={setAgriWaste}
              accentColor="text-yellow-700 bg-yellow-50 border-yellow-200"
              trackColor="#ca8a04"
              labelColor="text-yellow-800"
              icon={<CropIcon size={26} />}
              hint="0.02 m³ biogas per kg"
            />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard title="Daily Biogas" value={totalBiogasM3PerDay.toFixed(3)} unit="m³/day"
            icon={<Leaf className="w-5 h-5 text-green-600" />} iconBg="bg-green-100"
            formula="Σ(input_kg × biogas_factor_m³/kg)" source="MNRE biogas guidelines" dataType="Calculated" />
          <KpiCard title="Thermal Energy" value={thermalPerDay.toFixed(3)} unit="kWh/day"
            icon={<Zap className="w-5 h-5 text-orange-600" />} iconBg="bg-orange-100"
            formula={`Biogas (m³) × ${ASSUMPTIONS.biogasThermalKWhPerM3} kWh/m³`} source="MNRE" dataType="Calculated" />
          <KpiCard title="Electricity Potential" value={electricityPerMonth.toFixed(2)} unit="kWh/mo"
            icon={<Zap className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-100"
            formula={`Biogas × ${ASSUMPTIONS.biogasElectricKWhPerM3} kWh/m³ × 30`} source="MNRE" dataType="Calculated" />
          <KpiCard title="Monthly Saving" value={'₹' + monthlySavings.toLocaleString()}
            icon={<Leaf className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-100"
            formula={`Electricity × ₹${ASSUMPTIONS.tariffINRPerKWh}/kWh`} source="Standard tariff" dataType="Estimated" />
        </div>

        {/* Chart: Biogas contribution by waste type */}
        <div className="glass-card rounded-2xl p-5 mb-6 fade-up">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-600" /> Energy Recovery — Household Overview
          </h2>
          <p className="text-xs text-gray-500 mb-4">Biogas contribution by waste type (m³/day) and monthly output metrics</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Biogas by source bar chart */}
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Biogas by Waste Source (m³/day)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={energyChartData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v} m³/day`, 'Biogas']} />
                  <Bar dataKey="biogas" radius={[6, 6, 0, 0]}>
                    {energyChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly energy metrics bar chart */}
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Monthly Output Metrics (scaled)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyChart} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number, _: string, props: any) => [`${v} ${props.payload.unit}`, props.payload.name.replace('\n', ' ')]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {monthlyChart.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="text-[10px] text-gray-400 text-center mt-1">
                * Biogas and Savings are scaled (×10 and ÷10) for readability
              </div>
            </div>
          </div>

          {/* Summary row */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <div className="text-xs text-green-700 font-semibold uppercase">Monthly Biogas</div>
              <div className="text-lg font-extrabold text-green-900 mt-0.5">{biogasPerMonth.toFixed(1)} <span className="text-xs font-bold">m³</span></div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
              <div className="text-xs text-purple-700 font-semibold uppercase">CO₂ Offset</div>
              <div className="text-lg font-extrabold text-purple-900 mt-0.5">{co2OffsetPerMonth.toFixed(2)} <span className="text-xs font-bold">kg/mo</span></div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <div className="text-xs text-emerald-700 font-semibold uppercase">Est. Value</div>
              <div className="text-lg font-extrabold text-emerald-900 mt-0.5">₹{monthlySavings.toLocaleString()} <span className="text-xs font-bold">/mo</span></div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <strong>Note:</strong> Actual biogas yield depends on digester design, temperature, feed mix, and retention time. These are theoretical estimates using MNRE guidelines.
          </div>
        </div>

        {/* Government Biogas Schemes */}
        <div className="glass-card rounded-2xl p-6 fade-up">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-green-500" /> Government Biogas & Waste-to-Energy Schemes
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Indian government subsidies and programmes for biogas & organic waste adoption — click any scheme to expand eligibility &amp; details.
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
