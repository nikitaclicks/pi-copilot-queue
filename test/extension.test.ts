import assert from "node:assert/strict";
import test from "node:test";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import extension from "../src/index.js";
import { EXTENSION_COMMAND, TOOL_NAME } from "../src/constants.js";

interface Captured {
  commandName?: string;
  commandHandler?: (args: string, ctx: unknown) => Promise<void>;
  toolName?: string;
  toolExecute?: (...args: unknown[]) => Promise<unknown>;
  entries: { type: "custom"; customType: string; data: unknown }[];
}

function createPi(captured: Captured): ExtensionAPI {
  return {
    on: () => undefined,
    appendEntry: (customType: string, data: unknown) => {
      captured.entries.push({ type: "custom", customType, data });
    },
    registerCommand: (
      name: string,
      def: { handler: (args: string, ctx: unknown) => Promise<void> }
    ) => {
      captured.commandName = name;
      captured.commandHandler = def.handler;
    },
    registerTool: (def: { name: string; execute: (...args: unknown[]) => Promise<unknown> }) => {
      captured.toolName = def.name;
      captured.toolExecute = def.execute;
    },
  } as unknown as ExtensionAPI;
}

void test("registers expected command and tool", () => {
  const captured: Captured = { entries: [] };
  extension(createPi(captured));

  assert.equal(captured.commandName, EXTENSION_COMMAND);
  assert.equal(captured.toolName, TOOL_NAME);
});

void test("queued message is returned before fallback", async () => {
  const captured: Captured = { entries: [] };
  extension(createPi(captured));

  assert.ok(captured.commandHandler);
  assert.ok(captured.toolExecute);

  await captured.commandHandler?.("add first queued reply", createCommandCtx());

  const result = (await captured.toolExecute?.(
    "call-1",
    {},
    undefined,
    undefined,
    createToolCtx()
  )) as { content: { type: string; text: string }[]; details: { source: string } };

  assert.equal(result.content[0]?.text, "first queued reply");
  assert.equal(result.details.source, "queue");
});

void test("autopilot cycles prompts when enabled", async () => {
  const captured: Captured = { entries: [] };
  extension(createPi(captured));

  assert.ok(captured.commandHandler);
  assert.ok(captured.toolExecute);

  await captured.commandHandler?.("autopilot add first auto", createCommandCtx());
  await captured.commandHandler?.("autopilot add second auto", createCommandCtx());
  await captured.commandHandler?.("autopilot on", createCommandCtx());

  const result1 = (await captured.toolExecute?.(
    "call-1",
    {},
    undefined,
    undefined,
    createToolCtx()
  )) as { content: { type: string; text: string }[]; details: { source: string } };

  const result2 = (await captured.toolExecute?.(
    "call-2",
    {},
    undefined,
    undefined,
    createToolCtx()
  )) as { content: { type: string; text: string }[]; details: { source: string } };

  const result3 = (await captured.toolExecute?.(
    "call-3",
    {},
    undefined,
    undefined,
    createToolCtx()
  )) as { content: { type: string; text: string }[]; details: { source: string } };

  assert.equal(result1.content[0]?.text, "first auto");
  assert.equal(result2.content[0]?.text, "second auto");
  assert.equal(result3.content[0]?.text, "first auto");
  assert.equal(result1.details.source, "autopilot");
});

void test("queue remains higher priority than autopilot", async () => {
  const captured: Captured = { entries: [] };
  extension(createPi(captured));

  assert.ok(captured.commandHandler);
  assert.ok(captured.toolExecute);

  await captured.commandHandler?.("autopilot add auto reply", createCommandCtx());
  await captured.commandHandler?.("autopilot on", createCommandCtx());
  await captured.commandHandler?.("add queued reply", createCommandCtx());

  const queuedResult = (await captured.toolExecute?.(
    "call-1",
    {},
    undefined,
    undefined,
    createToolCtx()
  )) as { content: { type: string; text: string }[]; details: { source: string } };

  const autopilotResult = (await captured.toolExecute?.(
    "call-2",
    {},
    undefined,
    undefined,
    createToolCtx()
  )) as { content: { type: string; text: string }[]; details: { source: string } };

  assert.equal(queuedResult.content[0]?.text, "queued reply");
  assert.equal(queuedResult.details.source, "queue");
  assert.equal(autopilotResult.content[0]?.text, "auto reply");
  assert.equal(autopilotResult.details.source, "autopilot");
});

void test("non-copilot providers bypass queue and autopilot", async () => {
  const captured: Captured = { entries: [] };
  extension(createPi(captured));

  assert.ok(captured.commandHandler);
  assert.ok(captured.toolExecute);

  await captured.commandHandler?.("add queued reply", createCommandCtx());
  await captured.commandHandler?.("autopilot add auto reply", createCommandCtx());
  await captured.commandHandler?.("autopilot on", createCommandCtx());

  const result = (await captured.toolExecute?.(
    "call-1",
    {},
    undefined,
    undefined,
    createToolCtx({ provider: "anthropic" })
  )) as { content: { type: string; text: string }[]; details: { source: string } };

  assert.equal(result.content[0]?.text, "continue");
  assert.equal(result.details.source, "fallback");
});

void test("uses fallback when queue is empty and no UI", async () => {
  const captured: Captured = { entries: [] };
  extension(createPi(captured));

  assert.ok(captured.toolExecute);

  const result = (await captured.toolExecute?.(
    "call-1",
    {},
    undefined,
    undefined,
    createToolCtx()
  )) as { content: { type: string; text: string }[]; details: { source: string } };

  assert.equal(result.content[0]?.text, "continue");
  assert.equal(result.details.source, "fallback");
});

function createCommandCtx() {
  return {
    hasUI: false,
    ui: {
      notify: () => undefined,
      setStatus: () => undefined,
    },
  };
}

function createToolCtx(options?: { provider?: string }) {
  return {
    hasUI: false,
    model: { provider: options?.provider ?? "github-copilot" },
    ui: {
      input: () => Promise.resolve(undefined),
      notify: () => undefined,
      setStatus: () => undefined,
    },
  };
}
