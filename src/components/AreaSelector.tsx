import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { DEMO_AREAS } from '../data/demoData';
import { getAllAreaAnalyses } from '../services/energyService';
import { useLanguage } from '../context/LanguageContext';

const analyses = getAllAreaAnalyses();

interface AreaSelectorProps {
  selectedAreaId: string;
  onSelect: (id: string) => void;
  label?: string;
  className?: string;
}

export default function AreaSelector({ selectedAreaId, onSelect, label, className = '' }: AreaSelectorProps) {
  const { isHindi } = useLanguage();
  const selected = DEMO_AREAS.find((a) => a.id === selectedAreaId) ?? DEMO_AREAS[0];
  const analysis = analyses.find((a) => a.area.id === selectedAreaId);

  const displayLabel = label ?? (isHindi ? 'डेटा देखें:' : 'Viewing data for:');

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <MapPin className="w-4 h-4 text-emerald-600" />
        {displayLabel}
      </div>
      <div className="relative">
        <select
          value={selectedAreaId}
          onChange={(e) => onSelect(e.target.value)}
          className="appearance-none pl-3 pr-8 py-2 text-sm font-semibold bg-white border-2 border-emerald-300 rounded-xl text-gray-800 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
        >
          {DEMO_AREAS.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name} · {area.population.toLocaleString()} {isHindi ? 'निवासी' : 'people'}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-emerald-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {/* Info chips */}
      <span className="text-xs text-gray-600 bg-gray-100/90 rounded-full px-2.5 py-1 font-medium">
        {isHindi ? 'जनसंख्या:' : 'Pop:'} {selected.population.toLocaleString()}
      </span>
      <span className="text-xs text-gray-600 bg-gray-100/90 rounded-full px-2.5 py-1 font-medium">
        {selected.households} {isHindi ? 'परिवार' : 'households'}
      </span>
      {analysis && (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
          {analysis.renewablePercent.toFixed(0)}% {isHindi ? 'नवीकरणीय' : 'Renewable'}
        </span>
      )}
    </div>
  );
}
