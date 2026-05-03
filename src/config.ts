import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export const DEFAULT_ACTIVE_PROVIDERS = ["github-copilot"] as const;
export const DEFAULT_SHOW_STATUS_LINE = true;
export const DEFAULT_REMINDER_MODE = "system-prompt" as const;

export type CopilotQueueReminderMode = "system-prompt" | "history-append";

interface CopilotQueueSettings {
  providers?: unknown;
  provider?: unknown;
  showStatusLine?: unknown;
  reminderMode?: unknown;
}

interface PiSettingsFile {
  copilotQueue?: CopilotQueueSettings;
}

export interface ResolvedCopilotQueueSettings {
  providers: string[];
  showStatusLine: boolean;
  reminderMode: CopilotQueueReminderMode;
}

export function resolveCopilotQueueSettings(
  homeDir: string = homedir()
): ResolvedCopilotQueueSettings {
  const globalSettings = readSettingsFile(getGlobalSettingsPath(homeDir));

  return {
    providers: readProviderOverride(globalSettings) ?? [...DEFAULT_ACTIVE_PROVIDERS],
    showStatusLine: readShowStatusLineOverride(globalSettings) ?? DEFAULT_SHOW_STATUS_LINE,
    reminderMode: readReminderModeOverride(globalSettings) ?? DEFAULT_REMINDER_MODE,
  };
}

export function resolveConfiguredProviders(homeDir: string = homedir()): string[] {
  return resolveCopilotQueueSettings(homeDir).providers;
}

export function resolveShowStatusLine(homeDir: string = homedir()): boolean {
  return resolveCopilotQueueSettings(homeDir).showStatusLine;
}

export function resolveReminderMode(homeDir: string = homedir()): CopilotQueueReminderMode {
  return resolveCopilotQueueSettings(homeDir).reminderMode;
}

function readSettingsFile(path: string): PiSettingsFile | undefined {
  if (!existsSync(path)) {
    return undefined;
  }

  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return undefined;
    }
    return parsed as PiSettingsFile;
  } catch {
    return undefined;
  }
}

function readProviderOverride(settings: PiSettingsFile | undefined): string[] | undefined {
  const config = settings?.copilotQueue;
  if (!config || typeof config !== "object") {
    return undefined;
  }

  const providers = normalizeProviders(config.providers);
  if (providers !== undefined) {
    return providers;
  }

  const provider = normalizeProvider(config.provider);
  if (provider !== undefined) {
    return [provider];
  }

  return undefined;
}

function readShowStatusLineOverride(settings: PiSettingsFile | undefined): boolean | undefined {
  const config = settings?.copilotQueue;
  if (!config || typeof config !== "object") {
    return undefined;
  }

  if (typeof config.showStatusLine !== "boolean") {
    return undefined;
  }

  return config.showStatusLine;
}

function readReminderModeOverride(
  settings: PiSettingsFile | undefined
): CopilotQueueReminderMode | undefined {
  const config = settings?.copilotQueue;
  if (!config || typeof config !== "object") {
    return undefined;
  }

  return normalizeReminderMode(config.reminderMode);
}

export function writeGlobalConfiguredProviders(
  providers: string[],
  homeDir: string = homedir()
): string {
  const path = getGlobalSettingsPath(homeDir);
  const existing = readSettingsFile(path);
  const nextProviders = normalizeProviders(providers) ?? [];
  const nextQueue: CopilotQueueSettings =
    existing?.copilotQueue && typeof existing.copilotQueue === "object"
      ? { ...existing.copilotQueue }
      : {};

  delete nextQueue.provider;
  nextQueue.providers = nextProviders;

  const nextSettings: PiSettingsFile = existing ? { ...existing } : {};
  nextSettings.copilotQueue = nextQueue;

  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(nextSettings, null, 2)}\n`, "utf8");
  return path;
}

export function writeShowStatusLine(
  nextShowStatusLine: boolean,
  homeDir: string = homedir()
): string {
  const path = getGlobalSettingsPath(homeDir);
  const existing = readSettingsFile(path);
  const nextQueue: CopilotQueueSettings =
    existing?.copilotQueue && typeof existing.copilotQueue === "object"
      ? { ...existing.copilotQueue }
      : {};

  nextQueue.showStatusLine = nextShowStatusLine;

  const nextSettings: PiSettingsFile = existing ? { ...existing } : {};
  nextSettings.copilotQueue = nextQueue;

  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(nextSettings, null, 2)}\n`, "utf8");
  return path;
}

function getGlobalSettingsPath(homeDir: string): string {
  return join(homeDir, ".pi", "agent", "settings.json");
}

function normalizeProviders(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const providers = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return [...new Set(providers)];
}

function normalizeProvider(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed;
}

function normalizeReminderMode(value: unknown): CopilotQueueReminderMode | undefined {
  if (value !== "system-prompt" && value !== "history-append") {
    return undefined;
  }

  return value;
}
