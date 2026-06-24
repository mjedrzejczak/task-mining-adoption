// Curated "growth & engagement" inputs, transcribed from the June account / PoV
// board and the CCM target list (shared as screenshots). These are the accounts
// the team is actively working to grow — kept separate from the full contract
// book in src/data/customers.ts.
//
// `customer` is the canonical name in src/data/customers.ts when a contract
// exists; `null` means there is no contract record yet (prospect / live PoV).

export interface LighthouseSeed {
  label: string; // short display name
  customer: string | null; // matched customers.ts name (null = no contract yet)
  ccm: boolean; // also on the CCM target list
  note?: string;
}

// Lighthouse / reference accounts we want to grow. `ccm` flags accounts that
// also appear on the CCM target list (see CCM_TARGETS).
export const LIGHTHOUSE: LighthouseSeed[] = [
  { label: "Nykredit", customer: "Nykredit Realkredit A/S", ccm: false, note: "Scaling to 2,400 licenses" },
  { label: "Anglo American", customer: "Anglo American PLC", ccm: false },
  { label: "Deutsche Bank", customer: "Deutsche Bank AG", ccm: true },
  { label: "Goldman Sachs", customer: "Goldman Sachs", ccm: true, note: "PoV readout Aug-end" },
  { label: "Siemens", customer: "Siemens Financial Services GmbH", ccm: true, note: "CCM entity: Siemens Energy" },
  { label: "AstraZeneca", customer: "ASTRAZENECA UK LIMITED", ccm: false },
  { label: "Target", customer: "TARGET CORPORATION INDIA PRIVATE LIMITED", ccm: false },
  { label: "Dell", customer: null, ccm: true, note: "PoV readout July-end" },
  { label: "Microsoft", customer: null, ccm: false, note: "PoV readout July-end" },
  { label: "Hitachi Energy", customer: null, ccm: true },
];

// Stretch lighthouse ("Deutsche Bank / Barclays if it happens") — tracked but
// not counted in the lighthouse KPI.
export const LIGHTHOUSE_WATCH: LighthouseSeed[] = [
  { label: "Barclays", customer: null, ccm: false, note: "RFP / evaluation — lighthouse if it converts" },
];

export type PovStatus = "on-track" | "at-risk" | "won";

export interface PovSeed {
  name: string;
  status: PovStatus;
  strategic: boolean; // starred on the board
  ccm: boolean; // also a CCM target
  customer?: string | null; // matched customers.ts name (null = prospect, no contract)
  team?: string; // Datadog @teamDomain for trial usage, if any
  note?: string;
}

// PoV / Implementation column from the June board (active proofs-of-value).
export const POV: PovSeed[] = [
  { name: "Microsoft", status: "on-track", strategic: false, ccm: false, customer: null, note: "Readout July-end" },
  { name: "Dell", status: "on-track", strategic: false, ccm: true, customer: null, note: "Readout July-end" },
  { name: "Goldman Sachs", status: "on-track", strategic: true, ccm: true, customer: "Goldman Sachs", team: "gs-training-2026", note: "Readout Aug-end" },
  { name: "Anglo American", status: "on-track", strategic: false, ccm: false, customer: "Anglo American PLC", team: "anglo-american" },
  { name: "Siemens", status: "on-track", strategic: true, ccm: true, customer: "Siemens Financial Services GmbH", team: "siemens-sandbox" },
  { name: "Allianz", status: "on-track", strategic: true, ccm: true, customer: "Allianz Technology SE", team: "allianz-global" },
  { name: "Manulife", status: "at-risk", strategic: false, ccm: false, customer: null, team: "manulife-pov-ca-pov", note: "Ending Aug · VDI challenges" },
  { name: "Unilever", status: "at-risk", strategic: false, ccm: false, customer: null, team: "unilever-genpact", note: "VDI – Pyze" },
  { name: "Caceis", status: "at-risk", strategic: false, ccm: false, customer: null, team: "caceis-task-mining-pov", note: "Ending Aug · no AI addendum" },
  { name: "Elsevier", status: "at-risk", strategic: false, ccm: false, customer: null, note: "Ending Aug · no AI addendum" },
];

// Decision column — recently won. Shown for momentum, not counted as in-progress.
export const POV_WON: PovSeed[] = [
  { name: "Nykredit", status: "won", strategic: false, ccm: false, note: "Scale 2,400 licenses" },
  { name: "MAF", status: "won", strategic: false, ccm: false, note: "700 licenses" },
  { name: "IHG", status: "won", strategic: false, ccm: false, note: "Win against Skan" },
];

// CCM target list (screenshot). Kept verbatim for reference + future matching.
export const CCM_TARGETS: string[] = [
  "Bank of America Corporation",
  "Goldman Sachs",
  "Mars, Incorporated",
  "Pepsico Inc.",
  "Dell Technologies Inc.",
  "Exxon Mobil Corporation",
  "Pfizer Inc.",
  "Merck & Co., Inc.",
  "Deutsche Bank AG",
  "Allianz Technology SE",
  "STELLANTIS AUTO SAS",
  "Siemens Energy",
  "Ingka Group",
  "Novo Nordisk A/S",
  "BMW AG",
  "Hitachi Energy Ltd",
  "Fujitsu Limited",
];
