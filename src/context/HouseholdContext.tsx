import React, { createContext, useContext, useState, useMemo } from 'react';
import { APPLIANCE_DATABASE } from '../data/demoData';
import { calculateHouseholdEnergy } from '../calculations/engine';
import type { HouseholdAppliance } from '../types';

export const DEFAULT_APPLIANCES: HouseholdAppliance[] = [
  { spec: APPLIANCE_DATABASE[0],  quantity: 4, hoursPerDay: 6,    daysPerMonth: 30, enabled: true },
  { spec: APPLIANCE_DATABASE[2],  quantity: 3, hoursPerDay: 8,    daysPerMonth: 30, enabled: true },
  { spec: APPLIANCE_DATABASE[5],  quantity: 1, hoursPerDay: 4,    daysPerMonth: 30, enabled: true },
  { spec: APPLIANCE_DATABASE[6],  quantity: 1, hoursPerDay: 5,    daysPerMonth: 25, enabled: true },
  { spec: APPLIANCE_DATABASE[13], quantity: 1, hoursPerDay: 0,    daysPerMonth: 30, enabled: true },
  { spec: APPLIANCE_DATABASE[16], quantity: 1, hoursPerDay: 0.25, daysPerMonth: 25, enabled: true },
  { spec: APPLIANCE_DATABASE[8],  quantity: 1, hoursPerDay: 1,    daysPerMonth: 30, enabled: true },
];

interface HouseholdContextValue {
  appliances: HouseholdAppliance[];
  setAppliances: React.Dispatch<React.SetStateAction<HouseholdAppliance[]>>;
  members: number;
  setMembers: React.Dispatch<React.SetStateAction<number>>;
  totalKWh: number;
}

const HouseholdContext = createContext<HouseholdContextValue>({
  appliances: DEFAULT_APPLIANCES,
  setAppliances: () => {},
  members: 4,
  setMembers: () => {},
  totalKWh: 0,
});

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const [appliances, setAppliances] = useState<HouseholdAppliance[]>(DEFAULT_APPLIANCES);
  const [members, setMembers] = useState(4);
  const totalKWh = useMemo(() => calculateHouseholdEnergy(appliances), [appliances]);

  return (
    <HouseholdContext.Provider value={{ appliances, setAppliances, members, setMembers, totalKWh }}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  return useContext(HouseholdContext);
}
