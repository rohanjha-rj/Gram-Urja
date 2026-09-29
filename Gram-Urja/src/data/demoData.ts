import type { AreaProfile, ApplianceSpec } from '../types';

// ─── Appliance Database ───────────────────────────────────────────────────────
export const APPLIANCE_DATABASE: ApplianceSpec[] = [
  { id: 'led_bulb', name: 'LED Bulb', category: 'lighting', wattage: 9, unit: 'W', energyRating: 5 },
  { id: 'tube_light', name: 'Tube Light (Fluorescent)', category: 'lighting', wattage: 20, unit: 'W', energyRating: 3 },
  { id: 'fan_old', name: 'Ceiling Fan (Old)', category: 'cooling', wattage: 70, unit: 'W', energyRating: 2 },
  { id: 'fan_efficient', name: 'Ceiling Fan (5-Star)', category: 'cooling', wattage: 35, unit: 'W', energyRating: 5 },
  { id: 'fan_bldc', name: 'BLDC Fan', category: 'cooling', wattage: 28, unit: 'W', energyRating: 5 },
  { id: 'tv_lcd', name: 'TV (LCD 32")', category: 'entertainment', wattage: 80, unit: 'W', energyRating: 3 },
  { id: 'laptop', name: 'Laptop', category: 'entertainment', wattage: 60, unit: 'W', energyRating: 4 },
  { id: 'desktop', name: 'Desktop PC', category: 'entertainment', wattage: 150, unit: 'W', energyRating: 2 },
  { id: 'pump_05hp', name: 'Water Pump (0.5 HP)', category: 'pump', wattage: 373, unit: 'W', energyRating: 3 },
  { id: 'pump_1hp', name: 'Water Pump (1 HP)', category: 'pump', wattage: 746, unit: 'W', energyRating: 3 },
  { id: 'cooler', name: 'Desert Cooler', category: 'cooling', wattage: 200, unit: 'W', energyRating: 3 },
  { id: 'ac_3star', name: 'AC 1.5T (3-Star)', category: 'cooling', wattage: 1500, unit: 'W', energyRating: 3 },
  { id: 'ac_5star', name: 'AC 1.5T (5-Star)', category: 'cooling', wattage: 1100, unit: 'W', energyRating: 5 },
  { id: 'fridge_2star', name: 'Refrigerator 180L (2-Star)', category: 'kitchen', wattage: 1.2, unit: 'kWh/day', energyRating: 2 },
  { id: 'fridge_5star', name: 'Refrigerator 180L (5-Star)', category: 'kitchen', wattage: 0.7, unit: 'kWh/day', energyRating: 5 },
  { id: 'washing_machine', name: 'Washing Machine', category: 'kitchen', wattage: 500, unit: 'W', energyRating: 3 },
  { id: 'mixer', name: 'Mixer / Grinder', category: 'kitchen', wattage: 750, unit: 'W', energyRating: 3 },
  { id: 'iron', name: 'Electric Iron', category: 'other', wattage: 1000, unit: 'W', energyRating: 3 },
  { id: 'sl_sodium', name: 'Streetlight (Sodium)', category: 'lighting', wattage: 150, unit: 'W', energyRating: 1 },
  { id: 'sl_led', name: 'Streetlight (LED)', category: 'lighting', wattage: 40, unit: 'W', energyRating: 5 },
];

// ─── 5 Demo Areas ─────────────────────────────────────────────────────────────
export const DEMO_AREAS: AreaProfile[] = [
  {
    id: 'motipur',
    name: 'Motipur',
    type: 'village',
    population: 8959,
    households: 1684,
    // Average monthly electricity: 72938 kWh (household + school; no health-centre load)
    monthlyElectricity: 72938,
    infrastructure: {
      streetlights: { count: 80, wattageEach: 40, hoursPerDay: 9, type: 'led' },
      waterPumps: { count: 6, powerEach: 1.5, hoursPerDay: 6 },
      // Existing solar: Not verified → 0; Solar potential: 150 kW
      solar: { installedCapacity: 0, roofAreaSqFt: 18000, openLandSqFt: 12000, type: 'rooftop' },
      schools: 4,
      hospitals: 0,
      healthCentres: 0,
      panchayat: 1,
    },
    // GOBARdhan feedstock 1500 kg/day; estimated village organic waste 1684 kg/day
    cowDungKgPerDay: 900,
    foodWasteKgPerDay: 500,
    agriWasteKgPerDay: 284,
    // Bihar avg rainfall ~1100 mm/year; area 512.41 ha → large catchment
    rainfallMmPerYear: 1100,
    rainwaterCatchmentAreaM2: 800,
  },
  {
    id: 'oiara',
    name: 'Oiara',
    type: 'village',
    population: 3580,
    households: 674,
    // Average monthly electricity: 29912 kWh
    monthlyElectricity: 29912,
    infrastructure: {
      streetlights: { count: 50, wattageEach: 40, hoursPerDay: 9, type: 'led' },
      waterPumps: { count: 4, powerEach: 1.5, hoursPerDay: 5 },
      // Solar potential: 100 kW; not verified
      solar: { installedCapacity: 0, roofAreaSqFt: 10000, openLandSqFt: 6000, type: 'rooftop' },
      schools: 4,
      hospitals: 0,
      healthCentres: 0,
      panchayat: 1,
    },
    // GOBARdhan feedstock 1500 kg/day; estimated organic waste 674 kg/day
    cowDungKgPerDay: 400,
    foodWasteKgPerDay: 180,
    agriWasteKgPerDay: 94,
    rainfallMmPerYear: 1050,
    rainwaterCatchmentAreaM2: 500,
  },
  {
    id: 'amra',
    name: 'Amra',
    type: 'village',
    population: 4316,
    households: 803,
    // Average monthly electricity: 35408 kWh
    monthlyElectricity: 35408,
    infrastructure: {
      streetlights: { count: 60, wattageEach: 40, hoursPerDay: 9, type: 'led' },
      waterPumps: { count: 5, powerEach: 1.5, hoursPerDay: 6 },
      // Solar potential: 125 kW; not verified
      solar: { installedCapacity: 0, roofAreaSqFt: 12000, openLandSqFt: 8000, type: 'rooftop' },
      schools: 4,
      hospitals: 0,
      healthCentres: 0,
      panchayat: 1,
    },
    // GOBARdhan feedstock 2000 kg/day; estimated organic waste 803 kg/day
    cowDungKgPerDay: 500,
    foodWasteKgPerDay: 200,
    agriWasteKgPerDay: 103,
    rainfallMmPerYear: 1000,
    rainwaterCatchmentAreaM2: 620,
  },
  {
    id: 'barouni',
    name: 'Barouni (Part)',
    type: 'village',
    population: 1560,
    households: 300,
    // Average monthly electricity: 13980 kWh
    monthlyElectricity: 13980,
    infrastructure: {
      streetlights: { count: 30, wattageEach: 40, hoursPerDay: 8, type: 'led' },
      waterPumps: { count: 3, powerEach: 1.0, hoursPerDay: 5 },
      // Existing solar: 15 kW; solar potential: 300 kW
      solar: { installedCapacity: 15, roofAreaSqFt: 8000, openLandSqFt: 20000, type: 'hybrid' },
      schools: 2,
      hospitals: 0,
      healthCentres: 0,
      panchayat: 1,
    },
    // GOBARdhan feedstock 2000 kg/day; estimated organic waste 300 kg/day
    cowDungKgPerDay: 180,
    foodWasteKgPerDay: 80,
    agriWasteKgPerDay: 40,
    rainfallMmPerYear: 1100,
    rainwaterCatchmentAreaM2: 300,
  },
  {
    id: 'korha',
    name: 'Korha',
    type: 'village',
    population: 905,
    households: 170,
    // Average monthly electricity: 7842 kWh
    monthlyElectricity: 7842,
    infrastructure: {
      streetlights: { count: 20, wattageEach: 40, hoursPerDay: 8, type: 'led' },
      waterPumps: { count: 2, powerEach: 1.0, hoursPerDay: 5 },
      // Solar potential: 75 kW; not verified
      solar: { installedCapacity: 0, roofAreaSqFt: 5000, openLandSqFt: 3000, type: 'rooftop' },
      schools: 2,
      hospitals: 0,
      healthCentres: 0,
      panchayat: 1,
    },
    // GOBARdhan feedstock 2000 kg/day; estimated organic waste 170 kg/day
    cowDungKgPerDay: 100,
    foodWasteKgPerDay: 45,
    agriWasteKgPerDay: 25,
    rainfallMmPerYear: 1100,
    rainwaterCatchmentAreaM2: 250,
  },
];

export const REGION_NAME = 'Bihar Village Sustainability Region';
