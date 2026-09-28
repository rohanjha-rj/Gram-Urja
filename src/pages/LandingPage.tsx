import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Droplets, Leaf, Sun, LayoutDashboard, Activity, Lightbulb, Bell, Award, Bot, ArrowRight } from 'lucide-react';
import { getRegionTotals } from '../services/energyService';

const totals = getRegionTotals();

const featureCards = [
  {
    icon: <LayoutDashboard className="w-6 h-6" />,
    color: 'bg-green-50 text-green-600 border-green-100',
    title: 'Village Dashboard',
    description: 'Multi-area command centre. Priority index, energy breakdowns, and actionable insights for all 6 areas.',
    to: '/village',
  },
  {
    icon: <Activity className="w-6 h-6" />,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    title: 'Household Dashboard',
    description: 'Appliance-level energy analysis with cost breakdown, timer tracking and sustainability score.',
    to: '/household',
  },
  {
    icon: <Sun className="w-6 h-6" />,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    title: 'Solar Potential',
    description: 'Roof + land area simulator with before/after analysis. Visualize panels filling your available space.',
    to: '/solar',
  },
  {
    icon: <Droplets className="w-6 h-6" />,
    color: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    title: 'Water Management',
    description: 'Demand calculator, rainwater harvesting potential, and pump energy connection.',
    to: '/water',
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    title: 'Waste & Energy',
    description: 'Biogas potential from organic waste. Community vs household scale energy recovery.',
    to: '/waste',
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    title: 'Recommendations',
    description: 'Data-driven action plans with investment, payback, CO₂ impact and priority ranking.',
    to: '/recommendations',
  },
  {
    icon: <Bell className="w-6 h-6" />,
    color: 'bg-red-50 text-red-600 border-red-100',
    title: 'Alerts Centre',
    description: 'Anomaly detection for consumption spikes, equipment faults and missed opportunities.',
    to: '/alerts',
  },
  {
    icon: <Award className="w-6 h-6" />,
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    title: 'Sustainability Score',
    description: 'Transparent 0-100 score with category breakdown, weights, and trend over time.',
    to: '/score',
  },
  {
    icon: <Bot className="w-6 h-6" />,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    title: 'AI Assistant',
    description: 'Ask questions about your data in English or Hindi. Smart navigation and calculation retrieval.',
    to: '/ai',
  },
];

// ─── Animated SVG Village ─────────────────────────────────────────────────────
function VillageSVG() {
  return (
    <svg viewBox="0 0 520 260" className="w-full max-w-xl mx-auto" xmlns="http://www.w3.org/2000/svg">
      {/* Sky */}
      <rect x="0" y="0" width="520" height="260" fill="#f0fdf4" rx="12" />

      {/* Sun */}
      <circle cx="460" cy="45" r="22" fill="#fef08a" />
      <circle cx="460" cy="45" r="16" fill="#fbbf24" className="solar-glow" />
      {[0,45,90,135,180,225,270,315].map((a, i) => (
        <line key={i} x1={460 + 24 * Math.cos(a * Math.PI / 180)} y1={45 + 24 * Math.sin(a * Math.PI / 180)}
          x2={460 + 32 * Math.cos(a * Math.PI / 180)} y2={45 + 32 * Math.sin(a * Math.PI / 180)}
          stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      ))}

      {/* Ground */}
      <rect x="0" y="200" width="520" height="60" fill="#dcfce7" rx="0" />
      <rect x="0" y="210" width="520" height="50" fill="#bbf7d0" rx="0" />

      {/* Road */}
      <rect x="0" y="215" width="520" height="12" fill="#e2e8f0" />
      <line x1="0" y1="221" x2="520" y2="221" stroke="white" strokeWidth="1.5" strokeDasharray="20 15" />

      {/* House 1 (left) */}
      <rect x="20" y="165" width="60" height="50" fill="#fff" stroke="#d1d5db" strokeWidth="1.5" rx="2" />
      <polygon points="15,165 80,165 50,135" fill="#16a34a" />
      <rect x="40" y="185" width="15" height="25" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" rx="1" />
      <rect x="25" y="172" width="12" height="10" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" />
      {/* Solar panels on roof */}
      <rect x="28" y="145" width="10" height="7" fill="#0284c7" opacity="0.8" rx="1" />
      <rect x="40" y="145" width="10" height="7" fill="#0284c7" opacity="0.8" rx="1" />
      <rect x="52" y="148" width="10" height="7" fill="#0284c7" opacity="0.8" rx="1" />

      {/* House 2 */}
      <rect x="105" y="170" width="55" height="45" fill="#fff" stroke="#d1d5db" strokeWidth="1.5" rx="2" />
      <polygon points="100,170 165,170 132,142" fill="#059669" />
      <rect x="122" y="190" width="15" height="23" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" rx="1" />

      {/* School */}
      <rect x="185" y="158" width="90" height="57" fill="#fff7ed" stroke="#d1d5db" strokeWidth="1.5" rx="2" />
      <polygon points="180,158 280,158 230,128" fill="#dc2626" />
      <text x="230" y="178" textAnchor="middle" fill="#9a3412" fontSize="9" fontWeight="600">SCHOOL</text>
      <rect x="192" y="175" width="15" height="12" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" />
      <rect x="213" y="175" width="15" height="12" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" />
      <rect x="234" y="175" width="15" height="12" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" />
      <rect x="255" y="175" width="15" height="12" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" />
      <rect x="215" y="190" width="30" height="25" fill="#d1fae5" stroke="#a7f3d0" strokeWidth="1" rx="1" />

      {/* Water tower */}
      <rect x="295" y="155" width="30" height="55" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
      <ellipse cx="310" cy="155" rx="18" ry="10" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="1.5" />
      <rect x="305" y="160" width="10" height="15" fill="#bae6fd" />
      <line x1="295" y1="210" x2="285" y2="210" stroke="#7dd3fc" strokeWidth="2" />
      <text x="310" y="185" textAnchor="middle" fill="#0369a1" fontSize="7" fontWeight="500">WATER</text>

      {/* Hospital */}
      <rect x="350" y="162" width="70" height="52" fill="#fff" stroke="#d1d5db" strokeWidth="1.5" rx="2" />
      <polygon points="345,162 425,162 385,138" fill="#1d4ed8" />
      <text x="385" y="175" textAnchor="middle" fill="#1e40af" fontSize="8" fontWeight="700">+</text>
      <text x="385" y="185" textAnchor="middle" fill="#1e40af" fontSize="7" fontWeight="600">HEALTH</text>
      <rect x="357" y="178" width="12" height="10" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" />
      <rect x="375" y="178" width="12" height="10" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" />
      <rect x="393" y="178" width="12" height="10" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" />
      <rect x="410" y="178" width="12" height="10" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" />

      {/* House 3 right */}
      <rect x="445" y="168" width="55" height="47" fill="#fff" stroke="#d1d5db" strokeWidth="1.5" rx="2" />
      <polygon points="440,168 505,168 473,140" fill="#7c3aed" />
      <rect x="463" y="188" width="15" height="24" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" rx="1" />

      {/* Solar panel array (ground) */}
      <rect x="445" y="148" width="12" height="8" fill="#0284c7" opacity="0.85" rx="1" />
      <rect x="459" y="148" width="12" height="8" fill="#0284c7" opacity="0.85" rx="1" />
      <rect x="473" y="148" width="12" height="8" fill="#0284c7" opacity="0.85" rx="1" />
      <rect x="487" y="148" width="12" height="8" fill="#0284c7" opacity="0.85" rx="1" />

      {/* Streetlights */}
      {[85, 175, 340, 435].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="215" x2={x} y2="175" stroke="#9ca3af" strokeWidth="2.5" />
          <line x1={x} y1="175" x2={x + 12} y2="175" stroke="#9ca3af" strokeWidth="2.5" />
          <circle cx={x + 12} cy="174" r="4" fill="#fef08a" className="solar-glow" />
        </g>
      ))}

      {/* Waste bins */}
      <rect x="140" y="205" width="10" height="10" fill="#6ee7b7" stroke="#059669" strokeWidth="1" rx="1" />
      <rect x="152" y="205" width="10" height="10" fill="#fca5a5" stroke="#ef4444" strokeWidth="1" rx="1" />

      {/* Energy flow lines */}
      <line x1="50" y1="140" x2="100" y2="140" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.7" className="energy-flow" />
      <line x1="100" y1="140" x2="200" y2="140" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" className="energy-flow" />
      <line x1="460" y1="70" x2="460" y2="155" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.7" className="energy-flow" />
      <line x1="310" y1="210" x2="230" y2="210" stroke="#0284c7" strokeWidth="2" strokeDasharray="8 5" opacity="0.6" className="energy-flow" />

      {/* Labels */}
      <text x="50" y="130" textAnchor="middle" fill="#16a34a" fontSize="7" fontWeight="600">SOLAR</text>
      <text x="310" y="152" textAnchor="middle" fill="#0369a1" fontSize="7" fontWeight="600">H₂O</text>
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="rise-in">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                AI-powered Sustainability Intelligence
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                Can a village become more sustainable simply by making{' '}
                <span className="text-green-300">better decisions</span> with the data it already has?
              </h1>
              <p className="text-lg text-green-100 mb-8 leading-relaxed">
                GreenGrid AI analyzes energy, water, waste, infrastructure and renewable potential to create
                measurable sustainability action plans.
              </p>
              <div className="flex flex-wrap gap-4">
                 <Link to="/login" className="flex items-center gap-2 bg-white text-green-800 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors">
                   <Zap className="w-4 h-4" />
                   Get Started
                   <ArrowRight className="w-4 h-4" />
                 </Link>
                 <Link to="/login" className="flex items-center gap-2 bg-green-700 border border-green-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-600 transition-colors">
                   <Activity className="w-4 h-4" />
                   Choose Your Dashboard
                 </Link>
               </div>
              <p className="text-xs text-green-300/70 mt-4 italic">
                "Turning Energy, Water & Waste Data into Sustainable Action"
              </p>
            </div>
            <div>
              <VillageSVG />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10 bg-black/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Areas Monitored', value: `${totals.areas}`, unit: 'areas', icon: <LayoutDashboard className="w-4 h-4" /> },
                { label: 'Households', value: totals.totalHH.toLocaleString(), unit: '', icon: <Activity className="w-4 h-4" /> },
                { label: 'Monthly Consumption', value: (totals.totalKWh / 1000).toFixed(1) + 'k', unit: 'kWh/mo', icon: <Zap className="w-4 h-4" /> },
                { label: 'Monthly Cost', value: '₹' + (totals.totalCost / 100000).toFixed(1) + 'L', unit: '/month', icon: <Zap className="w-4 h-4" /> },
                { label: 'CO₂ Monthly', value: (totals.totalCO2 / 1000).toFixed(1), unit: 't CO₂/mo', icon: <Leaf className="w-4 h-4" /> },
                { label: 'Population', value: totals.totalPop.toLocaleString(), unit: 'residents', icon: <Activity className="w-4 h-4" /> },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-green-300">{stat.unit || stat.label}</div>
                  <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Complete Sustainability Intelligence Suite</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Every section is powered by transparent calculations, demo data badges, and actionable recommendations — built for communities, panchayats, and local administrators.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((card) => (
            <Link key={card.to} to={card.to} className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all">
              <div className={`inline-flex p-3 rounded-xl border mb-4 ${card.color}`}>
                {card.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">{card.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Explore <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Data transparency callout */}
      <section className="bg-green-50 border-y border-green-100">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700 mb-1">100%</div>
              <div className="font-semibold text-gray-800 mb-1">Formula Transparency</div>
              <div className="text-sm text-gray-500">Every metric has a "How calculated?" button revealing the exact formula, source and assumptions.</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-1">Demo</div>
              <div className="font-semibold text-gray-800 mb-1">Data Labeled Throughout</div>
              <div className="text-sm text-gray-500">Every demo/estimated value carries a visible badge. Replace with real sensor data when available.</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">API-Ready</div>
              <div className="font-semibold text-gray-800 mb-1">Service Adapter Pattern</div>
              <div className="text-sm text-gray-500">Services ready to connect to NASA POWER, CEA, BEE, MNRE, and Jal Jeevan Mission APIs.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
