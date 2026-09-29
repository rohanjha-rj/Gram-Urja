import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Home, ArrowRight, Zap, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { setRole } = useAuth();
  const navigate = useNavigate();

  function enter(role: 'official' | 'citizen', path: string) {
    setRole(role);
    navigate(path);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 40%, #0f172a 100%)' }}>

      {/* Background pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="login-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#16a34a" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-grid)" />
      </svg>

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" style={{ animation: 'pulse 4s ease-in-out infinite' }} />

      <div className="relative z-10 w-full max-w-4xl px-6">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500 rounded-2xl shadow-lg shadow-green-900/50">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <div className="text-4xl font-extrabold text-white tracking-tight">GreenGrid AI</div>
              <div className="text-green-300 text-sm font-medium">Sustainability Intelligence Platform</div>
            </div>
          </div>
          <p className="text-green-200/80 text-base max-w-lg mx-auto">
            Turning Energy, Water &amp; Waste Data into Sustainable Action
          </p>
        </div>

        {/* Role cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Official card */}
          <button
            onClick={() => enter('official', '/village')}
            className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-left hover:bg-white/20 hover:border-green-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-900/30"
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-xl group-hover:bg-green-500/30 transition-colors">
                <Building2 className="w-8 h-8 text-green-300" />
              </div>
              <div>
                <div className="text-xs text-green-400 font-semibold uppercase tracking-widest mb-1">Government Access</div>
                <h2 className="text-2xl font-bold text-white">Village Official</h2>
                <div className="text-sm text-green-200">Panchayat / Ward Officer</div>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              For Panchayat members, Ward officers, Gram Sevaks and local administrators. 
              Access the Community Command Centre with multi-village insights, priority index, and infrastructure monitoring.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Village Dashboard', 'Priority Index', 'Alerts Centre', 'Infrastructure'].map((tag) => (
                <span key={tag} className="text-xs bg-green-500/20 border border-green-400/30 text-green-300 rounded-full px-3 py-1">{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-green-300 font-semibold group-hover:gap-3 transition-all">
              Enter Village Dashboard <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Citizen card */}
          <button
            onClick={() => enter('citizen', '/household')}
            className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-left hover:bg-white/20 hover:border-blue-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/30"
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                <Home className="w-8 h-8 text-blue-300" />
              </div>
              <div>
                <div className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">Household Access</div>
                <h2 className="text-2xl font-bold text-white">Household Member</h2>
                <div className="text-sm text-blue-200">Resident / Citizen</div>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              For residents, households and individual citizens. 
              Track your appliances, calculate energy costs, and get personalized recommendations to save money and energy.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['My Appliances', 'Cost Tracker', 'Solar Advisor', 'Water Savings'].map((tag) => (
                <span key={tag} className="text-xs bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full px-3 py-1">{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-blue-300 font-semibold group-hover:gap-3 transition-all">
              Enter My Dashboard <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Guest link */}
        <div className="text-center">
          <button
            onClick={() => { setRole('guest'); navigate('/'); }}
            className="text-white/50 hover:text-white/80 text-sm transition-colors inline-flex items-center gap-1"
          >
            Just browsing? Explore the full platform <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom badge */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 text-xs text-green-400/60">
            <Leaf className="w-3 h-3" />
             Bihar Village Sustainability Region
          </div>
        </div>
      </div>
    </div>
  );
}
