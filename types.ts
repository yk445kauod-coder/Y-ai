export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  images?: string[];
  files?: FileAttachment[];
  searchGrounding?: GroundingSource[];
  isThinking?: boolean;
  thinkingContent?: string;
  isError?: boolean;
  isStreaming?: boolean;
}

export interface PersonaConfig {
  aiName: string;
  personality: string;
  memoryBrief: string;
  preferredStyle: string;
  shortMemoryLimit: number;
  longTermMemory: string;
}

export interface FileAttachment {
  name: string;
  type: string;
  data: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export enum ToolMode {
  Search = 'search',
  Reasoning = 'reasoning',
  Image = 'image',
  Coding = 'coding',
  Assistant = 'assistant',
  Vision = 'vision'
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  time: string; // Format: "HH:mm"
  isRecurring: boolean;
  lastNotifiedDate?: string; // To prevent multiple notifications on same day
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  activeTools: ToolMode[];
}

export type NodeType = 'trigger' | 'ai_agent' | 'ai_chain' | 'image_gen' | 'google_search' | 'http_request' | 'code_exec' | 'memory' | 'output';

export interface Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    config: any;
  };
}

export interface Connection {
  id: string;
  source: string;
  target: string;
}

export interface AgentFlow {
  id: string;
  name: string;
  nodes: Node[];
  connections: Connection[];
}
