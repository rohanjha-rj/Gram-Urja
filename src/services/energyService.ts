import type { AreaProfile, AreaAnalysis } from '../types';
import {
  calculateVillageEnergyBreakdown,
  calculateSolarPotential,
  calculateWaterAnalysis,
  calculateWasteAnalysis,
  calculateElectricityCost,
  calculateCO2,
  calculateSolarOffset,
  calculateSolarGeneration,
  calculateSustainabilityScore,
  calculatePriorityIndex,
} from '../calculations/engine';
import { DEMO_AREAS } from '../data/demoData';

export function analyzeArea(area: AreaProfile): AreaAnalysis {
  const energyBreakdown = calculateVillageEnergyBreakdown(area);
  const solarPotential = calculateSolarPotential(area);
  const waterAnalysis = calculateWaterAnalysis(area);
  const wasteAnalysis = calculateWasteAnalysis(area);

  const existingSolarGen = calculateSolarGeneration(area.infrastructure.solar.installedCapacity, 4.5, 30);
  const renewablePct = calculateSolarOffset(existingSolarGen, area.monthlyElectricity);

  const score = calculateSustainabilityScore(area, solarPotential, wasteAnalysis, waterAnalysis);
  const { index, reasons } = calculatePriorityIndex(area, solarPotential, energyBreakdown);

  return {
    area,
    energyBreakdown,
    solarPotential,
    waterAnalysis,
    wasteAnalysis,
    monthlyCostINR: calculateElectricityCost(area.monthlyElectricity),
    co2KgPerMonth: calculateCO2(area.monthlyElectricity),
    renewablePercent: renewablePct,
    sustainabilityScore: score,
    priorityIndex: index,
    priorityReasons: reasons,
  };
}

export function getAllAreaAnalyses(): AreaAnalysis[] {
  return DEMO_AREAS.map(analyzeArea);
}

export function getAreaById(id: string): AreaProfile | undefined {
  return DEMO_AREAS.find((a) => a.id === id);
}

export function getAreaAnalysisById(id: string): AreaAnalysis | undefined {
  const area = getAreaById(id);
  return area ? analyzeArea(area) : undefined;
}

export function getRegionTotals() {
  const analyses = getAllAreaAnalyses();
  const totalKWh = analyses.reduce((s, a) => s + a.area.monthlyElectricity, 0);
  const totalHH = analyses.reduce((s, a) => s + a.area.households, 0);
  const totalPop = analyses.reduce((s, a) => s + a.area.population, 0);
  const totalCost = analyses.reduce((s, a) => s + a.monthlyCostINR, 0);
  const totalCO2 = analyses.reduce((s, a) => s + a.co2KgPerMonth, 0);
  return { totalKWh, totalHH, totalPop, totalCost, totalCO2, areas: analyses.length };
}
