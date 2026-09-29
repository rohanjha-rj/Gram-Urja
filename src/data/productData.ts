// Product recommendation data for household appliance upgrades
// All prices are illustrative market estimates — verify before purchasing

export interface ProductOption {
  id: string;
  name: string;
  powerW: number;            // For W-rated appliances
  energyKWhPerDay?: number;  // For refrigerators/daily-rated
  beeStars?: number;
  approxCostINR: number;
  motorType?: string;
  notes: string;
}

export interface ApplianceCategory {
  id: string;
  label: string;
  icon: string;
  currentName: string;
  currentPowerW: number;
  currentEnergyKWhPerDay?: number;
  currentHoursPerDay: number;
  options: ProductOption[];
}

export const PRODUCT_RECOMMENDATIONS: ApplianceCategory[] = [
  {
    id: 'fan',
    label: 'Ceiling Fan',
    icon: '🌀',
    currentName: 'Standard Ceiling Fan (Old)',
    currentPowerW: 70,
    currentHoursPerDay: 10,
    options: [
      {
        id: 'havells_efficiencia',
        name: 'Havells Efficiencia Neo',
        powerW: 35,
        beeStars: 5,
        approxCostINR: 2800,
        notes: 'BEE 5-star rated, saves 50% energy vs standard fan',
      },
      {
        id: 'orient_aeroquiet',
        name: 'Orient Electric Aeroquiet',
        powerW: 35,
        motorType: 'BLDC',
        beeStars: 5,
        approxCostINR: 3200,
        notes: 'BLDC motor, ultra-quiet operation, remote control',
      },
      {
        id: 'atomberg_renesa',
        name: 'Atomberg Renesa BLDC',
        powerW: 28,
        motorType: 'BLDC',
        beeStars: 5,
        approxCostINR: 3500,
        notes: 'Most efficient — BLDC motor uses only 28W. IoT ready.',
      },
    ],
  },
  {
    id: 'bulb',
    label: 'Light Bulb',
    icon: '💡',
    currentName: 'Incandescent / CFL Bulb',
    currentPowerW: 40,
    currentHoursPerDay: 6,
    options: [
      {
        id: 'philips_stellar',
        name: 'Philips Stellar Bright LED 9W',
        powerW: 9,
        beeStars: 5,
        approxCostINR: 85,
        notes: 'Bright warm light, 9W replaces 40W incandescent',
      },
      {
        id: 'havells_adore',
        name: 'Havells Adore LED 9W',
        powerW: 9,
        beeStars: 5,
        approxCostINR: 90,
        notes: 'Long life design, 25,000 hrs rated',
      },
      {
        id: 'syska_ssl',
        name: 'Syska LED SSK-SRL 9W',
        powerW: 9,
        beeStars: 5,
        approxCostINR: 80,
        notes: 'Economy option, same 9W LED performance',
      },
    ],
  },
  {
    id: 'fridge',
    label: 'Refrigerator',
    icon: '🧊',
    currentName: 'Old 2-Star Refrigerator (180L)',
    currentPowerW: 0,
    currentEnergyKWhPerDay: 1.8,
    currentHoursPerDay: 0,
    options: [
      {
        id: 'whirlpool_215l',
        name: 'Whirlpool 215L 5-Star',
        powerW: 0,
        energyKWhPerDay: 0.70,
        beeStars: 5,
        approxCostINR: 18000,
        notes: 'Saves 1.1 kWh/day vs 2-star. 215L capacity.',
      },
      {
        id: 'lg_215l_inverter',
        name: 'LG 215L 5-Star Inverter',
        powerW: 0,
        energyKWhPerDay: 0.65,
        beeStars: 5,
        approxCostINR: 22000,
        notes: 'Inverter compressor — most efficient. Smart diagnosis.',
      },
      {
        id: 'samsung_215l',
        name: 'Samsung 215L 5-Star Digital Inverter',
        powerW: 0,
        energyKWhPerDay: 0.68,
        beeStars: 5,
        approxCostINR: 20000,
        notes: 'Digital inverter, 10-year compressor warranty',
      },
    ],
  },
  {
    id: 'ac',
    label: 'Air Conditioner',
    icon: '❄️',
    currentName: 'Old 3-Star 1.5T AC',
    currentPowerW: 1500,
    currentHoursPerDay: 6,
    options: [
      {
        id: 'voltas_5star',
        name: 'Voltas 1.5T 5-Star Inverter',
        powerW: 950,
        beeStars: 5,
        motorType: 'Inverter',
        approxCostINR: 35000,
        notes: 'Auto adjustable cooling, saves ~37% energy',
      },
      {
        id: 'daikin_5star',
        name: 'Daikin 1.5T 5-Star Inverter',
        powerW: 900,
        beeStars: 5,
        motorType: 'Inverter',
        approxCostINR: 40000,
        notes: 'Best-in-class efficiency. Quiet operation.',
      },
      {
        id: 'bluestar_5star',
        name: 'Blue Star 1.5T 5-Star Inverter',
        powerW: 920,
        beeStars: 5,
        motorType: 'Inverter',
        approxCostINR: 38000,
        notes: 'Self-cleaning filter, turbo cooling',
      },
    ],
  },
  {
    id: 'pump',
    label: 'Water Pump',
    icon: '💦',
    currentName: 'Old 1HP Water Pump',
    currentPowerW: 746,
    currentHoursPerDay: 2,
    options: [
      {
        id: 'kirloskar_star1',
        name: 'Kirloskar Star-1 0.5HP',
        powerW: 373,
        approxCostINR: 3500,
        notes: 'Adequate for most household needs, saves 50% pump energy',
      },
      {
        id: 'cri_mono_05hp',
        name: 'CRI Monoblock 0.5HP',
        powerW: 370,
        approxCostINR: 3200,
        notes: 'Economy choice. Reliable CRI brand monoblock.',
      },
      {
        id: 'havells_hiflow',
        name: 'Havells Hi-Flow 0.5HP',
        powerW: 375,
        approxCostINR: 3800,
        notes: 'Higher flow rate than standard 0.5HP pumps',
      },
    ],
  },
];

export function getProductCategory(applianceSpecId: string): ApplianceCategory | undefined {
  if (applianceSpecId.includes('fan') && applianceSpecId !== 'fan_bldc' && applianceSpecId !== 'fan_efficient') {
    return PRODUCT_RECOMMENDATIONS.find((p) => p.id === 'fan');
  }
  if (applianceSpecId.includes('led') || applianceSpecId.includes('bulb') || applianceSpecId.includes('tube')) {
    return PRODUCT_RECOMMENDATIONS.find((p) => p.id === 'bulb');
  }
  if (applianceSpecId.includes('fridge') && applianceSpecId.includes('2star')) {
    return PRODUCT_RECOMMENDATIONS.find((p) => p.id === 'fridge');
  }
  if (applianceSpecId.includes('ac_3star')) {
    return PRODUCT_RECOMMENDATIONS.find((p) => p.id === 'ac');
  }
  if (applianceSpecId.includes('pump_1hp')) {
    return PRODUCT_RECOMMENDATIONS.find((p) => p.id === 'pump');
  }
  return undefined;
}
