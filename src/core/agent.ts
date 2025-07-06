
import { EventEmitter } from 'events';
import { Observer } from '../modules/observer';
import { Executor } from '../modules/executor';
import { Planner } from '../modules/planner';
import { Knowledge } from '../modules/knowledge';
import { Logger } from '../logger';
import { AgentConfig, AgentEvent, AgentGoal, AgentTask, PlannerInput } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class Agent extends EventEmitter {
  private config: AgentConfig;
  private logger: any;
  private observer: Observer;
  private executor: Executor;
  private planner: Planner;
  private knowledge: Knowledge;
  
  private isRunning: boolean = false;
  private goals: Map<string, AgentGoal> = new Map();
  private tasks: Map<string, AgentTask> = new Map();
  private taskHistory: AgentTask[] = [];

  constructor(config: AgentConfig) {
    super();
    this.config = config;
    this.logger = Logger.get();
    
    // Initialize modules
    this.observer = new Observer(config);
    this.executor = new Executor(config);
    this.planner = new Planner(config);
    this.knowledge = new Knowledge(config);
    
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Listen to observer events
    this.observer.on('event', async (event: AgentEvent) => {
      await this.handleObservedEvent(event);
    });

    this.observer.on('started', () => {
      this.logger.info('Observer started');
    });

    this.observer.on('stopped', () => {
      this.logger.info('Observer stopped');
    });
  }

  async start(): Promise<void> {
    this.logger.info(`Starting agent: ${this.config.name}`);
    
    try {
      // Initialize knowledge module
      await this.knowledge.initialize();
      
      // Start observer
      await this.observer.start();
      
      this.isRunning = true;
      this.emit('started');
      
      // Store agent startup in memory
      await this.knowledge.storeMemory(
        `Agent ${this.config.name} started`,
        { type: 'system', action: 'startup' }
      );
      
      // Start main agent loop
      this.startMainLoop();
      
    } catch (error) {
      this.logger.error('Failed to start agent:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping agent...');
    this.isRunning = false;
    
    await this.observer.stop();
    await this.knowledge.close();
    
    this.emit('stopped');
  }

  addGoal(description: string): string {
    const goal: AgentGoal = {
      id: uuidv4(),
      description,
      completed: false,
      createdAt: new Date()
    };
    
    this.goals.set(goal.id, goal);
    this.logger.info(`Added goal: ${description}`);
    
    // Store in memory
    this.knowledge.storeMemory(
      `New goal added: ${description}`,
      { type: 'goal', goalId: goal.id }
    );
    
    return goal.id;
  }

  removeGoal(goalId: string): boolean {
    const goal = this.goals.get(goalId);
    if (goal) {
      this.goals.delete(goalId);
      this.logger.info(`Removed goal: ${goal.description}`);
      return true;
    }
    return false;
  }

  markGoalCompleted(goalId: string): boolean {
    const goal = this.goals.get(goalId);
    if (goal) {
      goal.completed = true;
      goal.completedAt = new Date();
      this.logger.info(`Completed goal: ${goal.description}`);
      
      // Store in memory
      this.knowledge.storeMemory(
        `Goal completed: ${goal.description}`,
        { type: 'goal', goalId, status: 'completed' }
      );
      
      return true;
    }
    return false;
  }

  getGoals(): AgentGoal[] {
    return Array.from(this.goals.values());
  }

  private async startMainLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.planAndExecute();
        await this.sleep(5000); // Wait 5 seconds between planning cycles
      } catch (error) {
        this.logger.error('Error in main loop:', error);
        await this.sleep(10000); // Wait longer if there's an error
      }
    }
  }

  private async planAndExecute(): Promise<void> {
    const goals = Array.from(this.goals.values());
    const availableActions = this.getAvailableActions();
    const currentContext = await this.getCurrentContext();
    
    const plannerInput: PlannerInput = {
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
    const task: AgentTask = {
      id: uuidv4(),
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
      await this.knowledge.storeMemory(
        `Task completed: ${plan.nextAction} - ${plan.reasoning}`,
        { 
          type: 'task', 
          taskId: task.id, 
          action: plan.nextAction,
          result: result,
          confidence: plan.confidence
        }
      );
      
    } catch (error) {
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

  private async executeAction(action: string, parameters: Record<string, any>): Promise<any> {
    this.logger.info(`Executing action: ${action}`, parameters);

    switch (action) {
      case 'transfer_flow':
        return await this.executor.transferFlow(parameters.to, parameters.amount);
        
      case 'check_balance':
        return await this.executor.getBalance(parameters.address);
        
      case 'deploy_contract':
        return await this.executor.deployContract(parameters.bytecode, parameters.args);
        
      case 'call_contract':
        return await this.executor.callContract(
          parameters.address,
          parameters.abi,
          parameters.function,
          parameters.args,
          parameters.value
        );
        
      case 'transfer_token':
        return await this.executor.transferToken(
          parameters.tokenAddress,
          parameters.to,
          parameters.amount
        );
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private getAvailableActions(): string[] {
    return [
      'observe',
      'transfer_flow',
      'check_balance',
      'deploy_contract',
      'call_contract',
      'transfer_token'
    ];
  }

  private async getCurrentContext(): Promise<Record<string, any>> {
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

  private async evaluateGoalCompletion(): Promise<void> {
    for (const goal of this.goals.values()) {
      if (!goal.completed) {
        const isCompleted = await this.planner.evaluateGoalCompletion(goal, this.taskHistory);
        if (isCompleted) {
          this.markGoalCompleted(goal.id);
        }
      }
    }
  }

  private async handleObservedEvent(event: AgentEvent): Promise<void> {
    this.logger.debug(`Observed event: ${event.type}`, event.data);
    
    // Store event in memory
    await this.knowledge.storeMemory(
      `Observed ${event.type} event`,
      { 
        type: 'observation', 
        eventType: event.type,
        eventData: event.data 
      }
    );
    
    this.emit('event', event);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for external interaction
  async query(question: string): Promise<string> {
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
