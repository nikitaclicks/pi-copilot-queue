import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export const DEFAULT_ACTIVE_PROVIDERS = ["github-copilot"] as const;
export const DEFAULT_SHOW_STATUS_LINE = true;

interface CopilotQueueSettings {
  providers?: unknown;
  provider?: unknown;
  showStatusLine?: unknown;
}

interface PiSettingsFile {
  copilotQueue?: CopilotQueueSettings;
}

export interface ResolvedCopilotQueueSettings {
  providers: string[];
  showStatusLine: boolean;
}

export function resolveCopilotQueueSettings(
  cwd: string,
  homeDir: string = homedir()
): ResolvedCopilotQueueSettings {
  const globalSettings = readSettingsFile(join(homeDir, ".pi", "agent", "settings.json"));
  const projectSettings = readSettingsFile(join(cwd, ".pi", "settings.json"));

  return {
    providers: readProviderOverride(projectSettings) ??
      readProviderOverride(globalSettings) ?? [...DEFAULT_ACTIVE_PROVIDERS],
    showStatusLine:
      readShowStatusLineOverride(projectSettings) ??
      readShowStatusLineOverride(globalSettings) ??
      DEFAULT_SHOW_STATUS_LINE,
  };
}

export function resolveConfiguredProviders(cwd: string, homeDir: string = homedir()): string[] {
  return resolveCopilotQueueSettings(cwd, homeDir).providers;
}

export function resolveShowStatusLine(cwd: string, homeDir: string = homedir()): boolean {
  return resolveCopilotQueueSettings(cwd, homeDir).showStatusLine;
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

export function writeConfiguredProviders(
  cwd: string,
  providers: string[],
  scope: "project" | "global" = "project",
  homeDir: string = homedir()
): string {
  const path =
    scope === "global"
      ? join(homeDir, ".pi", "agent", "settings.json")
      : join(cwd, ".pi", "settings.json");
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

export function writeProjectConfiguredProviders(cwd: string, providers: string[]): string {
  return writeConfiguredProviders(cwd, providers, "project");
}

export function writeGlobalConfiguredProviders(
  cwd: string,
  providers: string[],
  homeDir: string = homedir()
): string {
  return writeConfiguredProviders(cwd, providers, "global", homeDir);
}

export function writeShowStatusLine(
  cwd: string,
  nextShowStatusLine: boolean,
  scope: "project" | "global" = "project",
  homeDir: string = homedir()
): string {
  const path =
    scope === "global"
      ? join(homeDir, ".pi", "agent", "settings.json")
      : join(cwd, ".pi", "settings.json");
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
