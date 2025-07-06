import { AgentConfig, PlannerInput, PlannerOutput, AgentGoal, AgentTask } from '../types';
export declare class Planner {
    private llm;
    private config;
    private logger;
    private outputParser;
    constructor(config: AgentConfig);
    plan(input: PlannerInput): Promise<PlannerOutput>;
    private llmPlan;
    private ruleBasedPlan;
    evaluateGoalCompletion(goal: AgentGoal, taskHistory: AgentTask[]): Promise<boolean>;
    private llmEvaluateGoal;
    private ruleBasedEvaluateGoal;
}
//# sourceMappingURL=planner.d.ts.map