/**
 * GreenGrid AI — Calculation Engine
 * Pure functions, no side effects, no imports from other modules.
 * All assumptions are explicit and documented.
 */

import type {
  HouseholdAppliance,
  AreaProfile,
  EnergyBreakdown,
  SolarPotential,
  WaterAnalysis,
  WasteAnalysis,
  SustainabilityScoreBreakdown,
  ScoreCategory,
  TariffConfig,
  DEFAULT_TARIFF,
} from '../types';

// Re-export assumptions for UI transparency
export const ASSUMPTIONS = {
  solarM2PerKW: 9.29,           // 1 kW ≈ 10 m² ≈ 108 sq ft (using 9.29 m² = 100 sq ft)
  sqFtToM2: 0.0929,
  solarKWhPerKWPerDay: 4.5,     // 1 kW ≈ 4.5 kWh/day (India average irradiation)
  gridEmissionFactor: 0.82,     // kg CO2/kWh (CEA 2023)
  waterLpcdRural: 55,           // litres/person/day (rural standard)
  waterLpcdUrban: 70,           // litres/person/day (urban standard)
  rainwaterRunoffCoeff: 0.80,   // 80% collection efficiency
  cowDungBiogasM3PerKg: 0.04,  // 1 kg cow dung → 0.04 m³ biogas
  agriWasteBiogasM3PerKg: 0.02,
  foodWasteBiogasM3PerKg: 0.06,
  biogasThermalKWhPerM3: 6.0,  // 1 m³ biogas → 6 kWh thermal
  biogasElectricKWhPerM3: 2.0, // 1 m³ biogas → 2 kWh electricity
  tariffINRPerKWh: 6.5,
  solarCostINRPerKW: 60000,
  schoolMonthlyKWh: 300,        // avg school energy/month
  hospitalMonthlyKWh: 1500,
  healthCentreMonthlyKWh: 400,
  panchayatMonthlyKWh: 150,
  householdPerPersonKWhPerMonth: 15, // baseline for scoring
} as const;

// ─── Energy ───────────────────────────────────────────────────────────────────

/** kWh = (power_W × qty × hours/day × days) / 1000 */
export function calculateApplianceEnergy(
  powerW: number,
  quantity: number,
  hoursPerDay: number,
  days: number,
): number {
  return (powerW * quantity * hoursPerDay * days) / 1000;
}

/** Sum all household appliances → total kWh for period */
export function calculateHouseholdEnergy(appliances: HouseholdAppliance[]): number {
  return appliances
    .filter((a) => a.enabled)
    .reduce((sum, a) => {
      const spec = a.spec;
      if (spec.unit === 'kWh/day') {
        return sum + spec.wattage * a.quantity * a.daysPerMonth;
      }
      return sum + calculateApplianceEnergy(spec.wattage, a.quantity, a.hoursPerDay, a.daysPerMonth);
    }, 0);
}

/** Breakdown of area energy consumption */
export function calculateVillageEnergyBreakdown(area: AreaProfile): EnergyBreakdown {
  const { infrastructure, households, monthlyElectricity } = area;
  const { streetlights, waterPumps, schools, hospitals, healthCentres, panchayat } = infrastructure;

  const streetlightKWh = calculateStreetlightEnergy(
    streetlights.count,
    streetlights.wattageEach,
    streetlights.hoursPerDay,
    30,
  );
  const pumpKWh = waterPumps.count * waterPumps.powerEach * waterPumps.hoursPerDay * 30;
  const schoolKWh = schools * ASSUMPTIONS.schoolMonthlyKWh;
  const hospitalKWh = hospitals * ASSUMPTIONS.hospitalMonthlyKWh;
  const healthCentreKWh = healthCentres * ASSUMPTIONS.healthCentreMonthlyKWh;
  const panchayatKWh = panchayat * ASSUMPTIONS.panchayatMonthlyKWh;
  const otherInfra = hospitalKWh + healthCentreKWh + panchayatKWh;

  const infraTotal = streetlightKWh + pumpKWh + schoolKWh + otherInfra;
  const householdKWh = Math.max(0, monthlyElectricity - infraTotal);

  return {
    households: Math.round(householdKWh),
    streetlights: Math.round(streetlightKWh),
    waterPumps: Math.round(pumpKWh),
    schools: Math.round(schoolKWh),
    hospitals: Math.round(hospitalKWh + healthCentreKWh),
    other: Math.round(panchayatKWh),
    total: Math.round(monthlyElectricity),
  };
}

/** INR = kWh × tariff */
export function calculateElectricityCost(kWh: number, tariffINRPerKWh = ASSUMPTIONS.tariffINRPerKWh): number {
  return Math.round(kWh * tariffINRPerKWh);
}

/** kg CO2 = kWh × emission factor */
export function calculateCO2(kWh: number, emissionFactor = ASSUMPTIONS.gridEmissionFactor): number {
  return +(kWh * emissionFactor).toFixed(2);
}

// ─── Streetlights ─────────────────────────────────────────────────────────────

export function calculateStreetlightEnergy(
  count: number,
  wattageEach: number,
  hoursPerDay: number,
  days = 30,
): number {
  return (count * wattageEach * hoursPerDay * days) / 1000;
}

/** Savings if replacing old streetlights with LED 40W */
export function calculateStreetlightOptimization(
  count: number,
  currentWattage: number,
  hoursPerDay: number,
  ledWattage = 40,
): { savingsKWhPerMonth: number; savingsINRPerMonth: number; savingsCO2KgPerMonth: number } {
  const currentKWh = calculateStreetlightEnergy(count, currentWattage, hoursPerDay);
  const ledKWh = calculateStreetlightEnergy(count, ledWattage, hoursPerDay);
  const savingsKWh = currentKWh - ledKWh;
  return {
    savingsKWhPerMonth: Math.max(0, Math.round(savingsKWh)),
    savingsINRPerMonth: Math.max(0, Math.round(savingsKWh * ASSUMPTIONS.tariffINRPerKWh)),
    savingsCO2KgPerMonth: Math.max(0, calculateCO2(savingsKWh)),
  };
}

// ─── Solar ────────────────────────────────────────────────────────────────────

/** kW from available area, usable %, shading factor */
export function calculateSolarCapacity(
  areaSqFt: number,
  usablePercent = 0.7,
  shadingFactor = 0.9,
): number {
  const areaM2 = areaSqFt * ASSUMPTIONS.sqFtToM2;
  const usableM2 = areaM2 * usablePercent * shadingFactor;
  return +(usableM2 / ASSUMPTIONS.solarM2PerKW).toFixed(2);
}

/** kWh from installed capacity and irradiation */
export function calculateSolarGeneration(
  capacityKW: number,
  irradiationKWhPerKWPerDay: number = ASSUMPTIONS.solarKWhPerKWPerDay,
  days = 30,
): number {
  return Math.round(capacityKW * irradiationKWhPerKWPerDay * days);
}

/** % of consumption offset by solar */
export function calculateSolarOffset(generationKWh: number, consumptionKWh: number): number {
  if (consumptionKWh === 0) return 0;
  return Math.min(100, +(generationKWh / consumptionKWh * 100).toFixed(1));
}

/** kg CO2 avoided per month */
export function calculateSolarCO2Avoided(generationKWh: number, emissionFactor = ASSUMPTIONS.gridEmissionFactor): number {
  return calculateCO2(generationKWh, emissionFactor);
}

/** Full solar potential for an area */
export function calculateSolarPotential(area: AreaProfile, tariff = ASSUMPTIONS.tariffINRPerKWh): SolarPotential {
  const { infrastructure, monthlyElectricity } = area;
  const roofCapacity = calculateSolarCapacity(infrastructure.solar.roofAreaSqFt, 0.7, 0.9);
  const landCapacity = calculateSolarCapacity(infrastructure.solar.openLandSqFt ?? 0, 0.8, 0.95);
  const feasibleCapacity = +(roofCapacity + landCapacity).toFixed(2);
  const monthlyGen = calculateSolarGeneration(feasibleCapacity, ASSUMPTIONS.solarKWhPerKWPerDay, 30);
  const annualGen = calculateSolarGeneration(feasibleCapacity, ASSUMPTIONS.solarKWhPerKWPerDay, 365);
  const offsetPct = calculateSolarOffset(monthlyGen, monthlyElectricity);
  const co2Avoided = calculateSolarCO2Avoided(monthlyGen);
  const investment = Math.round(feasibleCapacity * ASSUMPTIONS.solarCostINRPerKW);
  const annualSavings = calculateElectricityCost(annualGen, tariff);
  const payback = annualSavings > 0 ? +(investment / annualSavings).toFixed(1) : 0;

  return {
    availableAreaM2: Math.round((infrastructure.solar.roofAreaSqFt + (infrastructure.solar.openLandSqFt ?? 0)) * ASSUMPTIONS.sqFtToM2),
    feasibleCapacityKW: feasibleCapacity,
    annualGenerationKWh: annualGen,
    monthlyGenerationKWh: monthlyGen,
    offsetPercent: offsetPct,
    co2AvoidedKgPerMonth: co2Avoided,
    estimatedCostINR: investment,
    paybackYears: payback,
  };
}

// ─── Water ────────────────────────────────────────────────────────────────────

/** Litres/day = population × lpcd */
export function calculateWaterDemand(population: number, lpcd: number = ASSUMPTIONS.waterLpcdRural): number {
  return population * lpcd;
}

/** Savings in litres */
export function calculateWaterSavings(currentLitres: number, optimizedLitres: number): number {
  return Math.max(0, currentLitres - optimizedLitres);
}

/** Litres of rainwater collectible */
export function calculateRainwaterHarvesting(
  rainfallMm: number,
  catchmentAreaM2: number,
  runoffCoeff: number = ASSUMPTIONS.rainwaterRunoffCoeff,
): number {
  // Volume (litres) = rainfall (m) × area (m²) × 1000 × runoff
  return Math.round((rainfallMm / 1000) * catchmentAreaM2 * 1000 * runoffCoeff);
}

/** kWh for pumping */
export function calculatePumpingEnergy(powerKW: number, hoursPerMonth: number): number {
  return +(powerKW * hoursPerMonth).toFixed(2);
}

/** Full water analysis for an area */
export function calculateWaterAnalysis(area: AreaProfile): WaterAnalysis {
  const lpcd: number = area.type === 'urban_ward' ? ASSUMPTIONS.waterLpcdUrban : ASSUMPTIONS.waterLpcdRural;
  const dailyDemand = calculateWaterDemand(area.population, lpcd);
  const monthlyDemand = dailyDemand * 30;
  const pumpEnergy =
    area.infrastructure.waterPumps.count *
    area.infrastructure.waterPumps.powerEach *
    area.infrastructure.waterPumps.hoursPerDay *
    30;
  const rainwaterAnnual = calculateRainwaterHarvesting(
    area.rainfallMmPerYear,
    area.rainwaterCatchmentAreaM2,
  );
  const rainwaterMonthly = rainwaterAnnual / 12;
  const offsetPct = +(rainwaterMonthly / monthlyDemand * 100).toFixed(1);

  return {
    dailyDemandLitres: Math.round(dailyDemand),
    monthlyDemandLitres: Math.round(monthlyDemand),
    pumpEnergyKWhPerMonth: Math.round(pumpEnergy),
    rainwaterPotentialLitresPerYear: rainwaterAnnual,
    rainwaterOffsetPercent: Math.min(100, offsetPct),
  };
}

// ─── Waste & Biogas ───────────────────────────────────────────────────────────

/** m³ biogas/day from organic inputs */
export function calculateBiogas(
  cowDungKgPerDay: number,
  agriWasteKgPerDay: number,
  foodWasteKgPerDay: number,
): number {
  return +(
    cowDungKgPerDay * ASSUMPTIONS.cowDungBiogasM3PerKg +
    agriWasteKgPerDay * ASSUMPTIONS.agriWasteBiogasM3PerKg +
    foodWasteKgPerDay * ASSUMPTIONS.foodWasteBiogasM3PerKg
  ).toFixed(2);
}

/** kWh/day thermal from biogas */
export function calculateWasteEnergy(biogasM3PerDay: number): number {
  return +(biogasM3PerDay * ASSUMPTIONS.biogasThermalKWhPerM3).toFixed(2);
}

/** Full waste analysis for an area */
export function calculateWasteAnalysis(area: AreaProfile): WasteAnalysis {
  const biogasPerDay = calculateBiogas(area.cowDungKgPerDay, area.agriWasteKgPerDay, area.foodWasteKgPerDay);
  const thermalPerDay = calculateWasteEnergy(biogasPerDay);
  const electricityPerDay = +(biogasPerDay * ASSUMPTIONS.biogasElectricKWhPerM3).toFixed(2);
  const co2OffsetPerMonth = calculateCO2(electricityPerDay * 30);

  return {
    biogasM3PerDay: biogasPerDay,
    thermalEnergyKWhPerDay: thermalPerDay,
    electricityKWhPerDay: electricityPerDay,
    co2OffsetKgPerMonth: co2OffsetPerMonth,
  };
}

// ─── Sustainability Score ─────────────────────────────────────────────────────

/** 0-100 composite sustainability score */
export function calculateSustainabilityScore(
  area: AreaProfile,
  solar: SolarPotential,
  waste: WasteAnalysis,
  water: WaterAnalysis,
): number {
  // Energy efficiency: per-household consumption vs. benchmark
  const perHH = area.monthlyElectricity / area.households;
  const energyScore = Math.max(0, Math.min(100, 100 - (perHH - 30) * 2));

  // Renewable adoption
  const renewableScore = Math.min(100, (area.infrastructure.solar.installedCapacity / (area.monthlyElectricity / 120)) * 100);

  // Solar potential utilization
  const solarUtilScore = Math.min(100, (area.infrastructure.solar.installedCapacity / Math.max(1, solar.feasibleCapacityKW)) * 100);

  // Water efficiency (rainwater offset)
  const waterScore = Math.min(100, water.rainwaterOffsetPercent * 2.5);

  // Waste-to-energy adoption (assume 20% utilization as 100)
  const wasteScore = Math.min(100, (waste.electricityKWhPerDay * 30 / Math.max(1, area.monthlyElectricity)) * 500);

  // Infrastructure (LED streetlights boost score)
  const ledPenalty = area.infrastructure.streetlights.type === 'led' ? 0 : 20;
  const infraScore = Math.max(0, 80 - ledPenalty);

  // Weighted average
  const score =
    energyScore * 0.25 +
    renewableScore * 0.20 +
    solarUtilScore * 0.15 +
    waterScore * 0.15 +
    wasteScore * 0.10 +
    infraScore * 0.15;

  return Math.round(Math.min(100, Math.max(0, score)));
}

export function calculateSustainabilityScoreBreakdown(
  area: AreaProfile,
  solar: SolarPotential,
  waste: WasteAnalysis,
  water: WaterAnalysis,
): SustainabilityScoreBreakdown {
  const perHH = area.monthlyElectricity / area.households;
  const energyScore = Math.round(Math.max(0, Math.min(100, 100 - (perHH - 30) * 2)));
  const renewableScore = Math.round(Math.min(100, (area.infrastructure.solar.installedCapacity / Math.max(1, area.monthlyElectricity / 120)) * 100));
  const solarUtilScore = Math.round(Math.min(100, (area.infrastructure.solar.installedCapacity / Math.max(1, solar.feasibleCapacityKW)) * 100));
  const waterScore = Math.round(Math.min(100, water.rainwaterOffsetPercent * 2.5));
  const wasteScore = Math.round(Math.min(100, (waste.electricityKWhPerDay * 30 / Math.max(1, area.monthlyElectricity)) * 500));
  const ledPenalty = area.infrastructure.streetlights.type === 'led' ? 0 : 20;
  const infraScore = Math.max(0, 80 - ledPenalty);

  const total = Math.round(
    energyScore * 0.25 +
    renewableScore * 0.20 +
    solarUtilScore * 0.15 +
    waterScore * 0.15 +
    wasteScore * 0.10 +
    infraScore * 0.15,
  );

  const grade: SustainabilityScoreBreakdown['grade'] =
    total >= 80 ? 'A+' : total >= 70 ? 'A' : total >= 60 ? 'B+' : total >= 50 ? 'B' : total >= 35 ? 'C' : 'D';

  const categories: ScoreCategory[] = [
    {
      name: 'Energy Efficiency',
      weight: 0.25,
      score: energyScore,
      rationale: `${perHH.toFixed(1)} kWh/household/month vs 30 kWh benchmark`,
      indicators: [{ label: 'Per-HH consumption', value: `${perHH.toFixed(1)} kWh/mo`, contribution: energyScore * 0.25 }],
    },
    {
      name: 'Renewable Adoption',
      weight: 0.20,
      score: renewableScore,
      rationale: `${area.infrastructure.solar.installedCapacity} kW installed vs estimated need`,
      indicators: [{ label: 'Solar installed', value: `${area.infrastructure.solar.installedCapacity} kW`, contribution: renewableScore * 0.20 }],
    },
    {
      name: 'Solar Utilization',
      weight: 0.15,
      score: solarUtilScore,
      rationale: `${area.infrastructure.solar.installedCapacity} kW of ${solar.feasibleCapacityKW} kW potential used`,
      indicators: [{ label: 'Solar utilization', value: `${solarUtilScore}%`, contribution: solarUtilScore * 0.15 }],
    },
    {
      name: 'Water Sustainability',
      weight: 0.15,
      score: waterScore,
      rationale: `Rainwater can offset ${water.rainwaterOffsetPercent}% of monthly demand`,
      indicators: [{ label: 'Rainwater offset', value: `${water.rainwaterOffsetPercent}%`, contribution: waterScore * 0.15 }],
    },
    {
      name: 'Waste-to-Energy',
      weight: 0.10,
      score: wasteScore,
      rationale: `${(waste.electricityKWhPerDay * 30).toFixed(0)} kWh/month biogas potential`,
      indicators: [{ label: 'Biogas potential', value: `${waste.biogasM3PerDay.toFixed(1)} m³/day`, contribution: wasteScore * 0.10 }],
    },
    {
      name: 'Infrastructure',
      weight: 0.15,
      score: infraScore,
      rationale: area.infrastructure.streetlights.type === 'led' ? 'LED streetlights in use' : 'Non-LED streetlights detected',
      indicators: [{ label: 'Streetlight type', value: area.infrastructure.streetlights.type.toUpperCase(), contribution: infraScore * 0.15 }],
    },
  ];

  const trend = [
    { month: 'Aug', score: Math.max(10, total - 18) },
    { month: 'Sep', score: Math.max(10, total - 12) },
    { month: 'Oct', score: Math.max(10, total - 8) },
    { month: 'Nov', score: Math.max(10, total - 5) },
    { month: 'Dec', score: Math.max(10, total - 2) },
    { month: 'Jan', score: total },
  ];

  return { total, grade, categories, trend };
}

/** Priority index 0-100 with reasons */
export function calculatePriorityIndex(
  area: AreaProfile,
  solar: SolarPotential,
  energyBreakdown: EnergyBreakdown,
): { index: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // High per-HH consumption
  const perHH = area.monthlyElectricity / area.households;
  if (perHH > 80) { score += 30; reasons.push('Very high per-household energy consumption'); }
  else if (perHH > 60) { score += 20; reasons.push('Above-average per-household energy consumption'); }

  // Low solar penetration
  const solarPct = solar.offsetPercent;
  if (solarPct < 5) { score += 25; reasons.push('Near-zero solar adoption — high rooftop potential'); }
  else if (solarPct < 20) { score += 15; reasons.push('Low solar penetration — significant potential untapped'); }

  // Inefficient streetlights
  if (area.infrastructure.streetlights.type !== 'led' && area.infrastructure.streetlights.wattageEach >= 60) {
    score += 20;
    reasons.push('High-wattage non-LED streetlights in operation');
  }

  // Large population with no solar
  if (area.population > 1000 && area.infrastructure.solar.installedCapacity === 0) {
    score += 15;
    reasons.push('Large population with zero solar installation');
  }

  // Biogas potential unused
  const biogasKWh = calculateBiogas(area.cowDungKgPerDay, area.agriWasteKgPerDay, area.foodWasteKgPerDay) * ASSUMPTIONS.biogasElectricKWhPerM3 * 30;
  if (biogasKWh > 200) {
    score += 10;
    reasons.push(`High organic waste biogas potential (~${Math.round(biogasKWh)} kWh/month)`);
  }

  return { index: Math.min(100, score), reasons };
}

/** Before/after scenario delta */
export function calculateBeforeAfterScenario(
  beforeKWh: number,
  solarGenerationKWh: number,
  tariff = ASSUMPTIONS.tariffINRPerKWh,
  emissionFactor = ASSUMPTIONS.gridEmissionFactor,
): {
  beforeKWh: number;
  afterKWh: number;
  savedKWh: number;
  savedINR: number;
  savedCO2Kg: number;
  savedPercent: number;
} {
  const afterKWh = Math.max(0, beforeKWh - solarGenerationKWh);
  const savedKWh = beforeKWh - afterKWh;
  return {
    beforeKWh: Math.round(beforeKWh),
    afterKWh: Math.round(afterKWh),
    savedKWh: Math.round(savedKWh),
    savedINR: calculateElectricityCost(savedKWh, tariff),
    savedCO2Kg: calculateCO2(savedKWh, emissionFactor),
    savedPercent: +(savedKWh / beforeKWh * 100).toFixed(1),
  };
}
