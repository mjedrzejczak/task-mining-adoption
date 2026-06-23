import sys, os, zipfile, re, json, datetime as dt
from xml.etree import ElementTree as ET

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
REL = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
path = sys.argv[1]
z = zipfile.ZipFile(path)

shared = []
if "xl/sharedStrings.xml" in z.namelist():
    root = ET.fromstring(z.read("xl/sharedStrings.xml"))
    for si in root.findall(f"{NS}si"):
        shared.append("".join(t.text or "" for t in si.iter(f"{NS}t")))

wb = ET.fromstring(z.read("xl/workbook.xml"))
sheets = [(s.get("name"), s.get(f"{REL}id")) for s in wb.find(f"{NS}sheets")]
rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
rid_to_target = {r.get("Id"): r.get("Target") for r in rels}


def col_index(ref):
    letters = re.match(r"([A-Z]+)", ref).group(1)
    n = 0
    for c in letters:
        n = n * 26 + (ord(c) - 64)
    return n - 1


def cell_value(c):
    t = c.get("t")
    v = c.find(f"{NS}v")
    if t == "s":
        return shared[int(v.text)] if v is not None else ""
    if t == "inlineStr":
        is_ = c.find(f"{NS}is")
        return "".join(x.text or "" for x in is_.iter(f"{NS}t")) if is_ is not None else ""
    return v.text if v is not None else ""


EPOCH = dt.date(1899, 12, 30)


def serial_to_date(s):
    try:
        return EPOCH + dt.timedelta(days=int(float(s)))
    except Exception:
        return None


name, rid = sheets[0]
target = rid_to_target[rid]
if not target.startswith("xl/"):
    target = "xl/" + target.lstrip("/")
ws = ET.fromstring(z.read(target))
data = ws.find(f"{NS}sheetData")

rows = []
for row in data.findall(f"{NS}row"):
    cells = {}
    maxc = -1
    for c in row.findall(f"{NS}c"):
        ci = col_index(c.get("r"))
        cells[ci] = cell_value(c) or ""
        maxc = max(maxc, ci)
    rows.append([cells.get(i, "") for i in range(maxc + 1)])

header_idx = next(i for i, r in enumerate(rows) if r and r[0].strip() == "Logo Name")
header = rows[header_idx]
month_cols = [ci for ci in range(4, len(header)) if serial_to_date(header[ci])]

TODAY = dt.date(2026, 6, 23)


def fnum(x):
    try:
        return float(x)
    except Exception:
        return 0.0


# Datadog active clients per team domain, parsed from the generated snapshot so the
# join always reflects the current src/data/adoption.ts (period: May-Jun 2026).
def load_team_clients():
    here = os.path.dirname(os.path.abspath(__file__))
    adoption = os.path.join(here, "..", "src", "data", "adoption.ts")
    text = open(adoption).read()
    out = {}
    for m in re.finditer(r'\{\s*team:\s*"([^"]+)",\s*clients:\s*(\d+)', text):
        out[m.group(1)] = int(m.group(2))
    return out


team_clients = load_team_clients()

# Map Excel logo -> list of Datadog team domains contributing active clients
logo_to_teams = {
    "Allianz Technology SE": ["allianz-global"],
    "Refinitiv": ["refinitiv"],
    "Majid Al Futtaim Global Solutions LLC (UAE)": ["majid-ai-futtaim"],
    "Nykredit Realkredit A/S": ["nykredit-realkredit"],
    "Anglo American PLC": ["anglo-american"],
    "Allstate Insurance Company": ["allstate"],
    "Kapitus": ["kapitus"],
    "ASTRAZENECA UK LIMITED": ["astrazeneca-dev"],
    "MOL Group": ["mol"],
    "Deutsche Bank AG": ["dbank", "dbank-psb"],
    "The Dai-ichi Life Insurance Company, Limited": ["dai-ichi-life-insurance"],
    "AFLAC LIFE INSURANCE JAPAN LTD.": ["aflac"],
    "SLB": ["schlumberger", "schlumberger-qa"],
    "Kimberly-Clark Corporation": ["kimberlyclark"],
    "Endpoint Technologies, LLC": ["endpoint"],
    "Siemens Financial Services GmbH": ["siemens-sandbox"],
    "UPM-Kymmene Oyj": ["upm-sandbox"],
    "Deutsche Post AG Finance & HR Operations Deutschland": ["dpdhl"],
    "Telefonica Global Technology": ["telefonica-productive"],
    "Merck & Co., Inc.": ["merck-tst"],
    "Eight-Japan Engineering Consultants Inc.": ["eight-japan-engineering-consultants"],
    "Rabobank": ["rabobank", "rabobank-sb"],
    "Booking Holdings Inc.": ["booking-holdings"],
    "DIOT SIACI": ["diot-siaci"],
    "MICHELIN": ["michelin"],
    "Mondelez Europe Procurement GmbH": ["mondelez"],
    "Nationwide Mutual Insurance Company": ["nationwide-prod"],
    "PANASONIC INFORMATION SYSTEMS CO. LTD.": ["panasonic-information"],
    "Goldman Sachs": ["gs-training-2026"],
    "Metro Bank PLC": ["metro-bank"],
    "Novartis AG": ["novartis-sb"],
}

agg = {}
for r in rows[header_idx + 1:]:
    if len(r) < 4 or not r[0].strip():
        continue
    logo = r[0].strip()
    end = serial_to_date(r[3])
    vals = [fnum(r[ci]) for ci in month_cols if ci < len(r)]
    sub_acv = max(vals) if vals else 0.0
    active = end is not None and end >= TODAY
    a = agg.setdefault(logo, {"current": 0.0, "end": None, "any_end": None,
                              "active_subs": 0, "total_subs": 0})
    a["total_subs"] += 1
    if a["any_end"] is None or (end and end > a["any_end"]):
        a["any_end"] = end
    if active:
        a["current"] += sub_acv
        a["active_subs"] += 1
        if a["end"] is None or end > a["end"]:
            a["end"] = end

out = []
for logo, a in agg.items():
    end = a["end"] or a["any_end"]
    teams = logo_to_teams.get(logo, [])
    clients = sum(team_clients.get(t, 0) for t in teams)
    out.append({
        "customer": logo,
        "contractValue": round(a["current"]),
        "activeClients": clients,
        "endDate": end.isoformat() if end else None,
        "active": a["active_subs"] > 0,
        "matchedTeams": teams,
    })

out.sort(key=lambda x: (-x["contractValue"], -x["activeClients"], x["customer"].lower()))

ts = []
ts.append("// Per-customer view: contract value (from 'Customers Task mining.xlsx') joined")
ts.append("// with current adoption (active clients) from the Datadog May-Jun 2026 snapshot.")
ts.append("// Generated by scripts/build_customers.py - do not edit by hand.")
ts.append("")
ts.append("export interface CustomerRecord {")
ts.append("  customer: string;")
ts.append("  contractValue: number; // current ACV (USD), 0 = none on record")
ts.append("  activeClients: number; // distinct active clients, Datadog May-Jun 2026")
ts.append("  endDate: string | null; // contract end (latest active subscription)")
ts.append("  active: boolean; // has >=1 active subscription")
ts.append("  matchedTeams: string[]; // Datadog @teamDomain(s) joined for adoption")
ts.append("}")
ts.append("")
ts.append("export const customers: CustomerRecord[] = " + json.dumps(out, indent=2, ensure_ascii=False) + ";")
print("\n".join(ts))

import sys as _s
_s.stderr.write(
    f"logos={len(out)} active={sum(1 for x in out if x['active'])} "
    f"matched={sum(1 for x in out if x['activeClients']>0)} "
    f"totalACV={sum(x['contractValue'] for x in out):,} "
    f"totalClientsMatched={sum(x['activeClients'] for x in out)}\n")
