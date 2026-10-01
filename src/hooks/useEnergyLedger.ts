/**
 * useEnergyLedger
 * ──────────────────────────────────────────────────────────────────────────────
 * Manages a household's live solar + biogas surplus inputs and derives all
 * financial / energy metrics from them in real time.
 *
 * solarSurplus   — kWh of solar surplus fed to the grid today (user-controlled)
 * biogasSurplus  — kWh of biogas surplus fed to the grid today (user-controlled)
 *
 * All derived values update instantly on every slider change.
 */

import { useState, useMemo } from 'react';

// ── Historical ledger rows (all months prior to the current live month) ───────
export interface LedgerRow {
  month: string;
  solar: number;
  biogas: number;
  earned: number;    // ₹ earned that month
  total: number;     // running cumulative total
}

const HISTORICAL_ROWS: LedgerRow[] = [
  { month: 'May 2025', solar: 4.1, biogas: 2.3, earned: 171, total: 1136 },
  { month: 'Apr 2025', solar: 3.7, biogas: 2.0, earned: 149, total:  965 },
  { month: 'Mar 2025', solar: 2.9, biogas: 1.5, earned: 119, total:  816 },
];

// Running total at the start of the current month (= end of last historical row)
const BASE_TOTAL = HISTORICAL_ROWS[0].total;   // ₹ 1 136

const CREDIT_RATE = 6.5;   // ₹ per kWh
const DAYS_IN_MONTH = 30;

export function useEnergyLedger() {
  // User-editable daily surplus values (kWh/day)
  const [solarSurplus,  setSolarSurplus]  = useState(3.8);
  const [biogasSurplus, setBiogasSurplus] = useState(2.1);

  // Derived values — all recomputed on every render when inputs change
  const totalSurplus = useMemo(
    () => +((solarSurplus + biogasSurplus).toFixed(1)),
    [solarSurplus, biogasSurplus],
  );

  const thisMonthEarnings = useMemo(
    () => Math.round(totalSurplus * CREDIT_RATE * DAYS_IN_MONTH),
    [totalSurplus],
  );

  const totalEarned = useMemo(
    () => BASE_TOTAL + thisMonthEarnings,
    [thisMonthEarnings],
  );

  // Live ledger: current month prepended in front of historical rows
  const ledger: LedgerRow[] = useMemo(() => [
    {
      month:  'Jun 2025',
      solar:  solarSurplus,
      biogas: biogasSurplus,
      earned: thisMonthEarnings,
      total:  totalEarned,
    },
    ...HISTORICAL_ROWS,
  ], [solarSurplus, biogasSurplus, thisMonthEarnings, totalEarned]);

  return {
    // Inputs
    solarSurplus,   setSolarSurplus,
    biogasSurplus,  setBiogasSurplus,
    // Derived
    totalSurplus,
    thisMonthEarnings,
    totalEarned,
    creditRate: CREDIT_RATE,
    // Full ledger (current month first)
    ledger,
  };
}
