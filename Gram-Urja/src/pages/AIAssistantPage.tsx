import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Mic, ExternalLink, Globe } from 'lucide-react';
import { generateAIResponse } from '../ai/chatEngine';
import type { ChatMessage } from '../types';
import { DemoBadge } from '../components/ui';

const QUICK_PROMPTS = [
  'Which area has the highest energy consumption?',
  'What is Motipur\'s solar potential?',
  'Show me Amra\'s water analysis',
  'What are the top recommendations?',
  'What is the region overview?',
  'Which area has the best sustainability score?',
  'What is Korha\'s monthly electricity cost?',
  'How much biogas can Motipur produce?',
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content: `**नमस्ते! Hello! Welcome to GreenGrid AI Assistant** 🌱

I'm your sustainability intelligence assistant for the **Bihar Village Sustainability Region**. I can answer questions about:

• ⚡ **Energy** — consumption, costs, per-household analysis
• ☀️ **Solar** — potential, panels, savings, payback
• 💧 **Water** — demand, rainwater harvesting, pump energy
• 🌿 **Waste** — biogas potential, organic inputs
• 🏆 **Scores** — sustainability rating, grade, breakdown
• 💡 **Recommendations** — priority actions, investments, CO₂ impact

I support **English and Hindi** text queries. Try a quick prompt below or type your question!

*All data is from the Bihar Village demo dataset. Click navigation suggestions to explore the relevant page.*`,
  timestamp: new Date().toISOString(),
  language: 'en',
};

function MessageBubble({ msg, onNavigate }: { msg: ChatMessage; onNavigate: (path: string) => void }) {
  const isUser = msg.role === 'user';

  // Simple markdown renderer for bold and tables
  function renderContent(text: string) {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Table row
      if (line.trim().startsWith('|')) {
        const cells = line.split('|').filter((c) => c.trim());
        const isSeparator = cells.every((c) => /^[-:]+$/.test(c.trim()));
        if (isSeparator) return null;
        return (
          <tr key={i} className="border-b border-gray-700">
            {cells.map((c, j) => (
              <td key={j} className="px-3 py-1 text-sm" dangerouslySetInnerHTML={{
                __html: c.trim().replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              }} />
            ))}
          </tr>
        );
      }
      // Bold rendering
      const html = line
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
      return <p key={i} className={`${line.startsWith('•') || line.startsWith('-') ? 'ml-2' : ''} ${line === '' ? 'h-2' : ''} text-sm leading-relaxed`} dangerouslySetInnerHTML={{ __html: html }} />;
    }).filter(Boolean);
  }

  const hasTableContent = msg.content.includes('|---|');

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-2 shrink-0 mt-1">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-green-600 text-white rounded-tr-sm'
          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
      }`}>
        {!isUser && msg.language === 'hi' && (
          <div className="flex items-center gap-1 text-xs text-blue-500 mb-1">
            <Globe className="w-3 h-3" /> Hindi / हिंदी
          </div>
        )}
        {hasTableContent ? (
          <table className="min-w-full text-sm mb-2">
            <tbody>{renderContent(msg.content)}</tbody>
          </table>
        ) : (
          <div className="space-y-0.5">{renderContent(msg.content)}</div>
        )}
        {msg.navigationSuggestion && !isUser && (
          <button
            onClick={() => onNavigate(msg.navigationSuggestion!)}
            className="mt-2 flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    // Simulate a brief "thinking" delay
    await new Promise((res) => setTimeout(res, 400));
    const response = generateAIResponse(text);
    setMessages((prev) => [...prev, response]);
    setLoading(false);
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #0a1628 50%, #0f172a 100%)' }}>
      {/* Neural network dots pattern */}
      <div className="absolute inset-0 pointer-events-none neural-pulse overflow-hidden">
        <svg width="100%" height="100%" opacity="0.15">
          {Array.from({ length: 20 }, (_, i) => {
            const x = (i * 83) % 100;
            const y = (i * 61 + 20) % 100;
            return <g key={i}><circle cx={`${x}%`} cy={`${y}%`} r="2" fill="#16a34a"/>{i > 0 && <line x1={`${x}%`} y1={`${y}%`} x2={`${((i-1)*83)%100}%`} y2={`${((i-1)*61+20)%100}%`} stroke="#16a34a" strokeWidth="0.5"/>}</g>;
          })}
        </svg>
      </div>
    <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600 rounded-xl">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
            <p className="text-xs text-gray-400">GreenGrid AI · English & Hindi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DemoBadge />
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['en', 'hi'] as const).map((lang) => (
              <button key={lang} onClick={() => setLanguage(lang)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${language === lang ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {lang === 'en' ? 'EN' : 'हिं'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-2xl border border-gray-200 p-4 mb-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} onNavigate={navigate} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-0">
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
      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK_PROMPTS.slice(0, 4).map((p) => (
          <button key={p} onClick={() => sendMessage(p)}
            className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors">
            {p}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder={language === 'en' ? 'Ask about energy, solar, water, waste...' : 'ऊर्जा, सौर, पानी, कचरे के बारे में पूछें...'}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
        <button className="bg-gray-100 text-gray-500 px-3 py-3 rounded-xl hover:bg-gray-200 transition-colors" title="Voice input (shell)">
          <Mic className="w-4 h-4" />
        </button>
      </div>
      <div className="text-xs text-center text-gray-400 mt-2">
        Rule-based AI · Demo data only · Not connected to live APIs
      </div>
    </div>
    </div>
  );
}
