import { GoogleGenAI } from '@google/genai';

/**
 * Gemini Service for GramUrja / Manu AI
 *
 * Integrates Google Gemini API using @google/genai (`gemini-2.5-flash`)
 * with strict domain system instructions, rate limiting, and robust offline fallbacks.
 */

const apiKey = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env.VITE_GEMINI_API_KEY
  : undefined;
const MODEL_NAME = 'gemini-2.5-flash';
const MIN_REQUEST_INTERVAL_MS = 2000;

let lastRequestTime = 0;
let aiClient = null;

function getClient() {
  if (!aiClient && apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTIONS = `You are Manu AI, the rural clean energy and sustainability intelligence assistant for GramUrja, designed for rural households, Gram Panchayats, and village officials across Bihar (including Motipur, Oiara, Amra, Barouni, and Korha).

Strict Scope & Guardrails:
1. Core Topics Only: You strictly and exclusively address questions regarding:
   - Rural electricity consumption, DISCOM tariffs (avg ₹6.5/kWh), appliances, and efficiency (LEDs, BLDC fans).
   - Solar energy sizing, rooftop & land photovoltaic potential, MNRE guidelines, and generation benchmarks (4.5 kWh/kW/day).
   - Water demand (Jal Jeevan Mission 55 LPCD benchmark), pump loads, and rainwater harvesting.
   - Waste-to-energy, community biogas plants, feedstock yields (dung, agri residue, food waste), and bio-slurry fertilizer.
   - Central & State government schemes: PM Surya Ghar Muft Bijli Yojana, PM-KUSUM (solar agriculture pumps), GOBARdhan, and SATAT.
2. Decline Off-Topic Requests: If the user query is outside rural clean energy, water, waste, or government subsidy schemes, politely decline in 1-2 sentences and remind them that you are Manu AI, specialized in rural sustainability and clean tech for GramUrja.
3. Tone and Accuracy: Provide factual, deterministic, and physics-grounded answers. Use Indian units where applicable (₹, kWh, kW, m³, LPCD, Lakhs). Keep answers concise, clear, and direct.`;

/**
 * Pre-written domain fallback responses matching core sustainability themes.
 * Used when the API key is missing, rate-limited, offline, or returns an error.
 */
export function getFallbackResponse(query = '') {
  const q = String(query).toLowerCase();

  if (q.includes('solar') || q.includes('sun') || q.includes('panel') || q.includes('photovoltaic') || q.includes('सौर')) {
    return 'Under PM Surya Ghar Muft Bijli Yojana, households can receive subsidies up to ₹78,000 for 3 kW rooftop solar installations. In Bihar, 1 kW of solar generates approximately 4.5 kWh/day (135 kWh/month), which can offset 40% to 70% of an average rural household electricity bill.';
  }

  if (q.includes('water') || q.includes('pump') || q.includes('rainwater') || q.includes('jal') || q.includes('पानी') || q.includes('जल')) {
    return 'Following Jal Jeevan Mission benchmarks, standard rural domestic water demand is 55 LPCD (litres per capita per day). With Bihar’s average annual rainfall of ~1,100 mm and an 80% collection runoff coefficient, a 100 m² rooftop can harvest over 88,000 litres of clean water annually.';
  }

  if (q.includes('waste') || q.includes('biogas') || q.includes('dung') || q.includes('gobar') || q.includes('कचरा') || q.includes('बायोगैस')) {
    return 'GramUrja models organic waste conversion where 1 kg of cattle dung yields ~0.04 m³ of biogas, and 1 kg of food waste yields ~0.06–0.08 m³. A community biogas plant generating 25 m³/day produces approximately 50 kWh/day of clean electricity or 150 kWh/day of thermal cooking energy, while yielding organic bio-slurry fertilizer.';
  }

  if (q.includes('energy') || q.includes('electricity') || q.includes('bill') || q.includes('kwh') || q.includes('tariff') || q.includes('power') || q.includes('बिजली')) {
    return 'At the Bihar rural domestic tariff of approximately ₹6.50/kWh, switching standard 70W incandescent/fluorescent fixtures to 9W LEDs and conventional fans to 28W BLDC fans cuts household appliance consumption by up to 55%, saving ₹400–₹900 per month.';
  }

  if (q.includes('scheme') || q.includes('subsidy') || q.includes('kusum') || q.includes('yojana') || q.includes('योजना') || q.includes('सब्सिडी')) {
    return 'Key clean energy schemes in Bihar include PM Surya Ghar Muft Bijli Yojana (rooftop solar subsidy up to ₹78,000), PM-KUSUM (up to 60% subsidy for solar agriculture pumps replacing diesel sets), and the GOBARdhan initiative for community biogas infrastructure.';
  }

  return 'Namaste! I am Manu AI, the GramUrja rural sustainability intelligence assistant. I can help you with solar rooftop feasibility, community biogas potential, Jal Jeevan Mission water metrics, and government schemes like PM Surya Ghar and PM-KUSUM. How can I assist your village or household today?';
}

/**
 * Fetches an AI response from Gemini 2.5 Flash with scope restriction,
 * client-side throttling (2s cooldown), and deterministic fallback handling.
 *
 * @param {string} userQuery
 * @returns {Promise<string>}
 */
export async function getAiResponse(userQuery) {
  // Validate input
  if (!userQuery || typeof userQuery !== 'string' || !userQuery.trim()) {
    return getFallbackResponse('');
  }

  const query = userQuery.trim();
  const now = Date.now();

  // Rate Limiting & Throttling: 2000ms cooldown
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL_MS) {
    console.warn(`[Manu AI] Request throttled (${now - lastRequestTime}ms < ${MIN_REQUEST_INTERVAL_MS}ms). Returning domain fallback.`);
    return getFallbackResponse(query);
  }

  lastRequestTime = now;

  // Check API key configuration
  if (!apiKey) {
    return getFallbackResponse(query);
  }

  const client = getClient();
  if (!client) {
    return getFallbackResponse(query);
  }

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: query,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        temperature: 0.1,
        maxOutputTokens: 300,
      },
    });

    const text = response?.text;
    if (typeof text === 'string' && text.trim().length > 0) {
      return text.trim();
    }

    return getFallbackResponse(query);
  } catch (error) {
    console.error('[Manu AI] Gemini API request failed. Falling back gracefully:', error);
    return getFallbackResponse(query);
  }
}
