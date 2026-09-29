# Gram Urja — GreenGrid AI

> **AI-powered Sustainability & Clean Energy Intelligence Platform for Rural Communities**
>
> *"Empowering Indian Villages with Waste-to-Energy, Solar Potential & Water Intelligence"*

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Key Highlights & New Features](#key-highlights--new-features)
3. [IBM BOB & AI Integration](#ibm-bob--ai-integration)
4. [AI Agent Architecture (AGENTS.md)](#ai-agent-architecture)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [Getting Started](#getting-started)
8. [Available Scripts](#available-scripts)
9. [Features & Dashboards](#features--dashboards)
10. [Monitored Bihar Villages](#monitored-bihar-villages)
11. [Formulas & Assumptions](#formulas--assumptions)
12. [User Roles & Portals](#user-roles--portals)

---

## Overview

**Gram Urja (GreenGrid AI)** is a frontend React intelligence platform that transforms rural energy, water, and organic waste data into measurable sustainability action plans. Built specifically for Gram Panchayats and rural Indian households, it generates transparent calculations for solar sizing, bio-methanation energy recovery, water harvesting, and carbon abatement.

---

## Key Highlights & New Features

- 🏛️ **5 Village Official Portals on Landing Page**: Instant administrative command center login for each of the 5 monitored Gram Panchayats (*Motipur, Oiara, Amra, Barouni, Korha*).
- 🌄 **AI-Generated Cinematic Rural Background**: High-resolution Gemini-generated visual embodying rooftop solar panels, biogas digesters, lush agriculture, and water reservoirs.
- 🌿 **Waste Production Metrics in Village Dashboard**: Detailed description cards highlight daily organic feedstock (cattle dung, food waste, crop residue) instead of generic population statistics.
- 🎙️ **Indian English (`en-IN`) & Hindi (`hi-IN`) Manu AI Voice**: Text-to-Speech synthesis and speech recognition tuned specifically with Indian English cadence and regional phonetic models.
- 🤖 **Developer & Agent Specifications**: Comprehensive [AGENTS.md](AGENTS.md) and [IBM_BOB_Usage.md](IBM_BOB_Usage.md) guides for architecture and AI optimization.

---

## IBM BOB & AI Integration

GramUrja leverages **IBM BOB (Business Optimization & watsonx-powered Intelligence)** to perform:
- **Biomass-to-Biogas Yield Prediction**: Multi-stream waste modeling for SATAT and community bio-methanation.
- **Solar Rooftop Optimization**: Shadow-free area and DISCOM load balancing with PM Surya Ghar subsidy curves.
- **Bilingual Conversational AI (Manu AI)**: Grounded rural sustainability Q&A in Hindi and Indian English.
- **Automated Anomaly Detection**: Proactive alerts for equipment faults, streetlight inefficiency, and water line leakage.

👉 See [IBM_BOB_Usage.md](IBM_BOB_Usage.md) for full technical documentation.

---

## AI Agent Architecture

For AI coding agents and autonomous workflows working on this repository, refer to [AGENTS.md](AGENTS.md). It outlines:
- Codebase guidelines & mathematical formula invariants.
- Bilingual dictionary sync conventions (`LanguageContext.tsx`).
- Subcontinent domain standards (₹, LPCD, Lakhs/Crores, MNRE benchmarks).

---

## Tech Stack

| Layer | Technology |
|---|---|
| **UI Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 + Glassmorphism |
| **Charts & Visualizations** | Recharts 2 |
| **Icons** | Lucide React |
| **Voice & Speech** | Web Speech API (`en-IN` & `hi-IN`) |
| **Routing** | React Router DOM 6 |
| **State Management** | React Context (Auth, Language, Household) |

---

## Project Structure

```
Gram-Urja/
├── AGENTS.md                   ← Agent instructions & architecture
├── IBM_BOB_Usage.md            ← IBM BOB AI integration guide
├── README.md                   ← Project documentation
├── index.html                  ← Entry HTML
├── public/
│   └── images/
│       └── landing_hero_bg.jpg ← Gemini-generated clean energy hero visual
└── src/
    ├── ai/
    │   └── chatEngine.ts       ← Manu AI logic & intent classification
    ├── calculations/
    │   └── engine.ts           ← Physics-grounded sustainability formulas
    ├── components/
    │   ├── AreaSelector.tsx    ← Reusable village dropdown
    │   ├── Layout.tsx          ← App shell, responsive sidebar & Manu AI
    │   └── ui.tsx              ← Standard UI components (KpiCard, Modal, etc.)
    ├── context/
    │   ├── AuthContext.tsx     ← Role management (Official / Citizen / Guest)
    │   ├── HouseholdContext.tsx← Household appliance state
    │   └── LanguageContext.tsx ← Bilingual dictionary (English / Hindi)
    ├── data/
    │   ├── alerts.ts           ← Anomaly detection alerts
    │   ├── demoData.ts         ← 5 Bihar village profiles
    │   ├── productData.ts      ← Solar & clean-tech catalog
    │   └── recommendations.ts  ← Prioritized action recommendations
    ├── pages/
    │   ├── AIAssistantPage.tsx ← Manu AI conversational voice page
    │   ├── AlertsPage.tsx      ← Anomaly detection center
    │   ├── HouseholdDashboard.tsx ← Household appliance & bill calculator
    │   ├── LandingPage.tsx     ← Hero, 5 village official portals & live metrics
    │   ├── LoginPage.tsx       ← Role selection & authentication
    │   ├── RecommendationsPage.tsx ← ROI & carbon-ranked action plans
    │   ├── ScorePage.tsx       ← 0–100 sustainability index
    │   ├── SolarPage.tsx       ← Rooftop & land solar simulator
    │   ├── VillageDashboard.tsx← Gram Panchayat Command Centre
    │   ├── WastePage.tsx       ← Biogas & SATAT energy simulator
    │   └── WaterPage.tsx       ← Demand, rainwater harvesting & pump load
    ├── services/
    │   └── energyService.ts    ← Analytical service layer
    └── types/
        └── index.ts            ← TypeScript interfaces
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/sakshikri255/Gram-Urja.git
cd Gram-Urja

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

App runs at: **http://localhost:5173**

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot-module reload |
| `npm run build` | Compile TypeScript and generate production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint across TypeScript codebase |

---

## Features & Dashboards

### 🏠 Landing Page & Official Portals
- **Hero Banner**: High-resolution Gemini-generated eco-village artwork.
- **5 Village Official Portals**: One-click direct login into Motipur, Oiara, Amra, Barouni, or Korha command centers.
- **Live Impact Metrics**: Aggregated daily solar potential, organic waste collected, CO₂ mitigated, and biogas power generated.
- **Circular Flow Diagram**: Animated interactive visual showing the closed-loop rural resource model.

### 🗺️ Village Dashboard (Panchayat Command Centre)
- Detailed description card displaying **daily waste production** (`kg/day`) alongside households and infrastructure.
- Comparative current vs. optimized energy load analysis.
- Multi-dimensional radar profile across solar, biogas, energy efficiency, and grid autonomy.

### 🏡 Household Dashboard
- Appliance-level wattage, daily hours, and monthly cost tracker.
- Custom appliance builder with BEE 5-Star efficiency advice.
- Household solar payback estimator and water demand calculator.

### 🤖 Manu AI Assistant
- Natural language dialog in English and Hindi.
- **Indian English Accent**: Uses `en-IN` voice profiles (*Microsoft Neerja, Microsoft Prabhat, Google English India*).
- Interactive voice input and spoken audio responses.

---

## Monitored Bihar Villages

The platform monitors **5 Gram Panchayats** in the Bihar region:

| Village | Households | Monthly Electricity | Daily Organic Waste | Feasible Solar |
|---|---|---|---|---|
| **Motipur** | 1,684 HH | 72,938 kWh | 1,684 kg/day | 150 kW |
| **Oiara** | 674 HH | 29,912 kWh | 674 kg/day | 100 kW |
| **Amra** | 803 HH | 35,408 kWh | 803 kg/day | 125 kW |
| **Barouni** | 300 HH | 13,980 kWh | 300 kg/day | 300 kW (15 kW active) |
| **Korha** | 170 HH | 7,842 kWh | 170 kg/day | 75 kW |

---

## Formulas & Assumptions

Key constants in [`src/calculations/engine.ts`](src/calculations/engine.ts):

| Benchmark | Value | Standard Source |
|---|---|---|
| Grid Emission Factor | 0.716 kg CO₂/kWh | Central Electricity Authority (CEA 2023) |
| Electricity Tariff | ₹6.00 / kWh | Regional DISCOM Average |
| Solar Radiation Yield | 4.5 kWh / kW / day | MNRE Bihar Benchmark |
| Solar Capital Cost | ₹60,000 / kW | MNRE Benchmark 2024 |
| Biogas Energy Content | 1.8 kWh / m³ electric, 5.5 kWh / m³ thermal | SATAT / Ministry of Petroleum |
| Rural Water Standard | 55 LPCD | Jal Jeevan Mission |

---

## User Roles & Portals

| Role | Accessible Views | Typical User |
|---|---|---|
| **Village Official** | Village Dashboard, 5 Official Portals, Alerts, Solar, Waste, Recommendations | Panchayat Pradhan, Ward Officer, BDO |
| **Household Member** | Household Dashboard, Appliance Tracker, Solar Calculator, Manu AI | Village resident, farming family |
| **Guest** | All analytics in interactive exploration mode | Evaluators, researchers, auditors |

---

> Built for the **IBM Hackathon** · GramUrja v1.0 · Bihar Sustainability Region
