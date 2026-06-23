import json, re, sys, zipfile, datetime as dt

src_ts = "src/data/customers.ts"
out_path = sys.argv[1] if len(sys.argv) > 1 else "exports/Task Mining - Customer Adoption.xlsx"

text = open(src_ts, encoding="utf-8").read()
m = re.search(r"export const customers: CustomerRecord\[\] = (\[.*\]);", text, re.S)
records = json.loads(m.group(1))

EPOCH = dt.date(1899, 12, 30)


def to_serial(iso):
    d = dt.date.fromisoformat(iso)
    return (d - EPOCH).days


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


headers = ["Customer name", "Info about usage (Yes/No)", "# active clients",
           "Contract value", "End of contract"]


def col_letter(i):
    s = ""
    i += 1
    while i:
        i, r = divmod(i - 1, 26)
        s = chr(65 + r) + s
    return s


rows_xml = []
# header row, style 1 (bold)
cells = "".join(
    f'<c r="{col_letter(j)}1" t="inlineStr" s="1"><is><t>{esc(h)}</t></is></c>'
    for j, h in enumerate(headers))
rows_xml.append(f'<row r="1">{cells}</row>')

r = 2
for rec in records:
    usage = "Yes" if rec["activeClients"] > 0 else "No"
    c_a = f'<c r="A{r}" t="inlineStr"><is><t>{esc(rec["customer"])}</t></is></c>'
    c_b = f'<c r="B{r}" t="inlineStr"><is><t>{usage}</t></is></c>'
    c_c = f'<c r="C{r}"><v>{rec["activeClients"]}</v></c>'
    c_d = f'<c r="D{r}" s="2"><v>{rec["contractValue"]}</v></c>'
    if rec["endDate"]:
        c_e = f'<c r="E{r}" s="3"><v>{to_serial(rec["endDate"])}</v></c>'
    else:
        c_e = f'<c r="E{r}" t="inlineStr"><is><t>—</t></is></c>'
    rows_xml.append(f'<row r="{r}">{c_a}{c_b}{c_c}{c_d}{c_e}</row>')
    r += 1

sheet = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<cols>
<col min="1" max="1" width="48" customWidth="1"/>
<col min="2" max="2" width="22" customWidth="1"/>
<col min="3" max="3" width="16" customWidth="1"/>
<col min="4" max="4" width="16" customWidth="1"/>
<col min="5" max="5" width="16" customWidth="1"/>
</cols>
<sheetData>{"".join(rows_xml)}</sheetData>
<autoFilter ref="A1:E{r-1}"/>
</worksheet>'''

styles = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2">
<numFmt numFmtId="164" formatCode="&quot;$&quot;#,##0"/>
<numFmt numFmtId="165" formatCode="yyyy\\-mm\\-dd"/>
</numFmts>
<fonts count="2">
<font><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><name val="Calibri"/></font>
</fonts>
<fills count="2">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
</fills>
<borders count="1"><border/></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="4">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>'''

content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>'''

root_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>'''

workbook = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Customer Adoption" sheetId="1" r:id="rId1"/></sheets>
</workbook>'''

wb_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>'''

import os
os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", content_types)
    z.writestr("_rels/.rels", root_rels)
    z.writestr("xl/workbook.xml", workbook)
    z.writestr("xl/_rels/workbook.xml.rels", wb_rels)
    z.writestr("xl/styles.xml", styles)
    z.writestr("xl/worksheets/sheet1.xml", sheet)

print(f"wrote {out_path} with {len(records)} customers")
