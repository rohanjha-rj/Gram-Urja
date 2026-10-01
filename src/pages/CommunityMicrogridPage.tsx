import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Zap, ShieldCheck, ShieldAlert, Shield,
  Sun, Leaf, Home, TrendingUp,
  Users, Droplets, AlertTriangle, CheckCircle2, RefreshCw,
  ArrowRight, ArrowUpRight, Coins, BarChart2, WifiOff, Wifi,
  Lightbulb, SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useEnergyLedger } from '../hooks/useEnergyLedger';

// Lazy-load the Three.js scene so it splits into a separate chunk and doesn't
// block the initial page render — shows a teal spinner while the module loads.
const MicrogridScene3D = React.lazy(() => import('../components/MicrogridScene3D'));

// ═══════════════════════════════════════════════════════════════════
//  STATIC DATA
// ═══════════════════════════════════════════════════════════════════

const VS = {
  totalSolarKWh:  248.4,
  totalBiogasKWh: 112.6,
  totalGenKWh:    361.0,
  demandKWh:      310.5,
  selfSuffPct:    87,
  bess: { soc: 72, capacityKWh: 200, healthPct: 94, chargeRateKW: 18 },
  areas: [
    { name: 'Rajpur',    solar: 68.2, biogas: 28.4, demand: 82.0 },
    { name: 'Motipur',   solar: 52.1, biogas: 22.0, demand: 68.5 },
    { name: 'Siraul',    solar: 44.6, biogas: 19.8, demand: 58.0 },
    { name: 'Bairgania', solar: 48.8, biogas: 24.1, demand: 62.0 },
    { name: 'Dhaka',     solar: 34.7, biogas: 18.3, demand: 40.0 },
  ],
};

const HS = {
  contribution: { solarFedKWh: 3.8, biogasFedKWh: 2.1, totalFedKWh: 5.9 },
  credits:      { thisMonthINR: 148, totalINR: 1284, kwhPrice: 6.5 },
  security:     { backupHours: 4.5, status: 'backed' },
};

const LEDGER = [
  { month: 'Jun 2025', solar: 3.8, biogas: 2.1, earned: 148, total: 1284 },
  { month: 'May 2025', solar: 4.1, biogas: 2.3, earned: 171, total: 1136 },
  { month: 'Apr 2025', solar: 3.7, biogas: 2.0, earned: 149, total:  965 },
  { month: 'Mar 2025', solar: 2.9, biogas: 1.5, earned: 119, total:  816 },
];

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════

function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }
function socColor(p: number) { return p >= 60 ? '#34d399' : p >= 30 ? '#fbbf24' : '#f87171'; }

// ═══════════════════════════════════════════════════════════════════
//  CANVAS ENERGY FLOW (core interactive hero)
// ═══════════════════════════════════════════════════════════════════

type Mode = 'day' | 'night';
type Particle = {
  id: number; x: number; y: number;
  tx: number; ty: number;         // target coords (next node centre)
  progress: number;               // 0→1 along the segment
  speed: number;
  color: string;
  glow: string;
  route: number[];                // ordered list of node indices to visit
  routeIdx: number;
};

// Node positions (relative to 600×360 viewBox)
const NODES = {
  solar:   { x: 90,  y: 60,  label: 'Solar PV',      emoji: '☀️' },
  biogas:  { x: 510, y: 60,  label: 'Biogas Plant',   emoji: '🌿' },
  bess:    { x: 300, y: 180, label: 'BESS Storage',   emoji: '🔋' },
  homes:   { x: 90,  y: 310, label: 'Village Homes',  emoji: '🏠' },
  water:   { x: 220, y: 310, label: 'Water Pump',     emoji: '💧' },
  clinic:  { x: 380, y: 310, label: 'Health Clinic',  emoji: '🏥' },
  lights:  { x: 510, y: 310, label: 'Streetlights',   emoji: '💡' },
  grid:    { x: 300, y: 60,  label: 'Main Grid',      emoji: '⚡' },
};

const NK = Object.keys(NODES) as (keyof typeof NODES)[];
function nPos(k: keyof typeof NODES) { return NODES[k]; }
function nIdx(k: keyof typeof NODES) { return NK.indexOf(k); }

// Static edge list for drawing wires (always drawn as thin grey)
const EDGES: [keyof typeof NODES, keyof typeof NODES][] = [
  ['solar',  'bess'],
  ['biogas', 'bess'],
  ['bess',   'homes'],
  ['bess',   'water'],
  ['bess',   'clinic'],
  ['bess',   'lights'],
  ['grid',   'bess'],
];

// Particle routes per mode
function makeParticles(mode: Mode, blackout: boolean, startId: number): Particle[] {
  const routes: { route: (keyof typeof NODES)[]; color: string; glow: string }[] = [];

  if (mode === 'day') {
    // Solar → BESS (charging)
    for (let i = 0; i < 4; i++) routes.push({ route: ['solar', 'bess'],  color: '#fbbf24', glow: '#fbbf2480' });
    // BESS → loads
    routes.push({ route: ['bess', 'homes'],  color: '#34d399', glow: '#34d39980' });
    routes.push({ route: ['bess', 'water'],  color: '#38bdf8', glow: '#38bdf880' });
    routes.push({ route: ['bess', 'clinic'], color: '#34d399', glow: '#34d39980' });
    routes.push({ route: ['bess', 'lights'], color: '#fbbf24', glow: '#fbbf2480' });
    if (!blackout) {
      // Grid tied
      routes.push({ route: ['grid', 'bess'],  color: '#94a3b8', glow: '#94a3b840' });
    }
  } else {
    // Night: biogas → BESS + loads
    for (let i = 0; i < 3; i++) routes.push({ route: ['biogas', 'bess'], color: '#4ade80', glow: '#4ade8080' });
    routes.push({ route: ['bess', 'homes'],  color: '#38bdf8', glow: '#38bdf880' });
    routes.push({ route: ['bess', 'water'],  color: '#38bdf8', glow: '#38bdf880' });
    routes.push({ route: ['bess', 'clinic'], color: '#c4b5fd', glow: '#c4b5fd80' });
    routes.push({ route: ['bess', 'lights'], color: '#fde68a', glow: '#fde68a80' });
  }

  return routes.map((r, i) => {
    const fromNode = nPos(r.route[0]);
    const toNode   = nPos(r.route[1]);
    return {
      id: startId + i,
      x: fromNode.x, y: fromNode.y,
      tx: toNode.x,  ty: toNode.y,
      progress: Math.random(),
      speed: 0.004 + Math.random() * 0.004,
      color: r.color,
      glow:  r.glow,
      route: r.route.map(k => nIdx(k)),
      routeIdx: 0,
    };
  });
}

function EnergyFlowCanvas({
  mode, blackout, socPct,
}: { mode: Mode; blackout: boolean; socPct: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef       = useRef<number>(0);
  const modeRef      = useRef(mode);
  const blackoutRef  = useRef(blackout);

  // Rebuild particles on mode/blackout change
  useEffect(() => {
    modeRef.current    = mode;
    blackoutRef.current = blackout;
    particlesRef.current = makeParticles(mode, blackout, Date.now() % 10000);
  }, [mode, blackout]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // DPI scaling
    function resize() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width  = rect.width  * window.devicePixelRatio;
      canvas!.height = rect.height * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function draw() {
      const W = canvas!.getBoundingClientRect().width;
      const H = canvas!.getBoundingClientRect().height;
      const scaleX = W / 600;
      const scaleY = H / 360;

      ctx!.clearRect(0, 0, W, H);

      // ── Draw static wires ──
      EDGES.forEach(([a, b]) => {
        const pa = nPos(a), pb = nPos(b);
        const isGrid = a === 'grid' || b === 'grid';
        ctx!.beginPath();
        ctx!.moveTo(pa.x * scaleX, pa.y * scaleY);
        ctx!.lineTo(pb.x * scaleX, pb.y * scaleY);
        ctx!.strokeStyle = isGrid && blackoutRef.current ? '#334155' : '#0d9488';
        ctx!.lineWidth   = isGrid && blackoutRef.current ? 1 : 1.5;
        ctx!.setLineDash(isGrid ? [4, 4] : []);
        ctx!.stroke();
        ctx!.setLineDash([]);
      });

      // ── Draw nodes ──
      NK.forEach(k => {
        const n = nPos(k);
        const cx = n.x * scaleX, cy = n.y * scaleY;
        const isGrid  = k === 'grid';
        const isBESS  = k === 'bess';
        const faded   = isGrid && blackoutRef.current;

        // Outer glow ring
        if (!faded) {
          const grad = ctx!.createRadialGradient(cx, cy, 14, cx, cy, 28);
          const ringColor = isBESS ? socColor(socPct) : k === 'solar' ? '#fbbf24' : k === 'biogas' ? '#4ade80' : '#10b981';
          grad.addColorStop(0, ringColor + '30');
          grad.addColorStop(1, ringColor + '00');
          ctx!.beginPath();
          ctx!.arc(cx, cy, 28, 0, Math.PI * 2);
          ctx!.fillStyle = grad;
          ctx!.fill();
        }

        // Node circle
        ctx!.beginPath();
        ctx!.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx!.fillStyle = faded ? '#1e293b' : isBESS ? '#042f2e' : '#0f2d2b';
        ctx!.fill();
        ctx!.strokeStyle = faded ? '#475569' : isBESS ? socColor(socPct) : '#0d9488';
        ctx!.lineWidth = 2;
        ctx!.stroke();

        // Emoji
        ctx!.font      = `${Math.round(14 * Math.min(scaleX, scaleY))}px serif`;
        ctx!.textAlign = 'center';
        ctx!.textBaseline = 'middle';
        ctx!.globalAlpha = faded ? 0.3 : 1;
        ctx!.fillText(n.emoji, cx, cy - 2);
        ctx!.globalAlpha = 1;

        // Label
        ctx!.font      = `bold ${Math.round(8 * Math.min(scaleX, scaleY) + 6)}px system-ui`;
        ctx!.fillStyle = faded ? '#64748b' : '#e2e8f0';
        ctx!.textAlign = 'center';
        ctx!.textBaseline = 'top';
        ctx!.fillText(n.label, cx, cy + 21);

        // BESS: draw SOC bar below label
        if (isBESS) {
          const bw = 44 * scaleX, bh = 6;
          const bx = cx - bw / 2, by = cy + 38;
          ctx!.fillStyle = '#1e3a32';
          ctx!.beginPath();
          ctx!.roundRect(bx, by, bw, bh, 3);
          ctx!.fill();
          ctx!.fillStyle = socColor(socPct);
          ctx!.beginPath();
          ctx!.roundRect(bx, by, bw * (socPct / 100), bh, 3);
          ctx!.fill();
          ctx!.font      = `bold ${Math.round(7 * Math.min(scaleX, scaleY) + 5)}px system-ui`;
          ctx!.fillStyle = '#34d399';
          ctx!.textAlign = 'center';
          ctx!.textBaseline = 'top';
          ctx!.fillText(`${socPct}% charged`, cx, by + 8);
        }

        // Grid: show TRIPPED label in blackout
        if (isGrid && blackoutRef.current) {
          ctx!.font      = `bold ${Math.round(7 * Math.min(scaleX, scaleY) + 5)}px system-ui`;
          ctx!.fillStyle = '#ef4444';
          ctx!.textAlign = 'center';
          ctx!.textBaseline = 'top';
          ctx!.fillText('TRIPPED', cx, cy + 22);
        }
      });

      // ── Move & draw particles ──
      particlesRef.current.forEach(p => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.x = p.tx; p.y = p.ty;
          // cycle to next segment or restart
          p.routeIdx = (p.routeIdx + 1) % (p.route.length - 1);
          const from = NK[p.route[p.routeIdx]];
          const to   = NK[p.route[Math.min(p.routeIdx + 1, p.route.length - 1)]];
          p.x = nPos(from).x; p.y = nPos(from).y;
          p.tx = nPos(to).x;  p.ty = nPos(to).y;
        }
        const px = (p.x + (p.tx - p.x) * p.progress) * scaleX;
        const py = (p.y + (p.ty - p.y) * p.progress) * scaleY;

        // glow
        const g = ctx!.createRadialGradient(px, py, 0, px, py, 9);
        g.addColorStop(0, p.color);
        g.addColorStop(1, p.color + '00');
        ctx!.beginPath();
        ctx!.arc(px, py, 9, 0, Math.PI * 2);
        ctx!.fillStyle = g;
        ctx!.fill();

        // dot
        ctx!.beginPath();
        ctx!.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    particlesRef.current = makeParticles(mode, blackout, 0);
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-xl"
      style={{ height: 'clamp(220px, 40vw, 360px)', display: 'block' }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CIRCUIT BREAKER (SVG + CSS animation — replaces 3D placeholder)
// ═══════════════════════════════════════════════════════════════════

function CircuitBreaker({ blackout }: { blackout: boolean }) {
  // Arc flash only shows briefly after trip
  const [arcVisible, setArcVisible] = useState(false);
  const prevBlackout = useRef(blackout);

  useEffect(() => {
    if (blackout && !prevBlackout.current) {
      setArcVisible(true);
      const t = setTimeout(() => setArcVisible(false), 900);
      return () => clearTimeout(t);
    }
    prevBlackout.current = blackout;
  }, [blackout]);

  // Switch arm angle: 0° = closed (horizontal), -50° = open
  const armAngle = blackout ? -50 : 0;

  return (
    <div className="relative w-full flex justify-center">
      <svg viewBox="0 0 340 200" className="w-full max-w-sm"
        style={{ filter: 'drop-shadow(0 4px 32px rgba(13,148,136,0.25))' }}>

        {/* Background */}
        <rect x={0} y={0} width={340} height={200} rx={12} fill="#0a1512" />

        {/* ── Terminal bars ── */}
        {/* Left = Main Grid */}
        <rect x={10} y={80} width={80} height={36} rx={6}
          fill={blackout ? '#1e293b' : '#0c2a3e'}
          stroke={blackout ? '#334155' : '#0284c7'} strokeWidth={1.5} />
        <text x={50} y={95} textAnchor="middle" fontSize={9} fontWeight="700"
          fill={blackout ? '#475569' : '#7dd3fc'} fontFamily="system-ui">MAIN</text>
        <text x={50} y={108} textAnchor="middle" fontSize={9} fontWeight="700"
          fill={blackout ? '#334155' : '#38bdf8'} fontFamily="system-ui">GRID</text>

        {/* Right = Village Microgrid */}
        <rect x={250} y={80} width={80} height={36} rx={6}
          fill="#042f2e" stroke="#0d9488" strokeWidth={1.5} />
        <text x={290} y={95} textAnchor="middle" fontSize={8} fontWeight="700"
          fill="#5eead4" fontFamily="system-ui">VILLAGE</text>
        <text x={290} y={108} textAnchor="middle" fontSize={8} fontWeight="700"
          fill="#2dd4bf" fontFamily="system-ui">MICROGRID</text>

        {/* ── Wires from terminals to pivot ── */}
        <line x1={90} y1={98} x2={140} y2={98}
          stroke={blackout ? '#334155' : '#0284c7'} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={200} y1={98} x2={250} y2={98}
          stroke="#0d9488" strokeWidth={2.5} strokeLinecap="round" />

        {/* ── Pivot point (left) ── */}
        <circle cx={140} cy={98} r={5} fill="#0f172a" stroke="#0d9488" strokeWidth={1.5} />

        {/* ── Switch arm (rotates around pivot) ── */}
        <g transform={`rotate(${armAngle}, 140, 98)`}
          style={{ transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <line x1={140} y1={98} x2={200} y2={98}
            stroke={blackout ? '#f97316' : '#2dd4bf'} strokeWidth={4}
            strokeLinecap="round" />
          {/* Moving contact end */}
          <circle cx={200} cy={98} r={5.5}
            fill={blackout ? '#f97316' : '#0d9488'}
            style={{ filter: blackout ? 'drop-shadow(0 0 6px #f97316)' : 'drop-shadow(0 0 8px #0d9488)' }} />
        </g>

        {/* ── Arc flash (brief orange burst) ── */}
        {arcVisible && (
          <g>
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <line key={i}
                x1={170} y1={98}
                x2={170 + Math.cos(deg * Math.PI / 180) * 20}
                y2={98  + Math.sin(deg * Math.PI / 180) * 20}
                stroke="#fb923c" strokeWidth={2} strokeLinecap="round"
                opacity={0.95} />
            ))}
            <circle cx={170} cy={98} r={7}
              fill="#fff7ed" stroke="#fb923c" strokeWidth={1.5}
              style={{ filter: 'drop-shadow(0 0 8px #fb923c)' }} />
          </g>
        )}

        {/* ── Village microgrid loop (glowing when islanded) ── */}
        {blackout && (
          <>
            <rect x={200} y={60} width={130} height={76} rx={10}
              fill="rgba(13,148,136,0.08)" stroke="#0d9488" strokeWidth={1.5}
              strokeDasharray="6 3"
              style={{ animation: 'dashMove 1.2s linear infinite' }} />
            <text x={265} y={55} textAnchor="middle" fontSize={8} fontWeight="700"
              fill="#2dd4bf" fontFamily="system-ui">ISLAND LOOP ACTIVE</text>
            {[0, 0.33, 0.66].map((offset, i) => (
              <circle key={i} r={4} fill="#34d399"
                style={{ filter: 'drop-shadow(0 0 5px #34d399)' }}>
                <animateMotion
                  dur="1.8s" begin={`${offset * 1.8}s`} repeatCount="indefinite"
                  path="M200,60 h130 a10,10 0 0 1 10,10 v56 a10,10 0 0 1 -10,10 h-130 a10,10 0 0 1 -10,-10 v-56 a10,10 0 0 1 10,-10 z"
                />
              </circle>
            ))}
          </>
        )}

        {/* ── PCC label ── */}
        <text x={170} y={155} textAnchor="middle" fontSize={8} fill="#475569" fontFamily="system-ui">
          Point of Common Coupling (PCC)
        </text>
        <text x={170} y={168} textAnchor="middle" fontSize={9} fontWeight="700"
          fill={blackout ? '#f87171' : '#2dd4bf'} fontFamily="system-ui">
          {blackout ? '⚡ TRIPPED — ISLANDED' : '✓ CLOSED — GRID CONNECTED'}
        </text>

        {/* ── Status indicator ── */}
        <circle cx={170} cy={138} r={8}
          fill={blackout ? '#1c0a0a' : '#042f2e'}
          stroke={blackout ? '#ef4444' : '#0d9488'} strokeWidth={2}
          style={{ filter: blackout ? 'drop-shadow(0 0 8px #ef444470)' : 'drop-shadow(0 0 8px #0d948870)' }} />
        <circle cx={170} cy={138} r={4}
          fill={blackout ? '#f87171' : '#2dd4bf'}
          style={{ filter: blackout ? 'none' : 'drop-shadow(0 0 4px #2dd4bf)' }} />
      </svg>

      <style>{`
        @keyframes dashMove { to { stroke-dashoffset: -18; } }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  BATTERY GAUGE (radial arc)
// ═══════════════════════════════════════════════════════════════════

function BatteryGauge({ soc, reserveHours }: { soc: number; reserveHours: number }) {
  const r = 48, circ = 2 * Math.PI * r;
  const arc  = circ * 0.75;
  const fill = arc * clamp(soc / 100, 0, 1);
  const col  = socColor(soc);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={130} height={130} viewBox="0 0 130 130">
        <circle cx={65} cy={65} r={r} fill="none"
          stroke="#1e3a32" strokeWidth={11}
          strokeDasharray={`${arc} ${circ - arc}`}
          strokeLinecap="round" transform="rotate(135 65 65)" />
        <circle cx={65} cy={65} r={r} fill="none"
          stroke={col} strokeWidth={11}
          strokeDasharray={`${fill} ${circ - fill}`}
          strokeLinecap="round" transform="rotate(135 65 65)"
          style={{ transition: 'stroke-dasharray 1s ease, stroke 0.5s' }} />
        <text x={65} y={59} textAnchor="middle" fontSize={20} fontWeight={800}
          fill={col} fontFamily="system-ui">{soc}%</text>
        <text x={65} y={74} textAnchor="middle" fontSize={9} fill="#94a3b8"
          fontFamily="system-ui">State of Charge</text>
      </svg>
      <div className="text-center">
        <div className="text-xs text-slate-400">Reserve Autonomy</div>
        <div className="text-lg font-black" style={{ color: col }}>{reserveHours}h</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  SECURITY BADGE
// ═══════════════════════════════════════════════════════════════════

function SecurityBadge({ status, hours }: { status: string; hours: number }) {
  const cfg: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
    backed:  { bg: 'bg-emerald-50',  text: 'text-emerald-800', border: 'border-emerald-300', icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />, label: `Backed by Community Microgrid — ${hours}h Storage Available` },
    limited: { bg: 'bg-amber-50',    text: 'text-amber-800',   border: 'border-amber-300',   icon: <Shield      className="w-4 h-4 text-amber-600"   />, label: `Limited Backup — ${hours}h Remaining` },
    offline: { bg: 'bg-red-50',      text: 'text-red-800',     border: 'border-red-300',     icon: <ShieldAlert className="w-4 h-4 text-red-600"     />, label: 'Microgrid Offline — No Backup' },
  };
  const c = cfg[status] ?? cfg['offline'];
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${c.bg} ${c.text} ${c.border}`}>
      {c.icon}{c.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CARD WRAPPERS
// ═══════════════════════════════════════════════════════════════════

// Dark navy card — matches Solar's live-roof dark stage
function DarkCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-teal-900/40 ${className}`}
      style={{ background: 'linear-gradient(180deg,#0f172a 0%,#0d1f1a 100%)', boxShadow: '0 4px 24px rgba(13,148,136,0.12)' }}
    >
      {children}
    </div>
  );
}

// Light glassmorphism card — used specifically for the visualizer panel
function LightGlassCard({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div
      id={id}
      className={`rounded-2xl bg-white border border-slate-200 ${className}`}
      style={{ boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(16,185,129,0.06)' }}
    >
      {children}
    </div>
  );
}

// Alias GlassCard → DarkCard for interactive panels
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <DarkCard className={className}>{children}</DarkCard>;
}

// Light white card for non-interactive/household sections
function LightCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  HOW IT WORKS CARDS
// ═══════════════════════════════════════════════════════════════════

const HOW_CARDS = [
  {
    step: 1, emoji: '⚡', color: '#f59e0b',
    title: 'Collection & Hybrid Generation',
    body: 'Daytime solar panels capture rooftop photons while biogas digesters continuously convert cattle dung and agricultural waste into clean gas — powering a micro-generator 24 / 7, even after sunset.',
  },
  {
    step: 2, emoji: '🔋', color: '#10b981',
    title: 'Smart Storage & EMS Balancing',
    body: 'An Energy Management System (EMS) monitors real-time supply and demand across all 5 village nodes. Surplus is auto-routed into the 200 kWh community LFP battery with smart charge scheduling.',
  },
  {
    step: 3, emoji: '🏘️', color: '#38bdf8',
    title: 'Distribution & Grid Resilience',
    body: 'When the main grid fails, the community battery takes over in milliseconds — sustaining water pumps, the health clinic, and streetlights until power is restored.',
  },
];

// ═══════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function CommunityMicrogridPage() {
  const { role } = useAuth();
  const { isHindi } = useLanguage();

  const isVillage = role === 'official' || role === 'guest';

  // ── Shared state ──
  const [mode,      setMode]      = useState<Mode>('day');
  const [blackout,  setBlackout]  = useState(false);
  const [simulating,setSimulating]= useState(false);
  const [socPct,    setSocPct]    = useState(VS.bess.soc);

  // ── Energy ledger hook (household live calculations) ──
  const {
    solarSurplus, setSolarSurplus,
    biogasSurplus, setBiogasSurplus,
    totalSurplus,
    thisMonthEarnings,
    totalEarned,
    creditRate,
    ledger,
  } = useEnergyLedger();

  // ── Modal state for How-It-Works Explore buttons ──
  const [activeModal, setActiveModal] = useState<number | null>(null);

  const reserveHours = +(( VS.bess.capacityKWh * (socPct / 100) ) / 32).toFixed(1);

  // Simulate slow battery drain during blackout
  useEffect(() => {
    if (!blackout) { setSocPct(VS.bess.soc); return; }
    const id = setInterval(() => setSocPct(p => Math.max(p - 1, 18)), 1400);
    return () => clearInterval(id);
  }, [blackout]);

  function handleBlackoutToggle() {
    setSimulating(true);
    setTimeout(() => { setBlackout(v => !v); setSimulating(false); }, 700);
  }

  const surplusKWh = +(VS.totalGenKWh - VS.demandKWh).toFixed(1);

  return (
    <div className="min-h-full" style={{ background: '#0a2219' }}>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ══════════════════════════════════════════════════════
            1. HERO BANNER
        ══════════════════════════════════════════════════════ */}
        <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 32px rgba(5,150,105,0.10)' }}>
          {/* Subtle emerald left accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-3xl bg-emerald-600" />
          <div className="relative px-6 sm:px-10 py-8 sm:py-10 pl-8 sm:pl-12">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mb-4">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
                Community Microgrid · Smart Energy Grid
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Empowerment Through{' '}
              <span className="text-emerald-600">Shared Energy</span>
            </h1>
            <p className="mt-3 text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
              Bridging Solar &amp; Biogas — How our village stores surplus waste energy to light up
              homes, power water pumps, and withstand grid blackouts without interruption.
            </p>

            {/* Mode + controls row */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {/* Day / Night toggle — pill style with clear active border */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 gap-0.5">
                {(['day', 'night'] as Mode[]).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === m
                        ? m === 'day'
                          ? 'bg-amber-400 text-amber-900 shadow border border-amber-500'
                          : 'bg-slate-800 text-sky-300 shadow border border-slate-700'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white'
                    }`}>
                    {m === 'day' ? '☀️ Day Mode' : '🌙 Night Mode'}
                  </button>
                ))}
              </div>

              {/* Blackout toggle — primary / danger button */}
              <button
                onClick={handleBlackoutToggle}
                disabled={simulating}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                  simulating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'
                } ${blackout
                  ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700 shadow-sm'
                  : 'bg-white border-red-400 text-red-600 hover:bg-red-50'}`}>
                {simulating
                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  : blackout
                    ? <><Wifi className="w-3.5 h-3.5" />Restore Grid</>
                    : <><WifiOff className="w-3.5 h-3.5" />Simulate Blackout</>}
              </button>

              {/* Role badge */}
              <div className={`ml-auto hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold
                ${isVillage ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                {isVillage ? <><BarChart2 className="w-3.5 h-3.5" />Village Macro View</> : <><Home className="w-3.5 h-3.5" />Household View</>}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            2. INTERACTIVE MICROGRID & BATTERY FLOW VISUALIZER
        ══════════════════════════════════════════════════════ */}
        <LightGlassCard id="visualizer-section" className="p-5 sm:p-6">
          {/* Light header strip */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                Live Energy Flow &amp; Storage Visualizer
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Stat pills — white glass with dark text */}
              <span className="text-xs font-bold text-amber-700 px-2.5 py-1 rounded-full border border-amber-200/80"
                style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
                {VS.totalGenKWh} kWh/day
              </span>
              <span className="text-slate-300 hidden sm:block text-xs">|</span>
              <span className="text-xs font-bold text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200/80"
                style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
                {VS.selfSuffPct}% self-sufficient
              </span>
              <span className="text-slate-300 hidden sm:block text-xs">|</span>
              <span className="text-xs font-bold text-cyan-700 px-2.5 py-1 rounded-full border border-cyan-200/80"
                style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
                {socPct}% BESS charged
              </span>
              {blackout && (
                <span className="flex items-center gap-1.5 text-xs font-bold bg-red-50 border border-red-300 text-red-600 px-2.5 py-1 rounded-full animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> ISLAND MODE
                </span>
              )}
            </div>
          </div>

          {/* Sub-status line — muted slate on light bg */}
          <p className="text-xs text-slate-500 mb-3">
            {mode === 'day'
              ? '☀️ Solar particles charging BESS + powering loads directly'
              : '🌿 Biogas + BESS discharge sustaining village overnight'}
            {blackout && '  ·  ⚡ Grid disconnected — PCC tripped'}
          </p>

          {/* 3-D Three.js isometric scene — lazy-loaded into its own JS chunk */}
          <React.Suspense fallback={
            <div className="w-full flex items-center justify-center rounded-xl border border-slate-200"
              style={{ height: 'clamp(300px, 45vw, 480px)', background: '#f8fafc' }}>
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                <span className="text-slate-400 text-xs font-medium tracking-wide">Loading 3D scene…</span>
              </div>
            </div>
          }>
            <MicrogridScene3D mode={mode} blackout={blackout} socPct={socPct} />
          </React.Suspense>

          {/* Legend — dark dots with muted slate labels on white */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center border-t border-slate-100 pt-3">
            {[
              { color: '#d97706', label: 'Solar Energy' },
              { color: '#059669', label: 'Biogas Energy' },
              { color: '#0891b2', label: 'Battery Discharge' },
              { color: '#64748b', label: 'Grid (when connected)' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: color }} />
                <span className="text-xs text-slate-500 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </LightGlassCard>

        {/* ══════════════════════════════════════════════════════
            3. CORE IMPACT METRICS BAR  — white cards
        ══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: <Sun className="w-5 h-5" />, liveColor: '#b45309',
              label: 'Total Generation',
              value: `${VS.totalGenKWh} kWh`,
              sub: `+${surplusKWh} kWh surplus/day`,
              iconBg: '#fef3c7', iconBorder: '#fcd34d',
            },
            {
              icon: <Zap className="w-5 h-5" />, liveColor: '#065f46',
              label: 'Self-Sufficiency',
              value: `${VS.selfSuffPct}%`,
              sub: 'of village demand met locally',
              iconBg: '#d1fae5', iconBorder: '#6ee7b7',
            },
            {
              icon: <div className="text-lg leading-none">🔋</div>, liveColor: socColor(socPct),
              label: 'Battery Reserve',
              value: `${socPct}%`,
              sub: `${Math.round(VS.bess.capacityKWh * socPct / 100)} kWh remaining`,
              iconBg: '#d1fae5', iconBorder: '#6ee7b7',
            },
            {
              icon: <div className="text-lg leading-none">🏠</div>, liveColor: '#0e7490',
              label: 'Household Backup',
              value: `${reserveHours}h`,
              sub: 'guaranteed backup per home',
              iconBg: '#cffafe', iconBorder: '#67e8f9',
            },
          ].map(({ icon, liveColor, label, value, sub, iconBg, iconBorder }) => (
            <div key={label}
              className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-2"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: iconBg, border: `1px solid ${iconBorder}` }}>
                <span style={{ color: liveColor }}>{icon}</span>
              </div>
              <div className="text-xl font-black leading-none tabular-nums" style={{ color: liveColor }}>{value}</div>
              <div className="text-xs font-semibold text-slate-700">{label}</div>
              <div className="text-[11px] text-slate-400">{sub}</div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════
            BATTERY STORAGE (BESS)  — full-width white card
        ══════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {/* Card header */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                Community Battery Storage
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">200 kWh · System Health
                <span className="text-emerald-600 font-bold"> {VS.bess.healthPct}%</span>
              </p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-lg">
              Live
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <BatteryGauge soc={socPct} reserveHours={reserveHours} />
            <div className="flex-1 w-full divide-y divide-slate-100">
              {[
                { label: 'Usable Energy',   value: `${Math.round(VS.bess.capacityKWh * socPct / 100)} kWh`, color: socColor(socPct) },
                { label: 'Charge Rate',     value: `${VS.bess.chargeRateKW} kW`,   color: '#059669' },
                { label: 'System Health',   value: `${VS.bess.healthPct}%`,          color: '#0891b2' },
                { label: 'Full Capacity',   value: `${VS.bess.capacityKWh} kWh`,     color: '#64748b' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between text-sm py-2">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-bold tabular-nums" style={{ color }}>{value}</span>
                </div>
              ))}
              {blackout && (
                <div className="mt-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
                  Backup Mode — Battery powering critical village loads
                </div>
              )}
            </div>
          </div>

          {/* Per-area self-sufficiency breakdown */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Per-Area Self-Sufficiency</div>
            <div className="space-y-2.5">
              {VS.areas.map(a => {
                const pct = Math.min(100, Math.round(((a.solar + a.biogas) / a.demand) * 100));
                const barColor = pct >= 80 ? '#059669' : pct >= 60 ? '#d97706' : '#dc2626';
                return (
                  <div key={a.name} className="flex items-center gap-3">
                    <span className="w-20 text-right text-xs text-slate-500 font-medium flex-shrink-0">{a.name}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                    <span className="w-9 text-right text-xs font-bold tabular-nums" style={{ color: barColor }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            4. HOW IT WORKS  — white cards, coloured step badges
        ══════════════════════════════════════════════════════ */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white">How the Community Microgrid Works</h2>
            <p className="text-sm text-slate-400 mt-0.5">The circular journey from waste to village-wide energy resilience</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HOW_CARDS.map((card) => (
              <div key={card.step}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full text-white text-sm font-black flex items-center justify-center flex-shrink-0"
                    style={{ background: card.color }}>
                    {card.step}
                  </div>
                  <span className="text-2xl">{card.emoji}</span>
                  <h3 className="text-sm font-bold text-slate-800 leading-snug">{card.title}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            5A. VILLAGE VIEW — Self-Sufficiency full bar
        ══════════════════════════════════════════════════════ */}
        {isVillage && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Village Self-Sufficiency Index</h2>
                <p className="text-xs text-slate-500 mt-0.5">Daily demand met entirely by local solar + biogas assets</p>
              </div>
              <span className="text-4xl font-black text-emerald-600 tabular-nums">{VS.selfSuffPct}%</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden bg-slate-100">
              <div className="h-full rounded-full"
                style={{ width: `${VS.selfSuffPct}%`, background: 'linear-gradient(90deg,#059669,#34d399,#86efac)', transition: 'width 1s ease' }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-400 font-medium">
              <span>0% — Full grid dependency</span>
              <span>100% — Fully energy independent</span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            5B. HOUSEHOLD VIEW — Contribution + Credits
        ══════════════════════════════════════════════════════ */}
        {!isVillage && (
          <div className="space-y-5">

            {/* Security badge full-width — white card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-2">Personal Energy Security</h2>
                  <SecurityBadge status={HS.security.status} hours={HS.security.backupHours} />
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-lg">
                    The community BESS has <strong className="text-emerald-600">{HS.security.backupHours} hours</strong> of
                    stored energy for your household's critical loads during any grid outage. You are part of a
                    self-reliant village grid.
                  </p>
                </div>
                {/* Mini radial backup */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <svg width={80} height={80} viewBox="0 0 80 80">
                    <circle cx={40} cy={40} r={30} fill="none" stroke="#e2e8f0" strokeWidth={9} />
                    <circle cx={40} cy={40} r={30} fill="none"
                      stroke="#059669" strokeWidth={9}
                      strokeDasharray={`${(HS.security.backupHours / 8) * 188} 188`}
                      strokeLinecap="round" transform="rotate(-90 40 40)"
                      style={{ transition: 'stroke-dasharray 0.8s ease' }} />
                    <text x={40} y={44} textAnchor="middle" fontSize={13} fontWeight={800}
                      fill="#059669" fontFamily="system-ui">{HS.security.backupHours}h</text>
                  </svg>
                  <span className="text-[11px] text-slate-400 text-center mt-1">of 8h max</span>
                </div>
              </div>
            </div>

            {/* ── Energy You're Sharing — live sliders ──────────── */}
            <LightCard className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">How much energy are you sharing today?</span>
                  <span className="text-[11px] text-slate-400">Move the sliders — your earnings update instantly below</span>
                </div>
              </div>
              <div className="space-y-6">
                {/* Solar slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">☀️ Solar energy shared</span>
                    <span className="text-sm font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 tabular-nums">
                      {solarSurplus.toFixed(1)} kWh/day
                    </span>
                  </div>
                  <input
                    type="range" min={0} max={12} step={0.1}
                    value={solarSurplus}
                    onChange={e => setSolarSurplus(+e.target.value)}
                    className="w-full cursor-pointer"
                    style={{ accentColor: '#d97706' }}
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>None</span><span>12 kWh max</span>
                  </div>
                </div>
                {/* Biogas slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">🌿 Biogas energy shared</span>
                    <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 tabular-nums">
                      {biogasSurplus.toFixed(1)} kWh/day
                    </span>
                  </div>
                  <input
                    type="range" min={0} max={8} step={0.1}
                    value={biogasSurplus}
                    onChange={e => setBiogasSurplus(+e.target.value)}
                    className="w-full cursor-pointer"
                    style={{ accentColor: '#059669' }}
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>None</span><span>8 kWh max</span>
                  </div>
                </div>
              </div>
            </LightCard>

            {/* Contribution + Credits side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Contribution card — live values from hook */}
              <LightCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="font-bold text-slate-900 text-sm">My Microgrid Contribution</span>
                </div>
                <div className="text-4xl font-black text-emerald-600 mb-1 tabular-nums">
                  {totalSurplus} <span className="text-lg font-semibold text-slate-400">kWh</span>
                </div>
                <div className="text-xs text-slate-500 mb-4">Excess energy shared today</div>
                <div className="space-y-2">
                  {[
                    { dot: 'bg-amber-400', label: 'Solar surplus', val: `${solarSurplus.toFixed(1)} kWh` },
                    { dot: 'bg-emerald-500', label: 'Biogas surplus', val: `${biogasSurplus.toFixed(1)} kWh` },
                  ].map(({ dot, label, val }) => (
                    <div key={label} className="flex items-center gap-2 text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
                      <span className="flex-1 text-slate-600">{label}</span>
                      <span className="font-bold text-slate-900">{val}</span>
                    </div>
                  ))}
                </div>
                {/* Split bar */}
                <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden flex">
                  <div className="h-full bg-amber-400 transition-all duration-300"
                    style={{ width: totalSurplus > 0 ? `${(solarSurplus / totalSurplus) * 100}%` : '50%' }} />
                  <div className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: totalSurplus > 0 ? `${(biogasSurplus / totalSurplus) * 100}%` : '50%' }} />
                </div>
              </LightCard>

              {/* Credits card — live values from hook */}
              <LightCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="font-bold text-slate-900 text-sm">Energy Credits Earned</span>
                </div>
                <div className="flex items-end gap-4 mb-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">This Month (est.)</div>
                    <div className="text-3xl font-black text-amber-500 tabular-nums">₹{thisMonthEarnings}</div>
                  </div>
                  <div className="pb-0.5">
                    <div className="text-xs text-slate-500 mb-0.5">Total Earned</div>
                    <div className="text-xl font-bold text-slate-900 tabular-nums">₹{totalEarned}</div>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
                  <strong>Credit Rate: ₹{creditRate}/kWh</strong> — Earned for every kWh of
                  solar or biogas surplus shared with your neighbours.
                </div>
              </LightCard>
            </div>

            {/* Compact ledger — live first row from hook */}
            <LightCard className="p-5">
              <h2 className="text-base font-bold text-slate-900 mb-4">
                Energy Credits Ledger
                <span className="ml-2 text-xs font-medium text-slate-400">Monthly record</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Month', 'Solar (kWh)', 'Biogas (kWh)', 'Earned', 'Running Total'].map(h => (
                        <th key={h} className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 pr-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ledger.map((row, i) => (
                      <tr key={row.month} className={i === 0 ? 'bg-emerald-50' : ''}>
                        <td className="py-2.5 pr-3 font-semibold text-slate-900">
                          {row.month}{i === 0 && <span className="ml-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">live</span>}
                        </td>
                        <td className="py-2.5 pr-3 text-amber-600 font-medium tabular-nums">{row.solar.toFixed(1)}</td>
                        <td className="py-2.5 pr-3 text-emerald-600 font-medium tabular-nums">{row.biogas.toFixed(1)}</td>
                        <td className="py-2.5 pr-3">
                          <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full text-xs">+₹{row.earned}</span>
                        </td>
                        <td className="py-2.5 font-bold text-slate-900 tabular-nums">₹{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </LightCard>
          </div>
        )}

      </div>
    </div>
  );
}
