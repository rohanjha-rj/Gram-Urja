import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Mic, MicOff, ExternalLink, Globe, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { generateAIResponse } from '../ai/chatEngine';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { ChatMessage } from '../types';

// ── Quick prompts by role + language ────────────────────────────────────────

const QUICK_PROMPTS_VILLAGE_EN = [
  'Which area has the highest energy consumption?',
  "What is Motipur's solar potential?",
  "Show me Amra's water analysis",
  'What are the top recommendations?',
  'What is the region overview?',
  'How much biogas can we generate from waste?',
  'Tell me about PM Surya Ghar and KUSUM scheme',
  'Compare Motipur and Oiara',
  'Who are you and what can you do?',
];

const QUICK_PROMPTS_VILLAGE_HI = [
  'किस क्षेत्र में सबसे अधिक बिजली खपत है?',
  'मोतीपुर की सौर क्षमता क्या है?',
  'अमरा का जल विश्लेषण दिखाएं',
  'शीर्ष सुझाव क्या हैं?',
  'क्षेत्र का अवलोकन दें',
  'कचरे से कितनी बायोगैस बन सकती है?',
  'पीएम सूर्य घर और कुसुम योजना के बारे में बताएं',
  'मोतीपुर और ओइआरा की तुलना करें',
  'आप कौन हैं और क्या मदद कर सकते हैं?',
];

const QUICK_PROMPTS_HOUSEHOLD_EN = [
  'How can I reduce my electricity bill?',
  'Which appliance uses the most power?',
  'How much can I save with solar panels?',
  'How do I save water at home?',
  'What is biogas and how does it help?',
  'What are BEE 5-star energy ratings?',
  'How much does a BLDC fan save?',
  'What government subsidies are available for home solar?',
  'Hello Manu! What can you do?',
];

const QUICK_PROMPTS_HOUSEHOLD_HI = [
  'मैं बिजली का बिल कैसे कम करूं?',
  'कौन सा उपकरण सबसे ज़्यादा बिजली खाता है?',
  'सोलर पैनल से कितनी बचत होगी?',
  'घर में पानी कैसे बचाएं?',
  'बायोगैस क्या है और यह कैसे मदद करता है?',
  'BEE 5-स्टार रेटिंग क्या होती है?',
  'BLDC पंखे से कितनी बिजली बचती है?',
  'सोलर पैनल के लिए सरकारी सब्सिडी कितनी मिलती है?',
  'नमस्ते मनु! आप क्या कर सकते हैं?',
];

// ── Initial messages by language + role ──────────────────────────────────────

function buildInitialMessage(language: 'en' | 'hi', role: string): ChatMessage {
  const isHousehold = role === 'citizen';
  const content =
    language === 'hi'
      ? isHousehold
        ? `**नमस्ते! मैं मनु AI हूँ।** 🌿

मैं आपकी **घरेलू ऊर्जा AI सहायक** हूँ। मैं इन विषयों पर मदद कर सकता हूँ:

• ⚡ **बिजली बिल** — खपत घटाने के उपाय
• ☀️ **सोलर पैनल** — बचत और लागत वसूली गणना
• 💡 **उपकरण** — कौन सा ज़्यादा बिजली खाता है
• 💧 **पानी बचत** — घर में जल प्रबंधन
• 🌿 **बायोगैस** — जैविक कचरे से स्वच्छ ऊर्जा

नीचे दिए त्वरित प्रश्न आज़माएं या अपना सवाल टाइप करें!`
        : `**नमस्ते! मैं मनु AI हूँ।** 🌿

मैं **GramUrja बिहार ग्रामीण संवहनीयता क्षेत्र** के लिए आपका AI सहायक हूँ। मैं इन विषयों पर मदद कर सकता हूँ:

• ⚡ **ऊर्जा** — खपत, लागत, प्रति-घर विश्लेषण
• ☀️ **सौर** — क्षमता, रूफटॉप पैनल, बचत
• 💧 **पानी** — मांग, वर्षा जल संचयन
• 🌿 **कचरा** — बायोगैस एवं स्वच्छ ऊर्जा
• 💡 **सुझाव** — प्राथमिकता विकास कार्य

नीचे दिए त्वरित प्रश्न आज़माएं या अपना प्रश्न टाइप करें!`
      : isHousehold
      ? `**Hello! I'm Manu AI.** 🌿

I'm your **Household Energy AI Assistant**. Here's how I can help:

• ⚡ **Electricity Bill** — tips to cut your monthly cost
• ☀️ **Solar Panels** — savings & payback estimates for your home
• 💡 **Appliances** — find out which ones drain the most power
• 💧 **Water Saving** — smart water management at home
• 🌿 **Biogas** — turn kitchen waste into clean energy

Try the quick questions below or type your own!`
      : `**Hello! I'm Manu AI.** 🌿

I'm the AI assistant for **GramUrja Bihar Village Sustainability Region**. I can help with:

• ⚡ **Energy** — consumption, cost, per-household analysis
• ☀️ **Solar** — potential, rooftop capacity, payback
• 💧 **Water** — demand and water management
• 🌿 **Waste** — biogas potential from organic biomass
• 💡 **Recommendations** — actionable priority solutions

Try the quick questions below or type your own!`;

  return {
    id: `init-${language}-${role}`,
    role: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    language,
  };
}

// Declare browser SpeechRecognition vendor prefix
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}

// ── Better TTS voice selector ─────────────────────────────────────────────────

// ── Indian English & Regional TTS voice selector ──────────────────────────────

function getBestVoice(lang: 'en' | 'hi'): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (lang === 'hi') {
    return (
      voices.find((v) => v.lang === 'hi-IN') ??
      voices.find((v) => v.lang.startsWith('hi')) ??
      null
    );
  }
  // English — prioritize Indian English (en-IN) voices for Indian subcontinent users
  const preferredIndianVoices = [
    'Microsoft Neerja Online (Natural) - English (India)',
    'Microsoft Prabhat Online (Natural) - English (India)',
    'Google English (India)',
    'Google हिन्दी',
    'Microsoft Heera - English (India)',
    'Microsoft Ravi - English (India)',
    'Microsoft Priya Online (Natural)',
    'Microsoft Mohan Online (Natural)',
    'Veena',
    'Rishi',
    'Kangana',
    'en-IN',
  ];
  for (const name of preferredIndianVoices) {
    const found = voices.find((v) => v.name.includes(name) || v.name === name);
    if (found) return found;
  }
  
  // Find any voice explicitly tagged with en-IN or India
  const indianTagged = voices.find(
    (v) =>
      v.lang === 'en-IN' ||
      v.lang.toLowerCase().includes('en-in') ||
      v.name.toLowerCase().includes('india') ||
      v.name.toLowerCase().includes('hindi')
  );
  if (indianTagged) return indianTagged;

  // Fallback to natural English voices
  return (
    voices.find((v) => v.lang.startsWith('en')) ??
    null
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  onNavigate,
}: {
  msg: ChatMessage;
  onNavigate: (path: string) => void;
}) {
  const isUser = msg.role === 'user';
  const [speaking, setSpeaking] = useState(false);

  function speakMessage() {
    if (!window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    // Strip emojis completely so TTS engine does NOT read out emoji names
    const cleanText = msg.content
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/•/g, '')
      .replace(/\|[-:]+\|/g, '')
      .replace(/\|/g, ' ')
      // Strip all Unicode emojis and pictographs
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{200D}\u{FE0F}\u{2000}-\u{206F}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = msg.language === 'hi' ? 'hi-IN' : 'en-IN';

    if (msg.language === 'hi') {
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
    } else {
      // Natural Indian English cadence
      utterance.rate = 0.90;
      utterance.pitch = 1.02;
    }

    const trySetVoice = () => {
      const voice = getBestVoice(msg.language ?? 'en');
      if (voice) utterance.voice = voice;
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      trySetVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        trySetVoice();
        window.speechSynthesis.onvoiceschanged = null;
      };
    }

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function renderContent(text: string) {
    const lines = text.split('\n');
    return lines
      .map((line, i) => {
        if (line.trim().startsWith('|')) {
          const cells = line.split('|').filter((c) => c.trim());
          const isSeparator = cells.every((c) => /^[-:]+$/.test(c.trim()));
          if (isSeparator) return null;
          return (
            <tr key={i} className="border-b border-gray-100">
              {cells.map((c, j) => (
                <td
                  key={j}
                  className="px-3 py-1 text-sm"
                  dangerouslySetInnerHTML={{
                    __html: c.trim().replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'),
                  }}
                />
              ))}
            </tr>
          );
        }
        const html = line
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>');
        return (
          <p
            key={i}
            className={`${line.startsWith('•') || line.startsWith('-') ? 'ml-2' : ''} ${
              line === '' ? 'h-2' : ''
            } text-sm leading-relaxed`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })
      .filter(Boolean);
  }

  const hasTableContent = msg.content.includes('|---|');
  const isHindi = msg.language === 'hi';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-400/40 bg-emerald-950 flex items-center justify-center mr-2 shrink-0 mt-1 shadow-sm">
          <img src="/manu_ai_logo.jpg" alt="Manu AI" className="w-full h-full object-cover" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-emerald-600 text-white rounded-tr-sm shadow-md'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
        }`}
      >
        {!isUser && isHindi && (
          <div className="flex items-center gap-1 text-xs text-emerald-600 mb-1 font-semibold">
            <Globe className="w-3 h-3" /> हिंदी
          </div>
        )}
        {hasTableContent ? (
          <table className="min-w-full text-sm mb-2">
            <tbody>{renderContent(msg.content)}</tbody>
          </table>
        ) : (
          <div className="space-y-0.5">{renderContent(msg.content)}</div>
        )}
        {!isUser && (
          <button
            onClick={speakMessage}
            title={speaking ? 'Stop speaking' : 'Listen to this message'}
            className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600 transition-colors font-medium"
          >
            {speaking ? <VolumeX className="w-3 h-3 text-red-500" /> : <Volume2 className="w-3 h-3" />}
            {speaking ? (isHindi ? 'रोकें' : 'Stop') : (isHindi ? 'सुनें' : 'Listen')}
          </button>
        )}
        {msg.navigationSuggestion && !isUser && (
          <button
            onClick={() => onNavigate(msg.navigationSuggestion!)}
            className="mt-1.5 flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            <ExternalLink className="w-3 h-3" />
            {isHindi ? 'संबंधित पृष्ठ खोलें' : 'Open related page'}
          </button>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center ml-2 shrink-0 mt-1 text-xs font-bold text-emerald-800">
          U
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AIAssistantPage() {
  const { role } = useAuth();
  const { language, setLanguage, isHindi } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    buildInitialMessage(language, role),
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // When language toggle changes, replace the initial intro message only
  useEffect(() => {
    setMessages((prev) => {
      const rest = prev.filter((m) => !m.id.startsWith('init-'));
      return [buildInitialMessage(language, role), ...rest];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, role]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  async function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    await new Promise((res) => setTimeout(res, 400));
    const response = generateAIResponse(text, language, role);
    setMessages((prev) => [...prev, response]);
    setLoading(false);
  }

  const toggleVoiceInput = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert('Voice input is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
  }, [listening, language]);

  const isHousehold = role === 'citizen';
  const quickPrompts =
    language === 'hi'
      ? isHousehold
        ? QUICK_PROMPTS_HOUSEHOLD_HI
        : QUICK_PROMPTS_VILLAGE_HI
      : isHousehold
      ? QUICK_PROMPTS_HOUSEHOLD_EN
      : QUICK_PROMPTS_VILLAGE_EN;

  return (
    <div
      className="min-h-screen relative flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #0a2e1c 50%, #0f172a 100%)' }}
    >
      {/* Neural network background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg width="100%" height="100%" opacity="0.12">
          {Array.from({ length: 20 }, (_, i) => {
            const x = (i * 83) % 100;
            const y = (i * 61 + 20) % 100;
            return (
              <g key={i}>
                <circle cx={`${x}%`} cy={`${y}%`} r="2" fill="#16a34a" />
                {i > 0 && (
                  <line
                    x1={`${x}%`}
                    y1={`${y}%`}
                    x2={`${((i - 1) * 83) % 100}%`}
                    y2={`${((i - 1) * 61 + 20) % 100}%`}
                    stroke="#16a34a"
                    strokeWidth="0.5"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Page wrapper */}
      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col flex-1 h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-emerald-950/60 border border-emerald-400/30 bg-emerald-950 flex items-center justify-center">
              <img src="/manu_ai_logo.jpg" alt="Manu AI" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Manu AI</h1>
              <p className="text-xs text-emerald-300/80">
                GramUrja ·{' '}
                {isHousehold
                  ? isHindi
                    ? 'घरेलू ऊर्जा सहायक'
                    : 'Household Assistant'
                  : isHindi
                  ? 'ग्राम प्रशासन सहायक'
                  : 'Village Admin Assistant'}
              </p>
            </div>
          </div>

          {/* Language toggle */}
          <div className="flex bg-gray-800/80 backdrop-blur-md rounded-xl p-0.5 border border-gray-700">
            {(['en', 'hi'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  language === lang
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {lang === 'en' ? 'English' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/95 backdrop-blur-md rounded-2xl border border-gray-200 p-4 mb-4 shadow-inner">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} onNavigate={navigate} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-400/40 bg-emerald-950 flex items-center justify-center">
                <img src="/manu_ai_logo.jpg" alt="Manu AI" className="w-full h-full object-cover" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2 mb-3 flex-shrink-0">
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="text-xs bg-white/10 border border-white/20 rounded-full px-3 py-1 text-gray-200 hover:bg-emerald-600/30 hover:border-emerald-400/50 hover:text-emerald-300 transition-colors shadow-xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="flex gap-2 flex-shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder={
              language === 'en'
                ? isHousehold
                  ? 'Ask Manu AI about your bill, appliances, solar, water…'
                  : 'Ask Manu AI about energy, solar, water, waste…'
                : isHousehold
                ? 'मनु AI से बिल, उपकरण, सोलर, पानी के बारे में पूछें…'
                : 'मनु AI से ऊर्जा, सौर, पानी, कचरे के बारे में पूछें…'
            }
            className="flex-1 border border-gray-600 bg-gray-800/90 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            onClick={toggleVoiceInput}
            className={`px-3 py-3 rounded-xl transition-colors ${
              listening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={listening ? 'Stop listening' : `Voice input (${language === 'hi' ? 'Hindi' : 'English'})`}
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {listening && (
          <p className="text-xs text-center text-red-400 mt-1 animate-pulse font-medium">
            🎙️ {language === 'hi' ? 'सुन रहे हैं… बोलें' : 'Listening… speak now'}
          </p>
        )}

        <div className="text-xs text-center text-gray-400 mt-2">
          {language === 'hi'
            ? 'GramUrja मनु AI · ग्रामीण ऊर्जा विश्लेषण एवं संवहनीयता'
            : 'GramUrja Manu AI · Rural Energy Analytics & Sustainability'}
        </div>
      </div>
    </div>
  );
}
