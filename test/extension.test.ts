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
  eventHandlers: Map<string, (event: unknown, ctx: unknown) => unknown>;
}

function createPi(captured: Captured): ExtensionAPI {
  return {
    on: (eventName: string, handler: (event: unknown, ctx: unknown) => unknown) => {
      captured.eventHandlers.set(eventName, handler);
    },
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

function createCaptured(): Captured {
  return { entries: [], eventHandlers: new Map() };
}

void test("registers expected command and tool", () => {
  const captured = createCaptured();
  extension(createPi(captured));

  assert.equal(captured.commandName, EXTENSION_COMMAND);
  assert.equal(captured.toolName, TOOL_NAME);
});

void test("injects ask_user policy for github-copilot", () => {
  const captured = createCaptured();
  extension(createPi(captured));

  const hook = captured.eventHandlers.get("before_agent_start");
  assert.ok(hook);

  const result = hook?.(
    { systemPrompt: "base prompt" },
    { model: { provider: "github-copilot" } }
  ) as { systemPrompt: string };

  assert.match(result.systemPrompt, /use the ask_user tool/i);
});

void test("interactive input during active run is queued instead of sent", async () => {
  const captured = createCaptured();
  extension(createPi(captured));

  const inputHook = captured.eventHandlers.get("input");
  assert.ok(inputHook);
  assert.ok(captured.toolExecute);

  const inputResult = inputHook?.(
    { text: "please continue with tests", source: "interactive" },
    createInputCtx({ idle: false })
  ) as { action: string };

  assert.equal(inputResult.action, "handled");

  const toolResult = (await captured.toolExecute?.(
    "call-1",
    {},
    undefined,
    undefined,
    createToolCtx()
  )) as { content: { type: string; text: string }[]; details: { source: string } };

  assert.equal(toolResult.content[0]?.text, "please continue with tests");
  assert.equal(toolResult.details.source, "queue");
});

void test("does not inject ask_user policy for non-copilot provider", () => {
  const captured = createCaptured();
  extension(createPi(captured));

  const hook = captured.eventHandlers.get("before_agent_start");
  assert.ok(hook);

  const result = hook?.({ systemPrompt: "base prompt" }, { model: { provider: "anthropic" } });

  assert.equal(result, undefined);
});

void test("queued message is returned before fallback", async () => {
  const captured = createCaptured();
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
  const captured = createCaptured();
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
  const captured = createCaptured();
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
  const captured = createCaptured();
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
  const captured = createCaptured();
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

function createInputCtx(options: { idle: boolean; provider?: string }) {
  return {
    hasUI: false,
    model: { provider: options.provider ?? "github-copilot" },
    isIdle: () => options.idle,
    ui: {
      notify: () => undefined,
      setStatus: () => undefined,
    },
  };
}
