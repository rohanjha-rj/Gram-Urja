import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Mic, MicOff, ExternalLink, Globe, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { generateAIResponse } from '../ai/chatEngine';
import type { ChatMessage } from '../types';

const QUICK_PROMPTS_EN = [
  'Which area has the highest energy consumption?',
  "What is Motipur's solar potential?",
  "Show me Amra's water analysis",
  'What are the top recommendations?',
  'What is the region overview?',
  'Which area has the best sustainability score?',
];

const QUICK_PROMPTS_HI = [
  'किस क्षेत्र में सबसे अधिक बिजली खपत है?',
  'मोतीपुर की सौर क्षमता क्या है?',
  'अमरा का जल विश्लेषण दिखाएं',
  'शीर्ष सुझाव क्या हैं?',
  'क्षेत्र का अवलोकन दें',
  'सर्वश्रेष्ठ स्थिरता स्कोर किस क्षेत्र का है?',
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content: `**नमस्ते! Hello! मैं Kiran हूँ।**

मैं **Bihar Village Sustainability Region** के लिए आपकी AI सहायक हूँ। मैं इन विषयों पर मदद कर सकती हूँ:

• ⚡ **ऊर्जा / Energy** — खपत, लागत, प्रति-घर विश्लेषण
• ☀️ **सौर / Solar** — क्षमता, पैनल, बचत, payback
• 💧 **पानी / Water** — मांग, वर्षा जल, पंप ऊर्जा
• 🌿 **कचरा / Waste** — बायोगैस क्षमता
• 🏆 **स्कोर / Scores** — स्थिरता रेटिंग
• 💡 **सुझाव / Recommendations** — प्राथमिकता कार्य

भाषा बदलने के लिए ऊपर **EN / हिं** बटन दबाएँ।
नीचे दिए गए त्वरित प्रश्न आज़माएं या अपना प्रश्न टाइप करें!`,
  timestamp: new Date().toISOString(),
  language: 'en',
};

// Declare browser SpeechRecognition vendor prefix
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}

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
    const utterance = new SpeechSynthesisUtterance(
      msg.content.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1')
    );
    utterance.lang = msg.language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;
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

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-2 shrink-0 mt-1">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-green-600 text-white rounded-tr-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
        }`}
      >
        {!isUser && msg.language === 'hi' && (
          <div className="flex items-center gap-1 text-xs text-blue-500 mb-1">
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
            className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors"
          >
            {speaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            {speaking ? 'Stop' : 'Listen'}
          </button>
        )}
        {msg.navigationSuggestion && !isUser && (
          <button
            onClick={() => onNavigate(msg.navigationSuggestion!)}
            className="mt-1 flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
          >
            <ExternalLink className="w-3 h-3" />
            Open related page
          </button>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 shrink-0 mt-1 text-xs font-bold text-gray-600">
          U
        </div>
      )}
    </div>
  );
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup speech recognition on unmount
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
    const response = generateAIResponse(text, language);
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
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
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

  const quickPrompts = language === 'hi' ? QUICK_PROMPTS_HI : QUICK_PROMPTS_EN;

  return (
    <div
      className="min-h-screen relative flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #0a1628 50%, #0f172a 100%)' }}
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
            <div className="p-2 bg-green-600 rounded-xl">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Kiran</h1>
              <p className="text-xs text-gray-400">GreenGrid AI · English & हिंदी</p>
            </div>
          </div>

          {/* Language toggle */}
          <div className="flex bg-gray-800 rounded-lg p-0.5 border border-gray-700">
            {(['en', 'hi'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  language === lang
                    ? 'bg-green-600 text-white shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {lang === 'en' ? 'EN' : 'हिं'}
              </button>
            ))}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 rounded-2xl border border-gray-200 p-4 mb-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} onNavigate={navigate} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
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
              className="text-xs bg-white/10 border border-white/20 rounded-full px-3 py-1 text-gray-300 hover:bg-green-600/20 hover:border-green-400/50 hover:text-green-300 transition-colors"
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
                ? 'Ask Kiran about energy, solar, water, waste…'
                : 'किरण से ऊर्जा, सौर, पानी, कचरे के बारे में पूछें…'
            }
            className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
          <p className="text-xs text-center text-red-400 mt-1 animate-pulse">
            🎙️ {language === 'hi' ? 'सुन रही हूँ… बोलें' : 'Listening… speak now'}
          </p>
        )}

        <div className="text-xs text-center text-gray-500 mt-2">
          Rule-based AI · Estimated data only · Not connected to live APIs
        </div>
      </div>
    </div>
  );
}
