
// Core exports
export { Agent } from './core/agent';

// Module exports
export { Observer } from './modules/observer';
export { Executor } from './modules/executor';
export { Planner } from './modules/planner';
export { Knowledge } from './modules/knowledge';

// Utility exports
export { Config } from './config';
export { Logger } from './logger';

// Type exports
export * from './types';

// Re-export commonly used viem types for convenience
export type { Address, Hash, TransactionReceipt, Block, Log } from 'viem';

// Version info
export const VERSION = '0.1.0';

// Default export for convenience
export default Agent;
