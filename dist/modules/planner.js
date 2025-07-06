"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Planner = void 0;
const openai_1 = require("@langchain/openai");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const logger_1 = require("../logger");
class Planner {
    llm = null;
    config;
    logger;
    outputParser;
    constructor(config) {
        this.config = config;
        this.logger = logger_1.Logger.get();
        this.outputParser = new output_parsers_1.JsonOutputParser();
        if (config.openaiApiKey) {
            this.llm = new openai_1.ChatOpenAI({
                openAIApiKey: config.openaiApiKey,
                modelName: 'gpt-3.5-turbo',
                temperature: 0.1
            });
        }
        else {
            this.logger.warn('No OpenAI API key provided. Planner will use rule-based fallback.');
        }
    }
    async plan(input) {
        if (this.llm) {
            return await this.llmPlan(input);
        }
        else {
            return await this.ruleBasedPlan(input);
        }
    }
    async llmPlan(input) {
        try {
            const prompt = prompts_1.PromptTemplate.fromTemplate(`
You are an autonomous agent operating on Flow EVM blockchain. Your task is to analyze the current situation and decide on the next action.

## Current Goals:
{goals}

## Task History (last 10 tasks):
{taskHistory}

## Current Context:
{currentContext}

## Available Actions:
{availableActions}

Based on the above information, decide on the next action to take. Consider:
1. Which goals are not yet completed
2. What actions have been tried recently and their outcomes
3. The current blockchain state and context
4. Available resources and constraints

Respond with a JSON object containing:
- nextAction: The action to take (must be one of the available actions)
- reasoning: Why this action was chosen
- parameters: Object with parameters for the action
- confidence: Number between 0 and 1 indicating confidence in this decision

Example response:
{{
  "nextAction": "transfer_flow",
  "reasoning": "User requested to send FLOW tokens to address 0x123...",
  "parameters": {{"to": "0x123...", "amount": "1.0"}},
  "confidence": 0.9
}}
`);
            const formattedPrompt = await prompt.format({
                goals: JSON.stringify(input.goals, null, 2),
                taskHistory: JSON.stringify(input.taskHistory.slice(-10), null, 2),
                currentContext: JSON.stringify(input.currentContext, null, 2),
                availableActions: input.availableActions.join(', ')
            });
            const response = await this.llm.invoke(formattedPrompt);
            const parsed = await this.outputParser.parse(response.content);
            this.logger.info('LLM planning completed:', parsed);
            return {
                nextAction: parsed.nextAction,
                reasoning: parsed.reasoning,
                parameters: parsed.parameters || {},
                confidence: parsed.confidence || 0.5
            };
        }
        catch (error) {
            this.logger.error('LLM planning failed, falling back to rule-based:', error);
            return await this.ruleBasedPlan(input);
        }
    }
    async ruleBasedPlan(input) {
        this.logger.info('Using rule-based planning');
        // Simple rule-based planning logic
        const incompleteGoals = input.goals.filter(goal => !goal.completed);
        if (incompleteGoals.length === 0) {
            return {
                nextAction: 'observe',
                reasoning: 'No incomplete goals, continuing observation',
                parameters: {},
                confidence: 0.8
            };
        }
        // Find the oldest incomplete goal
        const oldestGoal = incompleteGoals.reduce((oldest, current) => current.createdAt < oldest.createdAt ? current : oldest);
        // Simple action mapping based on goal description
        let nextAction = 'observe';
        let parameters = {};
        let reasoning = `Working on goal: ${oldestGoal.description}`;
        if (oldestGoal.description.toLowerCase().includes('transfer')) {
            nextAction = 'transfer_flow';
            reasoning = 'Goal involves transferring tokens';
        }
        else if (oldestGoal.description.toLowerCase().includes('balance')) {
            nextAction = 'check_balance';
            reasoning = 'Goal involves checking balances';
        }
        else if (oldestGoal.description.toLowerCase().includes('deploy')) {
            nextAction = 'deploy_contract';
            reasoning = 'Goal involves deploying a contract';
        }
        return {
            nextAction,
            reasoning,
            parameters,
            confidence: 0.6
        };
    }
    async evaluateGoalCompletion(goal, taskHistory) {
        if (this.llm) {
            return await this.llmEvaluateGoal(goal, taskHistory);
        }
        else {
            return await this.ruleBasedEvaluateGoal(goal, taskHistory);
        }
    }
    async llmEvaluateGoal(goal, taskHistory) {
        try {
            const prompt = prompts_1.PromptTemplate.fromTemplate(`
Evaluate whether the following goal has been completed based on the task history:

## Goal:
{goal}

## Recent Task History:
{taskHistory}

Respond with a JSON object:
{{
  "completed": true/false,
  "reasoning": "explanation of why the goal is/isn't completed"
}}
`);
            const formattedPrompt = await prompt.format({
                goal: JSON.stringify(goal, null, 2),
                taskHistory: JSON.stringify(taskHistory.slice(-5), null, 2)
            });
            const response = await this.llm.invoke(formattedPrompt);
            const parsed = await this.outputParser.parse(response.content);
            return parsed.completed;
        }
        catch (error) {
            this.logger.error('LLM goal evaluation failed:', error);
            return false;
        }
    }
    async ruleBasedEvaluateGoal(goal, taskHistory) {
        // Simple rule: if there's a successful task related to the goal in recent history
        const recentSuccessfulTasks = taskHistory
            .filter(task => task.status === 'completed')
            .slice(-5);
        return recentSuccessfulTasks.some(task => task.description.toLowerCase().includes(goal.description.toLowerCase()) ||
            goal.description.toLowerCase().includes(task.type));
    }
}
exports.Planner = Planner;
//# sourceMappingURL=planner.js.map