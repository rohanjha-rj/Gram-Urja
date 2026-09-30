const fs = require('fs');

// 1. Add HOUSEHOLD_RECOMMENDATIONS to recommendations.ts
const dataPath = '/Users/saumyaprincep/IBM$/Gram-Urja/src/data/recommendations.ts';
let dataContent = fs.readFileSync(dataPath, 'utf8');

const householdRecs = `
export const HOUSEHOLD_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-hh-solar',
    areaId: 'household',
    category: 'solar',
    priority: 'critical',
    title: 'Install 2 kW Rooftop Solar System',
    problem: 'Your household consumes 126 kWh/month entirely from the grid, leading to high electricity bills.',
    rootCause: 'No solar panels installed on available rooftop space (~1200 sq ft).',
    intervention: 'Install a 2 kW solar system. Requires ~150 sq ft of your rooftop.',
    currentValue: '100% grid-dependent',
    expectedValue: '~240 kWh/month solar generation (100% offset + export)',
    energySavingsKWhPerMonth: 126,
    costSavingsINRPerMonth: 750,
    co2ImpactKgPerMonth: 103,
    investmentINR: 120000,
    paybackMonths: 60,
    beneficiaries: 'Your household',
    implementationTime: '1-2 weeks',
  },
  {
    id: 'rec-hh-waste',
    areaId: 'household',
    category: 'waste',
    priority: 'high',
    title: 'Set Up Home Biogas Unit',
    problem: '6 kg/day of cow dung and 2 kg/day of food waste is currently unutilized.',
    rootCause: 'Lack of organic waste processing at home.',
    intervention: 'Install a 2 cubic meter portable home biogas unit.',
    currentValue: '0% organic waste utilized',
    expectedValue: 'Up to 2 hours of cooking gas per day',
    energySavingsKWhPerMonth: 30,
    costSavingsINRPerMonth: 400,
    co2ImpactKgPerMonth: 45,
    investmentINR: 25000,
    paybackMonths: 62,
    beneficiaries: 'Your household',
    implementationTime: '1 week',
  },
  {
    id: 'rec-hh-lighting',
    areaId: 'household',
    category: 'lighting',
    priority: 'medium',
    title: 'Upgrade to Energy Efficient LEDs',
    problem: 'Using incandescent or CFL bulbs consumes significantly more electricity for lighting.',
    rootCause: 'Older lighting fixtures still in use.',
    intervention: 'Replace 5 traditional bulbs with 9W LED bulbs.',
    currentValue: 'High energy consumption for lighting',
    expectedValue: '70% reduction in lighting electricity usage',
    energySavingsKWhPerMonth: 15,
    costSavingsINRPerMonth: 90,
    co2ImpactKgPerMonth: 12,
    investmentINR: 500,
    paybackMonths: 6,
    beneficiaries: 'Your household',
    implementationTime: '1 day',
  }
];
`;

if (!dataContent.includes('HOUSEHOLD_RECOMMENDATIONS')) {
  dataContent += householdRecs;
  fs.writeFileSync(dataPath, dataContent, 'utf8');
}


// 2. Modify RecommendationsPage.tsx
const pagePath = '/Users/saumyaprincep/IBM$/Gram-Urja/src/pages/RecommendationsPage.tsx';
let pageContent = fs.readFileSync(pagePath, 'utf8');

if (!pageContent.includes('HOUSEHOLD_RECOMMENDATIONS')) {
  pageContent = pageContent.replace(
    `import { DEMO_RECOMMENDATIONS } from '../data/recommendations';`,
    `import { DEMO_RECOMMENDATIONS, HOUSEHOLD_RECOMMENDATIONS } from '../data/recommendations';\nimport { useAuth } from '../context/AuthContext';`
  );
}

// Update the component logic
const oldLogic = `export default function RecommendationsPage() {
  const { t, isHindi } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState('motipur');
  const filtered = DEMO_RECOMMENDATIONS
    .filter((r) => r.areaId === selectedAreaId)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);`;

const newLogic = `export default function RecommendationsPage() {
  const { t, isHindi } = useLanguage();
  const { role } = useAuth();
  const isCitizen = role === 'citizen';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState('motipur');
  
  const recommendationsSource = isCitizen ? HOUSEHOLD_RECOMMENDATIONS : DEMO_RECOMMENDATIONS;
  const filtered = recommendationsSource
    .filter((r) => isCitizen ? true : r.areaId === selectedAreaId)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);`;

pageContent = pageContent.replace(oldLogic, newLogic);

// Hide AreaSelector for households
const oldAreaSelector = `<div className="mt-4">
          <AreaSelector selectedAreaId={selectedAreaId} onSelect={(id) => { setSelectedAreaId(id); }} />
        </div>`;
const newAreaSelector = `{!isCitizen && (
        <div className="mt-4">
          <AreaSelector selectedAreaId={selectedAreaId} onSelect={(id) => { setSelectedAreaId(id); }} />
        </div>
        )}`;

pageContent = pageContent.replace(oldAreaSelector, newAreaSelector);

// Change "Viewing data for:" label if needed. Actually it's inside AreaSelector.
// We might also want to change the text "Priority Action Recommendations".
// Let's also check if "Viewing data for:" is in AreaSelector or in RecommendationsPage.
// In RecommendationsPage, the AreaSelector handles it. So if we hide AreaSelector, we hide that.
// Let's add a small text for Household.

const newAreaSelectorReplacement = `{!isCitizen ? (
          <div className="mt-4">
            <AreaSelector selectedAreaId={selectedAreaId} onSelect={(id) => { setSelectedAreaId(id); }} />
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2">
             <span className="text-sm font-medium text-gray-500">{isHindi ? 'के लिए डेटा देख रहे हैं:' : 'Viewing data for:'}</span>
             <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 text-sm font-bold flex items-center gap-1.5 shadow-sm">
                <Users className="w-4 h-4" /> {isHindi ? 'आपका परिवार' : 'Your Household'}
             </span>
          </div>
        )}`;

pageContent = pageContent.replace(newAreaSelector, newAreaSelectorReplacement);

fs.writeFileSync(pagePath, pageContent, 'utf8');

console.log('Update complete');
