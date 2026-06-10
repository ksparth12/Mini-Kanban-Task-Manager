#!/usr/bin/env bash
set -euo pipefail

BACKEND_CMD=(npm --prefix backend run dev)
FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"
FRONTEND_PORT="${FRONTEND_PORT:-4173}"
FRONTEND_CMD=(npm --prefix frontend run dev -- --host "$FRONTEND_HOST" --port "$FRONTEND_PORT")

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [[ -n "${FRONTEND_PID:-}" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "Starting backend..."
"${BACKEND_CMD[@]}" > /tmp/mini-kanban-backend.log 2>&1 &
BACKEND_PID=$!

echo "Starting frontend on http://$FRONTEND_HOST:$FRONTEND_PORT ..."
"${FRONTEND_CMD[@]}" > /tmp/mini-kanban-frontend.log 2>&1 &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

echo "\nLogs:"
echo "  /tmp/mini-kanban-backend.log"
echo "  /tmp/mini-kanban-frontend.log"
echo "\nPress Ctrl+C to stop both."

wait "$BACKEND_PID" "$FRONTEND_PID"
