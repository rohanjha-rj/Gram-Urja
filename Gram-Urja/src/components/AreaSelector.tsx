import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { DEMO_AREAS } from '../data/demoData';
import { getAllAreaAnalyses } from '../services/energyService';

const analyses = getAllAreaAnalyses();

function getPriorityLabel(index: number): { label: string; color: string } {
  if (index >= 75) return { label: 'High',     color: 'bg-red-100 text-red-700 border-red-200' };
  if (index >= 50) return { label: 'Medium',   color: 'bg-amber-100 text-amber-700 border-amber-200' };
  if (index >= 30) return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
  return               { label: 'Low',      color: 'bg-green-100 text-green-700 border-green-200' };
}

interface AreaSelectorProps {
  selectedAreaId: string;
  onSelect: (id: string) => void;
  label?: string;
  className?: string;
}

export default function AreaSelector({ selectedAreaId, onSelect, label = 'Viewing data for:', className = '' }: AreaSelectorProps) {
  const selected = DEMO_AREAS.find((a) => a.id === selectedAreaId) ?? DEMO_AREAS[0];
  const analysis = analyses.find((a) => a.area.id === selectedAreaId);
  const priorityInfo = getPriorityLabel(analysis?.priorityIndex ?? 50);

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
        <MapPin className="w-4 h-4 text-green-600" />
        {label}
      </div>
      <div className="relative">
        <select
          value={selectedAreaId}
          onChange={(e) => onSelect(e.target.value)}
          className="appearance-none pl-3 pr-8 py-2 text-sm font-semibold bg-white border-2 border-green-300 rounded-xl text-gray-800 focus:outline-none focus:border-green-500 cursor-pointer shadow-sm"
        >
          {DEMO_AREAS.map((area) => {
            const a = analyses.find((x) => x.area.id === area.id);
            const p = getPriorityLabel(a?.priorityIndex ?? 50).label;
            return (
              <option key={area.id} value={area.id}>
                {area.name} · {area.population.toLocaleString()} people · {p} Priority
              </option>
            );
          })}
        </select>
        <ChevronDown className="w-4 h-4 text-green-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {/* Info chips */}
      <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">
        Pop: {selected.population.toLocaleString()}
      </span>
      <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">
        {selected.households} households
      </span>
      {analysis && (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${priorityInfo.color}`}>
          {priorityInfo.label} Priority
        </span>
      )}
    </div>
  );
}
