import json

PERIOD = "Jun 1-25, 2026"

# Datadog: service:task-mining, distinct @clientId by (@teamDomain, @recorderVersion)
CROSSTAB = """
2mi7vsyd-2025-11-18	2.21.1.0	1
6f1oiqjp-2026-02-13	2.21.1.0	1
90tcwbmd-2025-08-08	2.21.0.0	1
a-gutte-celonis-com	2.21.1.0	1
abeam-partner-sandbox	2.20.1.0	1
accenture-development-sandbox-dcp	2.6.1.0	1
aflac	2.17.0.0	18
aflac	2.19.0.0	13
aflac	2.20.0.0	5
aflac	2.21.0.0	1
aflac	2.15.2.0	1
allianz-global	2.18.1.0	654
allianz-global	2.20.0.0	1
allianz-global	2.21.1.0	1
allianzconsult-prod	2.18.1.0	3
allianzconsult-prod	2.21.1.0	1
allstate	2.20.0.0	196
allstate	2.17.0.0	14
allstate	2.21.1.0	2
amgen	2.20.0.0	4
amgen	2.18.0.0	4
amgen	2.19.0.0	1
amgen	2.18.1.0	1
anglo-american	2.21.0.0	88
anglo-american	2.20.0.0	24
anglo-american	2.21.1.0	10
anglo-american	2.11.0.0	6
anglo-american	2.21.1.379	1
anglo-american	2.9.2.0	1
anglo-american	2.18.1.0	1
astrazeneca-dev	2.17.0.0	59
astrazeneca-dev	2.18.0.0	38
astrazeneca-dev	2.20.0.0	5
atth6lw3-2023-12-07	2.21.1.0	1
atth6lw3-2023-12-07	2.20.0.0	1
banco-pichincha	2.15.2.0	6
banco-santander	2.18.1.0	1
basf	2.17.1.0	1
booking-holdings	2.21.0.0	2
bouygues-telecom	2.21.1.0	1
bouygues-telecom-pov-network-pov	2.20.0.0	1
caceis-task-mining-pov	2.21.0.0	15
caceis-task-mining-pov	2.21.1.0	5
celonis-ryw9oc	2.21.1.0	1
coloplast-pov	2.21.1.0	8
consulting	2.21.1.0	7
cordesgraefe	2.9.2.0	1
dai-ichi-life-insurance	2.19.0.0	40
dbank	2.20.0.0	68
dbank-psb	2.20.0.0	5
deloitte-in-partner-sandbox	2.14.0.0	1
dev	2.22.0.0	1
dev	2.21.2.384	1
diot-siaci	2.21.0.0	2
dpdhl	2.20.0.0	6
eight-japan-engineering-consultants	2.20.0.0	3
ems-japan-pov	2.18.1.0	1
endpoint	2.17.1.0	11
endpoint	2.21.1.0	7
endpoint	2.18.2.0	2
envalior	2.20.0.0	4
fujitsu-limited-product-business-task-mining-c4c	2.21.0.0	20
gs-training-2026	2.21.1.0	2
hitachi-partner-sandbox	2.21.1.0	1
ibm-crossmark-c4c	2.17.1.0	7
ibm-crossmark-c4c	2.21.1.0	1
ibm-sandbox	2.19.0.0	1
ihg-pov	2.21.1.0	1
itochu-partner-sandbox	2.20.1.0	1
itochu-partner-sandbox	2.19.0.0	1
kapitus	2.20.0.0	82
kapitus	2.21.0.0	47
kapitus	2.18.2.0	4
kapitus	2.21.1.0	4
kapitus	2.18.0.0	2
kimberlyclark	2.21.1.0	31
kimberlyclark	2.11.0.0	6
kimberlyclark	2.13.0.0	4
kimberlyclark	2.21.0.0	4
kimberlyclark	2.14.0.0	3
kimberlyclark	2.20.0.0	2
kimberlyclark	2.18.0.0	2
kimberlyclark	2.15.1.0	1
kimberlyclark	2.15.0.0	1
kimberlyclark	2.10.0.0	1
kistler-prod	2.21.0.0	6
kn	2.13.0.0	6
kn-sb	2.17.0.0	10
kn-sb	2.17.1.0	2
kn-sb	2.15.2.0	1
kpdgk5yo-2025-12-12	2.20.1.0	1
logatik-partner-sandbox	2.21.0.0	1
m-sakamoto-celonis-com	2.19.0.0	1
majid-ai-futtaim	2.21.0.0	247
majid-ai-futtaim	2.21.1.0	1
manulife-pov-ca-pov	2.21.1.0	26
merck-tst	2.20.0.0	2
merck-tst	2.10.0.0	1
metro-bank	2.20.0.0	1
metro-bank	2.19.0.0	1
michelin	2.17.1.0	1
mol	2.17.1.251	57
mol	2.18.1.0	1
mol	2.21.0.0	1
mol	2.18.0.0	1
mol	2.17.1.0	1
mondelez	2.20.0.0	1
nationwide-prod	2.18.0.0	1
nec-corporation-2	2.21.0.0	146
nec-corporation-2	2.20.0.0	42
nomura-research-institute-partner-sandbox	2.20.0.0	1
novartis-sb	2.21.1.0	2
nykredit-realkredit	2.13.0.0	230
nykredit-realkredit	2.21.1.0	5
ofi-benelux-b-v--om-kaemingk-c4c	2.21.1.0	176
ofi-benelux-bv-assistzorg-c4c	2.21.1.0	2
optus-standard-sandbox	2.21.0.0	1
panasonic-information	2.18.2.0	1
payroll-task-mining	2.21.1.0	3
pepsico-prod	2.17.0.0	4
pepsico-prod	2.11.0.0	1
pepsico-prod	2.18.2.0	1
prod	2.20.0.0	483
production	2.17.1.0	128
production	2.10.0.0	16
production	2.15.2.0	8
production	2.12.0.0	2
production	2.17.0.0	2
productive	2.6.1.0	3
pyze-partner-sandbox2	2.21.1.0	1
rabobank	2.20.0.0	1
rabobank-sb	2.20.0.0	1
refinitiv	2.18.2.0	475
refinitiv	2.17.1.0	28
refinitiv	2.15.2.0	4
refinitiv	2.18.1.0	2
refinitiv	2.17.0.0	1
riverty	2.18.0.0	19
sandbox	2.20.0.0	3
sandbox	2.10.0.0	1
schlumberger	2.20.0.0	12
schlumberger	2.18.2.0	7
schlumberger	2.18.0.0	6
schlumberger	2.18.1.0	2
schlumberger	2.17.1.0	2
schlumberger-qa	2.17.1.0	13
schlumberger-qa	2.13.0.0	2
secpentest-1	2.20.1.0	1
siemens-sandbox	2.20.1.0	6
siemens-sandbox	2.21.1.0	4
siemens-sandbox	2.21.0.0	1
silamir-partner-sandbox	2.21.0.0	2
syngenta-prod	2.8.1.0	1
task-mining	anyClientVersion	13
task-mining	2.22.0.0	7
task-mining	2.21.1.0	3
task-mining	2.20.0	2
task-mining	2.7.6.0	1
task-mining	0.0.0-sim	1
task-mining	2.21.0.0	1
task-mining-demo---kay	2.21.1.0	1
task-mining-ml-job	anyClientVersion	10
task-mining-orange	anyClientVersion	7
task-mining-purple	anyClientVersion	12
task-mining-purple	2.21.1.0	1
task-mining-purple	2.21.0.0	1
telefonica-productive	2.6.1.0	6
tgt-internal	2.21.1.0	1
toyo-seikan	2.21.1.0	25
toyo-seikan	2.20.0.0	1
unilever-genpact	2.21.1.0	4
upm-sandbox	2.20.1.0	3
upm-sandbox	2.21.1.0	2
upm-sandbox	2.18.2.0	1
upm-sandbox	2.21.0.0	1
wilo-sb	2.17.1.0	1
workday	2.3.0.0	1
"""

# Global distinct @clientId per @recorderVersion
GLOBAL = """
2.20.0.0	955
2.18.1.0	666
2.21.0.0	588
2.18.2.0	491
2.21.1.0	344
2.13.0.0	242
2.17.1.0	195
2.17.0.0	108
2.18.0.0	73
2.19.0.0	58
2.17.1.251	57
anyClientVersion	42
2.15.2.0	20
2.10.0.0	19
2.20.1.0	13
2.11.0.0	13
2.6.1.0	10
2.22.0.0	8
2.14.0.0	4
2.9.2.0	2
2.20.0	2
2.12.0.0	2
2.7.6.0	1
2.15.1.0	1
2.3.0.0	1
2.21.2.384	1
2.15.0.0	1
2.21.1.379	1
0.0.0-sim	1
2.8.1.0	1
"""

teams = {}
for line in CROSSTAB.strip().splitlines():
    team, version, clients = line.split("\t")
    teams.setdefault(team, []).append({"version": version, "clients": int(clients)})

by_team = []
for team, vers in teams.items():
    vers.sort(key=lambda v: -v["clients"])
    by_team.append({"team": team, "clients": sum(v["clients"] for v in vers), "versions": vers})
by_team.sort(key=lambda t: -t["clients"])

global_totals = []
for line in GLOBAL.strip().splitlines():
    version, clients = line.split("\t")
    global_totals.append({"version": version, "clients": int(clients)})

ts = []
ts.append("// Recorder version adoption per customer, from Datadog (service:task-mining).")
ts.append(f"// Period: {PERIOD}. Distinct @clientId per (@teamDomain, @recorderVersion).")
ts.append("// Generated by scripts/build_versions.py - do not edit by hand.")
ts.append("")
ts.append("import type { VersionPoint } from \"@/data/adoption\";")
ts.append("")
ts.append(f"export const VERSION_PERIOD = {json.dumps(PERIOD)};")
ts.append("")
ts.append("export const versionTotals: VersionPoint[] = " + json.dumps(global_totals, indent=2) + ";")
ts.append("")
ts.append("export interface TeamVersions {")
ts.append("  team: string;")
ts.append("  clients: number;")
ts.append("  versions: VersionPoint[];")
ts.append("}")
ts.append("")
ts.append("export const versionsByTeam: TeamVersions[] = " + json.dumps(by_team, indent=2, ensure_ascii=False) + ";")
print("\n".join(ts))
import sys
sys.stderr.write(f"teams={len(by_team)} versions(global)={len(global_totals)}\n")
