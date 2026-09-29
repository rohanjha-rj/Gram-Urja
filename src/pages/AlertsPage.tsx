import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Zap, Droplets, Sun, Home, Activity, Phone, MapPin, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { DEMO_ALERTS } from '../data/alerts';
import { DemoBadge } from '../components/ui';
import AreaSelector from '../components/AreaSelector';
import type { Alert, AlertStatus } from '../types';

// ─── Village-language alert content ──────────────────────────────────────────
interface FriendlyContent {
  emoji: string;
  titleEN: string;
  titleHI: string;
  bodyEN: string;
  bodyHI: string;
  todoEN: string;
  todoHI: string;
  whoToTell: string;
}

const FRIENDLY: Record<string, FriendlyContent> = {
  'alert-001': {
    emoji: '⚡',
    titleEN: 'Electricity Use is Very High — Motipur',
    titleHI: 'बिजली का उपयोग बहुत ज़्यादा है — मोतीपुर',
    bodyEN: 'Motipur is using much more electricity than other villages this month. This could mean there is a problem with the electricity meter, or some extra connections are using power without permission.',
    bodyHI: 'इस महीने मोतीपुर में अन्य गांवों की तुलना में बहुत अधिक बिजली उपयोग हो रही है। यह बिजली मीटर की खराबी या बिना अनुमति के अतिरिक्त कनेक्शन की वजह से हो सकता है।',
    todoEN: 'Ask the electricity department to check the meter in Motipur. A survey of all connections should be done.',
    todoHI: 'बिजली विभाग से मोतीपुर का मीटर जांचने को कहें। सभी कनेक्शन का सर्वे होना चाहिए।',
    whoToTell: 'Gram Sevak / Electricity Dept',
  },
  'alert-002': {
    emoji: '☀️',
    titleEN: 'Solar Status Unverified — Motipur',
    titleHI: 'सोलर की स्थिति अज्ञात है — मोतीपुर',
    bodyEN: 'Motipur has 150 kW solar potential but no verified solar installation. A solar survey is urgently needed to unlock major savings for the village.',
    bodyHI: 'मोतीपुर में 150 kW सोलर क्षमता है लेकिन कोई सत्यापित सोलर नहीं है। बड़ी बचत के लिए सोलर सर्वे ज़रूरी है।',
    todoEN: 'Commission a solar feasibility survey for Motipur. Apply under PM-KUSUM for 150 kW installation.',
    todoHI: 'मोतीपुर के लिए सोलर सर्वे कराएं। PM-KUSUM योजना के तहत 150 kW के लिए आवेदन करें।',
    whoToTell: 'Gram Pradhan / MNRE Office',
  },
  'alert-003': {
    emoji: '⚡',
    titleEN: 'High Electricity Cost with No Renewable — Amra',
    titleHI: 'नवीकरणीय ऊर्जा नहीं, बिजली खर्च बहुत ज़्यादा — अमरा',
    bodyEN: 'Amra spends ₹2,12,448 every month on electricity but has zero solar or renewable energy. Installing 125 kW solar could cut the bill by almost half.',
    bodyHI: 'अमरा हर महीने बिजली पर ₹2,12,448 खर्च करता है लेकिन कोई सोलर या नवीकरणीय ऊर्जा नहीं है। 125 kW सोलर लगाने से बिल लगभग आधा हो सकता है।',
    todoEN: 'Prioritize Amra for solar installation. Also initiate community biogas plant for waste-to-energy.',
    todoHI: 'अमरा में सोलर लगाना प्राथमिकता बनाएं। सामुदायिक बायोगैस संयंत्र भी शुरू करें।',
    whoToTell: 'Gram Pradhan / MNRE Office',
  },
  'alert-004': {
    emoji: '☀️',
    titleEN: 'Oiara Has No Solar — Big Saving Missed',
    titleHI: 'ओइरा में सोलर नहीं है — बड़ी बचत मिस हो रही है',
    bodyEN: 'Oiara has 100 kW solar potential but no verified solar installation. Installing solar could cut the village electricity bill by almost half.',
    bodyHI: 'ओइरा में 100 kW सोलर क्षमता है लेकिन अभी तक कोई सोलर नहीं लगाया गया। सोलर लगाने से गांव का बिजली बिल लगभग आधा हो सकता है।',
    todoEN: 'Ask the Panchayat to apply for a solar scheme for Oiara. Government solar subsidies may be available.',
    todoHI: 'पंचायत से ओइरा के लिए सोलर योजना में आवेदन करने को कहें। सरकारी सब्सिडी मिल सकती है।',
    whoToTell: 'Gram Pradhan / MNRE Office',
  },
  'alert-005': {
    emoji: '🔋',
    titleEN: 'Solar Adoption Very Low — Barouni (Part)',
    titleHI: 'सोलर अपनाना बहुत कम है — बरौनी (भाग)',
    bodyEN: 'Barouni has 15 kW solar installed but 300 kW potential available — only 5% adoption. Large open land is available for expansion.',
    bodyHI: 'बरौनी में 15 kW सोलर है लेकिन 300 kW क्षमता उपलब्ध है — केवल 5% अपनाया गया। विस्तार के लिए बड़ी खुली ज़मीन उपलब्ध है।',
    todoEN: 'Apply for MNRE subsidy to expand solar from 15 kW to 300 kW in Barouni.',
    todoHI: 'बरौनी में सोलर को 15 kW से 300 kW तक बढ़ाने के लिए MNRE सब्सिडी के लिए आवेदन करें।',
    whoToTell: 'Gram Pradhan / MNRE Office',
  },
  'alert-006': {
    emoji: '💰',
    titleEN: 'Budget Very Low for Biogas Plant — Korha',
    titleHI: 'बायोगैस संयंत्र के लिए बजट बहुत कम है — कोरहा',
    bodyEN: 'Korha\'s available budget (₹70,840) is far below the biogas plant cost (₹10,00,000). GOBARdhan feedstock of 2,000 kg/day is going unused.',
    bodyHI: 'कोरहा का उपलब्ध बजट (₹70,840) बायोगैस संयंत्र लागत (₹10,00,000) से बहुत कम है। 2,000 kg/दिन GOBARdhan चारा बर्बाद हो रहा है।',
    todoEN: 'Apply for GOBARdhan scheme grant for Korha. Explore SBM-G fund convergence.',
    todoHI: 'कोरहा के लिए GOBARdhan योजना अनुदान के लिए आवेदन करें। SBM-G निधि के साथ अभिसरण का पता लगाएं।',
    whoToTell: 'Block Development Officer / Gram Pradhan',
  },
  'alert-007': {
    emoji: '☀️',
    titleEN: 'Solar Potential Unverified — Korha',
    titleHI: 'सोलर क्षमता अज्ञात है — कोरहा',
    bodyEN: 'Korha has 75 kW solar potential but adoption status is not verified. External funding is needed due to limited village budget.',
    bodyHI: 'कोरहा में 75 kW सोलर क्षमता है लेकिन अपनाने की स्थिति सत्यापित नहीं है। सीमित बजट के कारण बाहरी वित्तपोषण की आवश्यकता है।',
    todoEN: 'Conduct solar survey in Korha. Explore district-level solar aggregation scheme.',
    todoHI: 'कोरहा में सोलर सर्वे करें। जिला स्तरीय सोलर एकत्रीकरण योजना का पता लगाएं।',
    whoToTell: 'Block Development Officer / Gram Pradhan',
  },
  'alert-008': {
    emoji: '🌟',
    titleEN: 'Good News! Barouni Biogas Plant in Progress',
    titleHI: 'खुशखबरी! बरौनी बायोगैस संयंत्र की प्रक्रिया जारी है',
    bodyEN: 'Barouni (Part) has a community biogas plant of 80 m³/day planned. ₹15,00,000 budget is available. Implementation is in progress.',
    bodyHI: 'बरौनी (भाग) में 80 m³/दिन का सामुदायिक बायोगैस संयंत्र योजनाबद्ध है। ₹15,00,000 का बजट उपलब्ध है। कार्यान्वयन जारी है।',
    todoEN: 'Continue monitoring biogas plant setup. Ensure budget is deployed on schedule.',
    todoHI: 'बायोगैस संयंत्र की स्थापना की निगरानी जारी रखें। सुनिश्चित करें कि बजट समय पर लगाया जाए।',
    whoToTell: 'Gram Pradhan (for appreciation)',
  },
};

const SEVERITY_CONFIGS = {
  critical: { banner: 'bg-red-600', label: 'Urgent', labelBg: 'bg-red-100 text-red-700', ring: 'border-red-300', bg: 'bg-red-50' },
  high:     { banner: 'bg-orange-500', label: 'Check Soon', labelBg: 'bg-orange-100 text-orange-700', ring: 'border-orange-300', bg: 'bg-orange-50' },
  medium:   { banner: 'bg-yellow-400', label: 'Look Into This', labelBg: 'bg-yellow-100 text-yellow-700', ring: 'border-yellow-300', bg: 'bg-yellow-50' },
  low:      { banner: 'bg-blue-400', label: 'For Your Info', labelBg: 'bg-blue-100 text-blue-700', ring: 'border-blue-200', bg: 'bg-blue-50' },
};

function FriendlyAlertCard({ alert, hindi, onStatusChange }: {
  alert: Alert; hindi: boolean; onStatusChange: (id: string, s: AlertStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const friendly = FRIENDLY[alert.id];
  const cfg = SEVERITY_CONFIGS[alert.severity];
  const isResolved = alert.status === 'resolved';
  const isChecked = alert.status === 'acknowledged';

  if (!friendly) return null;

  return (
    <div className={`relative rounded-2xl border-2 ${cfg.ring} overflow-hidden shadow-sm fade-up transition-all ${isResolved ? 'opacity-60' : ''}`}>
      {/* Left severity banner */}
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${cfg.banner}`} />

      <div className={`ml-2 ${cfg.bg}`}>
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start gap-3">
            <div className="text-3xl leading-none mt-0.5">{friendly.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${cfg.labelBg}`}>
                  {cfg.label}
                </span>
                <span className="text-xs text-gray-500 bg-white/70 rounded-full px-2 py-0.5 capitalize">
                  {alert.areaId.replace('ward0', 'Ward ')}
                </span>
                {isResolved && (
                  <span className="text-xs font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Resolved
                  </span>
                )}
                {isChecked && !isResolved && (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                    ✓ Checked
                  </span>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-base leading-snug">
                {hindi ? friendly.titleHI : friendly.titleEN}
              </h3>
            </div>
            {alert.estimatedLossINR && (
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-red-600">₹{alert.estimatedLossINR.toLocaleString()}</div>
                <div className="text-xs text-gray-400">est. monthly loss</div>
              </div>
            )}
          </div>

          {/* Body */}
          <p className="text-sm text-gray-700 leading-relaxed mt-2 ml-10">
            {hindi ? friendly.bodyHI : friendly.bodyEN}
          </p>
        </div>

        {/* Expand/collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-2 bg-white/50 border-t border-gray-100 text-xs text-gray-500 hover:text-gray-700 hover:bg-white/70 transition-colors"
        >
          <span>{expanded ? 'Hide details' : 'What should I do?'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded && (
          <div className="px-5 py-4 bg-white/70 border-t border-gray-100 space-y-3">
            {/* What to do */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                ✅ {hindi ? 'क्या करें' : 'What to do'}
              </div>
              <p className="text-sm text-green-800">{hindi ? friendly.todoHI : friendly.todoEN}</p>
            </div>

            {/* Who to tell */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <Phone className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <span className="text-xs font-bold text-blue-700">
                  {hindi ? 'किसे बताएं: ' : 'Tell: '}
                </span>
                <span className="text-sm text-blue-800 font-medium">{friendly.whoToTell}</span>
              </div>
            </div>

            {/* Verification note */}
            {alert.verificationRequired && (
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{hindi ? 'यह एक संभावित समस्या है। कृपया जमीन पर जाकर जांच करें।' : 'This is a possible issue. Please verify on the ground before taking action.'}</span>
              </div>
            )}

            {/* Action buttons */}
            {!isResolved && (
              <div className="flex gap-2 pt-1">
                {!isChecked && (
                  <button
                    onClick={() => onStatusChange(alert.id, 'acknowledged')}
                    className="flex-1 py-2.5 bg-amber-500 text-white font-semibold text-sm rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    {hindi ? '✓ जांच हो गई' : '✓ Mark as Checked'}
                  </button>
                )}
                <button
                  onClick={() => onStatusChange(alert.id, 'resolved')}
                  className="flex-1 py-2.5 bg-green-600 text-white font-semibold text-sm rounded-xl hover:bg-green-700 transition-colors"
                >
                  {hindi ? '✅ कोई समस्या नहीं' : '✅ All Fine, No Issue'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(DEMO_ALERTS);
  const [hindi, setHindi] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState('motipur');
  const [showAll, setShowAll] = useState(false);

  const filtered = showAll
    ? alerts
    : alerts.filter((a) => a.areaId === selectedAreaId || a.status === 'active');

  const urgentCount = alerts.filter((a) => (a.severity === 'critical' || a.severity === 'high') && a.status === 'active').length;
  const attentionCount = alerts.filter((a) => a.severity === 'medium' && a.status === 'active').length;
  const allClearCount = alerts.filter((a) => a.status === 'resolved').length;

  function handleStatusChange(id: string, status: AlertStatus) {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)' }}>
      {/* Background pulse rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[1,2,3].map((i) => (
          <div key={i} className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-500/20 pulse-ring"
            style={{ width: `${i * 200}px`, height: `${i * 200}px`, animationDelay: `${i * 0.6}s` }} />
        ))}
        {/* Signal tower watermark */}
        <svg className="absolute bottom-10 right-10 w-40 h-40 opacity-5" viewBox="0 0 100 100" fill="white">
          <path d="M50 50 L30 20 M50 50 L70 20 M50 50 L20 40 M50 50 L80 40" stroke="white" strokeWidth="2" fill="none"/>
          <circle cx="50" cy="50" r="5" fill="white"/>
          <rect x="47" y="55" width="6" height="30" fill="white"/>
          <rect x="38" y="85" width="24" height="4" fill="white"/>
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="glass-card rounded-2xl p-5 mb-6 fade-up">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {hindi ? 'गांव अलर्ट केंद्र' : 'Village Alert Centre'}
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  {hindi
                    ? 'आपके गांव की ऊर्जा, पानी और अपशिष्ट प्रणालियों के लिए महत्वपूर्ण सूचनाएं'
                    : "Important notices for your village's energy, water and waste systems"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DemoBadge />
              {/* Hindi/English toggle */}
              <button
                onClick={() => setHindi(!hindi)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  hindi
                    ? 'bg-orange-100 border-orange-300 text-orange-700'
                    : 'bg-gray-100 border-gray-300 text-gray-600'
                }`}
              >
                {hindi ? '🇮🇳 हिंदी' : '🇬🇧 English'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-card rounded-2xl p-4 text-center fade-up">
            <div className="text-4xl font-extrabold text-red-600 mb-1">{urgentCount}</div>
            <div className="text-xl mb-1">🚨</div>
            <div className="text-xs font-semibold text-gray-700">{hindi ? 'तत्काल जांच करें' : 'Urgent Alerts'}</div>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center fade-up delay-100">
            <div className="text-4xl font-extrabold text-amber-600 mb-1">{attentionCount}</div>
            <div className="text-xl mb-1">⚠️</div>
            <div className="text-xs font-semibold text-gray-700">{hindi ? 'ध्यान दें' : 'Needs Attention'}</div>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center fade-up delay-200">
            <div className="text-4xl font-extrabold text-green-600 mb-1">{allClearCount}</div>
            <div className="text-xl mb-1">✅</div>
            <div className="text-xs font-semibold text-gray-700">{hindi ? 'ठीक है' : 'Resolved'}</div>
          </div>
        </div>

        {/* Area selector */}
        <div className="glass-card rounded-2xl p-4 mb-6 fade-up delay-200">
          <AreaSelector
            selectedAreaId={selectedAreaId}
            onSelect={setSelectedAreaId}
            label={hindi ? 'इस गांव के अलर्ट:' : 'Alerts for:'}
          />
          <div className="mt-3 flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)}
                className="w-4 h-4 accent-green-600" />
              {hindi ? 'सभी गांवों के अलर्ट दिखाएं' : 'Show all areas'}
            </label>
          </div>
        </div>

        {/* Alert cards */}
        <div className="space-y-4 mb-8">
          {filtered.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
              <div className="text-xl font-bold text-gray-800 mb-2">
                {hindi ? 'इस गांव के लिए कोई अलर्ट नहीं' : 'No alerts for this area'}
              </div>
              <p className="text-gray-500 text-sm">
                {hindi ? 'सब कुछ ठीक चल रहा है!' : 'Everything looks fine here!'}
              </p>
            </div>
          ) : (
            filtered.map((alert) => (
              <FriendlyAlertCard
                key={alert.id}
                alert={alert}
                hindi={hindi}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>

        {/* How to report */}
        <div className="glass-card rounded-2xl p-6 fade-up">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            {hindi ? 'समस्या कैसे रिपोर्ट करें?' : 'How to Report a Problem'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { num: '1', icon: '👀', textEN: 'Notice a problem', textHI: 'समस्या देखें' },
              { num: '2', icon: '📲', textEN: 'Tap the alert card', textHI: 'अलर्ट कार्ड दबाएं' },
              { num: '3', icon: '✓', textEN: 'Mark as Checked', textHI: '"जांच हो गई" दबाएं' },
              { num: '4', icon: '📞', textEN: 'Tell your Gram Sevak', textHI: 'ग्राम सेवक को बताएं' },
            ].map((step) => (
              <div key={step.num} className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <div className="w-6 h-6 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center mx-auto mb-2">{step.num}</div>
                <div className="text-xl mb-1">{step.icon}</div>
                <div className="text-xs font-medium text-gray-700">{hindi ? step.textHI : step.textEN}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
