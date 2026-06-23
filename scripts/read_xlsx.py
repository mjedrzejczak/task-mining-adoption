import sys, zipfile, re
from xml.etree import ElementTree as ET

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
path = sys.argv[1]

z = zipfile.ZipFile(path)

# shared strings
shared = []
if "xl/sharedStrings.xml" in z.namelist():
    root = ET.fromstring(z.read("xl/sharedStrings.xml"))
    for si in root.findall(f"{NS}si"):
        text = "".join(t.text or "" for t in si.iter(f"{NS}t"))
        shared.append(text)

# workbook -> sheet names + rId
wb = ET.fromstring(z.read("xl/workbook.xml"))
sheets = [(s.get("name"), s.get(f"{{http://schemas.openxmlformats.org/officeDocument/2006/relationships}}id"))
          for s in wb.find(f"{NS}sheets")]

rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
rid_to_target = {r.get("Id"): r.get("Target") for r in rels}


def col_index(ref):
    m = re.match(r"([A-Z]+)", ref)
    letters = m.group(1)
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


for name, rid in sheets:
    target = rid_to_target[rid]
    if not target.startswith("xl/"):
        target = "xl/" + target.lstrip("/")
    print(f"\n===== SHEET: {name} =====")
    ws = ET.fromstring(z.read(target))
    data = ws.find(f"{NS}sheetData")
    for row in data.findall(f"{NS}row"):
        cells = {}
        maxc = -1
        for c in row.findall(f"{NS}c"):
            ref = c.get("r")
            ci = col_index(ref)
            cells[ci] = (cell_value(c) or "").replace("\t", " ").replace("\n", " ")
            maxc = max(maxc, ci)
        line = [cells.get(i, "") for i in range(maxc + 1)]
        if any(x.strip() for x in line):
            print("\t".join(line))
