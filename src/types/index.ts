// ─── Core metadata wrapper ───────────────────────────────────────────────────
export interface DataValue {
  value: number;
  unit: string;
  source: string;
  timestamp: string;
  type: 'measured' | 'estimated' | 'demo';
  confidence: number; // 0-1
}

// ─── Appliances ──────────────────────────────────────────────────────────────
export interface ApplianceSpec {
  id: string;
  name: string;
  category: 'lighting' | 'cooling' | 'entertainment' | 'kitchen' | 'pump' | 'other';
  wattage: number;
  unit: 'W' | 'kWh/day'; // fixed or daily energy
  energyRating?: 1 | 2 | 3 | 4 | 5;
  icon?: string;
}

export interface HouseholdAppliance {
  spec: ApplianceSpec;
  quantity: number;
  hoursPerDay: number;
  daysPerMonth: number;
  enabled: boolean;
}

// ─── Infrastructure ───────────────────────────────────────────────────────────
export interface Streetlight {
  count: number;
  wattageEach: number; // W
  hoursPerDay: number;
  type: 'sodium' | 'cfl' | 'led';
}

export interface WaterPump {
  count: number;
  powerEach: number; // kW
  hoursPerDay: number;
}

export interface SolarInstallation {
  installedCapacity: number; // kW
  roofAreaSqFt: number;
  openLandSqFt?: number;
  type: 'rooftop' | 'ground' | 'hybrid';
}

export interface Infrastructure {
  streetlights: Streetlight;
  waterPumps: WaterPump;
  solar: SolarInstallation;
  schools: number;
  hospitals: number;
  panchayat: number;
  healthCentres: number;
}

// ─── Area / Village ───────────────────────────────────────────────────────────
export type AreaType = 'village' | 'urban_ward' | 'town';

export interface AreaProfile {
  id: string;
  name: string;
  type: AreaType;
  population: number;
  households: number;
  monthlyElectricity: number; // kWh
  infrastructure: Infrastructure;
  // organic waste
  cowDungKgPerDay: number;
  foodWasteKgPerDay: number;
  agriWasteKgPerDay: number;
  // water
  rainfallMmPerYear: number;
  rainwaterCatchmentAreaM2: number;
  // scores (calculated)
  sustainabilityScore?: number;
  priorityIndex?: number;
  priorityReasons?: string[];
}

// ─── Household ────────────────────────────────────────────────────────────────
export interface HouseholdProfile {
  id: string;
  name: string;
  areaId: string;
  members: number;
  monthlyIncomeBand: 'low' | 'middle' | 'high';
  appliances: HouseholdAppliance[];
}

// ─── Calculation results ──────────────────────────────────────────────────────
export interface EnergyBreakdown {
  households: number; // kWh/month
  streetlights: number;
  waterPumps: number;
  schools: number;
  hospitals: number;
  other: number;
  total: number;
}

export interface SolarPotential {
  availableAreaM2: number;
  feasibleCapacityKW: number;
  annualGenerationKWh: number;
  monthlyGenerationKWh: number;
  offsetPercent: number;
  co2AvoidedKgPerMonth: number;
  estimatedCostINR: number;
  paybackYears: number;
}

export interface WaterAnalysis {
  dailyDemandLitres: number;
  monthlyDemandLitres: number;
  pumpEnergyKWhPerMonth: number;
  rainwaterPotentialLitresPerYear: number;
  rainwaterOffsetPercent: number;
}

export interface WasteAnalysis {
  biogasM3PerDay: number;
  thermalEnergyKWhPerDay: number;
  electricityKWhPerDay: number;
  co2OffsetKgPerMonth: number;
}

export interface AreaAnalysis {
  area: AreaProfile;
  energyBreakdown: EnergyBreakdown;
  solarPotential: SolarPotential;
  waterAnalysis: WaterAnalysis;
  wasteAnalysis: WasteAnalysis;
  monthlyCostINR: number;
  co2KgPerMonth: number;
  renewablePercent: number;
  sustainabilityScore: number;
  priorityIndex: number;
  priorityReasons: string[];
}

// ─── Recommendations ──────────────────────────────────────────────────────────
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type RecommendationCategory = 'solar' | 'water' | 'waste' | 'lighting' | 'appliance' | 'behavior';

export interface Recommendation {
  id: string;
  areaId: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  title: string;
  problem: string;
  rootCause: string;
  intervention: string;
  currentValue: string;
  expectedValue: string;
  energySavingsKWhPerMonth: number;
  costSavingsINRPerMonth: number;
  co2ImpactKgPerMonth: number;
  investmentINR: number;
  paybackMonths: number;
  beneficiaries: string;
  implementationTime: string;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface Alert {
  id: string;
  areaId: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: 'streetlight' | 'pump' | 'solar' | 'school' | 'hospital' | 'consumption' | 'water';
  title: string;
  description: string;
  possibleCause: string;
  recommendation: string;
  detectedAt: string;
  verificationRequired: boolean;
  estimatedLossINR?: number;
}

// ─── Sustainability Score ─────────────────────────────────────────────────────
export interface ScoreCategory {
  name: string;
  weight: number; // 0-1, sum=1
  score: number;  // 0-100
  rationale: string;
  indicators: { label: string; value: string; contribution: number }[];
}

export interface SustainabilityScoreBreakdown {
  total: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  categories: ScoreCategory[];
  trend: { month: string; score: number }[];
}

// ─── AI / Chat ────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language: 'en' | 'hi';
  relatedMetric?: string;
  navigationSuggestion?: string;
}

// ─── Tariff / Config ──────────────────────────────────────────────────────────
export interface TariffConfig {
  residentialINRPerKWh: number;
  commercialINRPerKWh: number;
  agricultureINRPerKWh: number;
  gridEmissionFactorKgPerKWh: number;
  solarCostINRPerKW: number;
  solarIrradiationKWhPerKWPerDay: number;
}

export const DEFAULT_TARIFF: TariffConfig = {
  residentialINRPerKWh: 6.5,
  commercialINRPerKWh: 8.0,
  agricultureINRPerKWh: 3.0,
  gridEmissionFactorKgPerKWh: 0.82,
  solarCostINRPerKW: 60000,
  solarIrradiationKWhPerKWPerDay: 4.5,
};
