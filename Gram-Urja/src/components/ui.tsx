import React from 'react';
import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';

// ─── Demo Badge ───────────────────────────────────────────────────────────────
export function DemoBadge({ className = '' }: { className?: string }) {
  return null;
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
const priorityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border ${priorityColors[priority] ?? 'bg-gray-100 text-gray-600'}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

// ─── Severity Badge ───────────────────────────────────────────────────────────
export function SeverityBadge({ severity, status }: { severity: string; status?: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-red-600 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-blue-500 text-white',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${colors[severity] ?? 'bg-gray-500 text-white'}`}>
      {severity.toUpperCase()}
      {status === 'resolved' && <span className="ml-1 opacity-75">✓</span>}
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  subtitle?: string;
  formula?: string;
  source?: string;
  dataType?: string;
}

export function KpiCard({ title, value, unit, icon, iconBg = 'bg-green-100', trend, trendLabel, subtitle, formula, source, dataType }: KpiCardProps) {
  const [showFormula, setShowFormula] = React.useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          {icon}
        </div>
        {dataType && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 font-medium">
            {dataType}
          </span>
        )}
      </div>
      <div className="mb-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
      </div>
      <div className="text-sm text-gray-500 font-medium mb-2">{title}</div>
      {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-green-500' : 'text-gray-400'}`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          {trendLabel}
        </div>
      )}
      {formula && (
        <button
          onClick={() => setShowFormula((v) => !v)}
          className="flex items-center gap-1 mt-2 text-xs text-blue-500 hover:text-blue-700"
        >
          <HelpCircle className="w-3 h-3" />
          How calculated?
        </button>
      )}
      {showFormula && formula && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800 border border-blue-100">
          <strong>Formula:</strong> {formula}
          {source && <div className="mt-1 text-blue-600"><strong>Source:</strong> {source}</div>}
        </div>
      )}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
export function SectionCard({
  title,
  subtitle,
  icon,
  badge,
  children,
  className = '',
  headerColor = '',
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerColor?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className={`px-6 py-4 border-b border-gray-100 ${headerColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && <div className="text-gray-600">{icon}</div>}
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {badge}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Assumption Box ───────────────────────────────────────────────────────────
export function AssumptionBox({ items }: { items: { label: string; value: string }[] }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mt-3">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
        <HelpCircle className="w-3 h-3" />
        {open ? 'Hide assumptions' : 'Show assumptions'}
      </button>
      {open && (
        <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-3 grid grid-cols-2 gap-1.5">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col">
              <span className="text-xs font-medium text-blue-800">{item.label}</span>
              <span className="text-xs text-blue-600">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
export function ScoreRing({ score, size = 80, strokeWidth = 8 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#16a34a' : score >= 50 ? '#f59e0b' : score >= 35 ? '#f97316' : '#ef4444';

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'bg-green-500', label }: { value: number; max?: number; color?: string; label?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      {label && <div className="flex justify-between text-xs text-gray-600 mb-1"><span>{label}</span><span>{value.toFixed(1)}%</span></div>}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────
export function StatRow({ label, value, unit, highlight }: { label: string; value: string | number; unit?: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 border-b border-gray-50 last:border-0 ${highlight ? 'bg-green-50 -mx-2 px-2 rounded' : ''}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-green-700' : 'text-gray-900'}`}>
        {value}{unit && <span className="font-normal text-gray-500 ml-1">{unit}</span>}
      </span>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-gray-300 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-sm">{description}</p>
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            active === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── Color-coded Number ───────────────────────────────────────────────────────
export function ColorNumber({ value, good = 'low', className = '' }: { value: number; good?: 'low' | 'high'; className?: string }) {
  const isGood = good === 'high' ? value >= 60 : value <= 40;
  return (
    <span className={`font-bold ${isGood ? 'text-green-600' : value >= 70 ? 'text-red-600' : 'text-amber-600'} ${className}`}>
      {value}
    </span>
  );
}
