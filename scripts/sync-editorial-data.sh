#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_BASE="/Users/leandrobosaipo/.openclaw/workspace-openrouter-free/projects/codigo5-manutencao/automation/editorial-monitor/public-data"
DST_BASE="$ROOT/public/data"

mkdir -p "$DST_BASE"
cp "$SRC_BASE/latest.json" "$DST_BASE/latest.json"
[[ -f "$SRC_BASE/latest-hourly.json" ]] && cp "$SRC_BASE/latest-hourly.json" "$DST_BASE/latest-hourly.json"
[[ -f "$SRC_BASE/latest-day14.json" ]] && cp "$SRC_BASE/latest-day14.json" "$DST_BASE/latest-day14.json"
[[ -f "$SRC_BASE/latest-day20.json" ]] && cp "$SRC_BASE/latest-day20.json" "$DST_BASE/latest-day20.json"
[[ -f "$SRC_BASE/latest-yesterday.json" ]] && cp "$SRC_BASE/latest-yesterday.json" "$DST_BASE/latest-yesterday.json"

echo "Dados sincronizados em $DST_BASE"
