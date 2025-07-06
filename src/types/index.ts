
import { Address, Hash, Log } from 'viem';

export interface AgentConfig {
  name: string;
  flowRpcUrl: string;
  privateKey: string;
  openaiApiKey?: string;
  pollingInterval?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  logFile?: string;
}

export interface EventFilter {
  address?: Address | Address[];
  topics?: (Hash | Hash[] | null)[];
  fromBlock?: bigint;
  toBlock?: bigint;
}

export interface AgentEvent {
  id: string;
  type: 'transaction' | 'log' | 'block';
  timestamp: Date;
  data: any;
  processed: boolean;
}

export interface AgentMemory {
  id: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface AgentGoal {
  id: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface AgentTask {
  id: string;
  type: 'observe' | 'plan' | 'execute';
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface PlannerInput {
  goals: AgentGoal[];
  taskHistory: AgentTask[];
  currentContext: Record<string, any>;
  availableActions: string[];
}

export interface PlannerOutput {
  nextAction: string;
  reasoning: string;
  parameters: Record<string, any>;
  confidence: number;
}

export interface ExecutorResult {
  success: boolean;
  transactionHash?: Hash;
  result?: any;
  error?: string;
  gasUsed?: bigint;
}
