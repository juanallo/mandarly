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

// Status colors for UI (legacy - use STATUS_CONFIG instead)
export const StatusColors: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'bg-gray-100 text-gray-800',
  [TaskStatus.RUNNING]: 'bg-blue-100 text-blue-800',
  [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [TaskStatus.FAILED]: 'bg-red-100 text-red-800',
  [TaskStatus.PAUSED]: 'bg-yellow-100 text-yellow-800',
  [TaskStatus.DISCONNECTED]: 'bg-orange-100 text-orange-800',
};

// Status configuration for Square UI design
export interface StatusConfig {
  status: TaskStatus;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
}

export const STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  [TaskStatus.PENDING]: {
    status: TaskStatus.PENDING,
    label: 'Pending',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    iconName: 'Circle',
  },
  [TaskStatus.RUNNING]: {
    status: TaskStatus.RUNNING,
    label: 'In Progress',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    iconName: 'Play',
  },
  [TaskStatus.PAUSED]: {
    status: TaskStatus.PAUSED,
    label: 'Paused',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    iconName: 'Pause',
  },
  [TaskStatus.COMPLETED]: {
    status: TaskStatus.COMPLETED,
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    iconName: 'CheckCircle',
  },
  [TaskStatus.FAILED]: {
    status: TaskStatus.FAILED,
    label: 'Failed',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    iconName: 'XCircle',
  },
  [TaskStatus.DISCONNECTED]: {
    status: TaskStatus.DISCONNECTED,
    label: 'Disconnected',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    iconName: 'Unplug',
  },
};
