// Settings, the one-click downloads, and the first-run setup screen.

import { useState } from "react";
import {
  AudioLines,
  Bell,
  Brain,
  Check,
  Cpu,
  Download,
  Eye,
  FolderOpen,
  Globe,
  Monitor,
  Moon,
  Play,
  RotateCcw,
  Shield,
  SlidersHorizontal,
  Square,
  Sun,
  Trash2,
  User,
  Volume2,
} from "lucide-react";
import { api } from "../api";
import { speak, stopSpeaking } from "../audio/speak";
import { errorToast, toast, useStore } from "../store";
import type { Part, Settings as SettingsType } from "../types";
import { cx } from "../util";
import { t as translate } from "../i18n";
import { MODES, modeNote } from "./Composer";
import { Logo } from "./Sidebar";
import { Modal, Progress, Segmented, StatusDot, Toggle } from "./ui";

const patch = (body: Partial<SettingsType>) => api("PATCH", "/api/settings", body).catch(errorToast);

const PART_ICONS: Record<Part["id"], JSX.Element> = {
  engine: <Cpu size={18} />,
  small: <Brain size={18} />,
  omni: <Eye size={18} />,
  guardian: <Shield size={18} />,
  browser: <Globe size={18} />,
};

export function SettingsModal() {
  const tab = useStore((s) => s.settingsOpen);
  const settings = useStore((s) => s.settings);
  if (!tab || !settings) return null;
  const lang = settings.language ?? "en";
  const close = () => useStore.setState({ settingsOpen: null });
  const TABS = [
    { id: "general", label: translate("settings.tab.general", lang), icon: <User size={15} /> },
    { id: "voice", label: translate("settings.tab.voice", lang), icon: <AudioLines size={15} /> },
    { id: "safety", label: translate("settings.tab.safety", lang), icon: <Shield size={15} /> },
    { id: "downloads", label: translate("settings.tab.downloads", lang), icon: <Download size={15} /> },
    { id: "advanced", label: translate("settings.tab.advanced", lang), icon: <SlidersHorizontal size={15} /> },
  ];

  return (
    <Modal title={translate("settings.title", lang)} onClose={close} wide>
      <div className="settings">
        <nav className="settings-nav">
          {TABS.map((item) => (
            <button key={item.id} className={cx("nav-row", tab === item.id && "active")} onClick={() => useStore.setState({ settingsOpen: item.id })}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="settings-body">
          {tab === "general" && <General settings={settings} />}
          {tab === "voice" && <Voice settings={settings} />}
          {tab === "safety" && <Safety settings={settings} />}
          {tab === "downloads" && <Downloads />}
          {tab === "advanced" && <Advanced settings={settings} />}
        </div>
      </div>
    </Modal>
  );
}

function Row({ title, detail, children }: { title: string; detail?: string; children: React.ReactNode }) {
  return (
    <div className="setting">
      <div className="setting-text">
        <div className="setting-title">{title}</div>
        {detail && <div className="setting-detail">{detail}</div>}
      </div>
      <div className="setting-control">{children}</div>
    </div>
  );
}

/** A text box that saves when you leave it. */
function SavedInput({ value, onSave, placeholder, type = "text", width }: { value: string; onSave: (v: string) => void; placeholder?: string; type?: string; width?: number }) {
  const [text, setText] = useState(value);
  return (
    <input
      className="input"
      type={type}
      value={text}
      placeholder={placeholder}
      style={width ? { width } : undefined}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => text !== value && onSave(text)}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
    />
  );
}

function General({ settings }: { settings: SettingsType }) {
  const lang = settings.language ?? "en";
  const intro = (key: string) => translate(key, lang);
  return (
    <>
      <h3>{intro("general.title")}</h3>
      <Row title={intro("general.name")} detail={intro("general.name.detail")}>
        <SavedInput value={settings.userName} placeholder={intro("general.name.placeholder")} onSave={(userName) => patch({ userName })} />
      </Row>
      <Row title={intro("general.language")} detail={intro("general.language.detail")}>
        <select className="input" value={settings.language} onChange={(e) => patch({ language: e.target.value as SettingsType["language"] })}>
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </Row>
      <Row title={intro("general.personality")} detail={intro("general.personality.detail")}>
        <select className="input" value={settings.personality} onChange={(e) => patch({ personality: e.target.value as SettingsType["personality"] })}>
          <option value="friendly">{intro("general.personality.friendly")}</option>
          <option value="concise">{intro("general.personality.concise")}</option>
          <option value="playful">{intro("general.personality.playful")}</option>
          <option value="professional">{intro("general.personality.professional")}</option>
        </select>
      </Row>
      <Row title={intro("general.think")} detail={intro("general.think.detail")}>
        <Toggle checked={settings.reasoning} onChange={(reasoning) => patch({ reasoning })} />
      </Row>
      <Row title={intro("general.appearance")}>
        <Segmented
          size="sm"
          value={settings.theme}
          onChange={(theme) => patch({ theme })}
          options={[
            { value: "system", label: "Auto", icon: <Monitor size={13} /> },
            { value: "light", label: "Light", icon: <Sun size={13} /> },
            { value: "dark", label: "Dark", icon: <Moon size={13} /> },
          ]}
        />
      </Row>
      <Row title={intro("general.home")} detail={intro("general.home.detail")}>
        <SavedInput value={settings.workspace} placeholder="~" onSave={(workspace) => patch({ workspace })} width={200} />
      </Row>
      <Row title={intro("general.notifications")} detail={intro("general.notifications.detail")}>
        <NotificationButton />
      </Row>
    </>
  );
}

function NotificationButton() {
  const [state, setState] = useState(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  if (state === "granted")
    return (
      <span className="pill pill-accent">
        <Check size={12} /> On
      </span>
    );
  if (state === "unsupported" || state === "denied") return <span className="muted small">{state === "denied" ? "Blocked in your browser settings" : "Not available"}</span>;
  return (
    <button className="btn" onClick={() => Notification.requestPermission().then(setState)}>
      <Bell size={14} /> Turn on
    </button>
  );
}

function Voice({ settings }: { settings: SettingsType }) {
  const speaking = useStore((s) => s.speaking === "preview");
  return (
    <>
      <h3>Voice</h3>
      <p className="muted">Voice chat, dictation and reading aloud all use LFM3 Omni 2B on this Mac.</p>
      <Row title="Voice">
        <Segmented
          size="sm"
          value={settings.voice}
          onChange={(voice) => patch({ voice })}
          options={[
            { value: "female", label: "Voice A" },
            { value: "male", label: "Voice B" },
          ]}
        />
        <button className="btn" onClick={() => (speaking ? stopSpeaking() : speak("preview", "Hi! This is how I sound. I run right here on your Mac."))}>
          {speaking ? <Square size={12} fill="currentColor" /> : <Volume2 size={14} />} {speaking ? "Stop" : "Hear it"}
        </button>
      </Row>
      <Row title="Read answers aloud" detail="Speaks every new answer in text chats.">
        <Toggle checked={settings.speakReplies} onChange={(speakReplies) => patch({ speakReplies })} />
      </Row>
    </>
  );
}

function Safety({ settings }: { settings: SettingsType }) {
  const guardian = useStore((s) => s.parts.find((p) => p.id === "guardian"));
  const wanted = useStore((s) => s.guardianWanted);
  return (
    <>
      <h3>Safety</h3>
      <p className="muted">Choose how much Liquid Agent can do without asking. Reading things is always fine; changes to your Mac depend on this.</p>
      <div className="mode-cards">
        {MODES.map((m) => (
          <button key={m.value} className={cx("mode-card", settings.approvalMode === m.value && "selected")} onClick={() => patch({ approvalMode: m.value })}>
            <span className="mode-icon">{m.icon}</span>
            <span className="mode-title">{m.label}</span>
            <span className="mode-detail">{m.detail}</span>
            {m.value === "approveForMe" && modeNote(guardian, wanted) && <span className="mode-need">{modeNote(guardian, wanted)}</span>}
            {settings.approvalMode === m.value && <Check size={15} className="mode-check" />}
          </button>
        ))}
      </div>
      {guardian && (wanted || (settings.approvalMode === "approveForMe" && guardian.status !== "running")) && (
        <div className="parts">
          <PartRow part={guardian} />
        </div>
      )}
      {settings.approvalMode === "approveForMe" && guardian?.status !== "running" && !wanted && (
        <div className="notice">Auto 200M isn't running right now, so every action asks you until it's back.</div>
      )}
      <Row title="How careful Auto 200M is" detail={`Asks you when it's less than ${Math.round((1 - settings.guardianThreshold) * 100)}% sure an action is safe.`}>
        <input
          type="range"
          min={0.1}
          max={0.9}
          step={0.05}
          value={1 - settings.guardianThreshold}
          onChange={(e) => patch({ guardianThreshold: Math.round((1 - Number(e.target.value)) * 100) / 100 })}
        />
      </Row>
      <p className="muted small">Commands that could wipe data, like deleting everything or shutting down, always ask, in every mode.</p>
    </>
  );
}

export function PartRow({ part }: { part: Part }) {
  const busy = useStore((s) => s.busy);
  const act = (path: string, body?: unknown) => api("POST", path, body).catch(errorToast);
  const changing = busy || part.status === "installing" || part.status === "starting";
  const tone = part.status === "running" ? "ok" : part.status === "failed" ? "bad" : part.status === "installing" || part.status === "starting" ? "busy" : "off";
  const label = {
    missing: "Not downloaded",
    installing: part.text || "Downloading…",
    installed: "Downloaded",
    starting: "Starting…",
    running: "Ready",
    failed: part.error || "Something went wrong",
  }[part.status];
  const note = part.queued && part.status !== "installing" ? "Waiting its turn…" : part.live ? `${label} · the current size keeps working meanwhile` : label;

  return (
    <div className={cx("part", `status-${part.status}`)}>
      <span className="part-icon">{PART_ICONS[part.id]}</span>
      <div className="part-text">
        <div className="part-title">
          {part.title} <span className="muted small">· {part.size}</span>
        </div>
        <div className="part-detail">{part.detail}</div>
        {part.quants && (
          <label className="part-size">
            <span>Size</span>
            <select
              className="input"
              value={part.quant}
              disabled={changing}
              title={changing ? "Wait for the current download to finish" : undefined}
              onChange={(e) => patch({ [`${part.id}Quant`]: e.target.value } as Partial<SettingsType>)}
            >
              {part.quants.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label} · {q.size}
                  {q.note ? ` · ${q.note}` : ""}
                  {q.onDisk ? " ✓" : ""}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className={cx("part-status", part.status === "failed" && "bad")}>
          <StatusDot tone={part.queued ? "busy" : tone} /> {note}
        </div>
        {part.status === "installing" && <Progress value={part.fraction} />}
      </div>
      <div className="part-actions">
        {part.status === "missing" && !part.queued && (
          <button className="btn primary" onClick={() => act("/api/parts/install", { ids: part.id === "engine" ? ["engine"] : ["engine", part.id] })}>
            <Download size={14} /> Get
          </button>
        )}
        {part.status === "failed" && !part.queued && (
          <button className="btn primary" onClick={() => act("/api/parts/install", { ids: [part.id] })}>
            <RotateCcw size={14} /> Try again
          </button>
        )}
        {part.status === "installed" && part.id !== "engine" && (
          <button className="btn" onClick={() => act(`/api/parts/${part.id}/start`)}>
            <Play size={13} /> Start
          </button>
        )}
        {(part.status === "running" || part.status === "starting") && part.id !== "engine" && (
          <button className="btn" onClick={() => act(`/api/parts/${part.id}/stop`)}>
            <Square size={11} fill="currentColor" /> Stop
          </button>
        )}
        {part.status === "installing" && <button className="btn" onClick={() => act("/api/parts/cancel")}>Cancel</button>}
        {(part.status === "installed" || part.status === "running" || part.status === "failed") && (
          <button
            className="icon-btn"
            title="Remove download"
            aria-label="Remove download"
            onClick={() => confirm(`Remove ${part.title}? You can download it again later.`) && act(`/api/parts/${part.id}/remove`)}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function Downloads() {
  const parts = useStore((s) => s.parts);
  const busy = useStore((s) => s.busy);
  const missing = parts.filter((p) => p.status === "missing" || p.status === "failed").map((p) => p.id);
  return (
    <>
      <div className="h3-row">
        <h3>Downloads</h3>
        {missing.length > 0 && (
          <button className="btn primary" disabled={busy} onClick={() => api("POST", "/api/parts/install", { ids: ["engine", ...missing.filter((id) => id !== "engine")] }).catch(errorToast)}>
            <Download size={14} /> Get everything
          </button>
        )}
      </div>
      <p className="muted">Everything runs on this Mac. Liquid Agent picks the right model for each message by itself.</p>
      <div className="parts">
        {parts.map((p) => (
          <PartRow key={p.id} part={p} />
        ))}
      </div>
      <button className="btn" onClick={() => api("POST", "/api/reveal").catch(errorToast)}>
        <FolderOpen size={14} /> Show files in Finder
      </button>
    </>
  );
}

function Advanced({ settings }: { settings: SettingsType }) {
  const num = (key: keyof SettingsType, min: number, max: number) => (v: string) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n < min || n > max) return toast(`Pick a number from ${min} to ${max}.`, "error");
    patch({ [key]: n } as Partial<SettingsType>);
  };
  return (
    <>
      <h3>Advanced</h3>
      <Row title="Memory for each chat" detail="How many tokens of the conversation go to the model. Smaller is faster.">
        <SavedInput type="number" width={110} value={String(settings.contextBudget)} onSave={num("contextBudget", 1000, 14000)} />
      </Row>
      <Row title="Tool output kept" detail="Characters of each tool result the model sees.">
        <SavedInput type="number" width={110} value={String(settings.toolOutputLimit)} onSave={num("toolOutputLimit", 500, 20000)} />
      </Row>
      <Row title="Most steps per answer">
        <SavedInput type="number" width={110} value={String(settings.maxSteps)} onSave={num("maxSteps", 1, 20)} />
      </Row>
      <Row title="Creativity" detail={`Temperature ${settings.temperature.toFixed(2)} for LFM3 1.7B.`}>
        <input type="range" min={0} max={1} step={0.05} value={settings.temperature} onChange={(e) => patch({ temperature: Number(e.target.value) })} />
      </Row>
      <Row title="Delete all chats" detail="Removes every conversation and the files you added. Memory stays.">
        <button className="btn danger-text" onClick={() => confirm("Delete every chat? This can't be undone.") && api("DELETE", "/api/chats").then(() => (location.hash = "#/"), errorToast)}>
          <Trash2 size={14} /> Delete all
        </button>
      </Row>
    </>
  );
}

// ---- First run ----

const SIZES = [
  { id: "small", label: "Smaller", detail: "Fastest, least space", small: "QAD-Q4_0", omni: "Q4_0" },
  { id: "balanced", label: "Balanced", detail: "Good answers, quick", small: "Q4_K_M", omni: "Q4_K_M" },
  { id: "best", label: "Best", detail: "Best answers, needs more memory", small: "Q8_0", omni: "Q8_0" },
] as const;
type SizeId = (typeof SIZES)[number]["id"];

const PLANS = {
  all: ["engine", "small", "omni", "guardian", "browser"],
  text: ["engine", "small"],
} as const;

const gbText = (bytes: number) => `${(bytes / 1e9).toFixed(1)} GB`;

/** Bytes a plan downloads with a given size, from what the server says each part weighs. */
function planBytes(parts: Part[], ids: readonly Part["id"][], size: (typeof SIZES)[number]) {
  return ids.reduce((sum, id) => {
    const p = parts.find((x) => x.id === id);
    if (!p || p.status === "installed" || p.status === "running") return sum;
    if (!p.quants) return sum + p.bytes;
    const current = p.quants.find((q) => q.id === p.quant);
    const chosen = p.quants.find((q) => q.id === (id === "small" ? size.small : size.omni));
    // Omni's bytes include its audio and vision projector on top of the weights.
    return sum + (chosen?.bytes ?? 0) + (p.bytes - (current?.bytes ?? 0));
  }, 0);
}

export function Setup() {
  const { parts, busy, settings, machine } = useStore();
  const memoryGB = machine.memoryGB;
  const suggested: SizeId = memoryGB >= 16 ? "best" : memoryGB > 0 && memoryGB < 8 ? "small" : "balanced";
  const [plan, setPlan] = useState<keyof typeof PLANS>("all");
  const [sizeId, setSizeId] = useState<SizeId>(suggested);
  const [name, setName] = useState(settings?.userName ?? "");
  const size = SIZES.find((x) => x.id === sizeId)!;
  const installing = busy || parts.some((p) => p.status === "installing");
  const failed = parts.filter((p) => p.status === "failed");

  const go = async () => {
    try {
      await api("PATCH", "/api/settings", { userName: name.trim(), smallQuant: size.small, omniQuant: size.omni });
      await api("POST", "/api/parts/install", { ids: PLANS[plan] });
      // Approve for Me turns itself on once Auto 200M is ready.
      if (plan === "all") await api("PATCH", "/api/settings", { approvalMode: "approveForMe" });
    } catch (e) {
      errorToast(e);
    }
  };

  if (installing || failed.length) {
    const shown = parts.filter((p) => p.status !== "missing" || p.queued);
    const total = shown.reduce((sum, p) => sum + p.bytes, 0);
    const done = shown.reduce(
      (sum, p) => sum + (p.status === "installing" ? (p.fraction ?? 0) * p.bytes : ["installed", "starting", "running"].includes(p.status) ? p.bytes : 0),
      0,
    );
    const current = shown.find((p) => p.status === "installing");
    return (
      <div className="setup">
        <div className="setup-card">
          <Logo size={44} />
          <h1>{installing ? "Setting things up" : "Almost there"}</h1>
          {installing ? (
            <>
              <p className="muted">
                {current ? `Getting ${current.title.toLowerCase()}. ` : ""}
                You can leave this open and come back. Chat opens as soon as the first model is ready.
              </p>
              <div className="setup-progress">
                <Progress value={total ? done / total : undefined} />
                <span className="muted small">
                  {gbText(done)} of {gbText(total)}
                </span>
              </div>
            </>
          ) : (
            <p className="muted">Something didn't download. Check your internet and try again.</p>
          )}
          <div className="parts compact">
            {shown.map((p) => (
              <PartRow key={p.id} part={p} />
            ))}
          </div>
          {installing ? (
            <button className="btn" onClick={() => api("POST", "/api/parts/cancel").catch(errorToast)}>
              Pause
            </button>
          ) : (
            <button className="btn primary big" onClick={() => api("POST", "/api/parts/install", { ids: failed.map((p) => p.id) }).catch(errorToast)}>
              <RotateCcw size={16} /> Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="setup">
      <div className="setup-card">
        <Logo size={52} />
        <h1>Welcome to Liquid Agent</h1>
        <p className="muted">A private assistant that lives on your Mac. Download it once and it works offline. Nothing you say leaves this computer.</p>
        <label className="field">
          <span>What should I call you?</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name (optional)" />
        </label>
        <div className="plan-cards">
          <button className={cx("plan-card", plan === "all" && "selected")} onClick={() => setPlan("all")}>
            <span className="plan-head">
              <strong>Everything</strong>
              <span className="pill pill-accent">Recommended</span>
            </span>
            <span className="plan-size">About {gbText(planBytes(parts, PLANS.all, size))}</span>
            <ul>
              <li>Chat, writing and actions on your Mac</li>
              <li>Voice chat, pictures and your screen</li>
              <li>Auto 200M, which approves safe actions for you</li>
              <li>Clicks around websites for you</li>
            </ul>
          </button>
          <button className={cx("plan-card", plan === "text" && "selected")} onClick={() => setPlan("text")}>
            <span className="plan-head">
              <strong>Just chat</strong>
            </span>
            <span className="plan-size">About {gbText(planBytes(parts, PLANS.text, size))}</span>
            <ul>
              <li>Chat, writing and actions on your Mac</li>
              <li>Add voice and the rest later in Settings</li>
            </ul>
          </button>
        </div>
        <div className="size-pick">
          <div className="size-pick-head">
            <span>Model size</span>
            {memoryGB > 0 && <span className="muted small">This Mac has {memoryGB} GB of memory</span>}
          </div>
          <div className="size-options">
            {SIZES.map((x) => (
              <button key={x.id} className={cx("size-option", sizeId === x.id && "selected")} onClick={() => setSizeId(x.id)}>
                <span className="size-label">
                  {x.label}
                  {x.id === suggested && <span className="pill pill-accent">For this Mac</span>}
                </span>
                <span className="size-detail">{x.detail}</span>
              </button>
            ))}
          </div>
          <span className="muted small">You can change this later in Settings → Downloads.</span>
        </div>
        <button className="btn primary big wide" onClick={go}>
          <Download size={17} /> Download and set up
        </button>
        <p className="muted small">Downloads come from Hugging Face, GitHub and the Python and npm package sites. After that, no internet is needed except for web searches.</p>
      </div>
    </div>
  );
}
