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

// ── Global Keyword Banks ───────────────────────────────────────────────────────
const GREETINGS = ['hello', 'hi', 'namaste', 'hey', 'pranam', 'नमस्ते', 'हेलो', 'हाय', 'प्रणाम'];
const TIME_GREETINGS = ['good morning', 'good evening', 'good afternoon', 'shubh prabhat', 'shubh sandhya', 'शुभ प्रभात', 'शुभ संध्या', 'सुप्रभात'];
const HOW_ARE_YOU = ['how are you', 'how r u', 'how do you do', 'kya haal', 'kaise ho', 'kaisi ho', 'सब ठीक', 'कैसे हो', 'कैसी हो', 'क्या हाल'];
const IDENTITY_KEYWORDS = ['who are you', 'what is your name', 'whats your name', 'who made you', 'who created you', 'aap kaun ho', 'tum kaun ho', 'tera naam', 'tumhara naam', 'kisne banaya', 'आप कौन हैं', 'आपका नाम', 'तुम कौन हो', 'किसने बनाया', 'परिचय'];
const THANKS_KEYWORDS = ['thank', 'thanks', 'dhanyawad', 'shukriya', 'धन्यवाद', 'शुक्रिया', 'थैंक यू', 'थैंक्स'];
const BYE_KEYWORDS = ['bye', 'goodbye', 'see you', 'tata', 'alvida', 'phir milenge', 'अलविदा', 'बाय', 'फिर मिलेंगे', 'टाटा'];
const JOKE_KEYWORDS = ['joke', 'chutkula', 'make me laugh', 'funny', 'जोक', 'चुटकुला', 'मजाक', 'हंसाओ'];

// Domain Keyword Banks
const SCHEME_KEYWORDS = ['scheme', 'subsidy', 'yojana', 'pm surya', 'kusum', 'gobar dhan', 'satat', 'subsidies', 'योजना', 'सब्सिडी', 'पीएम सूर्य घर', 'कुसुम', 'गोबर धन', 'सरकारी'];
const BLDC_KEYWORDS = ['bldc', 'fan', 'ceiling fan', 'पंखा', 'सीलिंग फैन', 'bldc पंखा'];
const SOLAR_PUMP_KEYWORDS = ['solar pump', 'irrigation', 'tubewell', 'agriculture pump', 'खेती पंप', 'सिंचाई', 'सोलर पंप', 'ट्यूबवेल', 'पंपिंग'];
const SOLAR_MAINTENANCE_KEYWORDS = ['maintenance', 'cleaning', 'clean panel', 'dust', 'cleaning solar', 'रखरखाव', 'सफाई', 'धूल', 'सोलर सफाई', 'धोना'];
const BATTERY_INVERTER_KEYWORDS = ['battery', 'inverter', 'backup', 'off grid', 'on grid', 'net meter', 'बैटरी', 'इन्वर्टर', 'नेट मीटरिंग', 'बैकअप', 'ऑफ ग्रिड', 'ऑन ग्रिड'];
const SLURRY_KEYWORDS = ['slurry', 'fertilizer', 'manure', 'organic farming', 'खाद', 'स्लरी', 'जैविक खाद', 'गोबर खाद'];
const WATER_QUALITY_KEYWORDS = ['quality', 'arsenic', 'fluoride', 'groundwater', 'pure water', 'शुद्ध पानी', 'आर्सेनिक', 'फ्लोराइड', 'भूजल', 'जल गुणवत्ता'];
const STREETLIGHT_KEYWORDS = ['streetlight', 'street light', 'light pole', 'स्ट्रीट लाइट', 'सड़क बत्ती', 'खंभा'];

// General & Village Keywords
const SOLAR_KEYWORDS = ['solar', 'panel', 'sun', 'rooftop', 'generation', 'सौर', 'पैनल', 'सूर्य', 'छत'];
const WATER_KEYWORDS = ['water', 'rainwater', 'pump', 'demand', 'पानी', 'वर्षा', 'जल', 'पंप'];
const WASTE_KEYWORDS = ['waste', 'biogas', 'dung', 'organic', 'कचरा', 'बायोगैस', 'गोबर', 'जैविक'];
const ENERGY_KEYWORDS = ['energy', 'consumption', 'electricity', 'kwh', 'बिजली', 'खपत', 'ऊर्जा'];
const COST_KEYWORDS = ['cost', 'bill', 'price', 'savings', 'लागत', 'बचत', 'बिल', 'कीमत', 'खर्च'];
const SCORE_KEYWORDS = ['score', 'grade', 'sustainability', 'rating', 'स्कोर', 'ग्रेड', 'स्थिरता'];
const REC_KEYWORDS = ['recommendation', 'suggest', 'improve', 'action', 'सुझाव', 'सुधार', 'कार्य'];
const HELP_KEYWORDS = ['help', 'what can', 'how do', 'कैसे', 'मदद', 'सहायता'];
const OVERVIEW_KEYWORDS = ['region', 'overview', 'all areas', 'summary', 'क्षेत्र', 'अवलोकन', 'सभी', 'सारांश'];
const HIGHEST_KEYWORDS = ['highest', 'most', 'top', 'best', 'सबसे', 'सर्वश्रेष्ठ', 'अधिकतम', 'शीर्ष'];

// Household-specific keyword banks
const HH_BILL_KEYWORDS = ['bill', 'reduce', 'cut', 'save money', 'lower', 'बिल', 'कम करना', 'बचत', 'घटाना', 'महंगा'];
const HH_APPLIANCE_KEYWORDS = ['appliance', 'fridge', 'ac', 'fan', 'tv', 'bulb', 'pump', 'heater', 'washing', 'उपकरण', 'फ्रिज', 'एसी', 'पंखा', 'टीवी', 'बल्ब', 'वॉशिंग', 'हीटर'];
const HH_SOLAR_HOME_KEYWORDS = ['home solar', 'rooftop solar', 'solar for home', 'install solar', 'घर सोलर', 'सोलर लगाना', 'छत सोलर'];
const HH_WATER_HOME_KEYWORDS = ['water at home', 'save water', 'water bill', 'water usage', 'घर पानी', 'पानी बचाएं', 'पानी की बचत'];
const HH_BIOGAS_KEYWORDS = ['biogas', 'kitchen waste', 'cow dung', 'cooking gas', 'बायोगैस', 'रसोई कचरा', 'खाना पकाना', 'गोबर गैस'];
const HH_SCORE_HOME_KEYWORDS = ['my score', 'household score', 'home score', 'मेरा स्कोर', 'घर का स्कोर', 'मेरी रेटिंग'];
const HH_LED_KEYWORDS = ['led', 'bulb', 'light', 'lighting', 'बल्ब', 'लाइट', 'रोशनी', 'led बल्ब'];
const HH_AC_KEYWORDS = ['air conditioner', 'ac', 'cooling', 'air con', 'एसी', 'ठंडक', 'एयर कंडीशनर'];
const HH_FRIDGE_KEYWORDS = ['refrigerator', 'fridge', 'freeze', 'रेफ्रिजरेटर', 'फ्रिज'];
const HH_TIPS_KEYWORDS = ['tip', 'advice', 'trick', 'easy', 'simple', 'how to save', 'सुझाव', 'टिप्स', 'आसान', 'कैसे बचाएं'];
const HH_CO2_KEYWORDS = ['co2', 'carbon', 'emission', 'environment', 'pollution', 'कार्बन', 'उत्सर्जन', 'पर्यावरण', 'प्रदूषण'];
const HH_WATER_HARVEST_KEYWORDS = ['rainwater', 'harvest', 'tank', 'collect rain', 'वर्षा जल', 'बारिश', 'टंकी', 'संचयन'];

// Village-admin extra keyword banks
const VA_COMPARE_KEYWORDS = ['compare', 'versus', 'vs', 'better', 'worse', 'comparison', 'तुलना', 'बनाम', 'अंतर'];
const VA_COST_ALL_KEYWORDS = ['total cost', 'region cost', 'all areas cost', 'कुल लागत', 'सभी क्षेत्र'];
const VA_ALERT_KEYWORDS = ['alert', 'warning', 'critical', 'urgent', 'अलर्ट', 'चेतावनी', 'तत्काल', 'जरूरी'];
const VA_CO2_REGION_KEYWORDS = ['region co2', 'total emissions', 'carbon footprint', 'क्षेत्र कार्बन', 'कुल उत्सर्जन'];

// ── Main Chat Generation Function ─────────────────────────────────────────────

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
  // 1. UNIVERSAL CASUAL & BASIC CONVERSATIONS
  // ══════════════════════════════════════════════════════════════════════════

  // ── Time-based Greetings (Good morning / evening) ──────────────────────────
  if (TIME_GREETINGS.some((g) => q.includes(g))) {
    content = isHindi
      ? `**शुभ समय!** ☀️🌱

आशा है आपका दिन ऊर्जावान और सुखद बीत रहा है! मैं मनु AI हूँ — ग्राम ऊर्जा और घरेलू संवहनीयता के लिए आपका डिजिटल साथी।

आज मैं आपकी किस प्रकार मदद कर सकता हूँ? सोलर पैनल सब्सिडी, बिजली बिल बचत, या जल प्रबंधन?`
      : `**Good day!** ☀️🌱

Hope you are having a bright and productive day! I'm Manu AI — your digital companion for rural clean energy and household sustainability.

How may I assist you today? Ask me about solar subsidies, reducing power bills, or water management!`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
  }

  // ── How are you / हाल-चाल ─────────────────────────────────────────────────
  if (HOW_ARE_YOU.some((k) => q.includes(k))) {
    content = isHindi
      ? `मैं बहुत बढ़िया और **100% स्वच्छ सौर ऊर्जा से चार्ज** हूँ! ⚡🌿

आप बताएं, आपका दिन कैसा चल रहा है? 
क्या आप अपने घर का बिजली बिल कम करना चाहते हैं या ग्राम पंचायत की ऊर्जा योजनाओं के बारे में जानना चाहते हैं?`
      : `I'm doing fantastic and **fully charged with 100% clean solar energy!** ⚡🌿

How are you doing today? 
Would you like help cutting your electricity bill or exploring village sustainability schemes?`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
  }

  // ── Who are you / Identity / Name ─────────────────────────────────────────
  if (IDENTITY_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**नमस्ते! मैं मनु AI (Manu AI) हूँ।** 🤖🌿

मैं **GramUrja (ग्रामीण ऊर्जा एवं संवहनीयता इंटेलिजेंस प्लेटफ़ॉर्म)** का समर्पित AI सहायक हूँ।

🎯 **मेरा उद्देश्य:**
• भारतीय गांवों और ग्राम पंचायतों को स्वच्छ ऊर्जा, सौर ऊर्जा और बायोगैस से सशक्त बनाना।
• ग्रामीण परिवारों का बिजली बिल कम करने और सही सरकारी सब्सिडी दिलाने में मदद करना।
• जल संरक्षण और वर्षा जल संचयन की सटीक गणना उपलब्ध कराना।

आप मुझसे सौर ऊर्जा, बायोगैस, पानी की बचत, सरकारी योजनाओं या उपकरणों की बिजली खपत के बारे में कभी भी पूछ सकते हैं!`
      : `**Hello! I'm Manu AI.** 🤖🌿

I am the dedicated AI assistant for **GramUrja — Rural Sustainability Intelligence Platform**.

🎯 **My Mission:**
• Empower Indian villages & Gram Panchayats with clean solar, biomass & biogas intelligence.
• Help rural households slash electricity bills & access government subsidies (PM Surya Ghar, KUSUM).
• Provide deterministic calculations for water harvesting, energy ROI, and carbon offsets.

Feel free to ask me anything about solar setups, biogas, power savings, or village sustainability analytics!`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
  }

  // ── Thanks / धन्यवाद ───────────────────────────────────────────────────────
  if (THANKS_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**आपका बहुत-बहुत धन्यवाद!** 🙏✨

स्वच्छ ऊर्जा और पर्यावरण संरक्षण की दिशा में आपका हर कदम महत्वपूर्ण है। यदि आपके पास कोई और सवाल हो, तो बेझिझक पूछें!`
      : `**You're most welcome!** 🙏✨

Every step you take towards clean energy and conservation builds a greener India. Feel free to ask whenever you need further insights!`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
  }

  // ── Goodbye / अलविदा ───────────────────────────────────────────────────────
  if (BYE_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**अलविदा! फिर मिलेंगे!** 🌿👋

ऊर्जा बचाएं, पर्यावरण संवारें और सुरक्षित रहें। जब भी ज़रूरत हो, मनु AI आपके साथ है!`
      : `**Goodbye! Take care!** 🌿👋

Save energy, nurture nature, and stay empowered. Manu AI is always here whenever you return!`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
  }

  // ── Joke / चुटकुला ────────────────────────────────────────────────────────
  if (JOKE_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `😄 **यहाँ एक मजेदार ऊर्जा चुटकुला है:**

**सवाल:** सौर पैनल स्कूल क्यों गया? ☀️🏫
**जवाब:** ताकि वह और ज़्यादा *ब्राइट* (होशियार और चमकदार) बन सके! 💡😂

स्वच्छ ऊर्जा से हर चेहरा खिलता है! अब बताइए, क्या कोई ऊर्जा संबंधी सवाल हल करें?`
      : `😄 **Here is a clean energy joke for you:**

**Question:** Why did the solar panel go to school? ☀️🏫
**Answer:** Because it wanted to be *brighter!* 💡😂

Solar energy keeps things light and efficient! What sustainability topic should we explore next?`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. EXTENDED DOMAIN TOPICS (GOVT SCHEMES, BLDC, IRRIGATION, MAINTENANCE)
  // ══════════════════════════════════════════════════════════════════════════

  // ── Government Subsidies (PM Surya Ghar, KUSUM, GOBAR-Dhan, SATAT) ─────────
  if (SCHEME_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**🇮🇳 प्रमुख सरकारी स्वच्छ ऊर्जा योजनाएं एवं सब्सिडी**

1. ☀️ **पीएम सूर्य घर: मुफ्त बिजली योजना (PM Surya Ghar)**
• 1 kW रूफटॉप सोलर: **₹30,000 सब्सिडी**
• 2 kW रूफटॉप सोलर: **₹60,000 सब्सिडी**
• 3 kW या अधिक: **₹78,000 अधिकतम सब्सिडी**
• प्रति माह 300 यूनिट तक मुफ्त बिजली का लाभ!

2. 🌾 **पीएम-कुसुम योजना (PM KUSUM — कृषि सोलर पंप)**
• 60% सरकारी सब्सिडी (30% केंद्र + 30% राज्य)
• 30% बैंक ऋण (आसान किस्तों पर)
• किसान को केवल **10%** भुगतान करना होता है।

3. 🐄 **गोबर-धन एवं SATAT योजना (GOBAR-Dhan & SATAT)**
• ग्रामीण स्तर पर कम्प्रेस्ड बायोगैस (CBG) और बायोमास प्लांट लगाने पर पूंजीगत अनुदान।
• जैविक खाद (Slurry) की बिक्री से अतिरिक्त आय।

4. 💧 **जल जीवन मिशन (Jal Jeevan Mission)**
• प्रति व्यक्ति प्रतिदिन 55 लीटर (55 LPCD) शुद्ध नल जल मानक।

सोलर पेज पर अपने गांव की क्षमता देखें →`
      : `**🇮🇳 Key Government Clean Energy Schemes & Subsidies**

1. ☀️ **PM Surya Ghar: Muft Bijli Yojana**
• 1 kW Rooftop Solar: **₹30,000 subsidy**
• 2 kW Rooftop Solar: **₹60,000 subsidy**
• 3 kW+ Systems: **₹78,000 maximum subsidy**
• Provides up to 300 free units of electricity per month!

2. 🌾 **PM-KUSUM Scheme (Solar Agriculture Pumps)**
• 60% Government Subsidy (30% Central + 30% State)
• 30% Bank Loan facility with low interest
• Farmer only pays **10% upfront**.

3. 🐄 **GOBAR-Dhan & SATAT Schemes**
• Financial incentives for rural community biogas & Compressed Biogas (CBG) plants.
• Organic bio-slurry monetized for soil health.

4. 💧 **Jal Jeevan Mission**
• Benchmarked standard: 55 Litres Per Capita per Day (55 LPCD) potable water.

Explore sizing and payback on the Solar page →`;
    navigationSuggestion = '/solar';
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
  }

  // ── BLDC Energy Efficient Fans ────────────────────────────────────────────
  if (BLDC_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**🌀 BLDC पंखा — 60% बिजली की सीधी बचत**

| पंखे का प्रकार | वाट क्षमता | दैनिक खपत (12घं) | मासिक खर्च (@₹8/kWh) |
|---|---|---|---|
| साधारण इंडक्शन पंखा | 75W | 0.90 kWh | **₹216 / माह** |
| **5-स्टार BLDC पंखा** | **28W** | **0.33 kWh** | **₹80 / माह** |
| **सीधी बचत** | **47W कम** | **0.57 kWh** | **₹136 / माह / पंखा** |

💡 **मुख्य फायदे:**
• एक BLDC पंखा साल में **₹1,632** की बचत करता है।
• घर के 3 पंखे बदलने पर **₹4,896/वर्ष** की शुद्ध बचत!
• इनवर्टर पर 3 गुना ज़्यादा लंबा बैकअप।
• 1.5 से 2 वर्ष में पंखे की पूरी कीमत वसूल (Payback)।`
      : `**🌀 BLDC Energy Saving Fans — Cut Power by 60%**

| Fan Type | Wattage | Daily Use (12 hrs) | Monthly Cost (@₹8/kWh) |
|---|---|---|---|
| Regular Induction Fan | 75W | 0.90 kWh | **₹216 / month** |
| **5-Star BLDC Fan** | **28W** | **0.33 kWh** | **₹80 / month** |
| **Net Savings** | **47W less** | **0.57 kWh** | **₹136 / month / fan** |

💡 **Key Highlights:**
• One BLDC fan saves **₹1,632 every year**.
• Upgrading 3 ceiling fans saves **₹4,896/year**!
• Runs 3x longer on home inverter battery during power cuts.
• Full payback period in just 1.5–2 years.`;
    navigationSuggestion = '/household';
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
  }

  // ── Solar Agricultural Pumps & Irrigation ──────────────────────────────────
  if (SOLAR_PUMP_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**🌾 सौर कृषि पंप (Solar Irrigation Pumps)**

🚜 **डीजल पंप बनाम सोलर पंप तुलना:**
• **डीजल पंप खर्च:** ₹150–200 प्रति घंटा डीजल = ₹40,000–60,000 प्रति वर्ष!
• **सोलर पंप खर्च:** **₹0 ईंधन खर्च** (सूरज की रोशनी से स्वचालित)।

☀️ **सिफारिशें:**
• 3 HP DC सोलर पंप: 2–3 एकड़ सिंचाई के लिए उपयुक्त (दैनिक 1.5–2 लाख लीटर पानी)।
• 5 HP सोलर पंप: 5 एकड़ से अधिक रकबे के लिए।
• **पीएम कुसुम योजना** के तहत 90% तक वित्तीय सहायता (60% सब्सिडी + 30% ऋण)।

🌱 अतिरिक्त लाभ: दिन के समय भरपूर पानी, ग्रिड बिजली कटौती से पूर्ण स्वतंत्रता!`
      : `**🌾 Solar Agricultural Pumps for Irrigation**

🚜 **Diesel Pump vs. Solar Pump Comparison:**
• **Diesel Running Cost:** ₹150–200/hour in fuel = ₹40,000–60,000 per year!
• **Solar Pump Running Cost:** **₹0 recurring fuel cost** (runs directly on sunlight).

☀️ **Sizing Guide:**
• 3 HP DC Solar Pump: Ideal for 2–3 acres (discharges ~1.5–2 lakh litres/day).
• 5 HP Solar Pump: Suitable for 5+ acres of farmland.
• Up to 90% financial support via **PM-KUSUM** (60% subsidy + 30% loan).

🌱 Extra benefit: Guaranteed daytime irrigation without relying on erratic rural grid power!`;
    navigationSuggestion = '/water';
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
  }

  // ── Solar Panel Maintenance & Cleaning ────────────────────────────────────
  if (SOLAR_MAINTENANCE_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**☀️ सोलर पैनल की सफाई और रखरखाव गाइड**

धूल और मिट्टी की परत से सोलर उत्पादन **15% से 25% तक घट जाता है**।

🧹 **सफाई के महत्वपूर्ण नियम:**
1. **सफाई का सही समय:** सुबह जल्दी (8 बजे से पहले) या शाम को — जब पैनल ठंडे हों। धूप में ठंडा पानी डालने से ग्लास चटक सकता है।
2. **सादा पानी और मुलायम कपड़ा:** केवल स्वच्छ पानी और माइक्रोफाइबर या स्पंज का प्रयोग करें।
3. **केमिकल या डिटर्जेंट न डालें:** कठोर साबुन एंटी-रिफ्लेक्टिव कोटिंग को नुकसान पहुंचाते हैं।
4. **सफाई चक्र:** बिहार के ग्रामीण क्षेत्रों में हर **10–15 दिन** में एक बार धोना पर्याप्त है।

⚡ समय पर सफाई से प्रति माह 15–30 kWh अतिरिक्त बिजली मिलती है!`
      : `**☀️ Solar Panel Cleaning & Maintenance Guide**

Accumulated rural dust and pollen can reduce solar generation by **15% to 25%**.

🧹 **Best Cleaning Practices:**
1. **Best Time:** Early morning (before 8 AM) or evening when panels are cool. Never spray cold water on scorching hot panels (prevents thermal crack).
2. **Use Plain Water & Soft Sponge:** Clean with soft microfiber cloth or rubber squeegee.
3. **No Harsh Chemicals:** Avoid detergents or abrasives that degrade the anti-reflective glass coating.
4. **Cleaning Frequency:** Once every **10–15 days** during dry/dusty seasons.

⚡ Keeping panels dust-free recovers up to 15–30 kWh extra monthly generation!`;
    navigationSuggestion = '/solar';
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
  }

  // ── Battery Storage, Inverters & Net Metering ──────────────────────────────
  if (BATTERY_INVERTER_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**🔋 सोलर इन्वर्टर, बैटरी और नेट मीटरिंग**

⚡ **प्रणालियों के प्रकार:**
1. **ऑन-ग्रिड (On-Grid) / नेट मीटरिंग:**
   - दिन में बनी अतिरिक्त बिजली ग्रिड को बेची जाती है।
   - सबसे कम लागत, सबसे तेज़ Payback (4–5 वर्ष)।
   - बिहार में NBPDCL/SBPDCL नेट मीटरिंग नियम लागू।

2. **हाइब्रिड / ऑफ-ग्रिड (With Battery):**
   - लिथियम (LiFePO4) या ट्यूबलर बैटरी बैकअप।
   - बार-बार बिजली कटने वाले ग्रामीण इलाकों के लिए सर्वोत्तम।
   - लिथियम बैटरी का जीवनकाल: 8–10 वर्ष (3000+ चक्र)।

💡 **सुझाव:** ग्रामीण क्षेत्रों में 3 kW हाइब्रिड सिस्टम + 5 kWh बैटरी बैकअप 24x7 बिजली सुनिश्चित करता है।`
      : `**🔋 Solar Inverters, Battery Storage & Net Metering**

⚡ **System Architectures:**
1. **On-Grid with Net Metering:**
   - Surpluses generated during peak sunshine are fed back to the DISCOM grid (NBPDCL/SBPDCL).
   - Lowest initial cost with the fastest payback (4–5 years).

2. **Hybrid / Off-Grid with Battery Backup:**
   - Paired with Lithium-ion (LiFePO4) or Tall Tubular batteries.
   - Ideal for rural areas with periodic grid outages.
   - Lithium battery lifespan: 8–10 years (3,000+ deep cycles).

💡 **Recommendation:** A 3 kW hybrid system with 5 kWh storage guarantees 24x7 power security for rural homes.`;
    navigationSuggestion = '/solar';
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
  }

  // ── Biogas Slurry / Organic Fertilizer ─────────────────────────────────────
  if (SLURRY_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**🌱 बायोगैस स्लरी — शुद्ध जैविक खाद**

बायोगैस डाइजेस्टर से निकलने वाला तरल अवशेष (Slurry) उत्तम कोटि की जैविक खाद है।

🌾 **मुख्य लाभ:**
• **एनपीके (N-P-K) से भरपूर:** इसमें नाइट्रोजन, फास्फोरस और पोटाश सुलभ रूप में होते हैं।
• **रासायनिक खाद की बचत:** यूरिया और डीएपी की खरीद में **₹3,000–5,000 प्रति एकड़/वर्ष** की बचत।
• **केंचुआ एवं सूक्ष्मजीव वृद्धि:** मिट्टी की जल-धारण क्षमता और उपजाऊपन बढ़ाता है।
• **खरपतवार मुक्त:** डाइजेशन प्रक्रिया में खरपतवार के बीज नष्ट हो जाते हैं।

बायोगैस से भोजन भी पकता है और खेतों के लिए मुफ्त खाद भी मिलती है!`
      : `**🌱 Biogas Digestate Slurry — Liquid Bio-Fertilizer**

The byproduct slurry from biogas digesters is a nutrient-dense organic fertilizer.

🌾 **Key Advantages:**
• **Rich in Plant-Available N-P-K:** Readily absorbed nitrogen, phosphorus, and potassium.
• **Cuts Chemical Costs:** Saves **₹3,000–5,000 per acre/year** on synthetic Urea and DAP.
• **Improves Soil Health:** Enhances microbial biodiversity and water retention capacity.
• **Weed & Pathogen Free:** Anaerobic fermentation neutralizes harmful weed seeds.

Biogas provides zero-cost cooking fuel while creating free premium manure for your crops!`;
    navigationSuggestion = '/waste';
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
  }

  // ── Groundwater Quality & Arsenic Mitigation ──────────────────────────────
  if (WATER_QUALITY_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**💧 भूजल गुणवत्ता और वर्षा जल समाधान**

बिहार के गंगा के मैदानी इलाकों में भूजल में अत्यधिक आयरन, आर्सेनिक और फ्लोराइड की समस्या पाई जाती है।

🛡️ **समाधान एवं संरक्षण:**
1. **वर्षा जल संचयन (Rainwater Harvesting):** छत से एकत्र वर्षा जल प्राकृतिक रूप से 100% केमिकल-मुक्त और शुद्ध होता है।
2. **भूजल पुनर्भरण (Recharge Pits):** अतिरिक्त वर्षा जल को जमीन में उतारने से स्थानीय जलस्तर सुधरता है और आर्सेनिक की सांद्रता कम होती है।
3. **सैंड-ग्रेवल फिल्टर:** कम लागत वाले फिल्टर से छत का पानी सीधे घरेलू उपयोग योग्य बनता है।

जल पृष्ठ पर अपने क्षेत्र की संचयन क्षमता देखें →`
      : `**💧 Groundwater Quality & Rainwater Solutions**

Parts of the Gangetic plain in Bihar face elevated groundwater iron, arsenic, and fluoride levels.

🛡️ **Mitigation & Clean Water Strategy:**
1. **Rooftop Rainwater Harvesting:** Rainwater harvested from clean rooftops is naturally pure, soft, and contaminant-free.
2. **Aquifer Recharge Wells:** Diverting surplus monsoon runoff into recharge pits replenishes village water tables and dilutes mineral concentration.
3. **Multi-layer Sand & Gravel Filtration:** Low-cost, maintenance-free domestic filtration.

See detailed harvesting potential on the Water page →`;
    navigationSuggestion = '/water';
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
  }

  // ── Streetlight Optimization ──────────────────────────────────────────────
  if (STREETLIGHT_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**💡 ग्राम पंचायत स्ट्रीटलाइट स्वचालन**

• **पारंपरिक सोडियम/हैलोजन लाइट:** 150W–250W प्रति लाइट (भारी बिजली बिल)।
• **स्मार्ट LED स्ट्रीटलाइट:** **30W–45W** (70% बिजली बचत)।
• **ऑटो डस्क-टू-डॉन सेंसर:** शाम होते ही स्वतः चालू और भोर में बंद होने से दिन में व्यर्थ बिजली जलना बंद।
• **सोलर स्ट्रीटलाइट किट:** प्रत्येक पोल पर 40W सोलर पैनल + लिथियम बैटरी = ₹0 ग्रिड लोड।`
      : `**💡 Gram Panchayat Streetlight Optimization**

• **Legacy Sodium/Halogen Lamps:** 150W–250W per pole (heavy panchayat power drain).
• **Smart LED Streetlights:** **30W–45W** (delivers 70% energy reduction).
• **Dusk-to-Dawn Optical Timers:** Eliminates daytime wastage with automatic light switching.
• **Standalone Solar Streetlight Kits:** 40W solar panel + integrated LiFePO4 battery = Zero grid burden.`;
    navigationSuggestion = '/village';
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3. HOUSEHOLD-SPECIFIC RESPONSES (role === 'citizen')
  // ══════════════════════════════════════════════════════════════════════════

  if (isHousehold) {

    // ── Greetings (household) ───────────────────────────────────────────────
    if (GREETINGS.some((g) => q.startsWith(g) || q === g)) {
      content = isHindi
        ? `नमस्ते! मैं मनु AI हूँ — आपकी **घरेलू ऊर्जा AI सहायक**।

मैं आपकी इन बातों में मदद कर सकता हूँ:
• बिजली बिल कम करने के उपाय
• सबसे ज़्यादा बिजली खाने वाले उपकरण
• सोलर पैनल की बचत और सरकारी सब्सिडी
• BLDC पंखे और 5-स्टार उपकरण
• घर में पानी और बायोगैस बचत

उदाहरण: *"मेरा फ्रिज कितनी बिजली खाता है?"* या *"सोलर पैनल पर कितनी सब्सिडी मिलेगी?"*`
        : `Hello! I'm Manu AI — your **Household Energy AI Assistant**.

I can help you with:
• Cutting your monthly electricity bill
• Identifying power-draining appliances
• Solar panel sizing, savings, and government subsidies
• BLDC fans & 5-star appliance upgrades
• Rainwater harvesting & home biogas

Try asking: *"How much does a BLDC fan save?"* or *"What subsidy is available for home solar?"*`;
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
    }

    // ── Help (household) ────────────────────────────────────────────────────
    if (HELP_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `मैं इन घरेलू सवालों के जवाब दे सकता हूँ:

**बिल बचत:** "बिजली बिल कैसे कम करूं?" · "आसान बचत के तरीके क्या हैं?"
**उपकरण:** "कौन सा उपकरण सबसे ज़्यादा बिजली खाता है?" · "BLDC पंखा कितनी बचत करता है?"
**सोलर:** "सोलर पैनल से कितनी बचत होगी?" · "पीएम सूर्य घर योजना क्या है?"
**LED बल्ब:** "LED से कितनी बचत होती है?"
**फ्रिज व AC:** "AC और फ्रिज की बिजली खपत कैसे घटाएं?"
**पानी:** "घर में पानी कैसे बचाएं?" · "वर्षा जल संचयन कैसे करें?"
**बायोगैस:** "रसोई कचरे और गोबर से गैस कैसे बनती है?"
**स्कोर:** "मेरा स्थिरता स्कोर कैसे सुधारूं?"`
        : `I can answer household questions like:

**Bill Savings:** "How do I reduce my electricity bill?" · "What are easy ways to save power?"
**Appliances:** "Which appliance uses the most power?" · "How much does a BLDC fan save?"
**Solar:** "How much can I save with solar?" · "What is the PM Surya Ghar scheme?"
**LED Bulbs:** "How much do LED bulbs save?"
**Fridge & AC:** "How do I cut AC & refrigerator energy consumption?"
**Water:** "How do I save water at home?" · "How to set up rainwater harvesting?"
**Biogas:** "How to make cooking gas from kitchen waste & cow dung?"
**Score:** "How do I improve my sustainability score?"`;
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
2. 🌀 **BLDC पंखे अपनाएं** — साधारण पंखों से 60% कम बिजली
3. ❄️ **AC 24°C पर रखें** — हर 1°C कम करने पर 6% बचत
4. 🌅 **दिन में सोलर** इस्तेमाल करें — रात को ग्रिड से बचें
5. 🔌 **स्टैंडबाय पावर बंद करें** — TV, charger का प्लग निकालें
6. 🌀 **5-स्टार उपकरण** खरीदें — 3-स्टार से 20-30% कम खपत
7. 🚿 **गीजर का कम उपयोग** — सोलर वाटर हीटर लगाएं (₹8-15k)
8. 📊 **अपना डैशबोर्ड** देखें — सबसे ज़्यादा खपत वाला उपकरण पहचानें

👆 My Household Dashboard में अपनी पूरी खपत देखें!`
        : `**8 Easy Ways to Cut Your Electricity Bill**

1. 💡 **Switch to LED bulbs** — 60% less power than CFL, saves ₹300+/year per bulb
2. 🌀 **Upgrade to BLDC fans** — 28W vs 75W saves ₹1,500/year per fan
3. ❄️ **Set AC to 24°C** — every degree lower adds 6% to your bill
4. 🌅 **Use solar during daylight hours** — avoid grid power at peak time
5. 🔌 **Unplug standby devices** — TVs, chargers, set-top boxes waste power
6. 🌀 **Buy 5-star rated appliances** — 20–30% less consumption than 3-star
7. 🚿 **Reduce geyser use** — install a solar water heater (₹8–15k, quick payback)
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
| साधारण पंखा | 75W | 0.6 kWh | 18 kWh | ₹144 |
| BLDC पंखा | 28W | 0.22 kWh | 7 kWh | ₹56 |
| LED (x10) | 90W | 0.72 kWh | 22 kWh | ₹173 |
| TV | 100W | 0.8 kWh | 24 kWh | ₹192 |

🏆 **सबसे ज़्यादा खपत:** AC > गीजर > फ्रिज > साधारण पंखे

अपने घर की सटीक खपत के लिए My Household Dashboard देखें!`
        : `**Household Appliance Power Usage (Estimated)**

| Appliance | Wattage | 8hrs/day | Monthly (8hrs) | Monthly cost |
|-----------|---------|----------|---------------|--------------|
| Old AC | 2,000W | 16 kWh | 480 kWh | ₹3,840 |
| Geyser | 2,000W | — | 60 kWh | ₹480 |
| Old Fridge | 150W | 3.6 kWh | 108 kWh | ₹864 |
| Washing Machine | 500W | — | 15 kWh | ₹120 |
| Old CFL (x10) | 230W | 1.84 kWh | 55 kWh | ₹441 |
| Standard Fan | 75W | 0.6 kWh | 18 kWh | ₹144 |
| BLDC Fan | 28W | 0.22 kWh | 7 kWh | ₹56 |
| LED (x10) | 90W | 0.72 kWh | 22 kWh | ₹173 |
| TV | 100W | 0.8 kWh | 24 kWh | ₹192 |

🏆 **Biggest consumers:** AC > Geyser > Fridge > Standard Fans

Visit My Household Dashboard for your exact breakdown!`;
      navigationSuggestion = '/household';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }

    // ── Home solar ────────────────────────────────────────────────────────────
    if (HH_SOLAR_HOME_KEYWORDS.some((k) => q.includes(k)) || (SOLAR_KEYWORDS.some((k) => q.includes(k)) && !findArea(q))) {
      content = isHindi
        ? `**घर के लिए सोलर पैनल — लागत व सब्सिडी**

• **1 kW सोलर सिस्टम** → ~120 kWh/माह उत्पादन (मासिक बचत: ₹960)
• **2 kW सोलर सिस्टम** → ~240 kWh/माह उत्पादन (मासिक बचत: ₹1,920)
• **3 kW सोलर सिस्टम** → ~360 kWh/माह उत्पादन (मासिक बचत: ₹2,880)

🏛️ **PM Surya Ghar Subsidy:**
• 1 kW: **₹30,000 सब्सिडी**
• 2 kW: **₹60,000 सब्सिडी**
• 3 kW: **₹78,000 सब्सिडी**

Payback अवधि: केवल **3 से 4 वर्ष** (सब्सिडी के बाद)!

सोलर पृष्ठ पर पूरी गणना देखें →`
        : `**Home Solar Panels — Sizing & Subsidies**

• **1 kW Solar System** → ~120 kWh/month (Saves ~₹960/month)
• **2 kW Solar System** → ~240 kWh/month (Saves ~₹1,920/month)
• **3 kW Solar System** → ~360 kWh/month (Saves ~₹2,880/month)

🏛️ **PM Surya Ghar Subsidies:**
• 1 kW: **₹30,000 subsidy**
• 2 kW: **₹60,000 subsidy**
• 3 kW: **₹78,000 subsidy**

Payback period: Just **3 to 4 years** post-subsidy!

See the Solar page for detailed simulation →`;
      navigationSuggestion = '/solar';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }

    // ── Home water saving ─────────────────────────────────────────────────────
    if (HH_WATER_HOME_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**घर में पानी बचाने के तरीके**

💧 **रोज़मर्रा की बचत:**
- नल बंद रखें — ब्रश/शेव करते समय (5L/दिन बचत)
- शॉर्ट शावर या बाल्टी का प्रयोग — बाल्टी से 15L बनाम शावर से 50L
- टपकता नल तुरंत ठीक कराएं — एक टपकता नल = 15L/दिन बर्बादी
- वाशिंग मशीन भर कर चलाएं

🌧️ **वर्षा जल संचयन:**
- 100 sqm छत → साल में ~84,000L पानी
- एक सामान्य भूमिगत टंकी पूरे साल की ज़रूरत पूरी कर सकती है।

ग्रामीण मानक: 55 लीटर प्रति व्यक्ति प्रति दिन (Jal Jeevan Mission)`
        : `**Home Water Saving Tips**

💧 **Daily savings:**
- Turn off tap while brushing/shaving → saves 5L/day
- Use bucket instead of long shower: Bucket (15L) vs Shower (50L)
- Fix leaky taps — one dripping tap wastes 15L/day
- Run washing machine only with full loads

🌧️ **Rainwater harvesting:**
- A 100 sqm roof in Bihar collects ~84,000L per year
- Meets the entire domestic water requirement of a 4-member family.

Standard: 55 litres per person per day (Jal Jeevan Mission)`;
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
    }

    // ── Rainwater harvesting (household) ──────────────────────────────────────
    if (HH_WATER_HARVEST_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**वर्षा जल संचयन — घर के लिए**

🌧️ **कितना पानी मिलेगा?**
- एक 100 sqm छत से: **पटना/बिहार में ~84,000L/वर्ष** (840 mm वर्षा)
- 4 लोगों का परिवार → ~80,000L/वर्ष चाहिए
- यानी छत का पानी **लगभग पूरी ज़रूरत** पूरी कर सकता है!

🏗️ **कैसे लगाएं?**
1. छत पर गटर और डाउनपाइप
2. फिल्टर (कंकड़/रेत/कपड़ा)
3. भूमिगत टंकी या ऊपरी टंकी
4. पानी पंप (यदि भूमिगत)

💰 **लागत:** छोटा सिस्टम ₹5,000–15,000 में तैयार होता है।`
        : `**Rainwater Harvesting — For Your Home**

🌧️ **How much water can you collect?**
- A 100 sqm roof in Bihar: ~**84,000L/year** (840mm rainfall)
- A family of 4 needs ~80,000L/year
- Your roof can meet **almost 100% of water needs!**

🏗️ **Setup Steps:**
1. Roof gutters and PVC downpipes
2. First-flush diverter + sand/gravel filter
3. Storage tank (masonry or modular PVC)
4. Submersible transfer pump

💰 **Cost:** ₹5,000–15,000 for standard rural home installations.`;
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
Bacteria break down kitchen waste or cow dung to produce clean methane gas for cooking.

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
• ✅ BLDC पंखे लगाएं (+10 अंक)
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

Your score is calculated live on the **My Household Dashboard**.

**How the score is calculated:**
- Starts at 100 points baseline
- Calibrated against per-capita benchmarks and renewable offsets

**Ways to improve your score:**
• ✅ Switch to LED bulbs (+10–15 points)
• ✅ Upgrade to BLDC fans (+10 points)
• ✅ Install solar panels (+20–30 points)
• ✅ Upgrade to 5-star AC/fridge (+10–20 points)
• ✅ Use a home biogas unit (+5–10 points)
• ✅ Rainwater harvesting (+5 points)

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
- BLDC पंखे: 5 kg CO₂/माह कम
- सोलर (2 kW): 24 kg CO₂/माह बचत
- बायोगैस: 15 kg CO₂/माह बचत

🎯 लक्ष्य: **50 kWh/माह** से कम ग्रिड खपत = ग्रीन घर!`
        : `**Household Carbon Footprint**

⚡ **CO₂ from electricity:**
- Grid emission factor: **0.82 kg CO₂/kWh** (CEA 2023 standard)
- 100 kWh/month → **82 kg CO₂/month**
- Typical Indian home: ~150 kWh → ~123 kg CO₂/month

🌿 **How to reduce:**
- LED bulbs: cut 3 kg CO₂/month
- BLDC fans: cut 5 kg CO₂/month
- 2 kW solar: save 24 kg CO₂/month
- Biogas: save 15 kg CO₂/month

🎯 Goal: Keep usage under **50 kWh/month** for a true Green Home!`;
      navigationSuggestion = '/household';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }

    // ── Recommendations (household) ───────────────────────────────────────────
    if (REC_KEYWORDS.some((k) => q.includes(k))) {
      content = isHindi
        ? `**आपके घर के लिए शीर्ष 5 सुझाव**

1. 💡 **LED बल्ब लगाएं**
- लागत: ₹80-150/बल्ब | बचत: ₹300/वर्ष/बल्ब | Payback: 3-6 माह

2. 🌀 **BLDC पंखा लगाएं**
- लागत: ₹2,500–3,500 | बचत: ₹1,500/वर्ष | Payback: 1.5–2 वर्ष

3. ☀️ **सोलर पैनल (2 kW) — PM Surya Ghar**
- लागत: ₹1.2–1.6 लाख (₹60k सब्सिडी के बाद ~₹70k) | मासिक बचत: ₹1,920 | Payback: 3–4 वर्ष

4. ❄️ **5-स्टार AC लें**
- लागत: ₹35,000–50,000 | बचत: ₹1,500/माह | Payback: 2-3 वर्ष

5. 🌿 **घरेलू बायोगैस प्लांट**
- लागत: ₹15,000–25,000 | बचत: ₹400/माह | Payback: 4-5 वर्ष

Recommendations पृष्ठ पर और विस्तार से देखें →`
        : `**Top Recommendations for Your Home**

1. 💡 **Switch to LED bulbs**
- Cost: ₹80–150/bulb | Saving: ₹300/year/bulb | Payback: 3–6 months

2. 🌀 **Upgrade to BLDC Ceiling Fans**
- Cost: ₹2,500–3,500 | Saving: ₹1,500/year | Payback: 1.5–2 years

3. ☀️ **Install 2 kW Solar (PM Surya Ghar)**
- Cost: ₹1.2–1.6L (~₹70k after ₹60k subsidy) | Saving: ₹1,920/month | Payback: 3–4 years

4. ❄️ **Upgrade to 5-star AC**
- Cost: ₹35,000–50,000 | Saving: ₹1,500/month | Payback: 2–3 years

5. 🌿 **Home Biogas Digester**
- Cost: ₹15,000–25,000 | Saving: ₹400/month | Payback: 4–5 years

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

Open My Household Dashboard →`;
      navigationSuggestion = '/household';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }

    // ── Household fallback ────────────────────────────────────────────────────
    content = isHindi
      ? `मुझे *"${userMessage}"* के लिए सीधा उत्तर नहीं मिला। मैं इन घरेलू विषयों में आपकी सहायता कर सकता हूँ:

• **बिल बचत:** "बिजली बिल कैसे कम करूं?"
• **उपकरण:** "BLDC पंखा कितनी बिजली बचाता है?"
• **सोलर:** "सोलर पैनल पर सरकारी सब्सिडी कितनी मिलती है?"
• **पानी:** "घर में वर्षा जल संचयन कैसे करें?"
• **बायोगैस:** "रसोई कचरे से बायोगैस कैसे बनाएं?"
• **स्कोर:** "मेरा स्थिरता स्कोर कैसे सुधारूं?"

**मदद** टाइप करें या ऊपर दिए त्वरित प्रश्न आज़माएं।`
      : `I didn't find a direct match for *"${userMessage}"*. Here are topics I can help you with:

• **Bill savings:** "How do I reduce my electricity bill?"
• **Appliances:** "How much does a BLDC fan save?"
• **Solar:** "What government subsidies are available for home solar?"
• **Water:** "How do I save water at home?"
• **Biogas:** "How do I generate cooking gas from waste?"
• **Score:** "How do I improve my sustainability score?"

Type **help** for a full list of questions or click the quick prompts above.`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4. VILLAGE ADMIN / OFFICIAL / GUEST RESPONSES
  // ══════════════════════════════════════════════════════════════════════════

  // ── Greetings (Village Admin / Official) ──────────────────────────────────
  if (GREETINGS.some((g) => q.startsWith(g) || q === g)) {
    content = isHindi
      ? `नमस्ते! मैं मनु AI हूँ — **Bihar Village Sustainability Region** के लिए आपकी AI सहायक।

मैं इन विषयों में मदद कर सकता हूँ:
• बिजली खपत और लागत विश्लेषण (मोतीपुर, ओइआरा, अमरा, बरौनी, कोरहा)
• सौर ऊर्जा क्षमता व रूफटॉप आंकड़े
• जल मांग एवं वर्षा जल संचयन
• जैविक कचरे से बायोगैस व SATAT ऊर्जा क्षमता
• स्थिरता स्कोर, अलर्ट और प्राथमिकता सुझाव

उदाहरण: *"मोतीपुर की सौर क्षमता क्या है?"* या *"किन क्षेत्रों में तत्काल कार्रवाई ज़रूरी है?"*`
      : `Hello! I'm Manu AI, your sustainability intelligence assistant for the **Bihar Village Sustainability Region**.

I can assist you with:
• Energy consumption & cost tracking across all 5 Gram Panchayats
• Solar sizing, rooftop potential & payback metrics
• Water demand (Jal Jeevan Mission LPCD) & rainwater harvesting
• Biogas yield from dung, food, and agri waste
• Sustainability score benchmarking & critical priority alerts

Try asking: *"What is Motipur's solar potential?"* or *"Which village needs urgent action?"*`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
  }

  // ── Help ──────────────────────────────────────────────────────────────────
  if (HELP_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `मैं इन विषयों पर सटीक जवाब दे सकता हूँ:

**ऊर्जा:** "[क्षेत्र] की मासिक खपत क्या है?"
**सौर:** "[क्षेत्र] की सौर क्षमता क्या है?" · "पीएम सूर्य घर योजना"
**पानी:** "अमरा कितना वर्षा जल संचयन कर सकता है?"
**कचरा:** "मोतीपुर की बायोगैस क्षमता क्या है?"
**लागत:** "कोरहा बिजली पर कितना खर्च करता है?"
**स्कोर:** "बरौनी का स्थिरता स्कोर क्या है?"
**सुझाव:** "शीर्ष सुझाव क्या हैं?"
**तुलना:** "मोतीपुर और अमरा की तुलना करें"
**अलर्ट:** "किन क्षेत्रों में तत्काल कार्रवाई ज़रूरी है?"

निगरानी क्षेत्र: Motipur, Oiara, Amra, Barouni, Korha`
      : `I can answer village administration questions like:

**Energy:** "What is [area] monthly consumption?" · "Which area consumes the most per household?"
**Solar:** "What is [area] solar potential?" · "How many kW can fit in Motipur?"
**Water:** "How much rainwater can Amra harvest?" · "What is Oiara's water demand?"
**Waste:** "What is the biogas potential of Motipur?"
**Cost:** "How much does Korha spend on electricity?"
**Scores:** "What is Barouni's sustainability score?"
**Recommendations:** "What are the top recommendations?"
**Compare:** "Compare Motipur and Oiara"
**Alerts:** "Which areas need urgent action?"

Monitored villages: Motipur, Oiara, Amra, Barouni, Korha`;
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
  }

  // ── Alerts / critical areas ────────────────────────────────────────────────
  if (VA_ALERT_KEYWORDS.some((k) => q.includes(k))) {
    const sorted = [...analyses].sort((a, b) => b.priorityIndex - a.priorityIndex).slice(0, 3);
    content = isHindi
      ? `**तत्काल ध्यान देने योग्य क्षेत्र (Critical Priority Villages)**

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
|---|---|---|
| मासिक खपत | ${a1.area.monthlyElectricity.toLocaleString()} kWh | ${a2.area.monthlyElectricity.toLocaleString()} kWh |
| मासिक लागत | ${formatINR(a1.monthlyCostINR)} | ${formatINR(a2.monthlyCostINR)} |
| स्थिरता स्कोर | ${a1.sustainabilityScore}/100 | ${a2.sustainabilityScore}/100 |
| सौर क्षमता | ${a1.solarPotential.feasibleCapacityKW} kW | ${a2.solarPotential.feasibleCapacityKW} kW |
| वर्षा जल ऑफसेट | ${a1.waterAnalysis.rainwaterOffsetPercent}% | ${a2.waterAnalysis.rainwaterOffsetPercent}% |
| CO₂/माह | ${(a1.co2KgPerMonth / 1000).toFixed(1)} टन | ${(a2.co2KgPerMonth / 1000).toFixed(1)} टन |`
        : `**${a1.area.name} vs ${a2.area.name} — Comparison**

| Metric | ${a1.area.name} | ${a2.area.name} |
|---|---|---|
| Monthly consumption | ${a1.area.monthlyElectricity.toLocaleString()} kWh | ${a2.area.monthlyElectricity.toLocaleString()} kWh |
| Monthly cost | ${formatINR(a1.monthlyCostINR)} | ${formatINR(a2.monthlyCostINR)} |
| Sustainability score | ${a1.sustainabilityScore}/100 | ${a2.sustainabilityScore}/100 |
| Solar potential | ${a1.solarPotential.feasibleCapacityKW} kW | ${a2.solarPotential.feasibleCapacityKW} kW |
| Rainwater offset | ${a1.waterAnalysis.rainwaterOffsetPercent}% | ${a2.waterAnalysis.rainwaterOffsetPercent}% |
| CO₂/month | ${(a1.co2KgPerMonth / 1000).toFixed(1)} t | ${(a2.co2KgPerMonth / 1000).toFixed(1)} t |`;
      navigationSuggestion = '/village';
      return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
    }
  }

  // ── Total region cost ──────────────────────────────────────────────────────
  if (VA_COST_ALL_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**क्षेत्र की कुल बिजली लागत**

| क्षेत्र | मासिक खपत | मासिक लागत |
|---|---|---|
${analyses.map((a) => `| ${a.area.name} | ${a.area.monthlyElectricity.toLocaleString()} kWh | ${formatINR(a.monthlyCostINR)} |`).join('\n')}
| **कुल** | **${(totals.totalKWh / 1000).toFixed(1)}k kWh** | **${formatINR(totals.totalCost)}** |

सबसे ज़्यादा खर्च: **${[...analyses].sort((a, b) => b.monthlyCostINR - a.monthlyCostINR)[0].area.name}**`
      : `**Region Total Electricity Cost**

| Area | Monthly consumption | Monthly cost |
|---|---|---|
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
|---|---|
${analyses.map((a) => `| ${a.area.name} | ${(a.co2KgPerMonth).toFixed(0)} kg |`).join('\n')}

यदि सभी सौर क्षमता उपयोग हो: **${(analyses.reduce((s, a) => s + a.solarPotential.co2AvoidedKgPerMonth, 0) / 1000).toFixed(1)} टन/माह बचत** संभव!`
      : `**Region Total CO₂ Emissions**

Monthly total: **${(totals.totalCO2 / 1000).toFixed(1)} tonnes CO₂**

| Area | CO₂ (kg/month) |
|---|---|
${analyses.map((a) => `| ${a.area.name} | ${(a.co2KgPerMonth).toFixed(0)} kg |`).join('\n')}

If all solar potential is used: **${(analyses.reduce((s, a) => s + a.solarPotential.co2AvoidedKgPerMonth, 0) / 1000).toFixed(1)} t/month** CO₂ could be avoided!`;
    navigationSuggestion = '/score';
    return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language, navigationSuggestion };
  }

  // ── Region overview ───────────────────────────────────────────────────────
  if (OVERVIEW_KEYWORDS.some((k) => q.includes(k))) {
    content = isHindi
      ? `**Bihar Village Sustainability Region — समग्र अवलोकन**

| मापदंड | मूल्य |
|---|---|
| निगरानी ग्राम पंचायतें | ${totals.areas} (मोतीपुर, ओइआरा, अमरा, बरौनी, कोरहा) |
| कुल घर | ${totals.totalHH.toLocaleString()} |
| कुल जनसंख्या | ${totals.totalPop.toLocaleString()} |
| मासिक ग्रिड खपत | ${(totals.totalKWh / 1000).toFixed(1)}k kWh |
| मासिक बिजली बिल | ${formatINR(totals.totalCost)} |
| मासिक CO₂ उत्सर्जन | ${(totals.totalCO2 / 1000).toFixed(1)} टन |

**प्राथमिकता क्षेत्र:** मोतीपुर (सर्वाधिक ग्रिड खपत 72,938 kWh) और अमरा (शून्य नवीकरणीय ऊर्जा, उच्च लागत)।`
      : `**Bihar Village Sustainability Region — Overview**

| Metric | Value |
|---|---|
| Monitored Panchayats | ${totals.areas} (Motipur, Oiara, Amra, Barouni, Korha) |
| Total households | ${totals.totalHH.toLocaleString()} |
| Total population | ${totals.totalPop.toLocaleString()} |
| Monthly grid consumption | ${(totals.totalKWh / 1000).toFixed(1)}k kWh |
| Monthly electricity cost | ${formatINR(totals.totalCost)} |
| Monthly CO₂ emissions | ${(totals.totalCO2 / 1000).toFixed(1)} tonnes |

**Priority areas:** Motipur (highest grid load: 72,938 kWh) and Amra (zero current renewable installations).`;
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

**उपयोग विभाजन:**
- घर: ${energyBreakdown.households.toLocaleString()} kWh
- स्ट्रीटलाइट: ${energyBreakdown.streetlights.toLocaleString()} kWh
- जल पंप: ${energyBreakdown.waterPumps.toLocaleString()} kWh
- स्कूल/सामुदायिक भवन: ${energyBreakdown.schools.toLocaleString()} kWh`
        : `**${area.name} — Energy & Cost Analysis** *(Demo Data)*

• Monthly consumption: **${area.monthlyElectricity.toLocaleString()} kWh**
• Per-household: **${(area.monthlyElectricity / area.households).toFixed(1)} kWh/household**
• Monthly electricity cost: **${formatINR(monthlyCostINR)}**
• CO₂ emissions: **${(co2KgPerMonth / 1000).toFixed(2)} tonnes/month**

**Breakdown:**
- Households: ${energyBreakdown.households.toLocaleString()} kWh
- Streetlights: ${energyBreakdown.streetlights.toLocaleString()} kWh
- Water pumps: ${energyBreakdown.waterPumps.toLocaleString()} kWh
- Schools & Community: ${energyBreakdown.schools.toLocaleString()} kWh

*Formula: Cost = kWh × ₹${ASSUMPTIONS.tariffINRPerKWh}/kWh*`;
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
• Payback अवधि: **${solarPotential.paybackYears} वर्ष**`
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

• दैनिक जल मांग: **${(waterAnalysis.dailyDemandLitres / 1000).toFixed(2)} kL/दिन** (55 LPCD)
• मासिक मांग: **${(waterAnalysis.monthlyDemandLitres / 1000).toFixed(1)} kL/माह**
• पंप ऊर्जा: **${waterAnalysis.pumpEnergyKWhPerMonth.toLocaleString()} kWh/माह**
• वर्षा जल क्षमता: **${(waterAnalysis.rainwaterPotentialLitresPerYear / 1000).toFixed(0)} kL/वर्ष**
• वर्षा जल ऑफसेट: **${waterAnalysis.rainwaterOffsetPercent}%** मासिक मांग का`
        : `**${area.name} — Water Analysis** *(Demo Data)*

• Daily water demand: **${(waterAnalysis.dailyDemandLitres / 1000).toFixed(2)} kL/day** (55 LPCD)
• Monthly demand: **${(waterAnalysis.monthlyDemandLitres / 1000).toFixed(1)} kL/month**
• Pump energy: **${waterAnalysis.pumpEnergyKWhPerMonth.toLocaleString()} kWh/month**
• Rainwater potential: **${(waterAnalysis.rainwaterPotentialLitresPerYear / 1000).toFixed(0)} kL/year**
• Rainwater offset: **${waterAnalysis.rainwaterOffsetPercent}%** of monthly demand

*LPCD: 55 L/person/day (Jal Jeevan Mission) · Runoff coefficient: 0.80*`;
      navigationSuggestion = '/water';
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

To improve: Install solar (biggest impact), optimize streetlights to LED, set up rainwater harvesting.`;
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
• सौर क्षमता: ${solarPotential.feasibleCapacityKW} kW

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
        'कृपया स्पष्ट करें — मैं किसके लिए सर्वाधिक खोज सकता हूँ: ऊर्जा खपत, सौर क्षमता, स्थिरता स्कोर, या जल मांग।'
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
- बचत: ₹${rec.costSavingsINRPerMonth.toLocaleString()}/माह · Payback: ${rec.paybackMonths} माह
- ${rec.intervention}`).join('\n\n')}

सभी ${DEMO_RECOMMENDATIONS.length} सुझाव Recommendations पृष्ठ पर देखें।`
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
    ? `मुझे *"${userMessage}"* के लिए कोई विशिष्ट उत्तर नहीं मिला। मैं इन विषयों में मदद कर सकता हूँ:

• **सरकारी योजनाएं:** "पीएम सूर्य घर और कुसुम योजना क्या है?"
• **क्षेत्र-विशिष्ट:** "मोतीपुर की ऊर्जा खपत क्या है?"
• **तुलना:** "मोतीपुर और अमरा की तुलना करें"
• **अलर्ट:** "किन क्षेत्रों में तत्काल कार्रवाई ज़रूरी है?"
• **मापदंड:** "कोरहा की सौर क्षमता दिखाएं"
• **सुझाव:** "शीर्ष सुझाव क्या हैं?"
• **अवलोकन:** "क्षेत्र का सारांश दें"

**मदद** टाइप करें या ऊपर दिए त्वरित प्रश्न आज़माएं।`
    : `I didn't find a specific match for *"${userMessage}"*. Here are topics I can help with:

• **Government Schemes:** "Tell me about PM Surya Ghar and KUSUM scheme"
• **Area-specific:** "What is Motipur's energy consumption?"
• **Compare areas:** "Compare Motipur and Oiara"
• **Alerts:** "Which areas need urgent action?"
• **Metrics:** "Show me Korha's solar potential"
• **Recommendations:** "What are the top recommendations?"
• **Overview:** "Give me the region summary"

Type **help** for a full list of queries or try the quick questions above.`;

  return { id: Math.random().toString(), role: 'assistant', content, timestamp: now, language };
}
