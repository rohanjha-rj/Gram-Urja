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

// ── Keyword banks ─────────────────────────────────────────────────────────────
const GREETINGS        = ['hello', 'hi', 'namaste', 'hey', 'नमस्ते', 'हेलो', 'हाय'];
const SOLAR_KEYWORDS   = ['solar', 'panel', 'sun', 'rooftop', 'generation', 'सौर', 'पैनल', 'सूर्य', 'छत'];
const WATER_KEYWORDS   = ['water', 'rainwater', 'pump', 'demand', 'पानी', 'वर्षा', 'जल', 'पंप'];
const WASTE_KEYWORDS   = ['waste', 'biogas', 'dung', 'organic', 'कचरा', 'बायोगैस', 'गोबर', 'जैविक'];
const ENERGY_KEYWORDS  = ['energy', 'consumption', 'electricity', 'kwh', 'बिजली', 'खपत', 'ऊर्जा'];
const COST_KEYWORDS    = ['cost', 'bill', 'price', 'savings', 'लागत', 'बचत', 'बिल', 'कीमत', 'खर्च'];
const SCORE_KEYWORDS   = ['score', 'grade', 'sustainability', 'rating', 'स्कोर', 'ग्रेड', 'स्थिरता'];
const REC_KEYWORDS     = ['recommendation', 'suggest', 'improve', 'action', 'सुझाव', 'सुधार', 'कार्य'];
const HELP_KEYWORDS    = ['help', 'what can', 'how do', 'कैसे', 'मदद', 'सहायता'];
const OVERVIEW_KEYWORDS = ['region', 'overview', 'all areas', 'summary', 'क्षेत्र', 'अवलोकन', 'सभी', 'सारांश'];
const HIGHEST_KEYWORDS = ['highest', 'most', 'top', 'best', 'सबसे', 'सर्वश्रेष्ठ', 'अधिकतम', 'शीर्ष'];

// Household-specific keyword banks
const HH_BILL_KEYWORDS    = ['bill', 'reduce', 'cut', 'save money', 'lower', 'बिल', 'कम करना', 'बचत', 'घटाना', 'महंगा'];
const HH_APPLIANCE_KEYWORDS = ['appliance', 'fridge', 'ac', 'fan', 'tv', 'bulb', 'pump', 'heater', 'washing', 'उपकरण', 'फ्रिज', 'एसी', 'पंखा', 'टीवी', 'बल्ब', 'वॉशिंग', 'हीटर'];
const HH_SOLAR_HOME_KEYWORDS = ['home solar', 'rooftop solar', 'solar for home', 'install solar', 'घर सोलर', 'सोलर लगाना', 'छत सोलर'];
const HH_WATER_HOME_KEYWORDS = ['water at home', 'save water', 'water bill', 'water usage', 'घर पानी', 'पानी बचाएं', 'पानी की बचत'];
const HH_BIOGAS_KEYWORDS  = ['biogas', 'kitchen waste', 'cow dung', 'cooking gas', 'बायोगैस', 'रसोई कचरा', 'खाना पकाना', 'गोबर गैस'];
const HH_SCORE_HOME_KEYWORDS = ['my score', 'household score', 'home score', 'मेरा स्कोर', 'घर का स्कोर', 'मेरी रेटिंग'];
const HH_LED_KEYWORDS     = ['led', 'bulb', 'light', 'lighting', 'बल्ब', 'लाइट', 'रोशनी', 'led बल्ब'];
const HH_AC_KEYWORDS      = ['air conditioner', 'ac', 'cooling', 'air con', 'एसी', 'ठंडक', 'एयर कंडीशनर'];
const HH_FRIDGE_KEYWORDS  = ['refrigerator', 'fridge', 'freeze', 'रेफ्रिजरेटर', 'फ्रिज'];
const HH_TIPS_KEYWORDS    = ['tip', 'advice', 'trick', 'easy', 'simple', 'how to save', 'सुझाव', 'टिप्स', 'आसान', 'कैसे बचाएं'];
const HH_CO2_KEYWORDS     = ['co2', 'carbon', 'emission', 'environment', 'pollution', 'कार्बन', 'उत्सर्जन', 'पर्यावरण', 'प्रदूषण'];
const HH_WATER_HARVEST_KEYWORDS = ['rainwater', 'harvest', 'tank', 'collect rain', 'वर्षा जल', 'बारिश', 'टंकी', 'संचयन'];

// Village-admin extra keyword banks
const VA_COMPARE_KEYWORDS = ['compare', 'versus', 'vs', 'better', 'worse', 'comparison', 'तुलना', 'बनाम', 'अंतर'];
const VA_COST_ALL_KEYWORDS = ['total cost', 'region cost', 'all areas cost', 'कुल लागत', 'सभी क्षेत्र'];
const VA_ALERT_KEYWORDS   = ['alert', 'warning', 'critical', 'urgent', 'अलर्ट', 'चेतावनी', 'तत्काल', 'जरूरी'];
const VA_CO2_REGION_KEYWORDS = ['region co2', 'total emissions', 'carbon footprint', 'क्षेत्र कार्बन', 'कुल उत्सर्जन'];

// ── Main function ─────────────────────────────────────────────────────────────

export function generateAIResponse(
  userMessage: string,
  language: 'en' | 'hi' = 'en',
  role = 'guest'
): ChatMessage {
  const q = userMessage.toLowerCase().trim();
  let content = '';
  let navigationSuggestion: string | undefined;
  let relatedMetric: string | undefined;
  const now = new Date().toISOString();
  const isHindi = language === 'hi';
  const isHousehold = role === 'citizen';

  function r(en: string, hi: string) {
    return isHindi ? hi : en;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HOUSEHOLD-SPECIFIC RESPONSES (role === 'citizen')
  // ══════════════════════════════════════════════════════════════════════════

  if (isHousehold) {

    // ── Greetings (household) ───────────────────────────────────────────────
    if (GREETINGS.some((g) => q.startsWith(g) || q === g)) {
      content = isHindi
        ? `नमस्ते! मैं मनु AI हूँ — आपकी **घरेलू ऊर्जा AI सहायक**।

मैं आपकी इन बातों में मदद कर सकता हूँ:
• बिजली बिल कम करने के उपाय
• सबसे ज़्यादा बिजली खाने वाले उपकरण
• सोलर पैनल की बचत और लागत वसूली
• घर में पानी की बचत
• बायोगैस से खाना पकाना

उदाहरण: *"मेरा फ्रिज कितनी बिजली खाता है?"* या *"LED बल्ब से कितनी बचत होगी?"*`
        : `Hello! I'm Manu AI — your **Household Energy AI Assistant**.

I can help you with:
• Cutting your electricity bill
• Finding your biggest power-draining appliances
• Solar panel savings and payback for your home
• Smart water saving tips
• Using biogas from kitchen waste

Try asking: *"How much electricity does my fridge use?"* or *"How much can I save with LED bulbs?"*`;
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
    }

    // ── Help (household) ────────────────────────────────────────────────────
    if (HELP_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `मैं इन घरेलू सवालों के जवाब दे सकती हूँ:

**बिल बचत:** "बिजली बिल कैसे कम करूं?" · "आसान बचत के तरीके क्या हैं?"
**उपकरण:** "कौन सा उपकरण सबसे ज़्यादा बिजली खाता है?" · "AC कितनी बिजली खाता है?"
**सोलर:** "सोलर पैनल से कितनी बचत होगी?" · "घर पर सोलर कैसे लगाएं?"
**LED बल्ब:** "LED से कितनी बचत होती है?"
**फ्रिज:** "फ्रिज की बिजली खपत कम कैसे करें?"
**पानी:** "घर में पानी कैसे बचाएं?" · "वर्षा जल संचयन कैसे करें?"
**बायोगैस:** "बायोगैस क्या है?" · "रसोई कचरे से गैस कैसे बनती है?"
**स्कोर:** "मेरा स्थिरता स्कोर कैसे सुधारूं?"
**CO₂:** "मेरे घर का कार्बन उत्सर्जन कितना है?"`
        : `I can answer household questions like:

**Bill savings:** "How do I reduce my electricity bill?" · "What are easy ways to save energy?"
**Appliances:** "Which appliance uses the most power?" · "How much power does an AC use?"
**Solar:** "How much can I save with solar panels?" · "How do I install solar at home?"
**LED bulbs:** "How much do LED bulbs save?"
**Fridge:** "How can I reduce my fridge's electricity usage?"
**Water:** "How do I save water at home?" · "How do I set up rainwater harvesting?"
**Biogas:** "What is biogas?" · "How do I make gas from kitchen waste?"
**Score:** "How do I improve my sustainability score?"
**CO₂:** "What is my household carbon footprint?"`;
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
    }

    // ── LED bulbs ────────────────────────────────────────────────────────────
    if (HH_LED_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**LED बल्ब — बिजली बचत**

| बल्ब प्रकार | वाट | मासिक खपत (8घं/दिन) | मासिक लागत |
|------------|-----|---------------------|------------|
| पुरानी CFL | 23W | 5.5 kWh | ₹44 |
| **LED** | **9W** | **2.2 kWh** | **₹18** |
| बचत | — | **3.3 kWh** | **₹26/बल्ब** |

✅ एक LED बल्ब साल में **₹312** बचाता है।
💡 घर के 10 बल्ब बदलने पर **₹3,120/वर्ष** की बचत!
🌿 CO₂ में भी 60% कमी।

LED बल्ब की कीमत ₹80-150 — 3-6 महीने में वापस।`
        : `**LED Bulbs — Energy Savings**

| Bulb Type | Wattage | Monthly use (8hrs/day) | Monthly cost |
|-----------|---------|----------------------|--------------|
| Old CFL | 23W | 5.5 kWh | ₹44 |
| **LED** | **9W** | **2.2 kWh** | **₹18** |
| Saving | — | **3.3 kWh** | **₹26/bulb** |

✅ One LED bulb saves **₹312 per year**.
💡 Replace 10 bulbs → **₹3,120/year saved!**
🌿 Also cuts CO₂ emissions by 60%.

LED bulbs cost ₹80–150 each — payback in just 3–6 months.`;
      navigationSuggestion = '/household';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }

    // ── AC usage ──────────────────────────────────────────────────────────────
    if (HH_AC_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**AC (एयर कंडीशनर) — बिजली खपत और बचत**

• 1.5 टन पुराना AC: **~2,000W** → 8 घं/दिन = **480 kWh/माह = ₹3,840**
• **5-स्टार BEE AC**: ~1,200W → 8 घं/दिन = **288 kWh/माह = ₹2,304**
• **बचत: ₹1,536/माह** (₹18,432/वर्ष!)

💡 **AC बचत के टिप्स:**
- तापमान 24°C रखें (हर 1°C पर 6% बचत)
- रात को इको मोड चालू करें
- फ़िल्टर हर महीने साफ़ करें
- AC के साथ पंखा चलाएं — कम बिजली खर्च
- दरवाज़े-खिड़कियाँ बंद रखें`
        : `**Air Conditioner — Power Use & Savings**

• Old 1.5-ton AC: **~2,000W** → 8 hrs/day = **480 kWh/month = ₹3,840**
• **5-star BEE AC**: ~1,200W → 8 hrs/day = **288 kWh/month = ₹2,304**
• **Saving: ₹1,536/month** (₹18,432/year!)

💡 **AC saving tips:**
- Set to 24°C (every 1°C saves ~6%)
- Use eco/sleep mode at night
- Clean filters every month
- Use ceiling fan with AC — allows higher temp setting
- Keep doors and windows closed`;
      navigationSuggestion = '/household';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }

    // ── Fridge usage ──────────────────────────────────────────────────────────
    if (HH_FRIDGE_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**फ्रिज — बिजली खपत और बचत**

• पुराना 200L फ्रिज: ~150W = **~108 kWh/माह = ₹864**
• **5-स्टार 200L फ्रिज**: ~50W = **~36 kWh/माह = ₹288**
• **बचत: ₹576/माह** (₹6,912/वर्ष)

💡 **फ्रिज बचत के टिप्स:**
- गर्म खाना ठंडा करके ही फ्रिज में रखें
- फ्रिज को दीवार से 10 सेमी दूर रखें
- तापमान: फ्रिज 3-5°C, फ्रीजर -18°C
- दरवाज़ा बार-बार न खोलें
- ख़राब सील बदलवाएं`
        : `**Refrigerator — Power Use & Savings**

• Old 200L fridge: ~150W = **~108 kWh/month = ₹864**
• **5-star 200L fridge**: ~50W = **~36 kWh/month = ₹288**
• **Saving: ₹576/month** (₹6,912/year)

💡 **Fridge saving tips:**
- Let hot food cool before putting it in the fridge
- Keep fridge 10 cm from the wall for ventilation
- Ideal temps: fridge 3–5°C, freezer -18°C
- Don't open the door too often
- Replace worn door seals`;
      navigationSuggestion = '/household';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }

    // ── Household bill reduction ──────────────────────────────────────────────
    if (HH_BILL_KEYWORDS.some((k) => q.includes(k)) || HH_TIPS_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**बिजली बिल कम करने के 8 आसान तरीके**

1. 💡 **LED बल्ब लगाएं** — CFL से 60% कम बिजली, ₹300+/वर्ष/बल्ब बचत
2. ❄️ **AC 24°C पर रखें** — हर 1°C कम करने पर 6% बचत
3. 🌅 **दिन में सोलर** इस्तेमाल करें — रात को ग्रिड से बचें
4. 🔌 **स्टैंडबाय पावर बंद करें** — TV, charger का प्लग निकालें
5. 🌀 **5-स्टार उपकरण** खरीदें — 3-स्टार से 20-30% कम खपत
6. 🚿 **गीजर का कम उपयोग** — सोलर वाटर हीटर लगाएं (₹8-15k)
7. 🌿 **वाशिंग मशीन** ठंडे पानी में चलाएं, भरकर एक बार चलाएं
8. 📊 **अपना डैशबोर्ड** देखें — सबसे ज़्यादा खपत वाला उपकरण पहचानें

👆 My Household Dashboard में अपनी पूरी खपत देखें!`
        : `**8 Easy Ways to Cut Your Electricity Bill**

1. 💡 **Switch to LED bulbs** — 60% less power than CFL, saves ₹300+/year per bulb
2. ❄️ **Set AC to 24°C** — every degree lower adds 6% to your bill
3. 🌅 **Use solar during daylight hours** — avoid grid power at peak time
4. 🔌 **Unplug standby devices** — TVs, chargers, set-top boxes waste power
5. 🌀 **Buy 5-star rated appliances** — 20–30% less consumption than 3-star
6. 🚿 **Reduce geyser use** — install a solar water heater (₹8–15k, quick payback)
7. 🌿 **Wash clothes in cold water** — run full loads only
8. 📊 **Check your dashboard** — identify which appliance costs the most

👆 Visit My Household Dashboard to see your full breakdown!`;
      navigationSuggestion = '/household';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }

    // ── Which appliance uses most power ────────────────────────────────────────
    if (HH_APPLIANCE_KEYWORDS.some((k) => q.includes(k)) && !HH_BILL_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**घरेलू उपकरणों की बिजली खपत (अनुमानित)**

| उपकरण | वाट | 8घं/दिन खपत | मासिक (8घं) | मासिक लागत |
|--------|-----|------------|------------|------------|
| पुराना AC | 2,000W | 16 kWh | 480 kWh | ₹3,840 |
| गीज़र | 2,000W | — | 60 kWh | ₹480 |
| पुराना फ्रिज | 150W | 3.6 kWh | 108 kWh | ₹864 |
| वाशिंग मशीन | 500W | — | 15 kWh | ₹120 |
| पुरानी CFL (x10) | 230W | 1.84 kWh | 55 kWh | ₹441 |
| LED (x10) | 90W | 0.72 kWh | 22 kWh | ₹173 |
| पंखा | 75W | 0.6 kWh | 18 kWh | ₹144 |
| TV | 100W | 0.8 kWh | 24 kWh | ₹192 |

🏆 **सबसे ज़्यादा खपत:** AC > गीजर > फ्रिज

अपने घर की सटीक खपत के लिए My Household Dashboard देखें!`
        : `**Household Appliance Power Usage (Estimated)**

| Appliance | Wattage | 8hrs/day | Monthly (8hrs) | Monthly cost |
|-----------|---------|----------|---------------|--------------|
| Old AC | 2,000W | 16 kWh | 480 kWh | ₹3,840 |
| Geyser | 2,000W | — | 60 kWh | ₹480 |
| Old Fridge | 150W | 3.6 kWh | 108 kWh | ₹864 |
| Washing Machine | 500W | — | 15 kWh | ₹120 |
| Old CFL (x10) | 230W | 1.84 kWh | 55 kWh | ₹441 |
| LED (x10) | 90W | 0.72 kWh | 22 kWh | ₹173 |
| Ceiling Fan | 75W | 0.6 kWh | 18 kWh | ₹144 |
| TV | 100W | 0.8 kWh | 24 kWh | ₹192 |

🏆 **Biggest consumers:** AC > Geyser > Fridge

Visit My Household Dashboard for your exact breakdown!`;
      navigationSuggestion = '/household';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }

    // ── Home solar ────────────────────────────────────────────────────────────
    if (HH_SOLAR_HOME_KEYWORDS.some((k) => q.includes(k)) || (SOLAR_KEYWORDS.some((k) => q.includes(k)) && !findArea(q))) {
      content = isHindi
        ? `**घर के लिए सोलर पैनल**

• **1 kW सोलर सिस्टम** → ~120 kWh/माह उत्पादन
• **अनुमानित लागत:** ₹60,000–80,000 (1 kW)
• **मासिक बचत:** ₹960 (@ ₹8/kWh)
• **payback:** 5–7 वर्ष

🏠 **कितने kW चाहिए?**
- 2 सदस्य, कम AC: **1–2 kW** (₹60k–1.5L)
- 4 सदस्य, 1 AC: **3–4 kW** (₹1.8L–3L)
- 6+ सदस्य, 2 AC: **5+ kW** (₹3L+)

✅ **PM Surya Ghar Yojana** — सरकारी सब्सिडी उपलब्ध
• 1-3 kW: 40% सब्सिडी
• 3+ kW: 20% सब्सिडी

सोलर पृष्ठ पर पूरी जानकारी देखें →`
        : `**Home Solar Panels**

• **1 kW solar system** → ~120 kWh/month generation
• **Estimated cost:** ₹60,000–80,000 (1 kW)
• **Monthly savings:** ₹960 (@ ₹8/kWh)
• **Payback:** 5–7 years

🏠 **How much do you need?**
- 2 members, no AC: **1–2 kW** (₹60k–1.5L)
- 4 members, 1 AC: **3–4 kW** (₹1.8L–3L)
- 6+ members, 2 AC: **5+ kW** (₹3L+)

✅ **PM Surya Ghar Yojana** — Government subsidy available
• 1–3 kW: 40% subsidy
• 3+ kW: 20% subsidy

See the Solar page for full details →`;
      navigationSuggestion = '/solar';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }

    // ── Home water saving ─────────────────────────────────────────────────────
    if (HH_WATER_HOME_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**घर में पानी बचाने के तरीके**

💧 **रोज़मर्रा की बचत:**
- नल बंद रखें — ब्रश/शेव करते समय (5L/दिन बचत)
- शॉर्ट शावर लें — 5 मिनट में 50L बनाम बाल्टी से 15L
- लीक नल ठीक करवाएं — एक टपकता नल = 15L/दिन बर्बाद
- वाशिंग मशीन भर कर चलाएं

🌧️ **वर्षा जल संचयन:**
- 100 sqm छत → साल में ~60,000L पानी
- एक बड़ी टंकी (₹5,000-15,000) से साल भर की ज़रूरत
- सब्सिडी पाने के लिए पंचायत से संपर्क करें

ग्रामीण मानक: 55 लीटर प्रति व्यक्ति प्रति दिन`
        : `**Home Water Saving Tips**

💧 **Daily savings:**
- Turn off tap while brushing/shaving → saves 5L/day
- Short showers: 5 min = 50L vs a bucket = 15L
- Fix leaky taps — one dripping tap wastes 15L/day
- Run washing machine only with full loads

🌧️ **Rainwater harvesting:**
- A 100 sqm roof can collect ~60,000L per year
- A storage tank (₹5,000–15,000) can cover annual needs
- Contact your Panchayat for subsidies

Rural standard: 55 litres per person per day`;
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
    }

    // ── Rainwater harvesting (household) ──────────────────────────────────────
    if (HH_WATER_HARVEST_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**वर्षा जल संचयन — घर के लिए**

🌧️ **कितना पानी मिलेगा?**
- एक 100 sqm छत से: **पटना में ~84,000L/वर्ष** (840 mm वर्षा)
- 4 लोगों का परिवार → ~80,000L/वर्ष चाहिए
- यानी छत का पानी **लगभग पूरी ज़रूरत** पूरी कर सकता है!

🏗️ **कैसे लगाएं?**
1. छत पर गटर और डाउनपाइप
2. फिल्टर (कंकड़/रेत/कपड़ा)
3. भूमिगत टंकी या ऊपरी टंकी
4. पानी पंप (यदि भूमिगत)

💰 **लागत:**
- छोटा सिस्टम: ₹5,000–10,000
- बड़ा सिस्टम: ₹20,000–50,000
- सरकारी सब्सिडी उपलब्ध`
        : `**Rainwater Harvesting — For Your Home**

🌧️ **How much water can you collect?**
- A 100 sqm roof in Bihar: ~**84,000L/year** (840mm rainfall)
- A family of 4 needs ~80,000L/year
- Your roof can meet **almost all water needs!**

🏗️ **How to set it up:**
1. Gutters and downpipes on your roof
2. Filter (gravel/sand/cloth)
3. Underground or overhead storage tank
4. Pump (if underground tank)

💰 **Cost:**
- Small system: ₹5,000–10,000
- Large system: ₹20,000–50,000
- Government subsidy available from Panchayat`;
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
    }

    // ── Biogas (household) ────────────────────────────────────────────────────
    if (HH_BIOGAS_KEYWORDS.some((k) => q.includes(k)) || WASTE_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**घर के लिए बायोगैस**

🐄 **बायोगैस क्या है?**
कूड़े/गोबर से बैक्टीरिया द्वारा गैस बनाई जाती है जो खाना पकाने या बिजली बनाने के काम आती है।

🏠 **एक घर के लिए (4 सदस्य):**
- रोज़ का खाना कचरा: ~2 kg
- बायोगैस उत्पादन: ~0.12 m³/दिन
- खाना पकाने का समय: **30-40 मिनट/दिन** (1 LPG सिलेंडर = 30 दिन)
- CO₂ बचत: ~0.5 kg/दिन

💰 **छोटे बायोगैस प्लांट की लागत:**
- 1 m³ क्षमता: ₹15,000–25,000
- LPG गैस की बचत: ₹300–400/माह
- payback: 4–7 वर्ष

🐄 **गाय/भैंस है तो और फायदा:**
- 1 गाय का गोबर → 0.04 m³ गैस/kg
- 4 गाय = 6-8 kg गोबर/दिन = 0.25 m³ गैस
- पूरे घर का खाना पकाने के लिए पर्याप्त!`
        : `**Home Biogas System**

🌿 **What is biogas?**
Bacteria break down kitchen waste or cow dung to produce gas for cooking or electricity.

🏠 **For a typical household (4 members):**
- Daily kitchen waste: ~2 kg
- Biogas output: ~0.12 m³/day
- Cooking time: **30–40 minutes/day** (replaces 1 LPG cylinder/month)
- CO₂ saving: ~0.5 kg/day

💰 **Small biogas plant cost:**
- 1 m³ capacity: ₹15,000–25,000
- LPG savings: ₹300–400/month
- Payback: 4–7 years

🐄 **Even better if you have cattle:**
- 1 cow produces 6–8 kg dung/day → 0.25 m³ gas
- Enough for the whole family's cooking needs!`;
      navigationSuggestion = '/waste';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }

    // ── Household sustainability score ───────────────────────────────────────
    if (HH_SCORE_HOME_KEYWORDS.some((k) => q.includes(k)) || SCORE_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**घरेलू स्थिरता स्कोर**

आपका स्कोर **My Household Dashboard** पर लाइव दिखाई देता है।

**स्कोर कैसे बनता है:**
- बेस: 100 अंक
- मासिक खपत 50 kWh से ज़्यादा होने पर घटता है

**स्कोर सुधारने के तरीके:**
• ✅ LED बल्ब लगाएं (+10-15 अंक)
• ✅ सोलर पैनल लगाएं (+20-30 अंक)
• ✅ 5-स्टार AC/फ्रिज (+10-20 अंक)
• ✅ बायोगैस उपयोग (+5-10 अंक)
• ✅ वर्षा जल संचयन (+5 अंक)

**स्कोर रेंज:**
- 80-100: उत्कृष्ट 🌟
- 60-79: अच्छा ✅
- 40-59: औसत ⚠️
- 0-39: सुधार ज़रूरी 🔴`
        : `**Household Sustainability Score**

Your score is shown live on the **My Household Dashboard**.

**How the score is calculated:**
- Starts at 100 points
- Drops when monthly consumption exceeds 50 kWh

**Ways to improve your score:**
• ✅ Switch to LED bulbs (+10–15 points)
• ✅ Install solar panels (+20–30 points)
• ✅ Upgrade to 5-star AC/fridge (+10–20 points)
• ✅ Use a biogas system (+5–10 points)
• ✅ Set up rainwater harvesting (+5 points)

**Score ranges:**
- 80–100: Excellent 🌟
- 60–79: Good ✅
- 40–59: Average ⚠️
- 0–39: Needs improvement 🔴`;
      navigationSuggestion = '/household';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }

    // ── CO₂ footprint (household) ─────────────────────────────────────────────
    if (HH_CO2_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**घर का कार्बन उत्सर्जन**

⚡ **बिजली से CO₂:**
- ग्रिड इमिशन फैक्टर: **0.82 kg CO₂/kWh** (CEA 2023)
- 100 kWh/माह → **82 kg CO₂/माह**
- भारतीय औसत घर: ~150 kWh → ~123 kg CO₂/माह

🌿 **कम करने के तरीके:**
- LED बल्ब: 3 kg CO₂/माह कम
- सोलर (2 kW): 24 kg CO₂/माह बचत
- बायोगैस: 15 kg CO₂/माह बचत
- 5-स्टार AC: 20 kg CO₂/माह बचत

🎯 लक्ष्य: **50 kWh/माह** से कम खपत = ग्रीन घर!`
        : `**Household Carbon Footprint**

⚡ **CO₂ from electricity:**
- Grid emission factor: **0.82 kg CO₂/kWh** (CEA 2023)
- 100 kWh/month → **82 kg CO₂/month**
- Typical Indian home: ~150 kWh → ~123 kg CO₂/month

🌿 **How to reduce:**
- LED bulbs: cut 3 kg CO₂/month
- 2 kW solar: save 24 kg CO₂/month
- Biogas: save 15 kg CO₂/month
- 5-star AC upgrade: save 20 kg CO₂/month

🎯 Goal: Keep usage under **50 kWh/month** for a Green Home!`;
      navigationSuggestion = '/household';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }

    // ── Recommendations (household) ───────────────────────────────────────────
    if (REC_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**आपके घर के लिए शीर्ष सुझाव**

**1. 💡 LED बल्ब लगाएं**
- लागत: ₹80-150/बल्ब | बचत: ₹300/वर्ष/बल्ब | Payback: 3-6 माह

**2. ☀️ सोलर पैनल (2 kW)**
- लागत: ₹1.2–1.6 लाख | बचत: ₹1,920/माह | Payback: 5-7 वर्ष

**3. ❄️ 5-स्टार AC लें**
- लागत: ₹35,000–50,000 | बचत: ₹1,500/माह | Payback: 2-3 वर्ष

**4. 🌿 बायोगैस प्लांट**
- लागत: ₹15,000–25,000 | बचत: ₹400/माह | Payback: 4-5 वर्ष

**5. 🚿 सोलर वाटर हीटर**
- लागत: ₹8,000–15,000 | बचत: ₹300/माह | Payback: 3-4 वर्ष

Recommendations पृष्ठ पर और विस्तार से देखें →`
        : `**Top Recommendations for Your Home**

**1. 💡 Switch to LED bulbs**
- Cost: ₹80–150/bulb | Saving: ₹300/year/bulb | Payback: 3–6 months

**2. ☀️ Install 2 kW solar panels**
- Cost: ₹1.2–1.6L | Saving: ₹1,920/month | Payback: 5–7 years

**3. ❄️ Upgrade to 5-star AC**
- Cost: ₹35,000–50,000 | Saving: ₹1,500/month | Payback: 2–3 years

**4. 🌿 Home biogas plant**
- Cost: ₹15,000–25,000 | Saving: ₹400/month | Payback: 4–5 years

**5. 🚿 Solar water heater**
- Cost: ₹8,000–15,000 | Saving: ₹300/month | Payback: 3–4 years

See the Recommendations page for full details →`;
      navigationSuggestion = '/recommendations';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }

    // ── Household overview / dashboard ────────────────────────────────────────
    if (OVERVIEW_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**My Household Dashboard — अवलोकन**

My Household Dashboard पर आप देख सकते हैं:
• ⚡ **मासिक खपत** — सभी उपकरणों की कुल खपत (kWh)
• 💰 **अनुमानित लागत** — ₹8/kWh की दर से
• 🌿 **CO₂ उत्सर्जन** — 0.82 kg/kWh
• 🏆 **स्थिरता स्कोर** — लाइव गणना

**उपकरण प्रबंधन:**
- उपकरण जोड़ें/हटाएं
- घंटे और मात्रा बदलें — खर्च तुरंत अपडेट

**ऊर्जा बचत विकल्प:**
- Category-wise upgrade options
- Payback analysis

My Household Dashboard खोलें →`
        : `**My Household Dashboard — Overview**

On the My Household Dashboard you can see:
• ⚡ **Monthly consumption** — all appliances combined (kWh)
• 💰 **Estimated cost** — at ₹8/kWh tariff
• 🌿 **CO₂ emissions** — at 0.82 kg/kWh
• 🏆 **Sustainability score** — live calculation

**Appliance management:**
- Add or remove appliances
- Change hours and quantity — cost updates instantly

**Energy upgrade options:**
- Category-wise upgrade comparison
- Payback period analysis

Open My Household Dashboard →`;
      navigationSuggestion = '/household';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }

    // ── Household fallback ────────────────────────────────────────────────────
    content = isHindi
      ? `मुझे *"${userMessage}"* के लिए कोई विशिष्ट उत्तर नहीं मिला। मैं इन घरेलू विषयों में मदद कर सकती हूँ:

• **बिल बचत:** "बिजली बिल कैसे कम करूं?"
• **उपकरण:** "कौन सा उपकरण सबसे ज़्यादा बिजली खाता है?"
• **सोलर:** "सोलर पैनल से कितनी बचत होगी?"
• **पानी:** "घर में पानी कैसे बचाएं?"
• **बायोगैस:** "बायोगैस क्या है?"
• **स्कोर:** "मेरा स्थिरता स्कोर कैसे सुधारूं?"

**मदद** टाइप करें या ऊपर दिए त्वरित प्रश्न आज़माएं।`
      : `I didn't find a specific match for *"${userMessage}"*. Here are household topics I can help with:

• **Bill savings:** "How do I reduce my electricity bill?"
• **Appliances:** "Which appliance uses the most power?"
• **Solar:** "How much can I save with solar panels?"
• **Water:** "How do I save water at home?"
• **Biogas:** "What is biogas?"
• **Score:** "How do I improve my sustainability score?"

Type **help** for a full list of questions.`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VILLAGE ADMIN / OFFICIAL / GUEST RESPONSES
  // ══════════════════════════════════════════════════════════════════════════

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
• क्षेत्रों की तुलना

उदाहरण: *"मोतीपुर की मासिक बिजली लागत क्या है?"* या *"किस क्षेत्र में सबसे अधिक सौर क्षमता है?"*`
      : `नमस्ते! Hello! I'm Kiran, your sustainability AI assistant for the **Bihar Village Sustainability Region**.

I can help you with:
• Energy consumption & cost analysis across all 5 areas
• Solar potential calculations
• Water demand & rainwater harvesting
• Biogas potential from organic waste
• Sustainability scores & priority recommendations
• Comparing areas and identifying urgent actions

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
**तुलना:** "मोतीपुर और अमरा की तुलना करें"
**अलर्ट:** "किन क्षेत्रों में तत्काल कार्रवाई ज़रूरी है?"

क्षेत्र: Motipur, Oiara, Amra, Barouni, Korha`
      : `I can answer questions like:

**Energy:** "What is [area] monthly consumption?" · "Which area consumes the most per household?"
**Solar:** "What is [area] solar potential?" · "How many panels can fit in Motipur?"
**Water:** "How much rainwater can Amra harvest?" · "What is Oiara's water demand?"
**Waste:** "What is the biogas potential of Motipur?"
**Cost:** "How much does Korha spend on electricity?"
**Scores:** "What is Barouni's sustainability score?"
**Recommendations:** "What is the top recommendation?" · "How can Amra improve?"
**Region:** "Give me the region overview"
**Compare:** "Compare Motipur and Amra"
**Alerts:** "Which areas need urgent action?"`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
  }

  // ── Alerts / critical areas ────────────────────────────────────────────────
  if (VA_ALERT_KEYWORDS.some((k) => q.includes(k))) {
    const sorted = [...analyses].sort((a, b) => b.priorityIndex - a.priorityIndex).slice(0, 3);
    content = isHindi
      ? `**तत्काल ध्यान देने योग्य क्षेत्र**

${sorted.map((a, i) => `**${i + 1}. ${a.area.name}** — Priority Index: ${a.priorityIndex.toFixed(0)}/100
- मासिक लागत: ${formatINR(a.monthlyCostINR)}
- स्थिरता स्कोर: ${a.sustainabilityScore}/100
- कारण: ${a.priorityReasons[0] ?? 'उच्च खपत'}`).join('\n\n')}

Alerts पृष्ठ पर सभी अलर्ट देखें →`
      : `**Areas Needing Urgent Action**

${sorted.map((a, i) => `**${i + 1}. ${a.area.name}** — Priority Index: ${a.priorityIndex.toFixed(0)}/100
- Monthly cost: ${formatINR(a.monthlyCostINR)}
- Sustainability score: ${a.sustainabilityScore}/100
- Reason: ${a.priorityReasons[0] ?? 'High consumption'}`).join('\n\n')}

Visit the Alerts page for all notifications →`;
    navigationSuggestion = '/alerts';
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
  }

  // ── Area comparison ────────────────────────────────────────────────────────
  if (VA_COMPARE_KEYWORDS.some((k) => q.includes(k))) {
    const mentioned = analyses.filter((a) => q.toLowerCase().includes(a.area.name.toLowerCase()));
    if (mentioned.length >= 2) {
      const [a1, a2] = mentioned;
      content = isHindi
        ? `**${a1.area.name} vs ${a2.area.name} — तुलना**

| मापदंड | ${a1.area.name} | ${a2.area.name} |
|--------|---------------|---------------|
| मासिक खपत | ${a1.area.monthlyElectricity.toLocaleString()} kWh | ${a2.area.monthlyElectricity.toLocaleString()} kWh |
| मासिक लागत | ${formatINR(a1.monthlyCostINR)} | ${formatINR(a2.monthlyCostINR)} |
| स्थिरता स्कोर | ${a1.sustainabilityScore}/100 | ${a2.sustainabilityScore}/100 |
| सौर क्षमता | ${a1.solarPotential.feasibleCapacityKW} kW | ${a2.solarPotential.feasibleCapacityKW} kW |
| वर्षा जल ऑफसेट | ${a1.waterAnalysis.rainwaterOffsetPercent}% | ${a2.waterAnalysis.rainwaterOffsetPercent}% |
| CO₂/माह | ${(a1.co2KgPerMonth / 1000).toFixed(1)} टन | ${(a2.co2KgPerMonth / 1000).toFixed(1)} टन |`
        : `**${a1.area.name} vs ${a2.area.name} — Comparison**

| Metric | ${a1.area.name} | ${a2.area.name} |
|--------|---------------|---------------|
| Monthly consumption | ${a1.area.monthlyElectricity.toLocaleString()} kWh | ${a2.area.monthlyElectricity.toLocaleString()} kWh |
| Monthly cost | ${formatINR(a1.monthlyCostINR)} | ${formatINR(a2.monthlyCostINR)} |
| Sustainability score | ${a1.sustainabilityScore}/100 | ${a2.sustainabilityScore}/100 |
| Solar potential | ${a1.solarPotential.feasibleCapacityKW} kW | ${a2.solarPotential.feasibleCapacityKW} kW |
| Rainwater offset | ${a1.waterAnalysis.rainwaterOffsetPercent}% | ${a2.waterAnalysis.rainwaterOffsetPercent}% |
| CO₂/month | ${(a1.co2KgPerMonth / 1000).toFixed(1)} t | ${(a2.co2KgPerMonth / 1000).toFixed(1)} t |`;
      navigationSuggestion = '/village';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }
    // fallthrough to general response if < 2 areas named
  }

  // ── Total region cost ──────────────────────────────────────────────────────
  if (VA_COST_ALL_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**क्षेत्र की कुल बिजली लागत**

| क्षेत्र | मासिक खपत | मासिक लागत |
|--------|-----------|-----------|
${analyses.map((a) => `| ${a.area.name} | ${a.area.monthlyElectricity.toLocaleString()} kWh | ${formatINR(a.monthlyCostINR)} |`).join('\n')}
| **कुल** | **${(totals.totalKWh / 1000).toFixed(1)}k kWh** | **${formatINR(totals.totalCost)}** |

सबसे ज़्यादा खर्च: **${[...analyses].sort((a, b) => b.monthlyCostINR - a.monthlyCostINR)[0].area.name}**`
      : `**Region Total Electricity Cost**

| Area | Monthly consumption | Monthly cost |
|------|---------------------|-------------|
${analyses.map((a) => `| ${a.area.name} | ${a.area.monthlyElectricity.toLocaleString()} kWh | ${formatINR(a.monthlyCostINR)} |`).join('\n')}
| **Total** | **${(totals.totalKWh / 1000).toFixed(1)}k kWh** | **${formatINR(totals.totalCost)}** |

Highest spender: **${[...analyses].sort((a, b) => b.monthlyCostINR - a.monthlyCostINR)[0].area.name}**`;
    navigationSuggestion = '/village';
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
  }

  // ── Region CO₂ ───────────────────────────────────────────────────────────
  if (VA_CO2_REGION_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**क्षेत्र का कुल CO₂ उत्सर्जन**

मासिक कुल: **${(totals.totalCO2 / 1000).toFixed(1)} टन CO₂**

| क्षेत्र | CO₂ (kg/माह) |
|--------|-------------|
${analyses.map((a) => `| ${a.area.name} | ${(a.co2KgPerMonth).toFixed(0)} kg |`).join('\n')}

यदि सभी सौर क्षमता उपयोग हो: **${(analyses.reduce((s, a) => s + a.solarPotential.co2AvoidedKgPerMonth, 0) / 1000).toFixed(1)} टन/माह बचत** संभव!`
      : `**Region Total CO₂ Emissions**

Monthly total: **${(totals.totalCO2 / 1000).toFixed(1)} tonnes CO₂**

| Area | CO₂ (kg/month) |
|------|----------------|
${analyses.map((a) => `| ${a.area.name} | ${(a.co2KgPerMonth).toFixed(0)} kg |`).join('\n')}

If all solar potential is used: **${(analyses.reduce((s, a) => s + a.solarPotential.co2AvoidedKgPerMonth, 0) / 1000).toFixed(1)} t/month** CO₂ could be avoided!`;
    navigationSuggestion = '/score';
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
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

  // ── Village admin fallback ────────────────────────────────────────────────
  content = isHindi
    ? `मुझे *"${userMessage}"* के लिए कोई विशिष्ट उत्तर नहीं मिला। मैं इन विषयों में मदद कर सकती हूँ:

• **क्षेत्र-विशिष्ट:** "मोतीपुर की ऊर्जा खपत क्या है?"
• **तुलना:** "मोतीपुर और अमरा की तुलना करें"
• **अलर्ट:** "किन क्षेत्रों में तत्काल कार्रवाई ज़रूरी है?"
• **मापदंड:** "कोरहा की सौर क्षमता दिखाएं"
• **सुझाव:** "शीर्ष सुझाव क्या हैं?"
• **अवलोकन:** "क्षेत्र का सारांश दें"

**मदद** टाइप करें या ऊपर दिए त्वरित प्रश्न आज़माएं।`
    : `I didn't find a specific match for *"${userMessage}"*. Here are some things I can help with:

• **Area-specific:** "What is Motipur's energy consumption?"
• **Compare areas:** "Compare Motipur and Amra"
• **Alerts:** "Which areas need urgent action?"
• **Metrics:** "Show me Korha's solar potential"
• **Recommendations:** "What are the top recommendations?"
• **Overview:** "Give me the region summary"

Type **help** for a full list of queries.`;

  return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
}
