# Project Assessment (Linux Port Baseline)

- Stack: Node ESM server, React/Vite web UI, Python guardian, Node bridge.
- Main entry: server/index.js.
- Storage paths: core.js already supports XDG on Linux.
- Platform coupling found: tools open/clipboard/notifications; install/start scripts.
- Builds: npm ci/build/typecheck all PASS on Arch Linux WSL2.

## Verification
- `npm run build` PASS
- `npm run typecheck` PASS
- `node server/index.js` PASS (startup)
