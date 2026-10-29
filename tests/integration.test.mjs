import { spawn } from "node:child_process";
import { strict as assert } from "node:assert";
import { test } from "node:test";

test("server starts and serves the web UI", async (t) => {
  const port = 18170;
  const child = spawn(process.execPath, ["server/index.js"], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, LIQUID_AGENT_PORT: String(port) },
  });
  t.after(() => child.kill("SIGTERM"));
  await new Promise((resolve) => {
    child.stdout.on("data", (d) => {
      if (String(d).includes("Liquid Agent is running")) resolve();
    });
  });
  const response = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /<html/i);
});
