# AGENTS.md — AI Agent Architecture & Contributor Guide

Welcome to the **GramUrja (GreenGrid AI)** codebase! This document provides instructions, domain definitions, and technical guardrails for autonomous and semi-autonomous AI agents developing, maintaining, or extending this project.

---

## 1. Project Overview & Philosophy

**GramUrja** is an AI-powered Rural Sustainability Intelligence Platform designed specifically for Indian villages, Gram Panchayats, and rural households. It converts distributed rural energy, water, and organic waste data into actionable clean energy roadmaps and transparent metrics.

### Key Principles
1. **Formula Transparency**: All calculations (solar sizing, biogas yield, water demand, CO₂ offsets) are deterministic, physics-grounded, and traceable to Indian standards (MNRE, CEA, Jal Jeevan Mission, SATAT).
2. **Subcontinent Regional Context**: Tailored for the Indian subcontinent — using INR (₹), Lakhs/Crores, LPCD benchmarks, DISCOM tariffs, and bilingual (Hindi & Indian English) interaction.
3. **Role-Driven Experience**: Distinct interfaces for **Village Officials / Panchayat Members** (community command center, multi-village tracking) and **Household Citizens** (appliance power consumption, solar savings).

---

## 2. Technical Stack & Repository Structure

```
Gram-Urja/
├── AGENTS.md                   ← Agent instructions & domain specification
├── IBM_BOB_Usage.md            ← IBM BOB AI integration & usage guide
├── README.md                   ← Human-facing project overview
├── index.html                  ← Entry HTML with SEO meta tags
├── public/
│   └── images/
│       └── landing_hero_bg.jpg ← AI-generated rural clean energy hero visual
├── src/
│   ├── ai/
│   │   └── chatEngine.ts       ← Deterministic & keyword-driven AI response engine (Manu AI)
│   ├── calculations/
│   │   └── engine.ts           ← Mathematical formulas, MNRE constants & assumptions
│   ├── components/
│   │   ├── AreaSelector.tsx    ← Reusable village selector dropdown
│   │   ├── Layout.tsx          ← Responsive sidebar + floating Manu AI + ambient layer
│   │   └── ui.tsx              ← Standard UI components (KpiCard, Modal, SectionCard)
│   ├── context/
│   │   ├── AuthContext.tsx     ← Role-based auth (official, citizen, guest) & demo login
│   │   ├── HouseholdContext.tsx← Household appliance state & custom configurations
│   │   └── LanguageContext.tsx ← Bilingual dictionary (English & Hindi)
│   ├── data/
│   │   ├── alerts.ts           ← Anomaly detection alert items
│   │   ├── demoData.ts         ← 5 Bihar village profiles (Motipur, Oiara, Amra, Barouni, Korha)
│   │   ├── productData.ts      ← Clean tech catalog (solar panels, inverters, biogas kits)
│   │   └── recommendations.ts  ← Prioritized sustainability action plans
│   ├── pages/
│   │   ├── AIAssistantPage.tsx ← Manu AI conversational voice interface (en-IN / hi-IN)
│   │   ├── AlertsPage.tsx      ← Anomaly detection center
│   │   ├── HouseholdDashboard.tsx ← Household appliance & bill calculator
│   │   ├── LandingPage.tsx     ← Hero, 5 village official login portals, live circular metrics
│   │   ├── LoginPage.tsx       ← Multi-role authentication page
│   │   ├── RecommendationsPage.tsx ← ROI & carbon-ranked action items
│   │   ├── ScorePage.tsx       ← 0–100 weighted sustainability index
│   │   ├── SolarPage.tsx       ← Rooftop & land solar sizing simulator
│   │   ├── VillageDashboard.tsx← Gram Panchayat Command Centre with waste production data
│   │   ├── WastePage.tsx       ← Biogas, biomass & SATAT energy simulator
│   │   └── WaterPage.tsx       ← Demand, rainwater harvesting & pump load
│   ├── services/
│   │   └── energyService.ts    ← Domain analytical adapters & aggregations
│   └── types/
│       └── index.ts            ← TypeScript schemas & type contracts
```

---

## 3. Monitored Bihar Village Profiles

The application models **5 real-world inspired Gram Panchayats** in Bihar:

| Village | Households | Monthly Grid Load | Daily Organic Waste | Feasible Solar |
|---|---|---|---|---|
| **Motipur** | 1,684 HH | 72,938 kWh | 1,684 kg/day (Dung: 900kg, Food: 500kg, Agri: 284kg) | 150 kW |
| **Oiara** | 674 HH | 29,912 kWh | 674 kg/day (Dung: 400kg, Food: 180kg, Agri: 94kg) | 100 kW |
| **Amra** | 803 HH | 35,408 kWh | 803 kg/day (Dung: 500kg, Food: 200kg, Agri: 103kg) | 125 kW |
| **Barouni** | 300 HH | 13,980 kWh | 300 kg/day (Dung: 180kg, Food: 80kg, Agri: 40kg) | 300 kW (15kW active) |
| **Korha** | 170 HH | 7,842 kWh | 170 kg/day (Dung: 100kg, Food: 45kg, Agri: 25kg) | 75 kW |

---

## 4. Key Calculation Formulas (`engine.ts`)

Agents modifying mathematical models must adhere to the following formulas:

### Solar Potential
$$\text{Feasible Capacity (kW)} = \min\left(\frac{\text{Roof Area (sq ft)}}{100}, \frac{\text{Monthly Consumption}}{120}\right)$$
$$\text{Monthly Generation (kWh)} = \text{Capacity (kW)} \times 4.5 \times 30$$
$$\text{CO}_2 \text{ Avoided (kg/month)} = \text{Monthly Generation (kWh)} \times 0.716$$

### Biogas & Waste-to-Energy
$$\text{Biogas } (m^3/\text{day}) = (\text{Dung kg} \times 0.04) + (\text{Food Waste kg} \times 0.08) + (\text{Agri Waste kg} \times 0.05)$$
$$\text{Electricity } (\text{kWh/day}) = \text{Biogas } (m^3) \times 1.8$$
$$\text{Thermal Energy } (\text{kWh/day}) = \text{Biogas } (m^3) \times 5.5$$

### Water Demand (Jal Jeevan Mission Standard)
$$\text{Daily Demand (Litres)} = \text{Population} \times 55 \text{ LPCD}$$
$$\text{Rainwater Harvest Potential (L/yr)} = \text{Roof Area } (m^2) \times \text{Rainfall (mm)} \times 0.85 \text{ (runoff coeff)}$$

---

## 5. Bilingual & Indian Subcontinent Conventions

1. **Language Keys**: When adding text to UI, always add corresponding entries in `src/context/LanguageContext.tsx` under `TRANSLATIONS` for both English (`en`) and Hindi (`hi`).
2. **AI Voice & Speech Synthesis**:
   - English voice synthesis uses Indian English (`en-IN`) accents (e.g. *Microsoft Neerja*, *Google English (India)*, *Microsoft Prabhat*).
   - Hindi speech synthesis uses `hi-IN`.
   - Speech recognition language follows the active session language (`hi-IN` or `en-IN`).
3. **Currency & Units**:
   - Currency: Indian Rupee (`₹`).
   - Number formatting: Indian numbering system for large values (Lakhs / Crores).
   - Energy units: `kWh`, `kW`, `m³`, `kg/day`, `tons/month`.

---

## 6. Guidelines for AI Agents Making Changes

- **Preserve Existing Comments**: Retain domain and architectural notes.
- **Pure Frontend Guarantee**: Do not introduce mandatory backend server requirements unless explicitly requested. Mock clients with offline fallbacks (such as `supabaseClient.ts`) ensure zero setup friction.
- **Aesthetic Excellence**: Maintain the custom Tailwind + glassmorphism palette, emerald-gold clean energy theme, and ambient micro-animations.
- **Verification**: Always verify TypeScript compilation (`npm run build` or Vite checks) after making edits.
