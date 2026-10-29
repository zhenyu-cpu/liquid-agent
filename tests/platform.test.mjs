import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { clipboardReadCandidates, clipboardWriteCandidates, openCommand, systemShell } from "../server/platform.js";

describe("platform helpers", () => {
  test("open command is xdg-open on Linux", () => {
    assert.equal(openCommand(), process.platform === "darwin" ? "open" : "xdg-open");
  });

  test("clipboard candidates are platform appropriate", () => {
    const readers = clipboardReadCandidates();
    const writers = clipboardWriteCandidates();
    assert.ok(Array.isArray(readers) && readers.length > 0);
    assert.ok(Array.isArray(writers) && writers.length > 0);
    if (process.platform === "linux") {
      assert.equal(readers[0][0], "wl-paste");
      assert.equal(writers[0][0], "wl-copy");
    }
  });

  test("system shell exists", () => {
    assert.match(systemShell(), /^\/(bin|usr\/bin)\//);
  });
});

import { runTool } from "../server/tools.js";

test("Linux clipboard reports missing helper clearly", async () => {
  if (process.platform !== "linux") return;
  const oldPath = process.env.PATH;
  process.env.PATH = "";
  try {
    const result = await runTool("clipboard", {}, {});
    assert.match(result.text, /No clipboard reader available|not found|ENOENT/i);
  } finally {
    process.env.PATH = oldPath;
  }
});
