import { AgentConfig, AgentMemory } from '../types';
export declare class Knowledge {
    private chroma;
    private chromaCollection;
    private redis;
    private config;
    private logger;
    private memoryCache;
    constructor(config: AgentConfig);
    initialize(): Promise<void>;
    storeMemory(content: string, metadata?: Record<string, any>): Promise<string>;
    retrieveMemory(id: string): Promise<AgentMemory | null>;
    searchMemories(query: string, limit?: number): Promise<AgentMemory[]>;
    getRecentMemories(limit?: number): Promise<AgentMemory[]>;
    deleteMemory(id: string): Promise<boolean>;
    clearAllMemories(): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=knowledge.d.ts.map