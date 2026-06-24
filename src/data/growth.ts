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

// Full sales pipeline (June board). Stages map to the board columns; health
// maps to the card colour (blue = on-track, yellow = at-risk, green = won).
export type PovStage = "Demo" | "RFP" | "Discovery" | "Implementation" | "Decision";
export type PovHealth = "on-track" | "at-risk" | "won" | "neutral";

export interface PipelineSeed {
  name: string;
  stage: PovStage;
  health: PovHealth;
  strategic?: boolean; // starred on the board
  ccm?: boolean; // also a CCM target
  customer?: string | null; // matched customers.ts name (implementation usage join)
  team?: string; // Datadog @teamDomain for trial usage, if any
  note?: string;
}

export const PIPELINE_STAGES: { id: PovStage; label: string }[] = [
  { id: "Demo", label: "Demo (completed)" },
  { id: "RFP", label: "RFP / evaluation" },
  { id: "Discovery", label: "Discovery" },
  { id: "Implementation", label: "PoV / implementation" },
  { id: "Decision", label: "Decision" },
];

export const PIPELINE: PipelineSeed[] = [
  // Demo (completed)
  { name: "Telefonica / TEF", stage: "Demo", health: "neutral" },
  { name: "Sulzer", stage: "Demo", health: "neutral" },
  { name: "Voith", stage: "Demo", health: "neutral" },
  { name: "Booking.com", stage: "Demo", health: "neutral" },
  { name: "Nordea", stage: "Demo", health: "neutral" },
  { name: "GSK", stage: "Demo", health: "neutral" },
  { name: "Mars", stage: "Demo", health: "neutral", ccm: true },
  { name: "Citco", stage: "Demo", health: "neutral" },
  { name: "Sasol", stage: "Demo", health: "neutral" },
  // RFP / evaluation
  { name: "Deutsche Bank", stage: "RFP", health: "neutral", strategic: true, ccm: true },
  { name: "Barclays", stage: "RFP", health: "neutral" },
  { name: "AstraZeneca", stage: "RFP", health: "neutral" },
  { name: "Autodesk", stage: "RFP", health: "neutral" },
  { name: "Western Digital", stage: "RFP", health: "neutral" },
  // Discovery
  { name: "Coloplast", stage: "Discovery", health: "at-risk", note: "VDI challenges" },
  { name: "Kerry", stage: "Discovery", health: "neutral" },
  { name: "Novartis", stage: "Discovery", health: "neutral" },
  // PoV / implementation
  { name: "Caceis", stage: "Implementation", health: "at-risk", customer: null, team: "caceis-task-mining-pov", note: "Ending Aug · no AI addendum" },
  { name: "Elsevier", stage: "Implementation", health: "at-risk", customer: null, note: "Ending Aug · no AI addendum" },
  { name: "Manulife", stage: "Implementation", health: "at-risk", customer: null, team: "manulife-pov-ca-pov", note: "Ending Aug · VDI challenges" },
  { name: "Microsoft", stage: "Implementation", health: "on-track", customer: null, note: "Readout July-end" },
  { name: "Dell", stage: "Implementation", health: "on-track", ccm: true, customer: null, note: "Readout July-end" },
  { name: "Unilever", stage: "Implementation", health: "at-risk", customer: null, team: "unilever-genpact", note: "VDI – Pyze" },
  { name: "Goldman Sachs", stage: "Implementation", health: "on-track", strategic: true, ccm: true, customer: "Goldman Sachs", team: "gs-training-2026", note: "Readout Aug-end" },
  { name: "Anglo American", stage: "Implementation", health: "on-track", customer: "Anglo American PLC", team: "anglo-american" },
  { name: "Siemens", stage: "Implementation", health: "on-track", strategic: true, ccm: true, customer: "Siemens Financial Services GmbH", team: "siemens-sandbox" },
  { name: "Allianz", stage: "Implementation", health: "on-track", strategic: true, ccm: true, customer: "Allianz Technology SE", team: "allianz-global" },
  // Decision (won)
  { name: "IHG", stage: "Decision", health: "won", note: "Win against Skan" },
  { name: "MAF", stage: "Decision", health: "won", note: "700 licenses (requested)" },
  { name: "Nykredit", stage: "Decision", health: "won", note: "Scale 2,400 licenses" },
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
