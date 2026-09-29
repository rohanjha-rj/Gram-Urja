import type { ChatMessage } from '../types';
import { getAllAreaAnalyses, getRegionTotals } from '../services/energyService';
import { calculateBiogas, calculateRainwaterHarvesting, ASSUMPTIONS } from '../calculations/engine';
import { DEMO_RECOMMENDATIONS } from '../data/recommendations';

const analyses = getAllAreaAnalyses();
const totals = getRegionTotals();

function findArea(q: string) {
  return analyses.find((a) => q.toLowerCase().includes(a.area.name.toLowerCase()));
}

function formatINR(n: number) {
  return n >= 100000 ? `₹${(n / 100000).toFixed(2)} lakh` : `₹${n.toLocaleString()}`;
}

const GREETINGS = ['hello', 'hi', 'namaste', 'hey', 'नमस्ते'];
const SOLAR_KEYWORDS = ['solar', 'panel', 'sun', 'rooftop', 'generation', 'सौर'];
const WATER_KEYWORDS = ['water', 'rainwater', 'pump', 'demand', 'पानी', 'वर्षा'];
const WASTE_KEYWORDS = ['waste', 'biogas', 'dung', 'organic', 'कचरा', 'बायोगैस'];
const ENERGY_KEYWORDS = ['energy', 'consumption', 'electricity', 'kWh', 'बिजली', 'खपत'];
const COST_KEYWORDS = ['cost', 'bill', 'price', 'savings', 'लागत', 'बचत'];
const SCORE_KEYWORDS = ['score', 'grade', 'sustainability', 'rating', 'स्कोर'];
const REC_KEYWORDS = ['recommendation', 'suggest', 'improve', 'action', 'सुझाव'];
const HELP_KEYWORDS = ['help', 'what can', 'how do', 'कैसे', 'मदद'];

export function generateAIResponse(userMessage: string): ChatMessage {
  const q = userMessage.toLowerCase().trim();
  let content = '';
  let navigationSuggestion: string | undefined;
  let relatedMetric: string | undefined;
  const now = new Date().toISOString();

  // Greetings
  if (GREETINGS.some((g) => q.startsWith(g))) {
    content = `नमस्ते! Hello! I'm GreenGrid AI, your sustainability assistant for the **Bihar Village Sustainability Region**.

I can help you with:
• Energy consumption & cost analysis
• Solar potential calculations
• Water demand & rainwater harvesting
• Biogas potential from organic waste
• Sustainability scores & recommendations
• Alert explanations

What would you like to know? Try asking: *"What is Motipur's monthly energy cost?"* or *"Which area has the highest solar potential?"*`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language: 'en' };
  }

  // Help
  if (HELP_KEYWORDS.some((k) => q.includes(k))) {
    content = `I can answer questions like:

**Energy:** "What is [area] monthly consumption?" · "Which area consumes the most per household?"
**Solar:** "What is [area] solar potential?" · "How many panels can fit in Motipur?"
**Water:** "How much rainwater can Amra harvest?" · "What is Oiara's water demand?"
**Waste:** "What is the biogas potential of Motipur?"
**Cost:** "How much does Korha spend on electricity?"
**Scores:** "What is Barouni's sustainability score?"
**Recommendations:** "What is the top recommendation?" · "How can Amra improve?"
**Region:** "Give me the region overview"`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language: 'en' };
  }

  // Region overview
  if (q.includes('region') || q.includes('overview') || q.includes('all areas') || q.includes('summary')) {
    content = `**Bihar Village Sustainability Region — Overview**

| Metric | Value |
|--------|-------|
| Areas monitored | ${totals.areas} |
| Total households | ${totals.totalHH.toLocaleString()} |
| Total population | ${totals.totalPop.toLocaleString()} |
| Monthly consumption | ${(totals.totalKWh / 1000).toFixed(1)}k kWh |
| Monthly electricity cost | ${formatINR(totals.totalCost)} |
| Monthly CO₂ emissions | ${(totals.totalCO2 / 1000).toFixed(1)} tonnes |

**Priority areas for action:** Motipur (highest consumption, solar unverified) and Amra (zero renewable, high cost).`;
    navigationSuggestion = '/village';
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language: 'en', navigationSuggestion };
  }

  // Specific area queries
  const matchedAnalysis = findArea(q);

  if (matchedAnalysis) {
    const { area, energyBreakdown, solarPotential, waterAnalysis, wasteAnalysis, monthlyCostINR, co2KgPerMonth, sustainabilityScore } = matchedAnalysis;

    if (ENERGY_KEYWORDS.some((k) => q.includes(k)) || COST_KEYWORDS.some((k) => q.includes(k))) {
      content = `**${area.name} — Energy & Cost Analysis** *(Demo Data)*

• Monthly consumption: **${area.monthlyElectricity.toLocaleString()} kWh**
• Per-household: **${(area.monthlyElectricity / area.households).toFixed(1)} kWh/household**
• Monthly electricity cost: **${formatINR(monthlyCostINR)}**
• CO₂ emissions: **${(co2KgPerMonth / 1000).toFixed(2)} tonnes/month**

**Breakdown:**
- Households: ${energyBreakdown.households.toLocaleString()} kWh
- Streetlights: ${energyBreakdown.streetlights.toLocaleString()} kWh
- Water pumps: ${energyBreakdown.waterPumps.toLocaleString()} kWh
- Schools: ${energyBreakdown.schools.toLocaleString()} kWh

*Formula: Cost = kWh × ₹${ASSUMPTIONS.tariffINRPerKWh}/kWh (demo tariff)*`;
      navigationSuggestion = '/village';
      relatedMetric = 'energy';
    } else if (SOLAR_KEYWORDS.some((k) => q.includes(k))) {
      content = `**${area.name} — Solar Potential** *(Demo Data)*

• Current solar: **${area.infrastructure.solar.installedCapacity} kW** installed
• Feasible additional capacity: **${solarPotential.feasibleCapacityKW} kW**
• Monthly generation potential: **${solarPotential.monthlyGenerationKWh.toLocaleString()} kWh**
• Consumption offset: **${solarPotential.offsetPercent}%**
• CO₂ avoided: **${(solarPotential.co2AvoidedKgPerMonth / 1000).toFixed(2)} t/month**
• Estimated investment: **${formatINR(solarPotential.estimatedCostINR)}**
• Payback period: **${solarPotential.paybackYears} years**

*Based on: 9.29 m² per kW, 4.5 kWh/kW/day irradiation, 70% usable roof area*`;
      navigationSuggestion = '/solar';
      relatedMetric = 'solar';
    } else if (WATER_KEYWORDS.some((k) => q.includes(k))) {
      content = `**${area.name} — Water Analysis** *(Demo Data)*

• Daily water demand: **${(waterAnalysis.dailyDemandLitres / 1000).toFixed(2)} kL/day**
• Monthly demand: **${(waterAnalysis.monthlyDemandLitres / 1000).toFixed(1)} kL/month**
• Pump energy: **${waterAnalysis.pumpEnergyKWhPerMonth.toLocaleString()} kWh/month**
• Rainwater potential: **${(waterAnalysis.rainwaterPotentialLitresPerYear / 1000).toFixed(0)} kL/year**
• Rainwater offset: **${waterAnalysis.rainwaterOffsetPercent}%** of monthly demand

*LPCD: 55 L/person/day (rural) · Runoff coefficient: 0.80*`;
      navigationSuggestion = '/overview';
      relatedMetric = 'water';
    } else if (WASTE_KEYWORDS.some((k) => q.includes(k))) {
      content = `**${area.name} — Waste & Biogas** *(Demo Data)*

• Cow dung input: **${area.cowDungKgPerDay} kg/day**
• Food waste: **${area.foodWasteKgPerDay} kg/day**
• Agri waste: **${area.agriWasteKgPerDay} kg/day**
• Biogas potential: **${wasteAnalysis.biogasM3PerDay.toFixed(2)} m³/day**
• Thermal energy: **${wasteAnalysis.thermalEnergyKWhPerDay.toFixed(2)} kWh/day**
• Electricity potential: **${(wasteAnalysis.electricityKWhPerDay * 30).toFixed(1)} kWh/month**
• CO₂ offset: **${(wasteAnalysis.co2OffsetKgPerMonth / 1000).toFixed(3)} t/month**

*Assumptions: 0.04 m³/kg (cow dung), 0.06 m³/kg (food), 0.02 m³/kg (agri)*`;
      navigationSuggestion = '/waste';
      relatedMetric = 'waste';
    } else if (SCORE_KEYWORDS.some((k) => q.includes(k))) {
      content = `**${area.name} — Sustainability Score** *(Demo Data)*

Score: **${sustainabilityScore}/100**

Key factors affecting the score:
• Per-household consumption: ${(area.monthlyElectricity / area.households).toFixed(1)} kWh/HH
• Solar installed: ${area.infrastructure.solar.installedCapacity} kW (${solarPotential.offsetPercent.toFixed(1)}% offset)
• Rainwater offset: ${waterAnalysis.rainwaterOffsetPercent.toFixed(1)}%
• Streetlight type: ${area.infrastructure.streetlights.type.toUpperCase()}

To improve: Install solar (biggest impact), optimize streetlights if non-LED, set up rainwater harvesting.`;
      navigationSuggestion = '/score';
    } else {
      // General area info
      content = `**${area.name}** (${area.type.replace('_', ' ')})

• Population: ${area.population.toLocaleString()} · ${area.households} households
• Monthly electricity: ${area.monthlyElectricity.toLocaleString()} kWh
• Monthly cost: ${formatINR(monthlyCostINR)}
• Sustainability score: **${sustainabilityScore}/100**
• Solar installed: ${area.infrastructure.solar.installedCapacity} kW
• Solar potential: ${solarPotential.feasibleCapacityKW} kW

Ask me about energy, solar, water, waste, or score for ${area.name}!`;
      navigationSuggestion = '/village';
    }

    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language: 'en', navigationSuggestion, relatedMetric };
  }

  // Highest/lowest queries (no specific area)
  if (q.includes('highest') || q.includes('most') || q.includes('top')) {
    if (ENERGY_KEYWORDS.some((k) => q.includes(k))) {
      const top = [...analyses].sort((a, b) => b.area.monthlyElectricity - a.area.monthlyElectricity)[0];
      content = `**Highest Energy Consumption:** ${top.area.name} with **${top.area.monthlyElectricity.toLocaleString()} kWh/month** (${top.area.households} households · ${(top.area.monthlyElectricity / top.area.households).toFixed(1)} kWh/HH).
      
This is ${(top.area.monthlyElectricity / analyses.reduce((s, a) => s + a.area.monthlyElectricity, 0) * 100).toFixed(1)}% of the region's total consumption.`;
      navigationSuggestion = '/village';
    } else if (SOLAR_KEYWORDS.some((k) => q.includes(k))) {
      const top = [...analyses].sort((a, b) => b.solarPotential.feasibleCapacityKW - a.solarPotential.feasibleCapacityKW)[0];
      content = `**Highest Solar Potential:** ${top.area.name} with **${top.solarPotential.feasibleCapacityKW} kW** feasible capacity — could generate ${top.solarPotential.monthlyGenerationKWh.toLocaleString()} kWh/month and offset ${top.solarPotential.offsetPercent.toFixed(1)}% of consumption.`;
      navigationSuggestion = '/solar';
    } else if (SCORE_KEYWORDS.some((k) => q.includes(k))) {
      const top = [...analyses].sort((a, b) => b.sustainabilityScore - a.sustainabilityScore)[0];
      content = `**Highest Sustainability Score:** ${top.area.name} with **${top.sustainabilityScore}/100** — leading in renewable adoption (${top.area.infrastructure.solar.installedCapacity} kW solar installed).`;
      navigationSuggestion = '/score';
    } else {
      content = `Could you specify what you're looking for? I can find the highest/most for: energy consumption, solar potential, sustainability score, or water demand.`;
    }
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language: 'en', navigationSuggestion };
  }

  // Recommendations
  if (REC_KEYWORDS.some((k) => q.includes(k))) {
    const top3 = DEMO_RECOMMENDATIONS.slice(0, 3);
    content = `**Top 3 Recommendations** by priority:

${top3.map((r, i) => `**${i + 1}. ${r.title}**
- Area: ${r.areaId} · Priority: ${r.priority}
- Savings: ₹${r.costSavingsINRPerMonth.toLocaleString()}/month · Payback: ${r.paybackMonths} months
- ${r.intervention}`).join('\n\n')}

View all ${DEMO_RECOMMENDATIONS.length} recommendations on the Recommendations page.`;
    navigationSuggestion = '/recommendations';
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language: 'en', navigationSuggestion };
  }

  // Hindi support
  if (q.includes('बिजली') || q.includes('खपत') || q.includes('सौर') || q.includes('पानी')) {
    content = `आपका प्रश्न समझ में आया। / I understood your question.

मैं आपको इन विषयों में मदद कर सकता हूं: / I can help you with:
• **बिजली खपत (Energy):** किसी भी क्षेत्र की मासिक खपत
• **सौर ऊर्जा (Solar):** स्थापना क्षमता और बचत
• **पानी (Water):** मांग और वर्षा जल संचयन
• **कचरे से ऊर्जा (Waste to Energy):** बायोगैस क्षमता

किस क्षेत्र के बारे में जानना चाहते हैं? (Motipur, Oiara, Amra, Barouni, Korha)`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language: 'hi' };
  }

  // Fallback
  content = `I didn't find a specific match for *"${userMessage}"*. Here are some things I can help with:

• **Area-specific:** "What is Motipur's energy consumption?"
• **Comparisons:** "Which area has the best sustainability score?"
• **Metrics:** "Show me Korha's solar potential"
• **Recommendations:** "What are the top recommendations?"
• **Overview:** "Give me the region summary"

Type **help** for a full list of queries.`;

  return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language: 'en' };
}
