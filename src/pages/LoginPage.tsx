import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Home, ArrowRight, Zap, Leaf, Mail, Lock, Eye, EyeOff, X, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

type Screen = 'roles' | 'household-auth';
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

  function enterOfficial() {
    setRole('official');
    navigate('/overview');
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
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-10"
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

      <div className="relative z-10 w-full max-w-4xl px-6">

        {/* ── Logo ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-900/60">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="text-3xl font-extrabold text-white tracking-tight">GramUrja</div>
              <div className="text-emerald-400 text-xs font-medium tracking-widest uppercase">{t('brandTagline')}</div>
            </div>
          </div>
          <p className="text-white/50 text-sm max-w-sm mx-auto">
            {isHindi ? 'स्वच्छ ऊर्जा · बायोमास एवं सौर · शून्य अपशिष्ट' : 'Clean Energy · Biomass & Solar · Zero Waste'}
          </p>
        </div>

        {/* ══ SCREEN: Role Selector ══════════════════════════════════════════ */}
        {screen === 'roles' && (
          <>
            <p className="text-center text-white/70 font-medium mb-6 text-base">
              {t('chooseRole')}
            </p>

            <div className="grid md:grid-cols-2 gap-5 mb-6">

              {/* ── Village Official ── */}
              <button
                onClick={enterOfficial}
                className="group relative bg-white/[0.06] backdrop-blur-md border border-white/[0.12] rounded-2xl p-8 text-left
                  hover:bg-white/[0.12] hover:border-emerald-400/50 transition-all duration-300
                  hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/40"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="p-4 bg-emerald-500/15 border border-emerald-400/25 rounded-xl group-hover:bg-emerald-500/25 transition-colors">
                    <Building2 className="w-8 h-8 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">{t('govAccess')}</div>
                    <h2 className="text-xl font-bold text-white">{t('roleOfficial')}</h2>
                    <div className="text-xs text-emerald-200/70">{t('panchayatOfficer')}</div>
                  </div>
                </div>
                <p className="text-white/55 text-sm leading-relaxed mb-5">
                  {t('officialDesc')}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {[(isHindi ? 'ग्राम डैशबोर्ड' : 'Village Dashboard'), (isHindi ? 'ऊर्जा विश्लेषण' : 'Energy Analytics'), (isHindi ? 'सौर एवं बायोगैस' : 'Solar & Biogas')].map(tag => (
                    <span key={tag} className="text-[11px] bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 rounded-full px-2.5 py-0.5">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold group-hover:gap-3 transition-all">
                  {t('enterVillageDashboard')} <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* ── Household Member ── */}
              <div
                className="relative bg-white/[0.06] backdrop-blur-md border border-white/[0.12] rounded-2xl p-8
                  border-blue-400/20"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="p-4 bg-blue-500/15 border border-blue-400/25 rounded-xl">
                    <Home className="w-8 h-8 text-blue-300" />
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">{t('householdAccess')}</div>
                    <h2 className="text-xl font-bold text-white">{t('roleCitizen')}</h2>
                    <div className="text-xs text-blue-200/70">{t('residentCitizen')}</div>
                  </div>
                </div>
                <p className="text-white/55 text-sm leading-relaxed mb-5">
                  {t('householdDesc')}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {[(isHindi ? 'मेरे उपकरण' : 'My Appliances'), (isHindi ? 'लागत ट्रैकर' : 'Cost Tracker'), (isHindi ? 'सौर कैलकुलेटर' : 'Solar Advisor')].map(tag => (
                    <span key={tag} className="text-[11px] bg-blue-500/15 border border-blue-400/25 text-blue-300 rounded-full px-2.5 py-0.5">{tag}</span>
                  ))}
                </div>
                {/* Auth action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setAuthMode('login'); setScreen('household-auth'); }}
                    className="flex-1 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-colors"
                  >
                    {t('logIn')}
                  </button>
                  <button
                    onClick={() => { setAuthMode('signup'); setScreen('household-auth'); }}
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-blue-400/40 text-blue-200 text-sm font-bold py-2.5 px-4 rounded-xl transition-colors"
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
