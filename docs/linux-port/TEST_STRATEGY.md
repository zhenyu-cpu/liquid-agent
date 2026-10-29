# Test Strategy

- Static: npm run build, npm run typecheck, node --check.
- Integration: node server/index.js startup; runTool mocked branches.
- E2E: install + server + browser/manual; blocked by no native utility packages on this host.
