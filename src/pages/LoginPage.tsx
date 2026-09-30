import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Home, ArrowRight, Zap, Leaf, Mail, Lock,
  Eye, EyeOff, X, Globe, ShieldCheck, MapPin, Sun, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getAllAreaAnalyses } from '../services/energyService';

type Screen = 'roles' | 'official-villages' | 'household-auth';
type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const { setRole, signIn, signUp } = useAuth();
  const { language, setLanguage, t, isHindi } = useLanguage();
  const navigate = useNavigate();

  const [screen, setScreen] = useState<Screen>('roles');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const allAnalyses = getAllAreaAnalyses();

  function handleOfficialVillageLogin(villageId: string) {
    setRole('official');
    if (villageId === 'all') {
      navigate('/village');
    } else {
      navigate(`/village?village=${villageId}`);
    }
  }

  async function handleHouseholdAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (authMode === 'login') {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err);
      } else {
        setRole('citizen');
        navigate('/overview');
      }
    } else {
      const { error: err } = await signUp(email, password);
      if (err) {
        setError(err);
      } else {
        setSuccess(isHindi ? 'खाता बनाया गया! लॉग इन करें।' : 'Account created! Please log in.');
        setAuthMode('login');
      }
    }
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-10 px-4 sm:px-6"
      style={{
        backgroundImage: 'linear-gradient(160deg, rgba(10,15,30,0.85) 0%, rgba(5,46,22,0.80) 30%, rgba(10,46,28,0.84) 65%, rgba(3,13,7,0.92) 100%), url("/images/landing_hero_bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Subtle grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="login-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#22c55e" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-grid)" />
      </svg>

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher in top corner */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all backdrop-blur-md shadow-md"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'en' ? 'हिन्दी में देखें' : 'Switch to English'}</span>
        </button>
      </div>

      <div className={`relative z-10 w-full ${screen === 'official-villages' ? 'max-w-6xl' : 'max-w-4xl'} transition-all duration-300`}>

        {/* ── Logo ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3.5 mb-2">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl shadow-emerald-950/80 border border-emerald-400/30 bg-emerald-950 flex items-center justify-center">
              <img src="/gramurja_logo.jpg" alt="GramUrja Logo" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <div className="text-3xl font-extrabold text-white tracking-tight">GramUrja</div>
              <div className="text-emerald-400 text-xs font-medium tracking-widest uppercase">{t('brandTagline')}</div>
            </div>
          </div>
          <p className="text-white/60 text-xs sm:text-sm max-w-sm mx-auto">
            {isHindi ? 'स्वच्छ ऊर्जा · बायोमास एवं सौर · शून्य अपशिष्ट' : 'Clean Energy · Biomass & Solar · Zero Waste'}
          </p>
        </div>

        {/* ══ SCREEN: Role Selector ══════════════════════════════════════════ */}
        {screen === 'roles' && (
          <>
            <p className="text-center text-white/70 font-medium mb-6 text-base">
              {t('chooseRole')}
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">

              {/* ── Village Official ── */}
              <div
                className="relative bg-white/[0.07] backdrop-blur-md border border-white/[0.14] rounded-2xl p-7 flex flex-col justify-between
                  hover:bg-white/[0.11] hover:border-emerald-400/50 transition-all duration-300 shadow-xl shadow-emerald-950/30 group"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3.5 bg-emerald-500/20 border border-emerald-400/30 rounded-xl group-hover:bg-emerald-500/30 transition-colors">
                      <Building2 className="w-7 h-7 text-emerald-300" />
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-0.5">{t('govAccess')}</div>
                      <h2 className="text-xl font-bold text-white">{t('roleOfficial')}</h2>
                      <div className="text-xs text-emerald-200/70">{t('panchayatOfficer')}</div>
                    </div>
                  </div>

                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-4">
                    {t('officialDesc')}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {[(isHindi ? '5 निगरानी ग्राम' : '5 Monitored Villages'), (isHindi ? 'ऊर्जा विश्लेषण' : 'Energy Analytics'), (isHindi ? 'सौर एवं बायोगैस' : 'Solar & Biogas')].map(tag => (
                      <span key={tag} className="text-[11px] bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 rounded-full px-2.5 py-0.5">{tag}</span>
                    ))}
                  </div>

                  {/* 1-Click Village Login Quick Selectors */}
                  <div className="bg-black/25 rounded-xl p-3 border border-emerald-500/20 mb-5">
                    <div className="text-[11px] font-semibold text-emerald-300 mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{t('quickVillageSelect')}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {allAnalyses.map(item => (
                        <button
                          key={item.area.id}
                          type="button"
                          onClick={() => handleOfficialVillageLogin(item.area.id)}
                          className="bg-emerald-900/40 hover:bg-emerald-600 hover:text-white border border-emerald-400/30 text-emerald-200 text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-all text-center truncate flex items-center justify-center gap-1"
                          title={`${item.area.name} Official Login`}
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span className="truncate">{item.area.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Primary Official Actions */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setScreen('official-villages')}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-emerald-950 font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 text-sm"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{isHindi ? '5 ग्राम अधिकारी लॉगिन पोर्टल देखें' : 'View 5 Village Official Portals'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOfficialVillageLogin('all')}
                    className="w-full bg-white/10 hover:bg-white/15 border border-emerald-400/30 text-emerald-200 text-xs font-semibold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{t('enterAllVillages')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ── Household Member ── */}
              <div
                className="relative bg-white/[0.07] backdrop-blur-md border border-white/[0.14] rounded-2xl p-7 flex flex-col justify-between
                  hover:bg-white/[0.11] hover:border-blue-400/50 transition-all duration-300 shadow-xl shadow-blue-950/30 group"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3.5 bg-blue-500/20 border border-blue-400/30 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                      <Home className="w-7 h-7 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-0.5">{t('householdAccess')}</div>
                      <h2 className="text-xl font-bold text-white">{t('roleCitizen')}</h2>
                      <div className="text-xs text-blue-200/70">{t('residentCitizen')}</div>
                    </div>
                  </div>

                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-4">
                    {t('householdDesc')}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {[(isHindi ? 'मेरे उपकरण' : 'My Appliances'), (isHindi ? 'लागत ट्रैकर' : 'Cost Tracker'), (isHindi ? 'सौर कैलकुलेटर' : 'Solar Advisor')].map(tag => (
                      <span key={tag} className="text-[11px] bg-blue-500/15 border border-blue-400/25 text-blue-300 rounded-full px-2.5 py-0.5">{tag}</span>
                    ))}
                  </div>

                  <div className="bg-black/25 rounded-xl p-3 border border-blue-500/20 mb-5 text-xs text-blue-200/80">
                    <div className="font-semibold text-blue-300 mb-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isHindi ? 'घरेलू ऊर्जा बचत मंच' : 'Household Energy Calculator'}</span>
                    </div>
                    <p className="text-[11px] text-white/50">
                      {isHindi
                        ? 'अपने बिजली उपकरणों की खपत जानें, सौर बचत का अनुमान लगाएं और मासिक बिल कम करें।'
                        : 'Simulate appliance power usage, estimate solar rooftop savings and optimize electricity bills.'}
                    </p>
                  </div>
                </div>

                {/* Auth action buttons */}
                <div className="flex gap-3 pt-2 border-t border-white/10">
                  <button
                    onClick={() => { setAuthMode('login'); setScreen('household-auth'); }}
                    className="flex-1 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-blue-900/50"
                  >
                    {t('logIn')}
                  </button>
                  <button
                    onClick={() => { setAuthMode('signup'); setScreen('household-auth'); }}
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-blue-400/40 text-blue-200 text-sm font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    {t('signUp')}
                  </button>
                </div>
              </div>
            </div>

            {/* Guest link */}
            <div className="text-center">
              <button
                onClick={() => { setRole('guest'); navigate('/overview'); }}
                className="text-white/40 hover:text-white/70 text-sm transition-colors inline-flex items-center gap-1.5"
              >
                {t('explorePlatform')} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </>
        )}

        {/* ══ SCREEN: 5 Monitored Village Official Portals ═══════════════════ */}
        {screen === 'official-villages' && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <button
                onClick={() => setScreen('roles')}
                className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors bg-white/10 px-3 py-1.5 rounded-lg border border-white/15"
              >
                <X className="w-4 h-4" /> {t('backToRoleSelection')}
              </button>

              <button
                onClick={() => handleOfficialVillageLogin('all')}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition-colors shadow-md"
              >
                <Building2 className="w-4 h-4" />
                <span>{t('enterAllVillages')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-2 border border-emerald-400/30">
                <Building2 className="w-3.5 h-3.5" />
                {isHindi ? 'ग्राम पंचायत प्रशासनिक पोर्टल' : 'Panchayat Administrative Portals'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                {isHindi ? '5 ग्रामों के आधिकारिक लॉगिन पोर्टल' : 'Login as Official of 5 Monitored Villages'}
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto text-xs sm:text-sm">
                {isHindi
                  ? 'प्रत्येक ग्राम के पंचायत अधिकारी, वार्ड सदस्य एवं प्रशासक अपने गांव के समर्पित कमांड सेंटर में सीधे प्रवेश कर सकते हैं:'
                  : 'Direct official dashboard login for Panchayat members, Ward officers, and local administrators across each of the 5 project villages:'}
              </p>
            </div>

            {/* 5 Distinct Village Official Sections Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {allAnalyses.map((item, idx) => {
                const { area, solarPotential, wasteAnalysis, renewablePercent, monthlyCostINR } = item;
                const totalDailyWasteKg = area.cowDungKgPerDay + area.foodWasteKgPerDay + area.agriWasteKgPerDay;

                return (
                  <div
                    key={area.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl hover:border-emerald-500 transition-all duration-300 flex flex-col justify-between overflow-hidden group text-gray-900"
                  >
                    {/* Top decorative gradient bar */}
                    <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400" />

                    <div className="p-5 sm:p-6">
                      {/* Village Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-600" />
                              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                                {isHindi ? `ग्राम पंचायत #${idx + 1}` : `Gram Panchayat #${idx + 1}`}
                              </span>
                            </div>
                            <h3 className="text-lg font-black text-gray-900 leading-tight">{area.name}</h3>
                          </div>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-0.5 text-right">
                          <div className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider">{isHindi ? 'नवीकरणीय' : 'Clean'}</div>
                          <div className="text-xs font-black text-emerald-700">{renewablePercent.toFixed(0)}%</div>
                        </div>
                      </div>

                      {/* Village Overview Meta */}
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-4 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center text-gray-600">
                          <span className="flex items-center gap-1 font-medium">
                            <Leaf className="w-3 h-3 text-emerald-600" />
                            {isHindi ? 'दैनिक अपशिष्ट:' : 'Daily Waste:'}
                          </span>
                          <strong className="text-gray-900 bg-white px-1.5 py-0.5 rounded border border-gray-200 font-bold text-[11px]">
                            {totalDailyWasteKg.toLocaleString()} kg/{isHindi ? 'दिन' : 'day'}
                          </strong>
                        </div>

                        <div className="flex justify-between items-center text-gray-600">
                          <span className="flex items-center gap-1 font-medium">
                            <Zap className="w-3 h-3 text-amber-500" />
                            {isHindi ? 'मासिक विद्युत:' : 'Monthly Power:'}
                          </span>
                          <strong className="text-gray-900 bg-white px-1.5 py-0.5 rounded border border-gray-200 font-bold text-[11px]">
                            {(area.monthlyElectricity / 1000).toFixed(1)}k kWh
                          </strong>
                        </div>

                        <div className="flex justify-between items-center text-gray-600">
                          <span className="flex items-center gap-1 font-medium">
                            <Sun className="w-3 h-3 text-amber-500" />
                            {isHindi ? 'सौर क्षमता:' : 'Feasible Solar:'}
                          </span>
                          <strong className="text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-gray-200 font-bold text-[11px]">
                            {solarPotential.feasibleCapacityKW.toFixed(0)} kW
                          </strong>
                        </div>

                        <div className="flex justify-between items-center text-gray-600 pt-1 border-t border-gray-200/60 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Home className="w-3 h-3 text-gray-400" />
                            {area.households} {isHindi ? 'परिवार' : 'HH'}
                          </span>
                          <span className="text-gray-500">
                            {area.infrastructure.streetlights.count} LEDs · {area.infrastructure.waterPumps.count} Pumps
                          </span>
                        </div>
                      </div>

                      {/* Highlights Pill */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                          {isHindi ? `बायोगैस: ${wasteAnalysis.biogasM3PerDay.toFixed(0)} m³/दिन` : `Biogas: ${wasteAnalysis.biogasM3PerDay.toFixed(0)} m³/day`}
                        </span>
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                          {isHindi ? `लागत: ₹${(monthlyCostINR / 1000).toFixed(1)}k/माह` : `Bill: ₹${(monthlyCostINR / 1000).toFixed(1)}k/mo`}
                        </span>
                      </div>
                    </div>

                    {/* Login Action Button for This Village */}
                    <div className="p-3.5 bg-gray-50 border-t border-gray-100 mt-auto">
                      <button
                        onClick={() => handleOfficialVillageLogin(area.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md text-xs sm:text-sm"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isHindi ? `${area.name} अधिकारी लॉगिन` : `Login as Official (${area.name})`}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ SCREEN: Household Auth Form ═══════════════════════════════════ */}
        {screen === 'household-auth' && (
          <div className="max-w-md mx-auto">
            <button
              onClick={() => { setScreen('roles'); setError(null); setSuccess(null); }}
              className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm mb-6 transition-colors"
            >
              <X className="w-4 h-4" /> {t('backToRoleSelection')}
            </button>

            <div className="bg-white/[0.07] backdrop-blur-md border border-white/[0.12] rounded-2xl p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-xl">
                  <Home className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{t('roleCitizen')}</h2>
                  <p className="text-xs text-white/50">
                    {authMode === 'login' ? (isHindi ? 'अपने खाते में साइन इन करें' : 'Sign in to your account') : (isHindi ? 'नया खाता बनाएं' : 'Create a new account')}
                  </p>
                </div>
              </div>

              {/* Tab switcher */}
              <div className="flex bg-white/[0.06] rounded-xl p-1 mb-6">
                <button
                  onClick={() => { setAuthMode('login'); setError(null); setSuccess(null); }}
                  className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${authMode === 'login' ? 'bg-blue-500 text-white shadow-md' : 'text-white/50 hover:text-white/80'}`}
                >
                  {t('logIn')}
                </button>
                <button
                  onClick={() => { setAuthMode('signup'); setError(null); setSuccess(null); }}
                  className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${authMode === 'signup' ? 'bg-blue-500 text-white shadow-md' : 'text-white/50 hover:text-white/80'}`}
                >
                  {t('signUp')}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleHouseholdAuth} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs text-white/60 font-medium mb-1.5">{t('emailAddress')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white/[0.07] border border-white/[0.15] text-white placeholder-white/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.10] transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs text-white/60 font-medium mb-1.5">{t('password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={authMode === 'signup' ? (isHindi ? 'कम से कम 6 अक्षर' : 'Min. 6 characters') : '••••••••'}
                      className="w-full bg-white/[0.07] border border-white/[0.15] text-white placeholder-white/30 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.10] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error / Success feedback */}
                {error && (
                  <div className="bg-red-500/15 border border-red-400/30 text-red-300 text-xs rounded-xl px-4 py-2.5">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs rounded-xl px-4 py-2.5">
                    {success}
                  </div>
                )}

                {/* Demo Credentials Quick Fill Banner */}
                <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3 text-xs text-blue-200/90 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-300">💡 {t('sampleCredentials')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('demo@gramurja.in');
                        setPassword('password123');
                        setError(null);
                      }}
                      className="text-[11px] bg-blue-500/30 hover:bg-blue-500/50 text-blue-100 font-medium px-2 py-0.5 rounded transition"
                    >
                      {t('autoFillSample')}
                    </button>
                  </div>
                  <div className="text-[11px] text-white/60 space-y-0.5">
                    <div><span className="text-white/40">Email:</span> <code className="text-blue-300">demo@gramurja.in</code></div>
                    <div><span className="text-white/40">Password:</span> <code className="text-blue-300">password123</code></div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : authMode === 'login' ? t('logIn') : t('signUp')
                  }
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Bottom badge */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 text-xs text-white/25">
            <Leaf className="w-3 h-3" />
            {t('regionName')}
          </div>
        </div>
      </div>
    </div>
  );
}

