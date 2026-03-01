export interface QueueState {
  queue: string[];
  fallbackResponse: string;
  autopilotEnabled: boolean;
  autopilotPrompts: string[];
  autopilotIndex: number;
  sessionStartedAt: number;
  toolCallCount: number;
  warningMinutes: number;
  warningToolCalls: number;
  warnedTime: boolean;
  warnedToolCalls: boolean;
}
