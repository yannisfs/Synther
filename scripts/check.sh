#!/usr/bin/env bash
# Build the site, serve the production build, run verify-site.mjs, stop the server.
#
#   ./scripts/check.sh            -> all checks
#   ./scripts/check.sh V01 V09    -> selected checks
#
# Override if your project differs (see Phase 0 of the plan):
#   PORT=4173  BUILD_CMD="npm run build"  PREVIEW_CMD="npm run preview -- --port 4173 --strictPort"
set -u
PORT="${PORT:-4173}"
# This project is a Vite SPA whose production build is two steps: `vite build`
# writes the bundle, then `scripts/prerender.mjs` renders every static route
# to its own HTML file in dist/ (and writes dist/404.html). Without the
# prerender, dist/ has no /disciplines/<id>/index.html and no 404.html, so the
# route checks would fall through to the SPA shell and prove nothing.
# The prerender server gets its own port so it does not collide with the
# preview server this script starts on $PORT.
BUILD_CMD="${BUILD_CMD:-npm run build && PRERENDER_PORT=4174 npm run prerender}"
PREVIEW_CMD="${PREVIEW_CMD:-npm run preview -- --port $PORT --strictPort}"
LOG_DIR="${TMPDIR:-/tmp}"

echo "Building…"
if ! bash -c "$BUILD_CMD" >"$LOG_DIR/synther-build.log" 2>&1; then
  echo "BUILD FAILED – last lines of $LOG_DIR/synther-build.log:"
  tail -n 30 "$LOG_DIR/synther-build.log"
  exit 2
fi

echo "Starting preview server on port ${PORT}…"
bash -c "$PREVIEW_CMD" >"$LOG_DIR/synther-preview.log" 2>&1 &
PID=$!
cleanup() { pkill -P "$PID" 2>/dev/null; kill "$PID" 2>/dev/null; }
trap cleanup EXIT

for _ in $(seq 1 60); do
  curl -s -o /dev/null "http://localhost:$PORT/" && break
  sleep 0.5
done
if ! curl -s -o /dev/null "http://localhost:$PORT/"; then
  echo "PREVIEW SERVER DID NOT START – see $LOG_DIR/synther-preview.log"
  tail -n 30 "$LOG_DIR/synther-preview.log"
  exit 2
fi

BASE="http://localhost:$PORT" node scripts/verify-site.mjs "$@"
