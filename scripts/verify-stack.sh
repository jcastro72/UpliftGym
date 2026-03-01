#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:${PORT:-5001}}"

echo "Checking backend health..."
curl -fsS "$BASE_URL/health" | cat

echo "\nChecking database health through backend..."
curl -fsS "$BASE_URL/db-health" | cat

echo "\nChecking database test query..."
curl -fsS "$BASE_URL/test-db" | cat

echo "\nAll checks passed for $BASE_URL"
