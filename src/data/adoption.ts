// Snapshot of Task Mining adoption pulled from Datadog (celonis.datadoghq.com).
// Period: May-Jun 2026 (2026-05-01 - 2026-06-23).
// Project-creation trend is the full window (metric retention); log-derived
// figures (clients, teams, versions, uploads, errors, weekly) reflect the
// retained log window (~ last 2-3 weeks) due to ~30-day Datadog log retention.
// To refresh: re-run the Datadog queries for a new window and replace this file.

export const PERIOD = "May-Jun 2026";
export const PERIOD_RANGE = "2026-05-01 - 2026-06-23";
export const SOURCE = "Datadog - celonis.datadoghq.com";

export interface SummaryMetrics {
  activeClients: number;
  activeTeams: number;
  suspendedClients: number;
  captureStarts: number;
  parquetUploadsSuccess: number;
  projectCreations: number;
  projectCreationFailurePct: number;
  sqlSuccessJobs: number;
  sqlSuccessTeams: number;
  quickstartJobs: number;
  quickstartTeams: number;
  metadataRequests: number;
  configRequests: number;
  sqlExecutions: number;
  uploaderSuccess: number;
}

export const summary: SummaryMetrics = {
  activeClients: 3735,
  activeTeams: 91,
  suspendedClients: 0,
  captureStarts: 1045,
  parquetUploadsSuccess: 944934,
  projectCreations: 3464,
  projectCreationFailurePct: 40.4,
  sqlSuccessJobs: 17580,
  sqlSuccessTeams: 50,
  quickstartJobs: 231,
  quickstartTeams: 5,
  metadataRequests: 7058702,
  configRequests: 1139993,
  sqlExecutions: 473786,
  uploaderSuccess: 16535414,
};

export interface TrendPoint {
  day: number;
  count: number;
}

// sum:taskmining.project.creations.as_count(), daily rollup (full window).
export const creationTrend: TrendPoint[] = [
  18, 1, 0, 66, 34, 52, 31, 21, 0, 0, 54, 44, 25, 24, 20, 1, 8, 182, 70, 36, 118, 17, 0, 0, 79, 81, 142, 94, 91, 1, 3, 86, 68, 102, 60, 37, 1, 0, 74, 50, 195, 269, 66, 0, 9, 123, 135, 179, 143, 96, 0, 0, 312, 146,
].map((count, i) => ({ day: i + 1, count }));

export interface VersionPoint {
  version: string;
  clients: number;
}

// Distinct @clientId per @recorderVersion (purpose:prod), top versions.
export const versionMix: VersionPoint[] = [
  { version: "2.20.0.0", clients: 842 },
  { version: "2.18.1.0", clients: 672 },
  { version: "2.21.0.0", clients: 588 },
  { version: "2.18.2.0", clients: 502 },
  { version: "2.21.1.0", clients: 301 },
  { version: "2.13.0.0", clients: 242 },
  { version: "2.17.1.0", clients: 201 },
  { version: "2.17.0.0", clients: 111 },
  { version: "2.18.0.0", clients: 76 },
  { version: "2.19.0.0", clients: 58 },
  { version: "2.17.1.251", clients: 57 },
  { version: "2.15.2.0", clients: 20 },
  { version: "2.10.0.0", clients: 18 },
  { version: "2.20.1.0", clients: 13 },
  { version: "2.11.0.0", clients: 13 },
];

export interface WeekPoint {
  week: string;
  clients: number;
}

// Partial: only the most recent weeks fall inside log retention (~30d).
export const weeklyActiveClients: WeekPoint[] = [
  { week: "Jun 8", clients: 2986 },
  { week: "Jun 15", clients: 3397 },
  { week: "Jun 22", clients: 3077 },
];

export interface TeamRecord {
  team: string;
  clients: number;
  versions: number;
  parquet: number;
  image: number;
  errors: number;
}

// All 91 teams active on the Task Mining client in production during the window.
export const teams: TeamRecord[] = [
  { team: "allianz-global", clients: 662, versions: 2, parquet: 306754, image: 3349, errors: 426246 },
  { team: "refinitiv", clients: 523, versions: 5, parquet: 0, image: 0, errors: 84314 },
  { team: "prod", clients: 479, versions: 1, parquet: 216, image: 0, errors: 95110 },
  { team: "majid-ai-futtaim", clients: 248, versions: 2, parquet: 74251, image: 0, errors: 16452 },
  { team: "nykredit-realkredit", clients: 231, versions: 2, parquet: 66825, image: 66818, errors: 109467 },
  { team: "nec-corporation-2", clients: 191, versions: 2, parquet: 45399, image: 0, errors: 518924 },
  { team: "ofi-benelux-b-v--om-kaemingk-c4c", clients: 174, versions: 1, parquet: 42879, image: 0, errors: 2510 },
  { team: "production", clients: 158, versions: 5, parquet: 54163, image: 4319, errors: 102525 },
  { team: "kapitus", clients: 136, versions: 5, parquet: 69709, image: 0, errors: 280274 },
  { team: "anglo-american", clients: 132, versions: 7, parquet: 45928, image: 973, errors: 467690 },
  { team: "allstate", clients: 120, versions: 3, parquet: 41297, image: 0, errors: 80193 },
  { team: "astrazeneca-dev", clients: 104, versions: 3, parquet: 34586, image: 0, errors: 220714 },
  { team: "mol", clients: 61, versions: 5, parquet: 26033, image: 0, errors: 23374 },
  { team: "kimberlyclark", clients: 55, versions: 10, parquet: 16563, image: 215, errors: 537855 },
  { team: "dbank", clients: 54, versions: 1, parquet: 16906, image: 0, errors: 3799 },
  { team: "dai-ichi-life-insurance", clients: 40, versions: 1, parquet: 22619, image: 29402, errors: 626816 },
  { team: "aflac", clients: 38, versions: 5, parquet: 18375, image: 0, errors: 81850 },
  { team: "schlumberger", clients: 30, versions: 5, parquet: 765, image: 663, errors: 18735 },
  { team: "manulife-pov-ca-pov", clients: 26, versions: 1, parquet: 11565, image: 0, errors: 960 },
  { team: "fujitsu-limited-product-business-task-mining-c4c", clients: 20, versions: 1, parquet: 10527, image: 0, errors: 3570 },
  { team: "riverty", clients: 19, versions: 1, parquet: 1143, image: 0, errors: 206 },
  { team: "endpoint", clients: 17, versions: 3, parquet: 9314, image: 0, errors: 51906 },
  { team: "caceis-task-mining-pov", clients: 16, versions: 2, parquet: 2185, image: 0, errors: 111 },
  { team: "schlumberger-qa", clients: 15, versions: 2, parquet: 304, image: 945, errors: 133119 },
  { team: "kn-sb", clients: 13, versions: 3, parquet: 0, image: 0, errors: 254 },
  { team: "siemens-sandbox", clients: 11, versions: 3, parquet: 103, image: 178, errors: 270 },
  { team: "amgen", clients: 10, versions: 4, parquet: 2611, image: 0, errors: 4893 },
  { team: "ibm-crossmark-c4c", clients: 8, versions: 2, parquet: 4076, image: 0, errors: 2393 },
  { team: "pepsico-prod", clients: 7, versions: 4, parquet: 0, image: 0, errors: 391 },
  { team: "upm-sandbox", clients: 7, versions: 4, parquet: 0, image: 0, errors: 396 },
  { team: "kn", clients: 6, versions: 1, parquet: 2238, image: 2238, errors: 1833 },
  { team: "toyo-seikan", clients: 6, versions: 1, parquet: 2366, image: 2046, errors: 1057 },
  { team: "telefonica-productive", clients: 6, versions: 1, parquet: 0, image: 0, errors: 22370 },
  { team: "dpdhl", clients: 6, versions: 1, parquet: 0, image: 0, errors: 295 },
  { team: "banco-pichincha", clients: 6, versions: 1, parquet: 2281, image: 0, errors: 186 },
  { team: "kistler-prod", clients: 6, versions: 1, parquet: 1178, image: 1502, errors: 14308 },
  { team: "dbank-psb", clients: 5, versions: 1, parquet: 1684, image: 0, errors: 238 },
  { team: "coloplast-pov", clients: 5, versions: 1, parquet: 2216, image: 0, errors: 142 },
  { team: "sandbox", clients: 4, versions: 2, parquet: 0, image: 0, errors: 210 },
  { team: "unilever-genpact", clients: 4, versions: 1, parquet: 176, image: 0, errors: 58 },
  { team: "envalior", clients: 4, versions: 1, parquet: 1741, image: 2576, errors: 7937 },
  { team: "payroll-task-mining", clients: 3, versions: 1, parquet: 690, image: 0, errors: 334 },
  { team: "productive", clients: 3, versions: 1, parquet: 157, image: 0, errors: 2312799 },
  { team: "eight-japan-engineering-consultants", clients: 3, versions: 1, parquet: 2181, image: 0, errors: 374 },
  { team: "merck-tst", clients: 3, versions: 2, parquet: 594, image: 0, errors: 202 },
  { team: "atth6lw3-2023-12-07", clients: 2, versions: 2, parquet: 1, image: 0, errors: 2 },
  { team: "novartis-sb", clients: 2, versions: 1, parquet: 230, image: 0, errors: 80 },
  { team: "task-mining", clients: 2, versions: 2, parquet: 3, image: 3, errors: 2172 },
  { team: "allianzconsult-prod", clients: 2, versions: 1, parquet: 0, image: 0, errors: 15 },
  { team: "diot-siaci", clients: 2, versions: 1, parquet: 0, image: 0, errors: 19 },
  { team: "michelin", clients: 2, versions: 1, parquet: 0, image: 0, errors: 13 },
  { team: "ofi-benelux-bv-assistzorg-c4c", clients: 2, versions: 1, parquet: 4, image: 9, errors: 29 },
  { team: "banco-santander", clients: 2, versions: 2, parquet: 0, image: 0, errors: 3 },
  { team: "booking-holdings", clients: 2, versions: 1, parquet: 0, image: 0, errors: 59 },
  { team: "metro-bank", clients: 2, versions: 2, parquet: 0, image: 0, errors: 0 },
  { team: "gs-training-2026", clients: 2, versions: 1, parquet: 366, image: 0, errors: 124 },
  { team: "silamir-partner-sandbox", clients: 2, versions: 1, parquet: 0, image: 0, errors: 82 },
  { team: "itochu-partner-sandbox", clients: 2, versions: 2, parquet: 0, image: 0, errors: 189 },
  { team: "task-mining-demo---kay", clients: 2, versions: 2, parquet: 0, image: 0, errors: 0 },
  { team: "wilo-sb", clients: 1, versions: 1, parquet: 433, image: 0, errors: 92 },
  { team: "cordesgraefe", clients: 1, versions: 1, parquet: 365, image: 365, errors: 2073937 },
  { team: "abeam-partner-sandbox", clients: 1, versions: 1, parquet: 480, image: 0, errors: 17 },
  { team: "m-sakamoto-celonis-com", clients: 1, versions: 1, parquet: 0, image: 0, errors: 0 },
  { team: "panasonic-information", clients: 1, versions: 1, parquet: 0, image: 0, errors: 2 },
  { team: "90tcwbmd-2025-08-08", clients: 1, versions: 1, parquet: 0, image: 0, errors: 76 },
  { team: "kpdgk5yo-2025-12-12", clients: 1, versions: 1, parquet: 0, image: 0, errors: 6 },
  { team: "logatik-partner-sandbox", clients: 1, versions: 1, parquet: 0, image: 0, errors: 19 },
  { team: "bouygues-telecom-pov-network-pov", clients: 1, versions: 1, parquet: 0, image: 0, errors: 138 },
  { team: "mondelez", clients: 1, versions: 1, parquet: 0, image: 0, errors: 6 },
  { team: "secpentest-1", clients: 1, versions: 1, parquet: 0, image: 0, errors: 0 },
  { team: "nationwide-prod", clients: 1, versions: 1, parquet: 17, image: 0, errors: 3 },
  { team: "syngenta-prod", clients: 1, versions: 1, parquet: 1, image: 1, errors: 5 },
  { team: "6f1oiqjp-2026-02-13", clients: 1, versions: 1, parquet: 0, image: 0, errors: 34 },
  { team: "basf", clients: 1, versions: 1, parquet: 0, image: 0, errors: 39 },
  { team: "deloitte-in-partner-sandbox", clients: 1, versions: 1, parquet: 0, image: 0, errors: 15 },
  { team: "tgt-internal", clients: 1, versions: 1, parquet: 0, image: 0, errors: 5 },
  { team: "hitachi-partner-sandbox", clients: 1, versions: 1, parquet: 14, image: 1, errors: 3 },
  { team: "ems-japan-pov", clients: 1, versions: 1, parquet: 0, image: 0, errors: 3 },
  { team: "rabobank-sb", clients: 1, versions: 1, parquet: 0, image: 0, errors: 0 },
  { team: "a-gutte-celonis-com", clients: 1, versions: 1, parquet: 7, image: 1, errors: 8 },
  { team: "pyze-partner-sandbox2", clients: 1, versions: 1, parquet: 346, image: 0, errors: 21 },
  { team: "5cbbo4q6-2026-05-25", clients: 1, versions: 1, parquet: 0, image: 0, errors: 0 },
  { team: "workday", clients: 1, versions: 1, parquet: 0, image: 0, errors: 2 },
  { team: "ibm-sandbox", clients: 1, versions: 1, parquet: 0, image: 0, errors: 38 },
  { team: "accenture-development-sandbox-dcp", clients: 1, versions: 1, parquet: 0, image: 0, errors: 0 },
  { team: "2mi7vsyd-2025-11-18", clients: 1, versions: 1, parquet: 0, image: 0, errors: 100 },
  { team: "ihg-pov", clients: 1, versions: 1, parquet: 66, image: 0, errors: 146 },
  { team: "bouygues-telecom", clients: 1, versions: 1, parquet: 0, image: 0, errors: 21 },
  { team: "optus-standard-sandbox", clients: 1, versions: 1, parquet: 0, image: 0, errors: 4588 },
  { team: "celonis-ryw9oc", clients: 1, versions: 1, parquet: 3, image: 0, errors: 10 },
  { team: "rabobank", clients: 1, versions: 1, parquet: 0, image: 0, errors: 16 },
];
