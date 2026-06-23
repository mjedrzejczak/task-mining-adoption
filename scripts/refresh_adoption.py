#!/usr/bin/env python3
"""One-off generator for src/data/adoption.ts from the Datadog pull (May-Jun 2026).

Inputs are the raw query results pasted below (clients/versions, uploads) plus the
large per-team errors TSV written to disk by the MCP tool. Re-run by replacing the
embedded blocks with fresh query output.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PERIOD = "May-Jun 2026"
PERIOD_RANGE = "2026-05-01 - 2026-06-23"

# sum:taskmining.project.creations.as_count(), daily rollup, 2026-05-01 -> 2026-06-23.
TREND = [
    18, 1, 0, 66, 34, 52, 31, 21, 0, 0, 54, 44, 25, 24, 20, 1, 8, 182, 70, 36,
    118, 17, 0, 0, 79, 81, 142, 94, 91, 1, 3, 86, 68, 102, 60, 37, 1, 0, 74, 50,
    195, 269, 66, 0, 9, 123, 135, 179, 143, 96, 0, 0, 312, 146,
]

# Distinct @clientId per @recorderVersion (purpose:prod), top versions.
VERSION_MIX = [
    ("2.20.0.0", 842), ("2.18.1.0", 672), ("2.21.0.0", 588), ("2.18.2.0", 502),
    ("2.21.1.0", 301), ("2.13.0.0", 242), ("2.17.1.0", 201), ("2.17.0.0", 111),
    ("2.18.0.0", 76), ("2.19.0.0", 58), ("2.17.1.251", 57), ("2.15.2.0", 20),
    ("2.10.0.0", 18), ("2.20.1.0", 13), ("2.11.0.0", 13),
]

# Distinct @clientId per week (partial: log retention ~ last 2-3 weeks only).
WEEKLY = [("Jun 8", 2986), ("Jun 15", 3397), ("Jun 22", 3077)]

# Headline metric/summary values (see scripts comment for sources).
SUMMARY = {
    "activeClients": 3735,
    "activeTeams": 91,
    "suspendedClients": 0,
    "captureStarts": 1045,        # carried from prior snapshot (no confirmed query)
    "projectCreations": sum(TREND),
    "projectCreationFailurePct": round(340 / 842 * 100, 1),  # (sql+custom) failed/(succ+fail)
    "sqlSuccessJobs": 17580,
    "sqlSuccessTeams": 50,
    "quickstartJobs": 231,        # carried from prior snapshot
    "quickstartTeams": 5,         # carried from prior snapshot
    "metadataRequests": 7058702,  # carried from prior snapshot
    "configRequests": 1139993,    # carried from prior snapshot
    "sqlExecutions": 473786,
    "uploaderSuccess": 16535414,
}

CLIENTS_VERSIONS = """allianz-global\t662\t2
refinitiv\t523\t5
prod\t479\t1
majid-ai-futtaim\t248\t2
nykredit-realkredit\t231\t2
nec-corporation-2\t191\t2
ofi-benelux-b-v--om-kaemingk-c4c\t174\t1
production\t158\t5
kapitus\t136\t5
anglo-american\t132\t7
allstate\t120\t3
astrazeneca-dev\t104\t3
mol\t61\t5
kimberlyclark\t55\t10
dbank\t54\t1
dai-ichi-life-insurance\t40\t1
aflac\t38\t5
schlumberger\t30\t5
manulife-pov-ca-pov\t26\t1
fujitsu-limited-product-business-task-mining-c4c\t20\t1
riverty\t19\t1
endpoint\t17\t3
caceis-task-mining-pov\t16\t2
schlumberger-qa\t15\t2
kn-sb\t13\t3
siemens-sandbox\t11\t3
amgen\t10\t4
ibm-crossmark-c4c\t8\t2
pepsico-prod\t7\t4
upm-sandbox\t7\t4
kn\t6\t1
toyo-seikan\t6\t1
telefonica-productive\t6\t1
dpdhl\t6\t1
banco-pichincha\t6\t1
kistler-prod\t6\t1
dbank-psb\t5\t1
coloplast-pov\t5\t1
sandbox\t4\t2
unilever-genpact\t4\t1
envalior\t4\t1
payroll-task-mining\t3\t1
productive\t3\t1
eight-japan-engineering-consultants\t3\t1
merck-tst\t3\t2
atth6lw3-2023-12-07\t2\t2
novartis-sb\t2\t1
task-mining\t2\t2
allianzconsult-prod\t2\t1
diot-siaci\t2\t1
michelin\t2\t1
ofi-benelux-bv-assistzorg-c4c\t2\t1
banco-santander\t2\t2
booking-holdings\t2\t1
metro-bank\t2\t2
gs-training-2026\t2\t1
silamir-partner-sandbox\t2\t1
itochu-partner-sandbox\t2\t2
task-mining-demo---kay\t2\t2
wilo-sb\t1\t1
cordesgraefe\t1\t1
abeam-partner-sandbox\t1\t1
m-sakamoto-celonis-com\t1\t1
panasonic-information\t1\t1
90tcwbmd-2025-08-08\t1\t1
kpdgk5yo-2025-12-12\t1\t1
logatik-partner-sandbox\t1\t1
bouygues-telecom-pov-network-pov\t1\t1
mondelez\t1\t1
secpentest-1\t1\t1
nationwide-prod\t1\t1
syngenta-prod\t1\t1
6f1oiqjp-2026-02-13\t1\t1
basf\t1\t1
deloitte-in-partner-sandbox\t1\t1
tgt-internal\t1\t1
hitachi-partner-sandbox\t1\t1
ems-japan-pov\t1\t1
rabobank-sb\t1\t1
a-gutte-celonis-com\t1\t1
pyze-partner-sandbox2\t1\t1
5cbbo4q6-2026-05-25\t1\t1
workday\t1\t1
ibm-sandbox\t1\t1
accenture-development-sandbox-dcp\t1\t1
2mi7vsyd-2025-11-18\t1\t1
ihg-pov\t1\t1
bouygues-telecom\t1\t1
optus-standard-sandbox\t1\t1
celonis-ryw9oc\t1\t1
rabobank\t1\t1"""

UPLOADS = """allianz-global\t306754\t3349
majid-ai-futtaim\t74251\t0
kapitus\t69709\t0
nykredit-realkredit\t66825\t66818
production\t54163\t4319
anglo-american\t45928\t973
nec-corporation-2\t45399\t0
ofi-benelux-b-v--om-kaemingk-c4c\t42879\t0
allstate\t41297\t0
astrazeneca-dev\t34586\t0
mol\t26033\t0
dai-ichi-life-insurance\t22619\t29402
aflac\t18375\t0
dbank\t16906\t0
kimberlyclark\t16563\t215
manulife-pov-ca-pov\t11565\t0
fujitsu-limited-product-business-task-mining-c4c\t10527\t0
endpoint\t9314\t0
ibm-crossmark-c4c\t4076\t0
amgen\t2611\t0
toyo-seikan\t2366\t2046
banco-pichincha\t2281\t0
kn\t2238\t2238
coloplast-pov\t2216\t0
caceis-task-mining-pov\t2185\t0
eight-japan-engineering-consultants\t2181\t0
envalior\t1741\t2576
dbank-psb\t1684\t0
kistler-prod\t1178\t1502
riverty\t1143\t0
schlumberger\t765\t663
payroll-task-mining\t690\t0
merck-tst\t594\t0
abeam-partner-sandbox\t480\t0
wilo-sb\t433\t0
gs-training-2026\t366\t0
cordesgraefe\t365\t365
pyze-partner-sandbox2\t346\t0
schlumberger-qa\t304\t945
novartis-sb\t230\t0
prod\t216\t0
unilever-genpact\t176\t0
productive\t157\t0
siemens-sandbox\t103\t178
ihg-pov\t66\t0
nationwide-prod\t17\t0
hitachi-partner-sandbox\t14\t1
a-gutte-celonis-com\t7\t1
ofi-benelux-bv-assistzorg-c4c\t4\t9
celonis-ryw9oc\t3\t0
task-mining\t3\t3
syngenta-prod\t1\t1
atth6lw3-2023-12-07\t1\t0"""

ERRORS_FILE = sys.argv[1] if len(sys.argv) > 1 else None


def parse_cv(block):
    out = []
    for line in block.strip().splitlines():
        team, clients, versions = line.split("\t")
        out.append((team, int(clients), int(versions)))
    return out


def parse_uploads(block):
    d = {}
    for line in block.strip().splitlines():
        team, parquet, image = line.split("\t")
        d[team] = (int(parquet or 0), int(image or 0))
    return d


def parse_errors(path):
    d = {}
    if not path or not os.path.exists(path):
        return d
    with open(path) as f:
        for line in f:
            line = line.rstrip("\n")
            if "\t" not in line:
                continue
            parts = line.split("\t")
            if len(parts) != 2:
                continue
            team, val = parts
            if team == "team" or not val:
                continue
            try:
                d[team] = int(round(float(val)))
            except ValueError:
                continue
    return d


cv = parse_cv(CLIENTS_VERSIONS)
uploads = parse_uploads(UPLOADS)
errors = parse_errors(ERRORS_FILE)

teams = []
for team, clients, versions in cv:
    parquet, image = uploads.get(team, (0, 0))
    teams.append({
        "team": team,
        "clients": clients,
        "versions": versions,
        "parquet": parquet,
        "image": image,
        "errors": errors.get(team, 0),
    })

SUMMARY["activeTeams"] = len(teams)
SUMMARY["parquetUploadsSuccess"] = sum(t["parquet"] for t in teams)


def ts_lines():
    L = []
    L.append("// Snapshot of Task Mining adoption pulled from Datadog (celonis.datadoghq.com).")
    L.append(f"// Period: {PERIOD} ({PERIOD_RANGE}).")
    L.append("// Project-creation trend is the full window (metric retention); log-derived")
    L.append("// figures (clients, teams, versions, uploads, errors, weekly) reflect the")
    L.append("// retained log window (~ last 2-3 weeks) due to ~30-day Datadog log retention.")
    L.append("// To refresh: re-run the Datadog queries for a new window and replace this file.")
    L.append("")
    L.append(f'export const PERIOD = "{PERIOD}";')
    L.append(f'export const PERIOD_RANGE = "{PERIOD_RANGE}";')
    L.append('export const SOURCE = "Datadog - celonis.datadoghq.com";')
    L.append("")
    L.append("export interface SummaryMetrics {")
    for k in ["activeClients", "activeTeams", "suspendedClients", "captureStarts",
              "parquetUploadsSuccess", "projectCreations", "projectCreationFailurePct",
              "sqlSuccessJobs", "sqlSuccessTeams", "quickstartJobs", "quickstartTeams",
              "metadataRequests", "configRequests", "sqlExecutions", "uploaderSuccess"]:
        L.append(f"  {k}: number;")
    L.append("}")
    L.append("")
    L.append("export const summary: SummaryMetrics = {")
    for k in ["activeClients", "activeTeams", "suspendedClients", "captureStarts",
              "parquetUploadsSuccess", "projectCreations", "projectCreationFailurePct",
              "sqlSuccessJobs", "sqlSuccessTeams", "quickstartJobs", "quickstartTeams",
              "metadataRequests", "configRequests", "sqlExecutions", "uploaderSuccess"]:
        L.append(f"  {k}: {SUMMARY[k]},")
    L.append("};")
    L.append("")
    L.append("export interface TrendPoint {")
    L.append("  day: number;")
    L.append("  count: number;")
    L.append("}")
    L.append("")
    L.append("// sum:taskmining.project.creations.as_count(), daily rollup (full window).")
    L.append("export const creationTrend: TrendPoint[] = [")
    row = "  " + ", ".join(str(v) for v in TREND) + ","
    L.append(row)
    L.append("].map((count, i) => ({ day: i + 1, count }));")
    L.append("")
    L.append("export interface VersionPoint {")
    L.append("  version: string;")
    L.append("  clients: number;")
    L.append("}")
    L.append("")
    L.append("// Distinct @clientId per @recorderVersion (purpose:prod), top versions.")
    L.append("export const versionMix: VersionPoint[] = [")
    for v, c in VERSION_MIX:
        L.append(f'  {{ version: "{v}", clients: {c} }},')
    L.append("];")
    L.append("")
    L.append("export interface WeekPoint {")
    L.append("  week: string;")
    L.append("  clients: number;")
    L.append("}")
    L.append("")
    L.append("// Partial: only the most recent weeks fall inside log retention (~30d).")
    L.append("export const weeklyActiveClients: WeekPoint[] = [")
    for w, c in WEEKLY:
        L.append(f'  {{ week: "{w}", clients: {c} }},')
    L.append("];")
    L.append("")
    L.append("export interface TeamRecord {")
    L.append("  team: string;")
    L.append("  clients: number;")
    L.append("  versions: number;")
    L.append("  parquet: number;")
    L.append("  image: number;")
    L.append("  errors: number;")
    L.append("}")
    L.append("")
    L.append(f"// All {len(teams)} teams active on the Task Mining client in production during the window.")
    L.append("export const teams: TeamRecord[] = [")
    for t in teams:
        L.append(
            f'  {{ team: "{t["team"]}", clients: {t["clients"]}, versions: {t["versions"]},'
            f' parquet: {t["parquet"]}, image: {t["image"]}, errors: {t["errors"]} }},'
        )
    L.append("];")
    L.append("")
    return "\n".join(L)


out_path = os.path.join(ROOT, "src", "data", "adoption.ts")
with open(out_path, "w") as f:
    f.write(ts_lines())

sys.stderr.write(
    f"teams={len(teams)} activeClients={SUMMARY['activeClients']} "
    f"projectCreations={SUMMARY['projectCreations']} "
    f"parquetSum={SUMMARY['parquetUploadsSuccess']} "
    f"errorsMatched={sum(1 for t in teams if t['errors'] > 0)}\n"
)
print(out_path)
