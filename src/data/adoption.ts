// Snapshot of Task Mining adoption pulled from Datadog (celonis.datadoghq.com).
// Period: May 2026 (2026-05-01 -> 2026-06-01).
// To refresh: re-run the Datadog queries for a new window and replace this file.

export const PERIOD = "May 2026";
export const PERIOD_RANGE = "2026-05-01 - 2026-06-01";
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
  activeClients: 3444,
  activeTeams: 75,
  suspendedClients: 0,
  captureStarts: 1045,
  parquetUploadsSuccess: 82997,
  projectCreations: 1313,
  projectCreationFailurePct: 45.8,
  sqlSuccessJobs: 5616,
  sqlSuccessTeams: 36,
  quickstartJobs: 231,
  quickstartTeams: 5,
  metadataRequests: 7058702,
  configRequests: 1139993,
  sqlExecutions: 54928,
  uploaderSuccess: 9074343,
};

export interface TrendPoint {
  day: number;
  count: number;
}

// sum:taskmining.project.creations.as_count(), daily rollup.
export const creationTrend: TrendPoint[] = [
  18, 1, 0, 66, 34, 52, 31, 21, 0, 0, 54, 44, 25, 24, 20, 1, 8, 182, 70, 36,
  118, 17, 0, 0, 79, 81, 142, 94, 91, 1, 3,
].map((count, i) => ({ day: i + 1, count }));

export interface VersionPoint {
  version: string;
  clients: number;
}

// Distinct @clientId per @recorderVersion (purpose:prod), top versions.
export const versionMix: VersionPoint[] = [
  { version: "2.20.0.0", clients: 836 },
  { version: "2.18.1.0", clients: 656 },
  { version: "2.18.2.0", clients: 553 },
  { version: "2.21.0.0", clients: 537 },
  { version: "2.13.0.0", clients: 240 },
  { version: "2.17.1.0", clients: 171 },
  { version: "2.17.0.0", clients: 139 },
  { version: "2.21.1.0", clients: 71 },
  { version: "2.17.1.251", clients: 57 },
  { version: "2.19.0.0", clients: 57 },
  { version: "2.18.0.0", clients: 38 },
  { version: "2.15.2.0", clients: 22 },
  { version: "2.10.0.0", clients: 16 },
  { version: "2.6.1.0", clients: 15 },
  { version: "2.20.1.0", clients: 14 },
];

export interface WeekPoint {
  week: string;
  clients: number;
}

// Partial: earlier May weeks fall outside log retention (~30d).
export const weeklyActiveClients: WeekPoint[] = [
  { week: "May 18", clients: 2739 },
  { week: "May 25", clients: 3290 },
];

export interface TeamRecord {
  team: string;
  clients: number;
  versions: number;
  parquet: number;
  image: number;
  errors: number;
}

// All 75 teams active on the Task Mining client in production during May 2026.
export const teams: TeamRecord[] = [
  { team: "allianz-global", clients: 648, versions: 3, parquet: 0, image: 0, errors: 73560 },
  { team: "refinitiv", clients: 577, versions: 5, parquet: 0, image: 0, errors: 42289 },
  { team: "prod", clients: 469, versions: 1, parquet: 0, image: 0, errors: 46761 },
  { team: "majid-ai-futtaim", clients: 231, versions: 1, parquet: 0, image: 0, errors: 7882 },
  { team: "nykredit-realkredit", clients: 226, versions: 1, parquet: 32959, image: 0, errors: 66852 },
  { team: "nec-corporation-2", clients: 151, versions: 3, parquet: 0, image: 0, errors: 360627 },
  { team: "anglo-american", clients: 146, versions: 9, parquet: 128, image: 0, errors: 309684 },
  { team: "allstate", clients: 137, versions: 3, parquet: 8663, image: 0, errors: 109027 },
  { team: "kapitus", clients: 137, versions: 4, parquet: 0, image: 0, errors: 165311 },
  { team: "production", clients: 128, versions: 5, parquet: 19681, image: 0, errors: 46439 },
  { team: "astrazeneca-dev", clients: 71, versions: 3, parquet: 7925, image: 0, errors: 132420 },
  { team: "mol", clients: 62, versions: 5, parquet: 210, image: 0, errors: 8964 },
  { team: "dbank", clients: 48, versions: 1, parquet: 0, image: 0, errors: 2852 },
  { team: "dai-ichi-life-insurance", clients: 40, versions: 1, parquet: 0, image: 0, errors: 479242 },
  { team: "aflac", clients: 38, versions: 5, parquet: 3895, image: 0, errors: 63925 },
  { team: "ofi-benelux-b-v--om-kaemingk-c4c", clients: 35, versions: 3, parquet: 0, image: 0, errors: 108 },
  { team: "schlumberger", clients: 31, versions: 6, parquet: 0, image: 0, errors: 2390 },
  { team: "kimberlyclark", clients: 31, versions: 9, parquet: 674, image: 0, errors: 89362 },
  { team: "fujitsu-limited-product-business-task-mining-c4c", clients: 20, versions: 1, parquet: 0, image: 0, errors: 3181 },
  { team: "riverty", clients: 20, versions: 1, parquet: 0, image: 0, errors: 110 },
  { team: "schlumberger-qa", clients: 15, versions: 2, parquet: 160, image: 1890, errors: 3621 },
  { team: "kistler-prod", clients: 12, versions: 1, parquet: 0, image: 0, errors: 75806 },
  { team: "kn-sb", clients: 12, versions: 3, parquet: 0, image: 0, errors: 297 },
  { team: "endpoint", clients: 11, versions: 1, parquet: 3844, image: 0, errors: 7816 },
  { team: "amgen", clients: 9, versions: 3, parquet: 0, image: 0, errors: 1827 },
  { team: "siemens-sandbox", clients: 8, versions: 3, parquet: 0, image: 0, errors: 109 },
  { team: "pepsico-prod", clients: 8, versions: 4, parquet: 0, image: 0, errors: 758 },
  { team: "ibm-crossmark-c4c", clients: 8, versions: 2, parquet: 1999, image: 0, errors: 1322 },
  { team: "upm-sandbox", clients: 7, versions: 4, parquet: 0, image: 0, errors: 1139 },
  { team: "caceis-task-mining-pov", clients: 7, versions: 2, parquet: 0, image: 0, errors: 59 },
  { team: "banco-pichincha", clients: 7, versions: 1, parquet: 1607, image: 0, errors: 365 },
  { team: "kn", clients: 7, versions: 1, parquet: 669, image: 0, errors: 1798 },
  { team: "dpdhl", clients: 6, versions: 1, parquet: 0, image: 0, errors: 207 },
  { team: "telefonica-productive", clients: 6, versions: 1, parquet: 0, image: 0, errors: 4578 },
  { team: "productive", clients: 5, versions: 1, parquet: 0, image: 0, errors: 1708026 },
  { team: "dbank-psb", clients: 5, versions: 1, parquet: 0, image: 0, errors: 129 },
  { team: "sandbox", clients: 4, versions: 2, parquet: 0, image: 0, errors: 44 },
  { team: "merck-tst", clients: 4, versions: 2, parquet: 0, image: 0, errors: 367 },
  { team: "envalior", clients: 4, versions: 1, parquet: 0, image: 0, errors: 55093 },
  { team: "task-mining", clients: 3, versions: 2, parquet: 0, image: 0, errors: 12 },
  { team: "eight-japan-engineering-consultants", clients: 3, versions: 1, parquet: 0, image: 0, errors: 209 },
  { team: "rabobank", clients: 2, versions: 1, parquet: 0, image: 0, errors: 58 },
  { team: "ihg-pov", clients: 2, versions: 1, parquet: 0, image: 0, errors: 277 },
  { team: "90tcwbmd-2025-08-08", clients: 2, versions: 1, parquet: 0, image: 0, errors: 43 },
  { team: "syngenta-prod", clients: 2, versions: 1, parquet: 202, image: 0, errors: 267 },
  { team: "silamir-partner-sandbox", clients: 2, versions: 1, parquet: 0, image: 0, errors: 217 },
  { team: "booking-holdings", clients: 2, versions: 1, parquet: 0, image: 0, errors: 48 },
  { team: "6f1oiqjp-2026-02-13", clients: 2, versions: 2, parquet: 0, image: 0, errors: 11 },
  { team: "gs-training-2026", clients: 2, versions: 1, parquet: 0, image: 0, errors: 40 },
  { team: "itochu-partner-sandbox", clients: 2, versions: 2, parquet: 0, image: 0, errors: 84 },
  { team: "abeam-partner-sandbox", clients: 2, versions: 2, parquet: 0, image: 0, errors: 10 },
  { team: "allianzconsult-prod", clients: 2, versions: 1, parquet: 0, image: 0, errors: 2 },
  { team: "diot-siaci", clients: 2, versions: 1, parquet: 0, image: 0, errors: 39 },
  { team: "michelin", clients: 2, versions: 1, parquet: 0, image: 0, errors: 53 },
  { team: "optus-standard-sandbox", clients: 1, versions: 1, parquet: 0, image: 0, errors: 26 },
  { team: "accenture-development-sandbox-dcp", clients: 1, versions: 1, parquet: 0, image: 0, errors: 0 },
  { team: "5cbbo4q6-2026-05-25", clients: 1, versions: 1, parquet: 0, image: 0, errors: 0 },
  { team: "a-gutte-celonis-com", clients: 1, versions: 1, parquet: 0, image: 0, errors: 1 },
  { team: "task-mining-demo---kay", clients: 1, versions: 1, parquet: 0, image: 0, errors: 0 },
  { team: "ems-japan-pov", clients: 1, versions: 1, parquet: 0, image: 0, errors: 4 },
  { team: "deloitte-in-partner-sandbox", clients: 1, versions: 1, parquet: 0, image: 0, errors: 4 },
  { team: "nationwide-prod", clients: 1, versions: 1, parquet: 0, image: 0, errors: 0 },
  { team: "2mi7vsyd-2025-11-18", clients: 1, versions: 1, parquet: 0, image: 0, errors: 20 },
  { team: "panasonic-information", clients: 1, versions: 1, parquet: 0, image: 0, errors: 4 },
  { team: "fulizsri-2025-02-18", clients: 1, versions: 1, parquet: 0, image: 0, errors: 134 },
  { team: "kpdgk5yo-2025-12-12", clients: 1, versions: 1, parquet: 0, image: 0, errors: 6 },
  { team: "ibm-sandbox", clients: 1, versions: 1, parquet: 0, image: 0, errors: 36 },
  { team: "cordesgraefe", clients: 1, versions: 1, parquet: 0, image: 0, errors: 195616 },
  { team: "mondelez", clients: 1, versions: 1, parquet: 0, image: 0, errors: 118 },
  { team: "bouygues-telecom-pov-network-pov", clients: 1, versions: 1, parquet: 0, image: 0, errors: 20 },
  { team: "wilo-sb", clients: 1, versions: 1, parquet: 83, image: 0, errors: 54 },
  { team: "workday", clients: 1, versions: 1, parquet: 0, image: 0, errors: 0 },
  { team: "rabobank-sb", clients: 1, versions: 1, parquet: 0, image: 0, errors: 3 },
  { team: "logatik-partner-sandbox", clients: 1, versions: 1, parquet: 0, image: 0, errors: 5 },
  { team: "basf", clients: 1, versions: 1, parquet: 0, image: 0, errors: 17 },
];
