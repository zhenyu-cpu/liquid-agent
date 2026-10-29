# Linux Port Progress

## Current Stage
Stage 1 baseline + platform integration adapters

## Completed
- Architecture/build baseline on Arch Linux WSL2 x86_64.
- `server/tools.js`: Linux clipboard/open/notifications adapters.
- `install.sh`, `scripts/start.sh`: Linux data/node/install paths.
- `server/guardian.js`: Linux `xdg-open` descriptor.
- Docs: PROJECT_ASSESSMENT, FEATURE_MATRIX, PROGRESS.

## Verification
- npm ci PASS
- npm run build PASS
- npm run typecheck PASS
- node --check server/tools.js/guardian.js PASS
- node server/index.js startup PASS
- runTool open URL PASS
- runTool clipboard mocked with wl-clipboard PASS
- runTool set_clipboard mocked with wl-clipboard PASS

## Blocked
- Real notify-send/wl-clipboard/xclip absent on host; cannot perform real utility E2E.

## Update 2026-10-30 (continued)
- Added `server/platform.js` abstraction and unit tests (`npm test`: 3 PASS).
- Added optional Linux desktop entry creation in `install.sh`.
- Added GitHub Actions Linux + macOS CI workflow.
- `npm run build`, `npm run typecheck`, `npm test` all PASS.
