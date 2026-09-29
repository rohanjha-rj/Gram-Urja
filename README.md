# Gram Urja — GreenGrid AI

> **AI-powered Sustainability Intelligence Platform for Rural & Semi-Urban Communities**
>
> "Turning Energy, Water & Waste Data into Sustainable Action"

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Available Scripts](#available-scripts)
6. [Port Configuration](#port-configuration)
7. [Features](#features)
8. [Pages & Routes](#pages--routes)
9. [Data & Calculations](#data--calculations)
10. [User Roles](#user-roles)
11. [Collaboration Guide](#collaboration-guide)

---

## Overview

**Gram Urja (GreenGrid AI)** is a frontend React application that analyses energy, water, waste, infrastructure and renewable potential for villages and semi-urban areas. It generates measurable sustainability scores, action plans, alerts, and AI-assisted insights — all powered by transparent, formula-driven calculations on demo data.

> This is a **pure frontend** application. There is no backend server or database. All data is demo data defined in `src/data/`. The service layer (`src/services/`) is ready to connect to real APIs (NASA POWER, CEA, BEE, MNRE, Jal Jeevan Mission).

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts 2 |
| Icons | Lucide React |
| Routing | React Router DOM 6 |
| Package Manager | npm |

---

## Project Structure

```
Gram-Urja/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── postcss.config.js
├── README.md
└── src/
        ├── main.tsx             ← App entry point
        ├── App.tsx              ← Routes & AuthProvider
        ├── index.css            ← Global styles + animation classes
        ├── ai/
        │   └── chatEngine.ts    ← AI assistant logic (keyword-based)
        ├── calculations/
        │   └── engine.ts        ← All sustainability formulas & constants
        ├── components/
        │   ├── Layout.tsx       ← Sidebar + topbar + ambient animations
        │   ├── AreaSelector.tsx ← Reusable area dropdown
        │   └── ui.tsx           ← Shared UI components (KpiCard, Modal, etc.)
        ├── context/
        │   └── AuthContext.tsx  ← Role-based auth state (official/citizen/guest)
        ├── data/
        │   ├── demoData.ts      ← 6 demo area profiles (Suryapur region)
        │   ├── alerts.ts        ← Demo alert data
        │   ├── productData.ts   ← Product/equipment data
        │   └── recommendations.ts ← Action plan recommendations
        ├── pages/
        │   ├── LandingPage.tsx
        │   ├── LoginPage.tsx
        │   ├── VillageDashboard.tsx
        │   ├── HouseholdDashboard.tsx
        │   ├── SolarPage.tsx
        │   ├── WaterPage.tsx
        │   ├── WastePage.tsx
        │   ├── RecommendationsPage.tsx
        │   ├── AlertsPage.tsx
        │   ├── ScorePage.tsx
        │   └── AIAssistantPage.tsx
        ├── services/
        │   └── energyService.ts ← Data access layer (API-ready adapters)
        └── types/
            └── index.ts         ← All TypeScript interfaces
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sakshikri255/Gram-Urja.git
cd Gram-Urja

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will open automatically at **http://localhost:5173**

---

## Available Scripts

Run these from the project root directory:

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint on all `.ts` / `.tsx` files |

---

## Port Configuration

| Environment | Port | URL |
|---|---|---|
| Development | **5173** | http://localhost:5173 |
| Preview (prod build) | **4173** | http://localhost:4173 |

> Port is configured in `vite.config.ts`. If 5173 is busy, Vite will auto-increment (`strictPort: false`). Check your terminal output for the actual port.

To change the port permanently, edit `vite.config.ts`:

```ts
server: {
  port: 5173,   // ← change this
  strictPort: false,
  open: true,
}
```

---

## Features

### 🏠 Landing Page
Animated hero with live-calculated village stats (energy, CO₂, water, waste), conservation particle animations, and feature card grid.

### 🗺️ Village Dashboard
Multi-area command centre for **Village Officials**. Shows all 6 demo areas with sustainability scores, priority index, energy breakdown donut chart, solar potential, water and waste analysis per area.

### 🏡 Household Dashboard
Appliance-level energy analysis for **Household Members**. Cost breakdown, timer tracking, and individual sustainability score.

### ☀️ Solar Page
Interactive roof + land area simulator. Calculates feasible solar capacity, monthly generation, consumption offset, CO₂ avoided, investment, and payback period. Animated panel visualizer with before/after comparison.

### 💧 Water Page
Demand calculator (LPCD-based), rainwater harvesting potential, pump energy analysis, and Jal Jeevan Mission alignment.

### 🌿 Waste & Biogas Page
Organic waste input (cow dung, food waste, agri waste) → biogas m³/day → thermal & electrical energy potential. Community vs household scale.

### 💡 Recommendations Page
Data-driven action plans ranked by priority, with investment cost, payback period, CO₂ impact and category filters.

### 🔔 Alerts Centre
Anomaly detection alerts for consumption spikes, equipment faults, missed solar opportunities, and water leakage indicators. Filter by severity and status.

### 🏆 Sustainability Score
Transparent 0–100 composite score with weighted category breakdown (energy efficiency, renewable adoption, water management, waste management, infrastructure), grade, and trend.

### 🤖 AI Assistant
Natural language Q&A about village data in English and Hindi. Keyword-based engine routes questions to the correct calculation and returns data-grounded answers.

---

## Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/` | Landing Page | All |
| `/login` | Login / Role Select | All |
| `/village` | Village Dashboard | Official, Guest |
| `/household` | Household Dashboard | Citizen, Guest |
| `/solar` | Solar Page | All |
| `/water` | Water Page | All |
| `/waste` | Waste & Biogas | All |
| `/recommendations` | Recommendations | All |
| `/alerts` | Alerts Centre | Official, Guest |
| `/score` | Sustainability Score | All |
| `/ai` | AI Assistant | All |

---

## Data & Calculations

All formulas are in [`src/calculations/engine.ts`](src/calculations/engine.ts).

Key constants (editable in `ASSUMPTIONS`):

| Constant | Value | Source |
|---|---|---|
| Grid emission factor | 0.716 kg CO₂/kWh | CEA 2023 |
| Electricity tariff | ₹6/kWh | Demo |
| Solar yield | 4.5 kWh/kW/day | MNRE avg |
| Solar cost | ₹60,000/kW | MNRE 2024 |
| Rural LPCD | 55 L/person/day | Jal Jeevan Mission |
| Urban LPCD | 70 L/person/day | BIS standard |

Every metric on screen has a **"How calculated?"** button showing the exact formula and source.

---

## User Roles

| Role | Login Option | Access |
|---|---|---|
| **Village Official** | "Login as Official" | Village Dashboard, Alerts, all pages |
| **Household Member** | "Login as Citizen" | Household Dashboard, all pages |
| **Guest** | "Continue as Guest" | Full read-only access |

Role is stored in React context (`AuthContext`). No real authentication — demo only.

---

## Collaboration Guide

### Branch Strategy
```
main          → stable, demo-ready
dev           → active development
feature/xxx   → individual features
```

### Adding a New Area
Edit `src/data/demoData.ts` → add a new `AreaProfile` object to the `DEMO_AREAS` array. All dashboards, scores, and charts update automatically.

### Connecting Real APIs
Replace functions in `src/services/energyService.ts` with real API calls. The `AreaProfile` type in `src/types/index.ts` defines the required data shape.

### Environment Variables
Create a `.env` file in the project root for any future API keys:
```
VITE_NASA_POWER_API_KEY=your_key_here
VITE_CEA_API_KEY=your_key_here
```
Access in code via `import.meta.env.VITE_NASA_POWER_API_KEY`.

---

## Demo Data

The app uses **6 demo areas** in the fictional **Suryapur Sustainability Region**:

| Area | Type | Population |
|---|---|---|
| Suryapur Village | Village | ~1,200 |
| Nandpur | Village | ~800 |
| Rajpur Ward | Urban Ward | ~2,500 |
| Krishnanagar | Village | ~950 |
| Devpur Town | Town | ~4,000 |
| Ambali Hamlet | Village | ~450 |

---

> Built for the **IBM Kharagpur Hackathon** · GreenGrid AI v0.1 · Demo Mode
