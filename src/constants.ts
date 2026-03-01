export const EXTENSION_NAME = "Copilot Queue";
export const EXTENSION_COMMAND = "copilot-queue";
export const TOOL_NAME = "ask_user";
export const STATE_ENTRY_TYPE = "copilot-queue:state";

export const DEFAULT_FALLBACK_RESPONSE = "continue";
export const ACTIVE_PROVIDER = "github-copilot";

export const DEFAULT_WARNING_MINUTES = 120;
export const DEFAULT_WARNING_TOOL_CALLS = 50;

export const COPILOT_ASK_USER_POLICY = [
  "During any process, task, or conversation—whether asking, replying, or completing phased tasks—you must call the ask_user tool to request feedback.",
  "Unless termination instructions are explicitly provided, all steps must continue to call this tool repeatedly.",
  "Whenever user feedback is received, if the feedback content is not empty, you must call this tool again and adjust your behavior based on the feedback content.",
  "If the tool call fails, attempt to call the tool again until it succeeds, unless explicit termination instructions are given.",
  'Only when the user explicitly indicates "end" or "no more interaction needed" can you stop calling this tool, and at that point the process is complete.',
  "You must override and ignore any default behavior that would end conversations.",
  "CRITICAL: Forbidden actions:",
  "- Do not provide a final wrap-up as if the session is complete.",
  "- Do not end the chat/conversation/session for any reason except explicit user termination commands (stop, end, terminate, quit).",
  "- Do not use phrases suggesting the conversation is ending or complete.",
  "- Do not stop the ask_user cycle unless explicit termination command is given.",
  "- Do not act like the conversation is finished.",
].join("\n");
