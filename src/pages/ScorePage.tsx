import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { Award, TrendingUp, HelpCircle } from 'lucide-react';
import { getAllAreaAnalyses } from '../services/energyService';
import { calculateSustainabilityScoreBreakdown } from '../calculations/engine';
import { SectionCard, DemoBadge, ScoreRing, ProgressBar, AssumptionBox } from '../components/ui';
import AreaSelector from '../components/AreaSelector';
import type { AreaAnalysis } from '../types';

const areas = getAllAreaAnalyses();

const GRADE_COLORS: Record<string, string> = {
  'A+': 'text-green-600 bg-green-50 border-green-200',
  'A': 'text-green-500 bg-green-50 border-green-100',
  'B+': 'text-blue-600 bg-blue-50 border-blue-200',
  'B': 'text-blue-500 bg-blue-50 border-blue-100',
  'C': 'text-amber-600 bg-amber-50 border-amber-200',
  'D': 'text-red-600 bg-red-50 border-red-200',
};

export default function ScorePage() {
  const [selectedAreaId, setSelectedAreaId] = useState(areas[0].area.id);
  const selectedAnalysis = areas.find((a) => a.area.id === selectedAreaId) ?? areas[0];
  const { area, solarPotential, wasteAnalysis, waterAnalysis } = selectedAnalysis;
  const breakdown = calculateSustainabilityScoreBreakdown(area, solarPotential, wasteAnalysis, waterAnalysis);

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const radarData = breakdown.categories.map((c) => ({
    subject: c.name.split(' ')[0],
    score: c.score,
    fullMark: 100,
  }));

  // All areas comparison
  const allScores = areas.map((a) => {
    const bd = calculateSustainabilityScoreBreakdown(a.area, a.solarPotential, a.wasteAnalysis, a.waterAnalysis);
    return { name: a.area.name, score: bd.total, grade: bd.grade };
  });

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(150deg, #052e16 0%, #14532d 50%, #052e16 100%)' }}>
      {/* Circular ripple background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[150, 300, 450, 600].map((r, i) => (
          <div key={i} className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-green-500/10 pulse-ring"
            style={{ width: `${r}px`, height: `${r}px`, animationDelay: `${i * 0.7}s` }} />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
      <div className="glass-card rounded-2xl p-5 mb-6 fade-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-500" /> Sustainability Score
            </h1>
            <p className="text-gray-500 text-sm mt-1">Transparent weighted scoring · 6 categories · Trend over time</p>
          </div>
          <DemoBadge />
        </div>
        <AreaSelector selectedAreaId={selectedAreaId} onSelect={setSelectedAreaId} />
      </div>

      {/* removed old inline selector */}
      <div className="hidden">
      </div>

      {/* Score hero */}
      <div className="bg-gradient-to-br from-purple-800 to-indigo-900 text-white rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-purple-300 text-sm mb-1">{area.name} · Suryapur Region</div>
            <div className="flex items-end gap-4">
              <div>
                <div className="text-7xl font-extrabold">{breakdown.total}</div>
                <div className="text-purple-300 text-sm">out of 100</div>
              </div>
              <div className={`text-4xl font-bold px-4 py-2 rounded-xl border ${GRADE_COLORS[breakdown.grade]}`}>
                {breakdown.grade}
              </div>
            </div>
          </div>
          <div className="relative">
            <ScoreRing score={breakdown.total} size={120} strokeWidth={12} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-extrabold">{breakdown.total}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Category scores */}
        <SectionCard title="Score Breakdown" subtitle="Click category to see details" icon={<TrendingUp className="w-4 h-4" />}>
          <DemoBadge className="mb-4" />
          <div className="space-y-3">
            {breakdown.categories.map((cat) => (
              <div key={cat.name}>
                <button
                  onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                  className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">weight {(cat.weight * 100).toFixed(0)}%</span>
                        <span className="text-sm font-bold text-gray-900">{cat.score}/100</span>
                        <HelpCircle className="w-3 h-3 text-blue-400" />
                      </div>
                    </div>
                    <ProgressBar
                      value={cat.score}
                      color={cat.score >= 60 ? 'bg-green-500' : cat.score >= 40 ? 'bg-amber-500' : 'bg-red-400'}
                    />
                  </div>
                </button>
                {expandedCategory === cat.name && (
                  <div className="mx-2 mt-1 mb-2 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
                    <div className="font-semibold mb-1">How calculated:</div>
                    <div>{cat.rationale}</div>
                    <div className="mt-2">
                      <strong>Weighted contribution to total:</strong> {cat.score.toFixed(0)} × {(cat.weight * 100).toFixed(0)}% = {(cat.score * cat.weight).toFixed(1)} points
                    </div>
                    {cat.indicators.map((ind) => (
                      <div key={ind.label} className="mt-1">
                        <strong>{ind.label}:</strong> {ind.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <AssumptionBox items={[
            { label: 'Energy Efficiency', value: '25% weight' },
            { label: 'Renewable Adoption', value: '20% weight' },
            { label: 'Solar Utilization', value: '15% weight' },
            { label: 'Water Sustainability', value: '15% weight' },
            { label: 'Waste-to-Energy', value: '10% weight' },
            { label: 'Infrastructure', value: '15% weight' },
          ]} />
        </SectionCard>

        {/* Radar chart */}
        <SectionCard title="Radar Profile" subtitle="Category balance visualization">
          <DemoBadge className="mb-4" />
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#374151' }} />
              <Radar name={area.name} dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Trend over time */}
      <SectionCard title="Score Trend (Last 6 Months)" subtitle="Demo trajectory" className="mb-6">
        <DemoBadge className="mb-4" />
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={breakdown.trend} margin={{ left: -10 }}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [v, 'Score']} />
            <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4, fill: '#7c3aed' }} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* All areas comparison */}
      <SectionCard title="All Areas — Score Comparison">
        <DemoBadge className="mb-4" />
        <div className="space-y-3">
          {allScores.sort((a, b) => b.score - a.score).map((s) => (
            <div key={s.name} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-gray-700">{s.name}</div>
              <div className="flex-1">
                <ProgressBar
                  value={s.score}
                  color={s.score >= 60 ? 'bg-green-500' : s.score >= 40 ? 'bg-amber-500' : 'bg-red-400'}
                  label={`${s.score}/100 · ${s.grade}`}
                />
              </div>
              <div className={`text-sm font-bold px-2 py-0.5 rounded border ${GRADE_COLORS[s.grade]}`}>{s.grade}</div>
            </div>
          ))}
        </div>
      </SectionCard>
      </div>
    </div>
  );
}
