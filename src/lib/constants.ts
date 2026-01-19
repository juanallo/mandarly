// Task Status enum
export const TaskStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PAUSED: 'paused',
  DISCONNECTED: 'disconnected',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

// Environment Type enum
export const EnvironmentType = {
  LOCAL: 'local',
  WORKTREE: 'worktree',
  REMOTE: 'remote',
} as const;

export type EnvironmentType = typeof EnvironmentType[keyof typeof EnvironmentType];

// AI Vendor enum
export const AIVendor = {
  CLAUDE: 'claude',
  CHATGPT: 'chatgpt',
  GEMINI: 'gemini',
  CURSOR: 'cursor',
  COPILOT: 'copilot',
  WINDSURF: 'windsurf',
  CODY: 'cody',
  AIDER: 'aider',
  OTHER: 'other',
} as const;

export type AIVendor = typeof AIVendor[keyof typeof AIVendor];

// AI Vendor display names
export const AIVendorNames: Record<AIVendor, string> = {
  [AIVendor.CLAUDE]: 'Claude',
  [AIVendor.CHATGPT]: 'ChatGPT',
  [AIVendor.GEMINI]: 'Gemini',
  [AIVendor.CURSOR]: 'Cursor',
  [AIVendor.COPILOT]: 'Copilot',
  [AIVendor.WINDSURF]: 'Windsurf',
  [AIVendor.CODY]: 'Cody',
  [AIVendor.AIDER]: 'Aider',
  [AIVendor.OTHER]: 'Other',
};

// Status colors for UI
export const StatusColors: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'bg-gray-100 text-gray-800',
  [TaskStatus.RUNNING]: 'bg-blue-100 text-blue-800',
  [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [TaskStatus.FAILED]: 'bg-red-100 text-red-800',
  [TaskStatus.PAUSED]: 'bg-yellow-100 text-yellow-800',
  [TaskStatus.DISCONNECTED]: 'bg-orange-100 text-orange-800',
};
