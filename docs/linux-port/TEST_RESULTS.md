# Test Results

Environment: Arch Linux WSL2, x86_64, Node v24.22.0, npm.
- `npm ci`: PASS
- `npm run build`: PASS
- `npm run typecheck`: PASS
- `npm test`: PASS (4 cases)
  - platform: open command Linux = xdg-open
  - platform: Linux clipboard candidates wl-paste/wl-copy
  - platform: system shell path exists
  - integration: real server starts and serves HTML
- `node server/index.js`: PASS startup
- `runTool open URL`: PASS
- `runTool clipboard` without Linux utility: clear BLOCKED-style error (expected)

Remaining blocked: notify-send and clipboard utilities not installed on host; model/model-stack E2E unavailable.
