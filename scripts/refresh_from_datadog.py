#!/usr/bin/env python3
"""Regenerate src/data/live.json from Datadog.

Pulls the volatile adoption numbers the dashboard displays:
  - distinct active Task Mining clients per @teamDomain (last 30 days)
  - total distinct active clients + active team count
  - distinct active clients per week (trailing weeks within log retention)

Contract data (src/data/customers.ts) is static and is NOT touched here; the
app re-derives each customer's active-client count from this file at build time.

Auth via env vars (set as GitHub Actions secrets):
  DD_API_KEY   - Datadog API key
  DD_APP_KEY   - Datadog Application key
  DD_SITE      - Datadog site, default "datadoghq.com" (celonis org is US1)

Run: python3 scripts/refresh_from_datadog.py
Exits non-zero (without writing) if the data looks empty, so CI never
publishes a broken snapshot.
"""

import datetime as dt
import json
import os
import sys
import urllib.error
import urllib.request

# Same filter the snapshot was built from: production Task Mining clients,
# excluding the internal "taskmining" smoke-test client.
QUERY = "service:task-mining @logType:Client purpose:prod -clientId:taskmining"
CLIENT_FACET = "@clientId"
TEAM_FACET = "@teamDomain"
RETENTION_DAYS = 30
WEEKS = 5

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(ROOT, "src", "data", "live.json")


def iso(t: dt.datetime) -> str:
    return t.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def aggregate(api_key, app_key, site, frm, to, group_by_team):
    """Call the Datadog v2 logs aggregate API and return the raw buckets."""
    compute = [{"aggregation": "cardinality", "metric": CLIENT_FACET}]
    body = {
        "compute": compute,
        "filter": {"query": QUERY, "from": iso(frm), "to": iso(to), "indexes": ["*"]},
    }
    if group_by_team:
        body["group_by"] = [{
            "facet": TEAM_FACET,
            "limit": 1000,
            "sort": {"aggregation": "cardinality", "metric": CLIENT_FACET, "order": "desc"},
        }]

    req = urllib.request.Request(
        f"https://api.{site}/api/v2/logs/analytics/aggregate",
        data=json.dumps(body).encode(),
        headers={
            "Content-Type": "application/json",
            "DD-API-KEY": api_key,
            "DD-APPLICATION-KEY": app_key,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            payload = json.load(resp)
    except urllib.error.HTTPError as e:
        sys.stderr.write(f"Datadog API error {e.code}: {e.read().decode()[:500]}\n")
        raise
    return payload.get("data", {}).get("buckets", [])


def compute_value(bucket) -> int:
    computes = bucket.get("computes", {})
    if not computes:
        return 0
    # Single compute -> key is "c0"; be tolerant of naming.
    return int(round(float(next(iter(computes.values())))))


def main() -> int:
    api_key = os.environ.get("DD_API_KEY")
    app_key = os.environ.get("DD_APP_KEY")
    site = os.environ.get("DD_SITE", "datadoghq.com")
    if not api_key or not app_key:
        sys.stderr.write("DD_API_KEY and DD_APP_KEY must be set.\n")
        return 2

    now = dt.datetime.now(dt.timezone.utc)
    window_start = now - dt.timedelta(days=RETENTION_DAYS)

    # Per-team distinct clients over the retention window.
    team_buckets = aggregate(api_key, app_key, site, window_start, now, group_by_team=True)
    teams = [
        {"team": b["by"][TEAM_FACET], "clients": compute_value(b)}
        for b in team_buckets
        if b.get("by", {}).get(TEAM_FACET)
    ]
    teams = [t for t in teams if t["clients"] > 0]
    teams.sort(key=lambda t: (-t["clients"], t["team"]))

    # Total distinct active clients (cardinality is not summable across teams).
    total_buckets = aggregate(api_key, app_key, site, window_start, now, group_by_team=False)
    active_clients = compute_value(total_buckets[0]) if total_buckets else 0

    # Trailing weekly buckets (Mon 00:00 UTC) that fall within retention.
    monday = (now - dt.timedelta(days=now.weekday())).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    weekly = []
    for i in range(WEEKS, 0, -1):
        start = monday - dt.timedelta(weeks=i)
        end = min(start + dt.timedelta(weeks=1), now)
        if end <= window_start:
            continue
        wb = aggregate(api_key, app_key, site, max(start, window_start), end, group_by_team=False)
        weekly.append({"week": start.strftime("%b %d"), "clients": compute_value(wb[0]) if wb else 0})

    # Sanity gate: never overwrite with empty data.
    if active_clients <= 0 or not teams:
        sys.stderr.write(
            f"Refusing to write: active_clients={active_clients} teams={len(teams)}\n"
        )
        return 1

    live = {
        "period": now.strftime("%b %Y"),
        "periodRange": f"{window_start.date().isoformat()} - {now.date().isoformat()}",
        "activeClients": active_clients,
        "activeTeams": len(teams),
        "teams": teams,
        "weeklyActiveClients": weekly,
    }
    with open(OUT_PATH, "w") as f:
        f.write(json.dumps(live, indent=2) + "\n")

    sys.stderr.write(
        f"Wrote {OUT_PATH}: activeClients={active_clients} activeTeams={len(teams)} "
        f"weeks={len(weekly)}\n"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
