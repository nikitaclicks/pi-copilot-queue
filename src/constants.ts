export const EXTENSION_NAME = "Copilot Queue";
export const EXTENSION_COMMAND = "copilot-queue";
export const TOOL_NAME = "ask_user";
export const STATE_ENTRY_TYPE = "copilot-queue:state";

export const DEFAULT_FALLBACK_RESPONSE = "continue";
export const ACTIVE_PROVIDER = "github-copilot";

export const COPILOT_ASK_USER_POLICY = [
  "For this session, you must use the ask_user tool for iterative feedback loops.",
  "Before ending the task, call ask_user to request next instruction unless user explicitly says stop/end/no more interaction needed.",
  "When ask_user returns text, continue work using that text as the latest user guidance.",
].join("\n");
