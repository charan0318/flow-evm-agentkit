import { Hash, Address } from 'viem';
import { EventEmitter } from 'events';
import { AgentConfig, EventFilter } from '../types';
export declare class Observer extends EventEmitter {
    private client;
    private config;
    private logger;
    private isRunning;
    private eventFilters;
    private lastProcessedBlock;
    constructor(config: AgentConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    addEventFilter(id: string, filter: EventFilter): void;
    removeEventFilter(id: string): void;
    private pollForNewBlocks;
    private processBlockRange;
    private processBlock;
    private processTransaction;
    private processLogsForBlock;
    private emitAgentEvent;
    private sleep;
    subscribeToContract(address: Address, topics?: (Hash | Hash[] | null)[]): Promise<string>;
    subscribeToTokenTransfers(tokenAddress?: Address): Promise<string>;
}
//# sourceMappingURL=observer.d.ts.map