// Small platform abstraction so macOS- and Linux-specific behaviour lives
// in one place and can be tested independently of the tool code.

import fs from "node:fs";

export const isMac = process.platform === "darwin";
export const isLinux = process.platform === "linux";

export function openCommand() {
  return isMac ? "open" : "xdg-open";
}

export function clipboardReadCandidates() {
  return isMac
    ? [["pbpaste", []]]
    : [["wl-paste", []], ["xclip", ["-o", "-selection", "clipboard"]], ["xsel", ["--clipboard", "--output"]]];
}

export function clipboardWriteCandidates() {
  return isMac
    ? [["pbcopy", []]]
    : [["wl-copy", []], ["xclip", ["-selection", "clipboard"]], ["xsel", ["--clipboard", "--input"]]];
}

export function notificationCommand(text) {
  if (isMac) return { cmd: "osascript", args: ["-e", "on run argv", "-e", 'display notification (item 1 of argv) with title "Liquid Agent" sound name "Glass"', "-e", "end run", String(text ?? "")] };
  if (isLinux) return { cmd: "notify-send", args: ["Liquid Agent", String(text ?? "")] };
  return null;
}

export function systemShell() {
  for (const candidate of ["/bin/zsh", "/bin/bash", "/bin/sh"]) {
    try { if (fs.statSync(candidate).isFile()) return candidate; } catch {}
  }
  return "/bin/sh";
}

export function guardianOpenCommand() {
  return openCommand();
}

export function guardianClipboardCommand() {
  return clipboardWriteCandidates()[0][0];
}
