#!/usr/bin/env python3
"""Regenerate src/data/adoption.ts and src/data/versions.ts from the Aug 10, 2026
Datadog snapshot.

The raw TSV blocks below are the verbatim outputs of the Datadog log/metric
queries run for the window 2026-07-12 -> 2026-08-11 (data retained from
~2026-07-27). Editing the numbers here and re-running keeps both TS files in
sync and preserves provenance.

Filter for client/version/team figures:
  service:task-mining @logType:Client purpose:prod -clientId:taskmining
Errors: service:task-mining status:error (grouped by @teamDomain)
Creation trend: sum:taskmining.project.creations{*}.as_count() daily rollup
"""

import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PERIOD = "Jul-Aug 2026"
PERIOD_RANGE = "2026-07-27 - 2026-08-10"
VERSION_PERIOD = "Jul 27 - Aug 10, 2026"
SOURCE = "Datadog - celonis.datadoghq.com"

ACTIVE_CLIENTS = 5486
ACTIVE_TEAMS = 95

# team \t clients \t versions
TEAMS_TSV = """
nykredit-realkredit	1814	2
majid-ai-futtaim	812	3
prod	453	1
allianz-global	375	4
refinitiv	327	5
allstate	191	3
nec-corporation-2	188	3
ofi-benelux-b-v--om-kaemingk-c4c	168	1
kapitus	165	6
anglo-american	161	8
production	131	4
astrazeneca-dev	89	3
dbank	69	1
mol	59	5
unilever-genpact	38	1
dai-ichi-life-insurance	36	1
schlumberger	28	5
toyo-seikan	26	1
manulife-pov-ca-pov	24	1
aflac	22	4
kimberlyclark	22	7
elsevier	20	1
fujitsu-limited-product-business-task-mining-c4c	19	1
endpoint	16	3
siemens-sandbox	16	4
caceis-task-mining-pov	16	3
schlumberger-qa	14	2
kn-sb	12	3
coloplast-pov	12	1
amgen	11	4
novartis-sb	9	1
consulting	8	1
kn	7	1
dpdhl	6	1
pepsico-prod	6	3
riverty	6	1
telefonica-productive	6	1
eon	6	3
upm-sandbox	5	2
banco-pichincha	5	1
ibm-crossmark-c4c	5	1
kistler-prod	4	1
bouygues-telecom	4	1
envalior	4	1
sandbox	4	3
merck-tst	3	1
alstom	3	2
productive	3	1
eight-japan-engineering-consultants	3	1
payroll-task-mining	2	1
task-mining-demo---kay	2	2
diot-siaci	2	1
cel-tm-finance	2	2
dbank-psb	2	1
itochu-partner-sandbox	2	2
silamir-partner-sandbox	2	1
booking-holdings	2	1
task-mining	2	2
ilt-saint-gobain-training	1	1
dataops	1	1
hanwhasolution-pov	1	1
celonis-rktu9q	1	1
ibm-sandbox	1	1
jc14jlpc-2026-04-03	1	1
wilo-sb	1	1
hitachi-partner-sandbox	1	1
metro-bank	1	1
banco-santander	1	1
fnfh2u42-2025-04-18	1	1
a-gutte-celonis-com	1	1
pyze-partner-sandbox2	1	1
kpdgk5yo-2025-12-12	1	1
ems-japan-pov	1	1
panasonic-information	1	1
nomura-research-institute-partner-sandbox	1	1
michelin	1	1
optus-standard-sandbox	1	1
nationwide-prod	1	1
accenture-development-sandbox-dcp	1	1
bouygues-telecom-pov-network-pov	1	1
ciklum-partner-sandbox	1	1
zespri	1	1
m-sakamoto-celonis-com	1	1
axa-task-mining	1	1
tata-consultancy-services-partner-sandbox	1	1
syngenta-prod	1	1
cordesgraefe	1	1
allianzconsult-prod	1	1
mondelez	1	1
tgt-internal	1	1
logatik-partner-sandbox	1	1
roboyo-us-partner-sandbox	1	1
basf	1	1
tpl-product-task-mining	1	1
kone	1	1
"""

# team \t errors (status:error). Values already de-scientific-notated.
ERRORS_TSV = """
allianz-global	2425729
cordesgraefe	2376542
productive	926736
dai-ichi-life-insurance	825502
anglo-american	785654
nec-corporation-2	369058
astrazeneca-dev	195729
kapitus	135221
allstate	120721
envalior	67628
production	50740
toyo-seikan	49764
nykredit-realkredit	48919
aflac	46080
schlumberger	45676
prod	43602
majid-ai-futtaim	28955
telefonica-productive	23889
refinitiv	23689
endpoint	16411
kimberlyclark	16199
mol	13877
schlumberger-qa	13185
elsevier	6525
task-mining	4449
kistler-prod	3491
dbank	2593
ofi-benelux-b-v--om-kaemingk-c4c	2259
fujitsu-limited-product-business-task-mining-c4c	2219
amgen	1644
unilever-genpact	1166
hitachi-partner-sandbox	942
kn	922
ibm-crossmark-c4c	765
banco-pichincha	754
manulife-pov-ca-pov	658
tata-consultancy-services-partner-sandbox	567
syngenta-prod	502
siemens-sandbox	405
eight-japan-engineering-consultants	293
novartis-sb	276
kn-sb	208
merck-tst	199
dpdhl	191
pepsico-prod	139
itochu-partner-sandbox	138
consulting	129
upm-sandbox	110
mondelez	100
coloplast-pov	90
fnfh2u42-2025-04-18	85
ibm-sandbox	83
sandbox	81
bouygues-telecom	75
caceis-task-mining-pov	70
eon	53
pyze-partner-sandbox2	45
alstom	45
bouygues-telecom-pov-network-pov	44
booking-holdings	40
metro-bank	33
dataops	33
tpl-product-task-mining	32
wilo-sb	29
roboyo-us-partner-sandbox	26
michelin	23
riverty	21
payroll-task-mining	20
dbank-psb	20
allianzconsult-prod	19
basf	18
cel-tm-finance	16
jc14jlpc-2026-04-03	12
silamir-partner-sandbox	11
logatik-partner-sandbox	9
diot-siaci	9
nationwide-prod	6
zespri	4
task-mining-demo---kay	4
kpdgk5yo-2025-12-12	4
nomura-research-institute-partner-sandbox	3
celonis-rktu9q	2
kone	2
axa-task-mining	2
panasonic-information	2
banco-santander	2
ciklum-partner-sandbox	2
ilt-saint-gobain-training	1
"""

# version \t clients (global distinct clients per recorder version)
VER_TOTALS_TSV = """
2.21.1.0	2546
2.21.0.0	1162
2.20.0.0	878
2.18.2.0	310
2.17.1.0	166
2.17.0.0	86
2.18.0.0	62
2.17.1.251	55
2.18.1.0	53
2.19.0.0	49
2.21.2.0	43
2.15.2.0	18
2.10.0.0	15
2.13.0.0	11
2.20.1.0	10
2.6.1.0	10
2.11.0.0	6
2.9.2.0	2
2.14.0.0	2
2.21.2.384	1
2.15.1.0	1
2.12.0.0	1
2.21.1.379	1
2.8.1.0	1
2.7.6.0	1
"""

# team \t version \t clients (crosstab)
CROSSTAB_TSV = """
a-gutte-celonis-com	2.21.1.0	1
accenture-development-sandbox-dcp	2.6.1.0	1
aflac	2.17.0.0	11
aflac	2.19.0.0	8
aflac	2.20.0.0	2
aflac	2.21.0.0	1
allianz-global	2.21.1.0	330
allianz-global	2.18.1.0	45
allianz-global	2.21.0.0	1
allianz-global	2.21.2.0	1
allianzconsult-prod	2.21.1.0	1
allstate	2.20.0.0	178
allstate	2.17.0.0	11
allstate	2.21.1.0	2
alstom	2.21.1.0	2
alstom	2.21.2.0	1
amgen	2.18.0.0	5
amgen	2.20.0.0	4
amgen	2.19.0.0	1
amgen	2.18.1.0	1
anglo-american	2.21.0.0	81
anglo-american	2.21.1.0	36
anglo-american	2.20.0.0	19
anglo-american	2.21.2.0	17
anglo-american	2.11.0.0	5
anglo-american	2.18.1.0	1
anglo-american	2.21.1.379	1
anglo-american	2.9.2.0	1
astrazeneca-dev	2.17.0.0	50
astrazeneca-dev	2.18.0.0	35
astrazeneca-dev	2.20.0.0	4
axa-task-mining	2.21.1.0	1
banco-pichincha	2.15.2.0	5
banco-santander	2.18.1.0	1
basf	2.17.1.0	1
booking-holdings	2.21.0.0	2
bouygues-telecom	2.21.1.0	4
bouygues-telecom-pov-network-pov	2.20.0.0	1
caceis-task-mining-pov	2.21.0.0	7
caceis-task-mining-pov	2.21.1.0	6
caceis-task-mining-pov	2.21.2.0	3
cel-tm-finance	2.21.2.384	1
cel-tm-finance	2.21.2.0	1
celonis-rktu9q	2.21.2.0	1
ciklum-partner-sandbox	2.21.1.0	1
coloplast-pov	2.21.1.0	12
consulting	2.21.1.0	8
cordesgraefe	2.9.2.0	1
dai-ichi-life-insurance	2.19.0.0	36
dataops	2.21.2.0	1
dbank	2.20.0.0	69
dbank-psb	2.20.0.0	2
diot-siaci	2.21.0.0	2
dpdhl	2.20.0.0	6
eight-japan-engineering-consultants	2.20.0.0	3
elsevier	2.21.1.0	20
ems-japan-pov	2.18.1.0	1
endpoint	2.17.1.0	10
endpoint	2.21.1.0	4
endpoint	2.18.2.0	2
envalior	2.20.0.0	4
eon	2.21.2.0	4
eon	2.21.1.0	1
eon	2.20.0.0	1
fnfh2u42-2025-04-18	2.21.2.0	1
fujitsu-limited-product-business-task-mining-c4c	2.21.0.0	19
hanwhasolution-pov	2.21.1.0	1
hitachi-partner-sandbox	2.21.2.0	1
ibm-crossmark-c4c	2.17.1.0	5
ibm-sandbox	2.19.0.0	1
ilt-saint-gobain-training	2.21.1.0	1
itochu-partner-sandbox	2.20.1.0	1
itochu-partner-sandbox	2.19.0.0	1
jc14jlpc-2026-04-03	2.21.1.0	1
kapitus	2.21.0.0	83
kapitus	2.20.0.0	70
kapitus	2.21.1.0	6
kapitus	2.18.2.0	4
kapitus	2.18.0.0	2
kapitus	2.21.2.0	1
kimberlyclark	2.21.1.0	13
kimberlyclark	2.20.0.0	2
kimberlyclark	2.14.0.0	2
kimberlyclark	2.18.0.0	2
kimberlyclark	2.21.2.0	1
kimberlyclark	2.15.1.0	1
kimberlyclark	2.13.0.0	1
kistler-prod	2.21.0.0	4
kn	2.13.0.0	7
kn-sb	2.17.0.0	9
kn-sb	2.17.1.0	2
kn-sb	2.15.2.0	1
kone	2.21.1.0	1
kpdgk5yo-2025-12-12	2.20.1.0	1
logatik-partner-sandbox	2.21.0.0	1
m-sakamoto-celonis-com	2.19.0.0	1
majid-ai-futtaim	2.21.0.0	809
majid-ai-futtaim	2.21.1.0	2
majid-ai-futtaim	2.21.2.0	1
manulife-pov-ca-pov	2.21.1.0	24
merck-tst	2.20.0.0	3
metro-bank	2.19.0.0	1
michelin	2.17.1.0	1
mol	2.17.1.251	55
mol	2.18.0.0	1
mol	2.21.0.0	1
mol	2.17.1.0	1
mol	2.18.1.0	1
mondelez	2.20.0.0	1
nationwide-prod	2.18.0.0	1
nec-corporation-2	2.21.0.0	147
nec-corporation-2	2.20.0.0	40
nec-corporation-2	2.21.2.0	1
nomura-research-institute-partner-sandbox	2.20.0.0	1
novartis-sb	2.21.1.0	9
nykredit-realkredit	2.21.1.0	1813
nykredit-realkredit	2.13.0.0	1
ofi-benelux-b-v--om-kaemingk-c4c	2.21.1.0	168
optus-standard-sandbox	2.21.0.0	1
panasonic-information	2.18.2.0	1
payroll-task-mining	2.21.1.0	2
pepsico-prod	2.17.0.0	4
pepsico-prod	2.18.2.0	1
pepsico-prod	2.11.0.0	1
prod	2.20.0.0	453
production	2.17.1.0	108
production	2.10.0.0	14
production	2.15.2.0	8
production	2.12.0.0	1
productive	2.6.1.0	3
pyze-partner-sandbox2	2.21.1.0	1
refinitiv	2.18.2.0	297
refinitiv	2.17.1.0	24
refinitiv	2.15.2.0	4
refinitiv	2.17.0.0	1
refinitiv	2.18.1.0	1
riverty	2.18.0.0	6
roboyo-us-partner-sandbox	2.21.2.0	1
sandbox	2.21.2.0	2
sandbox	2.20.0.0	2
sandbox	2.10.0.0	1
schlumberger	2.20.0.0	13
schlumberger	2.18.0.0	8
schlumberger	2.18.2.0	5
schlumberger	2.17.1.0	1
schlumberger	2.18.1.0	1
schlumberger-qa	2.17.1.0	12
schlumberger-qa	2.13.0.0	2
siemens-sandbox	2.21.1.0	5
siemens-sandbox	2.20.1.0	5
siemens-sandbox	2.21.2.0	5
siemens-sandbox	2.21.0.0	1
silamir-partner-sandbox	2.21.0.0	2
syngenta-prod	2.8.1.0	1
task-mining	2.21.1.0	1
task-mining	2.7.6.0	1
task-mining-demo---kay	2.21.1.0	1
task-mining-demo---kay	2.18.0.0	1
tata-consultancy-services-partner-sandbox	2.21.1.0	1
telefonica-productive	2.6.1.0	6
tgt-internal	2.21.1.0	1
toyo-seikan	2.21.1.0	26
tpl-product-task-mining	2.18.1.0	1
unilever-genpact	2.21.1.0	38
upm-sandbox	2.20.1.0	3
upm-sandbox	2.21.1.0	2
wilo-sb	2.17.1.0	1
zespri	2.18.0.0	1
"""

# sum:taskmining.project.creations{*}.as_count() daily rollup, 2026-06-18 -> 2026-08-10
CREATION_TREND = [
    143, 96, 0, 0, 312, 147, 219, 73, 55, 0, 1, 110, 95, 163, 229, 75, 0, 0,
    186, 87, 218, 60, 87, 0, 0, 132, 94, 297, 116, 49, 4, 5, 265, 219, 110, 57,
    211, 0, 0, 194, 222, 67, 115, 70, 2, 0, 123, 87, 309, 125, 171, 7, 5, 143,
]

# week label \t distinct clients (DATE_TRUNC weeks, Mondays)
WEEKLY = [
    ("Jul 27", 3782),
    ("Aug 3", 4685),
    ("Aug 10", 3900),
]


def rows(tsv):
    return [ln.split("\t") for ln in tsv.strip().splitlines()]


def main():
    errors = {t: int(v) for t, v in rows(ERRORS_TSV)}
    team_rows = [(t, int(c), int(v)) for t, c, v in rows(TEAMS_TSV)]

    ver_totals = [(v, int(c)) for v, c in rows(VER_TOTALS_TSV)]

    crosstab = {}
    for t, v, c in rows(CROSSTAB_TSV):
        crosstab.setdefault(t, []).append((v, int(c)))

    # --- adoption.ts ---
    a = []
    a.append("// Snapshot of Task Mining adoption pulled from Datadog (celonis.datadoghq.com).")
    a.append(f"// Period: {PERIOD} ({PERIOD_RANGE}).")
    a.append("// Log-derived figures (clients, teams, versions, errors, weekly) reflect the")
    a.append("// retained Datadog log window (data present from ~2026-07-27). Project-creation")
    a.append("// trend uses metric retention (2026-06-18 - 2026-08-10).")
    a.append("// Generated by scripts/refresh_aug10.py - do not edit by hand.")
    a.append("")
    a.append(f'export const PERIOD = "{PERIOD}";')
    a.append(f'export const PERIOD_RANGE = "{PERIOD_RANGE}";')
    a.append(f'export const SOURCE = "{SOURCE}";')
    a.append("")
    a.append("export interface SummaryMetrics {")
    a.append("  activeClients: number;")
    a.append("  activeTeams: number;")
    a.append("  suspendedClients: number;")
    a.append("  projectCreations: number;")
    a.append("}")
    a.append("")
    a.append("export const summary: SummaryMetrics = {")
    a.append(f"  activeClients: {ACTIVE_CLIENTS},")
    a.append(f"  activeTeams: {ACTIVE_TEAMS},")
    a.append("  suspendedClients: 0,")
    a.append(f"  projectCreations: {sum(CREATION_TREND)},")
    a.append("};")
    a.append("")
    a.append("export interface TrendPoint {")
    a.append("  day: number;")
    a.append("  count: number;")
    a.append("}")
    a.append("")
    a.append("// sum:taskmining.project.creations.as_count(), daily rollup (metric window).")
    a.append("export const creationTrend: TrendPoint[] = [")
    a.append("  " + ", ".join(str(x) for x in CREATION_TREND) + ",")
    a.append("].map((count, i) => ({ day: i + 1, count }));")
    a.append("")
    a.append("export interface VersionPoint {")
    a.append("  version: string;")
    a.append("  clients: number;")
    a.append("}")
    a.append("")
    a.append("// Distinct @clientId per @recorderVersion (purpose:prod), top versions.")
    a.append("export const versionMix: VersionPoint[] = [")
    for v, c in ver_totals[:15]:
        a.append(f'  {{ version: "{v}", clients: {c} }},')
    a.append("];")
    a.append("")
    a.append("export interface WeekPoint {")
    a.append("  week: string;")
    a.append("  clients: number;")
    a.append("}")
    a.append("")
    a.append("// Partial: only the most recent weeks fall inside log retention.")
    a.append("export const weeklyActiveClients: WeekPoint[] = [")
    for wk, c in WEEKLY:
        a.append(f'  {{ week: "{wk}", clients: {c} }},')
    a.append("];")
    a.append("")
    a.append("export interface TeamRecord {")
    a.append("  team: string;")
    a.append("  clients: number;")
    a.append("  versions: number;")
    a.append("  parquet: number;")
    a.append("  image: number;")
    a.append("  errors: number;")
    a.append("}")
    a.append("")
    a.append(f"// All {len(team_rows)} teams active on the Task Mining client in production during")
    a.append("// the window. parquet/image upload counts are not part of this refresh (0).")
    a.append("export const teams: TeamRecord[] = [")
    for t, c, v in team_rows:
        e = errors.get(t, 0)
        a.append(
            f'  {{ team: "{t}", clients: {c}, versions: {v}, '
            f"parquet: 0, image: 0, errors: {e} }},"
        )
    a.append("];")
    a.append("")

    with open(os.path.join(ROOT, "src", "data", "adoption.ts"), "w") as f:
        f.write("\n".join(a))

    # --- versions.ts ---
    # Order teams by total clients desc (sum of crosstab per team).
    team_totals = {t: sum(c for _, c in vs) for t, vs in crosstab.items()}
    ordered = sorted(crosstab.items(), key=lambda kv: (-team_totals[kv[0]], kv[0]))

    v = []
    v.append("// Recorder version adoption per customer, from Datadog (service:task-mining).")
    v.append(f"// Period: {VERSION_PERIOD}. Distinct @clientId per (@teamDomain, @recorderVersion).")
    v.append("// Generated by scripts/refresh_aug10.py - do not edit by hand.")
    v.append("")
    v.append('import type { VersionPoint } from "@/data/adoption";')
    v.append("")
    v.append(f'export const VERSION_PERIOD = "{VERSION_PERIOD}";')
    v.append("")
    v.append("export const versionTotals: VersionPoint[] = [")
    for ver, c in ver_totals:
        v.append(f'  {{ version: "{ver}", clients: {c} }},')
    v.append("];")
    v.append("")
    v.append("export interface TeamVersions {")
    v.append("  team: string;")
    v.append("  clients: number;")
    v.append("  versions: VersionPoint[];")
    v.append("}")
    v.append("")
    v.append("export const versionsByTeam: TeamVersions[] = [")
    for t, vs in ordered:
        vs_sorted = sorted(vs, key=lambda x: -x[1])
        v.append("  {")
        v.append(f'    team: "{t}",')
        v.append(f"    clients: {team_totals[t]},")
        v.append("    versions: [")
        for ver, c in vs_sorted:
            v.append(f'      {{ version: "{ver}", clients: {c} }},')
        v.append("    ],")
        v.append("  },")
    v.append("];")
    v.append("")

    with open(os.path.join(ROOT, "src", "data", "versions.ts"), "w") as f:
        f.write("\n".join(v))

    print(
        f"Wrote adoption.ts ({len(team_rows)} teams) and versions.ts "
        f"({len(ordered)} teams, {len(ver_totals)} versions). "
        f"activeClients={ACTIVE_CLIENTS} projectCreations={sum(CREATION_TREND)}"
    )


if __name__ == "__main__":
    main()
