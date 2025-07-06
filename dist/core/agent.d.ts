import { EventEmitter } from 'events';
import { AgentConfig, AgentGoal, AgentTask } from '../types';
export declare class Agent extends EventEmitter {
    private config;
    private logger;
    private observer;
    private executor;
    private planner;
    private knowledge;
    private isRunning;
    private goals;
    private tasks;
    private taskHistory;
    constructor(config: AgentConfig);
    private setupEventHandlers;
    start(): Promise<void>;
    stop(): Promise<void>;
    addGoal(description: string): string;
    removeGoal(goalId: string): boolean;
    markGoalCompleted(goalId: string): boolean;
    getGoals(): AgentGoal[];
    private startMainLoop;
    private planAndExecute;
    private executeAction;
    private getAvailableActions;
    private getCurrentContext;
    private evaluateGoalCompletion;
    private handleObservedEvent;
    private sleep;
    query(question: string): Promise<string>;
    getStatus(): {
        running: boolean;
        goals: AgentGoal[];
        recentTasks: AgentTask[];
        address: Promise<`0x${string}`>;
    };
}
//# sourceMappingURL=agent.d.ts.map