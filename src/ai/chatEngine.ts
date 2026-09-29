import type { ChatMessage } from '../types';
import { getAllAreaAnalyses, getRegionTotals } from '../services/energyService';
import { ASSUMPTIONS } from '../calculations/engine';
import { DEMO_RECOMMENDATIONS } from '../data/recommendations';

const analyses = getAllAreaAnalyses();
const totals = getRegionTotals();

function findArea(q: string) {
  return analyses.find((a) => q.toLowerCase().includes(a.area.name.toLowerCase()));
}

function formatINR(n: number) {
  return n >= 100000 ? `₹${(n / 100000).toFixed(2)} लाख` : `₹${n.toLocaleString()}`;
}

const GREETINGS = ['hello', 'hi', 'namaste', 'hey', 'नमस्ते', 'हेलो', 'हाय'];
const SOLAR_KEYWORDS = ['solar', 'panel', 'sun', 'rooftop', 'generation', 'सौर', 'पैनल', 'सूर्य'];
const WATER_KEYWORDS = ['water', 'rainwater', 'pump', 'demand', 'पानी', 'वर्षा', 'जल', 'पंप'];
const WASTE_KEYWORDS = ['waste', 'biogas', 'dung', 'organic', 'कचरा', 'बायोगैस', 'गोबर', 'जैविक'];
const ENERGY_KEYWORDS = ['energy', 'consumption', 'electricity', 'kwh', 'बिजली', 'खपत', 'ऊर्जा'];
const COST_KEYWORDS = ['cost', 'bill', 'price', 'savings', 'लागत', 'बचत', 'बिल', 'कीमत'];
const SCORE_KEYWORDS = ['score', 'grade', 'sustainability', 'rating', 'स्कोर', 'ग्रेड', 'स्थिरता'];
const REC_KEYWORDS = ['recommendation', 'suggest', 'improve', 'action', 'सुझाव', 'सुधार', 'कार्य'];
const HELP_KEYWORDS = ['help', 'what can', 'how do', 'कैसे', 'मदद', 'सहायता'];
const OVERVIEW_KEYWORDS = ['region', 'overview', 'all areas', 'summary', 'क्षेत्र', 'अवलोकन', 'सभी', 'सारांश'];
const HIGHEST_KEYWORDS = ['highest', 'most', 'top', 'best', 'सबसे', 'सर्वश्रेष्ठ', 'अधिकतम', 'शीर्ष'];

export function generateAIResponse(userMessage: string, language: 'en' | 'hi' = 'en'): ChatMessage {
  const q = userMessage.toLowerCase().trim();
  let content = '';
  let navigationSuggestion: string | undefined;
  let relatedMetric: string | undefined;
  const now = new Date().toISOString();
  const isHindi = language === 'hi';

  // ── Helper: wrap with hindi label if needed ──────────────────────────────
  function r(en: string, hi: string) {
    return isHindi ? hi : en;
  }

  // ── Greetings ─────────────────────────────────────────────────────────────
  if (GREETINGS.some((g) => q.startsWith(g) || q === g)) {
    content = isHindi
      ? `नमस्ते! मैं किरण हूँ — **Bihar Village Sustainability Region** के लिए आपकी AI सहायक।

मैं इन विषयों में मदद कर सकती हूँ:
• बिजली खपत और लागत विश्लेषण
• सौर ऊर्जा क्षमता गणना
• जल मांग और वर्षा जल संचयन
• जैविक कचरे से बायोगैस क्षमता
• स्थिरता स्कोर और सुझाव

उदाहरण के लिए पूछें: *"मोतीपुर की मासिक बिजली लागत क्या है?"* या *"किस क्षेत्र में सबसे अधिक सौर क्षमता है?"*`
      : `नमस्ते! Hello! I'm Kiran, your sustainability AI assistant for the **Bihar Village Sustainability Region**.

I can help you with:
• Energy consumption & cost analysis
• Solar potential calculations
• Water demand & rainwater harvesting
• Biogas potential from organic waste
• Sustainability scores & recommendations

Try asking: *"What is Motipur's monthly energy cost?"* or *"Which area has the highest solar potential?"*`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
  }

  // ── Help ──────────────────────────────────────────────────────────────────
  if (HELP_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `मैं इस तरह के प्रश्नों का उत्तर दे सकती हूँ:

**ऊर्जा:** "[क्षेत्र] की मासिक खपत क्या है?"
**सौर:** "[क्षेत्र] की सौर क्षमता क्या है?"
**पानी:** "अमरा कितना वर्षा जल संचयन कर सकता है?"
**कचरा:** "मोतीपुर की बायोगैस क्षमता क्या है?"
**लागत:** "कोरहा बिजली पर कितना खर्च करता है?"
**स्कोर:** "बरौनी का स्थिरता स्कोर क्या है?"
**सुझाव:** "शीर्ष सुझाव क्या हैं?"

क्षेत्र: Motipur, Oiara, Amra, Barouni, Korha`
      : `I can answer questions like:

**Energy:** "What is [area] monthly consumption?" · "Which area consumes the most per household?"
**Solar:** "What is [area] solar potential?" · "How many panels can fit in Motipur?"
**Water:** "How much rainwater can Amra harvest?" · "What is Oiara's water demand?"
**Waste:** "What is the biogas potential of Motipur?"
**Cost:** "How much does Korha spend on electricity?"
**Scores:** "What is Barouni's sustainability score?"
**Recommendations:** "What is the top recommendation?" · "How can Amra improve?"
**Region:** "Give me the region overview"`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
  }

  // ── Region overview ───────────────────────────────────────────────────────
  if (OVERVIEW_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**Bihar Village Sustainability Region — अवलोकन**

| मापदंड | मूल्य |
|--------|-------|
| निगरानी क्षेत्र | ${totals.areas} |
| कुल घर | ${totals.totalHH.toLocaleString()} |
| कुल जनसंख्या | ${totals.totalPop.toLocaleString()} |
| मासिक खपत | ${(totals.totalKWh / 1000).toFixed(1)}k kWh |
| मासिक बिजली लागत | ${formatINR(totals.totalCost)} |
| मासिक CO₂ उत्सर्जन | ${(totals.totalCO2 / 1000).toFixed(1)} टन |

**प्राथमिकता क्षेत्र:** मोतीपुर (सर्वाधिक खपत, सौर अनिश्चित) और अमरा (शून्य नवीकरणीय, उच्च लागत)।`
      : `**Bihar Village Sustainability Region — Overview**

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
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
  }

  // ── Specific area queries ─────────────────────────────────────────────────
  const matchedAnalysis = findArea(q);

  if (matchedAnalysis) {
    const { area, energyBreakdown, solarPotential, waterAnalysis, wasteAnalysis, monthlyCostINR, co2KgPerMonth, sustainabilityScore } = matchedAnalysis;

    if (ENERGY_KEYWORDS.some((k) => q.includes(k)) || COST_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**${area.name} — ऊर्जा और लागत विश्लेषण** *(डेमो डेटा)*

• मासिक खपत: **${area.monthlyElectricity.toLocaleString()} kWh**
• प्रति घर: **${(area.monthlyElectricity / area.households).toFixed(1)} kWh/घर**
• मासिक बिजली लागत: **${formatINR(monthlyCostINR)}**
• CO₂ उत्सर्जन: **${(co2KgPerMonth / 1000).toFixed(2)} टन/माह**

**विवरण:**
- घर: ${energyBreakdown.households.toLocaleString()} kWh
- स्ट्रीटलाइट: ${energyBreakdown.streetlights.toLocaleString()} kWh
- जल पंप: ${energyBreakdown.waterPumps.toLocaleString()} kWh
- स्कूल: ${energyBreakdown.schools.toLocaleString()} kWh`
        : `**${area.name} — Energy & Cost Analysis** *(Demo Data)*

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
      content = isHindi
        ? `**${area.name} — सौर क्षमता** *(डेमो डेटा)*

• वर्तमान सौर: **${area.infrastructure.solar.installedCapacity} kW** स्थापित
• संभव अतिरिक्त क्षमता: **${solarPotential.feasibleCapacityKW} kW**
• मासिक उत्पादन क्षमता: **${solarPotential.monthlyGenerationKWh.toLocaleString()} kWh**
• खपत ऑफसेट: **${solarPotential.offsetPercent}%**
• CO₂ बचत: **${(solarPotential.co2AvoidedKgPerMonth / 1000).toFixed(2)} टन/माह**
• अनुमानित निवेश: **${formatINR(solarPotential.estimatedCostINR)}**
• payback अवधि: **${solarPotential.paybackYears} वर्ष**`
        : `**${area.name} — Solar Potential** *(Demo Data)*

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
      content = isHindi
        ? `**${area.name} — जल विश्लेषण** *(डेमो डेटा)*

• दैनिक जल मांग: **${(waterAnalysis.dailyDemandLitres / 1000).toFixed(2)} kL/दिन**
• मासिक मांग: **${(waterAnalysis.monthlyDemandLitres / 1000).toFixed(1)} kL/माह**
• पंप ऊर्जा: **${waterAnalysis.pumpEnergyKWhPerMonth.toLocaleString()} kWh/माह**
• वर्षा जल क्षमता: **${(waterAnalysis.rainwaterPotentialLitresPerYear / 1000).toFixed(0)} kL/वर्ष**
• वर्षा जल ऑफसेट: **${waterAnalysis.rainwaterOffsetPercent}%** मासिक मांग का`
        : `**${area.name} — Water Analysis** *(Demo Data)*

• Daily water demand: **${(waterAnalysis.dailyDemandLitres / 1000).toFixed(2)} kL/day**
• Monthly demand: **${(waterAnalysis.monthlyDemandLitres / 1000).toFixed(1)} kL/month**
• Pump energy: **${waterAnalysis.pumpEnergyKWhPerMonth.toLocaleString()} kWh/month**
• Rainwater potential: **${(waterAnalysis.rainwaterPotentialLitresPerYear / 1000).toFixed(0)} kL/year**
• Rainwater offset: **${waterAnalysis.rainwaterOffsetPercent}%** of monthly demand

*LPCD: 55 L/person/day (rural) · Runoff coefficient: 0.80*`;
      navigationSuggestion = '/overview';
      relatedMetric = 'water';
    } else if (WASTE_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**${area.name} — कचरा और बायोगैस** *(डेमो डेटा)*

• गोबर इनपुट: **${area.cowDungKgPerDay} kg/दिन**
• खाद्य अपशिष्ट: **${area.foodWasteKgPerDay} kg/दिन**
• कृषि अपशिष्ट: **${area.agriWasteKgPerDay} kg/दिन**
• बायोगैस क्षमता: **${wasteAnalysis.biogasM3PerDay.toFixed(2)} m³/दिन**
• तापीय ऊर्जा: **${wasteAnalysis.thermalEnergyKWhPerDay.toFixed(2)} kWh/दिन**
• बिजली क्षमता: **${(wasteAnalysis.electricityKWhPerDay * 30).toFixed(1)} kWh/माह**
• CO₂ ऑफसेट: **${(wasteAnalysis.co2OffsetKgPerMonth / 1000).toFixed(3)} टन/माह**`
        : `**${area.name} — Waste & Biogas** *(Demo Data)*

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
      content = isHindi
        ? `**${area.name} — स्थिरता स्कोर** *(डेमो डेटा)*

स्कोर: **${sustainabilityScore}/100**

मुख्य कारक:
• प्रति घर खपत: ${(area.monthlyElectricity / area.households).toFixed(1)} kWh/घर
• स्थापित सौर: ${area.infrastructure.solar.installedCapacity} kW (${solarPotential.offsetPercent.toFixed(1)}% ऑफसेट)
• वर्षा जल ऑफसेट: ${waterAnalysis.rainwaterOffsetPercent.toFixed(1)}%
• स्ट्रीटलाइट प्रकार: ${area.infrastructure.streetlights.type.toUpperCase()}

सुधार के लिए: सौर ऊर्जा स्थापित करें (सबसे बड़ा प्रभाव), LED स्ट्रीटलाइट और वर्षा जल संचयन।`
        : `**${area.name} — Sustainability Score** *(Demo Data)*

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
      content = isHindi
        ? `**${area.name}** (${area.type.replace('_', ' ')})

• जनसंख्या: ${area.population.toLocaleString()} · ${area.households} घर
• मासिक बिजली: ${area.monthlyElectricity.toLocaleString()} kWh
• मासिक लागत: ${formatINR(monthlyCostINR)}
• स्थिरता स्कोर: **${sustainabilityScore}/100**
• सौर स्थापित: ${area.infrastructure.solar.installedCapacity} kW

${area.name} के बारे में ऊर्जा, सौर, पानी, कचरा, या स्कोर के बारे में पूछें!`
        : `**${area.name}** (${area.type.replace('_', ' ')})

• Population: ${area.population.toLocaleString()} · ${area.households} households
• Monthly electricity: ${area.monthlyElectricity.toLocaleString()} kWh
• Monthly cost: ${formatINR(monthlyCostINR)}
• Sustainability score: **${sustainabilityScore}/100**
• Solar installed: ${area.infrastructure.solar.installedCapacity} kW
• Solar potential: ${solarPotential.feasibleCapacityKW} kW

Ask me about energy, solar, water, waste, or score for ${area.name}!`;
      navigationSuggestion = '/village';
    }

    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion, relatedMetric };
  }

  // ── Highest/lowest queries (no specific area) ─────────────────────────────
  if (HIGHEST_KEYWORDS.some((k) => q.includes(k))) {
    if (ENERGY_KEYWORDS.some((k) => q.includes(k))) {
      const top = [...analyses].sort((a, b) => b.area.monthlyElectricity - a.area.monthlyElectricity)[0];
      content = isHindi
        ? `**सर्वाधिक बिजली खपत:** ${top.area.name} — **${top.area.monthlyElectricity.toLocaleString()} kWh/माह** (${top.area.households} घर · ${(top.area.monthlyElectricity / top.area.households).toFixed(1)} kWh/घर)।

यह क्षेत्र की कुल खपत का ${(top.area.monthlyElectricity / analyses.reduce((s, a) => s + a.area.monthlyElectricity, 0) * 100).toFixed(1)}% है।`
        : `**Highest Energy Consumption:** ${top.area.name} with **${top.area.monthlyElectricity.toLocaleString()} kWh/month** (${top.area.households} households · ${(top.area.monthlyElectricity / top.area.households).toFixed(1)} kWh/HH).

This is ${(top.area.monthlyElectricity / analyses.reduce((s, a) => s + a.area.monthlyElectricity, 0) * 100).toFixed(1)}% of the region's total consumption.`;
      navigationSuggestion = '/village';
    } else if (SOLAR_KEYWORDS.some((k) => q.includes(k))) {
      const top = [...analyses].sort((a, b) => b.solarPotential.feasibleCapacityKW - a.solarPotential.feasibleCapacityKW)[0];
      content = isHindi
        ? `**सर्वाधिक सौर क्षमता:** ${top.area.name} — **${top.solarPotential.feasibleCapacityKW} kW** संभव क्षमता — ${top.solarPotential.monthlyGenerationKWh.toLocaleString()} kWh/माह उत्पादन और ${top.solarPotential.offsetPercent.toFixed(1)}% खपत ऑफसेट।`
        : `**Highest Solar Potential:** ${top.area.name} with **${top.solarPotential.feasibleCapacityKW} kW** feasible capacity — could generate ${top.solarPotential.monthlyGenerationKWh.toLocaleString()} kWh/month and offset ${top.solarPotential.offsetPercent.toFixed(1)}% of consumption.`;
      navigationSuggestion = '/solar';
    } else if (SCORE_KEYWORDS.some((k) => q.includes(k))) {
      const top = [...analyses].sort((a, b) => b.sustainabilityScore - a.sustainabilityScore)[0];
      content = isHindi
        ? `**सर्वश्रेष्ठ स्थिरता स्कोर:** ${top.area.name} — **${top.sustainabilityScore}/100** — नवीकरणीय ऊर्जा अपनाने में अग्रणी (${top.area.infrastructure.solar.installedCapacity} kW सौर स्थापित)।`
        : `**Highest Sustainability Score:** ${top.area.name} with **${top.sustainabilityScore}/100** — leading in renewable adoption (${top.area.infrastructure.solar.installedCapacity} kW solar installed).`;
      navigationSuggestion = '/score';
    } else {
      content = r(
        'Could you specify what you\'re looking for? I can find the highest/most for: energy consumption, solar potential, sustainability score, or water demand.',
        'कृपया स्पष्ट करें — मैं किसके लिए सर्वाधिक खोज सकती हूँ: ऊर्जा खपत, सौर क्षमता, स्थिरता स्कोर, या जल मांग।'
      );
    }
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
  }

  // ── Recommendations ───────────────────────────────────────────────────────
  if (REC_KEYWORDS.some((k) => q.includes(k))) {
    const top3 = DEMO_RECOMMENDATIONS.slice(0, 3);
    content = isHindi
      ? `**शीर्ष 3 सुझाव** (प्राथमिकता के अनुसार):

${top3.map((rec, i) => `**${i + 1}. ${rec.title}**
- क्षेत्र: ${rec.areaId} · प्राथमिकता: ${rec.priority}
- बचत: ₹${rec.costSavingsINRPerMonth.toLocaleString()}/माह · payback: ${rec.paybackMonths} माह
- ${rec.intervention}`).join('\n\n')}

सभी ${DEMO_RECOMMENDATIONS.length} सुझाव सुझाव पृष्ठ पर देखें।`
      : `**Top 3 Recommendations** by priority:

${top3.map((r, i) => `**${i + 1}. ${r.title}**
- Area: ${r.areaId} · Priority: ${r.priority}
- Savings: ₹${r.costSavingsINRPerMonth.toLocaleString()}/month · Payback: ${r.paybackMonths} months
- ${r.intervention}`).join('\n\n')}

View all ${DEMO_RECOMMENDATIONS.length} recommendations on the Recommendations page.`;
    navigationSuggestion = '/recommendations';
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  content = isHindi
    ? `मुझे *"${userMessage}"* के लिए कोई विशिष्ट उत्तर नहीं मिला। मैं इन विषयों में मदद कर सकती हूँ:

• **क्षेत्र-विशिष्ट:** "मोतीपुर की ऊर्जा खपत क्या है?"
• **तुलना:** "किस क्षेत्र का सबसे अच्छा स्थिरता स्कोर है?"
• **मापदंड:** "कोरहा की सौर क्षमता दिखाएं"
• **सुझाव:** "शीर्ष सुझाव क्या हैं?"
• **अवलोकन:** "क्षेत्र का सारांश दें"

**मदद** टाइप करें या ऊपर दिए गए त्वरित प्रश्न आज़माएं।`
    : `I didn't find a specific match for *"${userMessage}"*. Here are some things I can help with:

• **Area-specific:** "What is Motipur's energy consumption?"
• **Comparisons:** "Which area has the best sustainability score?"
• **Metrics:** "Show me Korha's solar potential"
• **Recommendations:** "What are the top recommendations?"
• **Overview:** "Give me the region summary"

Type **help** for a full list of queries.`;

  return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
}
