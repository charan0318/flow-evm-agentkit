"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const events_1 = require("events");
const observer_1 = require("../modules/observer");
const executor_1 = require("../modules/executor");
const planner_1 = require("../modules/planner");
const knowledge_1 = require("../modules/knowledge");
const logger_1 = require("../logger");
const uuid_1 = require("uuid");
class Agent extends events_1.EventEmitter {
    config;
    logger;
    observer;
    executor;
    planner;
    knowledge;
    isRunning = false;
    goals = new Map();
    tasks = new Map();
    taskHistory = [];
    constructor(config) {
        super();
        this.config = config;
        this.logger = logger_1.Logger.get();
        // Initialize modules
        this.observer = new observer_1.Observer(config);
        this.executor = new executor_1.Executor(config);
        this.planner = new planner_1.Planner(config);
        this.knowledge = new knowledge_1.Knowledge(config);
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        // Listen to observer events
        this.observer.on('event', async (event) => {
            await this.handleObservedEvent(event);
        });
        this.observer.on('started', () => {
            this.logger.info('Observer started');
        });
        this.observer.on('stopped', () => {
            this.logger.info('Observer stopped');
        });
    }
    async start() {
        this.logger.info(`Starting agent: ${this.config.name}`);
        try {
            // Initialize knowledge module
            await this.knowledge.initialize();
            // Start observer
            await this.observer.start();
            this.isRunning = true;
            this.emit('started');
            // Store agent startup in memory
            await this.knowledge.storeMemory(`Agent ${this.config.name} started`, { type: 'system', action: 'startup' });
            // Start main agent loop
            this.startMainLoop();
        }
        catch (error) {
            this.logger.error('Failed to start agent:', error);
            throw error;
        }
    }
    async stop() {
        this.logger.info('Stopping agent...');
        this.isRunning = false;
        await this.observer.stop();
        await this.knowledge.close();
        this.emit('stopped');
    }
    addGoal(description) {
        const goal = {
            id: (0, uuid_1.v4)(),
            description,
            completed: false,
            createdAt: new Date()
        };
        this.goals.set(goal.id, goal);
        this.logger.info(`Added goal: ${description}`);
        // Store in memory
        this.knowledge.storeMemory(`New goal added: ${description}`, { type: 'goal', goalId: goal.id });
        return goal.id;
    }
    removeGoal(goalId) {
        const goal = this.goals.get(goalId);
        if (goal) {
            this.goals.delete(goalId);
            this.logger.info(`Removed goal: ${goal.description}`);
            return true;
        }
        return false;
    }
    markGoalCompleted(goalId) {
        const goal = this.goals.get(goalId);
        if (goal) {
            goal.completed = true;
            goal.completedAt = new Date();
            this.logger.info(`Completed goal: ${goal.description}`);
            // Store in memory
            this.knowledge.storeMemory(`Goal completed: ${goal.description}`, { type: 'goal', goalId, status: 'completed' });
            return true;
        }
        return false;
    }
    getGoals() {
        return Array.from(this.goals.values());
    }
    async startMainLoop() {
        while (this.isRunning) {
            try {
                await this.planAndExecute();
                await this.sleep(5000); // Wait 5 seconds between planning cycles
            }
            catch (error) {
                this.logger.error('Error in main loop:', error);
                await this.sleep(10000); // Wait longer if there's an error
            }
        }
    }
    async planAndExecute() {
        const goals = Array.from(this.goals.values());
        const availableActions = this.getAvailableActions();
        const currentContext = await this.getCurrentContext();
        const plannerInput = {
            goals,
            taskHistory: this.taskHistory.slice(-10), // Last 10 tasks
            currentContext,
            availableActions
        };
        // Get plan from planner
        const plan = await this.planner.plan(plannerInput);
        if (plan.nextAction === 'observe') {
            // Just continue observing
            return;
        }
        // Create and execute task
        const task = {
            id: (0, uuid_1.v4)(),
            type: 'execute',
            description: `Execute action: ${plan.nextAction}`,
            status: 'pending',
            createdAt: new Date()
        };
        this.tasks.set(task.id, task);
        try {
            task.status = 'running';
            const result = await this.executeAction(plan.nextAction, plan.parameters);
            task.status = 'completed';
            task.result = result;
            task.completedAt = new Date();
            this.logger.info(`Task completed: ${task.description}`);
            // Store task result in memory
            await this.knowledge.storeMemory(`Task completed: ${plan.nextAction} - ${plan.reasoning}`, {
                type: 'task',
                taskId: task.id,
                action: plan.nextAction,
                result: result,
                confidence: plan.confidence
            });
        }
        catch (error) {
            task.status = 'failed';
            task.error = error instanceof Error ? error.message : 'Unknown error';
            task.completedAt = new Date();
            this.logger.error(`Task failed: ${task.description}`, error);
        }
        // Add to history and clean up
        this.taskHistory.push(task);
        this.tasks.delete(task.id);
        // Keep only last 100 tasks in history
        if (this.taskHistory.length > 100) {
            this.taskHistory = this.taskHistory.slice(-100);
        }
        // Evaluate goal completion
        await this.evaluateGoalCompletion();
    }
    async executeAction(action, parameters) {
        this.logger.info(`Executing action: ${action}`, parameters);
        switch (action) {
            case 'transfer_flow':
                return await this.executor.transferFlow(parameters.to, parameters.amount);
            case 'check_balance':
                return await this.executor.getBalance(parameters.address);
            case 'deploy_contract':
                return await this.executor.deployContract(parameters.bytecode, parameters.args);
            case 'call_contract':
                return await this.executor.callContract(parameters.address, parameters.abi, parameters.function, parameters.args, parameters.value);
            case 'transfer_token':
                return await this.executor.transferToken(parameters.tokenAddress, parameters.to, parameters.amount);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }
    getAvailableActions() {
        return [
            'observe',
            'transfer_flow',
            'check_balance',
            'deploy_contract',
            'call_contract',
            'transfer_token'
        ];
    }
    async getCurrentContext() {
        const address = await this.executor.getAddress();
        const balance = await this.executor.getBalance();
        const recentMemories = await this.knowledge.getRecentMemories(5);
        return {
            address,
            balance: balance.toString(),
            recentMemories: recentMemories.map(m => m.content),
            activeGoals: this.getGoals().filter(g => !g.completed).length,
            completedGoals: this.getGoals().filter(g => g.completed).length
        };
    }
    async evaluateGoalCompletion() {
        for (const goal of this.goals.values()) {
            if (!goal.completed) {
                const isCompleted = await this.planner.evaluateGoalCompletion(goal, this.taskHistory);
                if (isCompleted) {
                    this.markGoalCompleted(goal.id);
                }
            }
        }
    }
    async handleObservedEvent(event) {
        this.logger.debug(`Observed event: ${event.type}`, event.data);
        // Store event in memory
        await this.knowledge.storeMemory(`Observed ${event.type} event`, {
            type: 'observation',
            eventType: event.type,
            eventData: event.data
        });
        this.emit('event', event);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Public methods for external interaction
    async query(question) {
        const memories = await this.knowledge.searchMemories(question, 5);
        const context = await this.getCurrentContext();
        return `Based on recent activity and current state: ${JSON.stringify(context)}. Recent memories: ${memories.map(m => m.content).join(', ')}`;
    }
    getStatus() {
        return {
            running: this.isRunning,
            goals: this.getGoals(),
            recentTasks: this.taskHistory.slice(-5),
            address: this.executor.getAddress()
        };
    }
}
exports.Agent = Agent;
//# sourceMappingURL=agent.js.map