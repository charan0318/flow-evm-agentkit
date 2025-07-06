
import { Agent } from '../core/agent';
import { Config } from '../config';
import { Logger } from '../logger';
import * as readline from 'readline';

export class ChatbotAgent {
  private agent: Agent;
  private logger: any;
  private rl: readline.Interface;

  constructor() {
    const config = Config.load();
    Logger.initialize(config); 
    this.agent = new Agent(config);
    this.logger = Logger.get();
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log('🤖 Flow EVM Chatbot Agent Starting...');
    
    // Set up agent goals
    this.agent.addGoal('Respond to user queries about Flow EVM');
    this.agent.addGoal('Execute requested blockchain operations');
    this.agent.addGoal('Provide helpful information and insights');

    // Set up event handlers
    this.agent.on('event', (event) => {
      if (event.type === 'transaction') {
        console.log(`\n📡 Transaction observed: ${event.data.transaction.hash}`);
        this.promptUser();
      }
    });

    this.agent.on('started', () => {
      console.log('✅ Chatbot agent started successfully!');
      console.log(`👤 Agent address: ${this.agent.getStatus().address}`);
      console.log('\n💬 You can now chat with your agent!');
      console.log('Examples:');
      console.log('  - "What is my balance?"');
      console.log('  - "Transfer 1 FLOW to 0x123..."');
      console.log('  - "What are my recent transactions?"');
      console.log('  - "Help me understand my portfolio"');
      console.log('\nType "exit" to quit\n');
      
      this.promptUser();
    });

    await this.agent.start();
  }

  private promptUser() {
    this.rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        await this.stop();
        return;
      }

      if (input.trim() === '') {
        this.promptUser();
        return;
      }

      try {
        console.log('🤔 Agent is thinking...');
        
        // Process user input through the agent
        const response = await this.processUserInput(input);
        
        console.log(`🤖 Agent: ${response}\n`);
      } catch (error) {
        console.log(`❌ Error: ${error}\n`);
      }
      
      this.promptUser();
    });
  }

  private async processUserInput(input: string): Promise<string> {
    // Check for specific commands
    if (input.toLowerCase().includes('balance')) {
      return await this.handleBalanceQuery();
    }
    
    if (input.toLowerCase().includes('transfer')) {
      return await this.handleTransferRequest(input);
    }
    
    if (input.toLowerCase().includes('status') || input.toLowerCase().includes('portfolio')) {
      return await this.handleStatusQuery();
    }
    
    if (input.toLowerCase().includes('help')) {
      return this.getHelpMessage();
    }

    // For general queries, use the agent's query method
    return await this.agent.query(input);
  }

  private async handleBalanceQuery(): Promise<string> {
    try {
      const status = this.agent.getStatus();
      return `Your current FLOW balance is ${status.balance || 'unknown'} FLOW tokens at address ${status.address}`;
    } catch (error) {
      return `Sorry, I couldn't retrieve your balance. Error: ${error}`;
    }
  }

  private async handleTransferRequest(input: string): Promise<string> {
    // Extract transfer details from input (simplified parsing)
    const transferMatch = input.match(/transfer\s+(\d+\.?\d*)\s+.*?to\s+(0x[a-fA-F0-9]{40})/i);
    
    if (!transferMatch) {
      return "I couldn't parse the transfer request. Please use format: 'Transfer X FLOW to 0x...'";
    }

    const amount = transferMatch[1];
    const toAddress = transferMatch[2];

    // Add transfer goal to agent
    this.agent.addGoal(`Transfer ${amount} FLOW to ${toAddress}`);
    
    return `I've added a goal to transfer ${amount} FLOW to ${toAddress}. The agent will plan and execute this transfer.`;
  }

  private async handleStatusQuery(): Promise<string> {
    const status = this.agent.getStatus();
    const goals = status.goals;
    const recentTasks = status.recentTasks;
    
    let response = `📊 Agent Status:\n`;
    response += `Address: ${status.address}\n`;
    response += `Running: ${status.running ? 'Yes' : 'No'}\n`;
    response += `Active Goals: ${goals.filter(g => !g.completed).length}\n`;
    response += `Completed Goals: ${goals.filter(g => g.completed).length}\n`;
    
    if (recentTasks.length > 0) {
      response += `\nRecent Tasks:\n`;
      recentTasks.slice(-3).forEach((task, index) => {
        response += `${index + 1}. ${task.description} (${task.status})\n`;
      });
    }
    
    return response;
  }

  private getHelpMessage(): string {
    return `🤖 Flow EVM Agent Help

Available Commands:
• "What is my balance?" - Check your FLOW token balance
• "Transfer X FLOW to 0x..." - Transfer tokens to an address
• "What is my status?" - Get agent status and recent activity
• "Help" - Show this help message
• "Exit" - Stop the agent and quit

Examples:
• "Transfer 1.5 FLOW to 0x742d35Cc8C15C80085E31c65E8bB38C98b2a3B86"
• "What are my recent transactions?"
• "Show me my portfolio status"

The agent can also respond to general questions about Flow EVM and blockchain operations.`;
  }

  async stop() {
    console.log('\n🛑 Stopping chatbot agent...');
    this.rl.close();
    await this.agent.stop();
    console.log('👋 Goodbye!');
    process.exit(0);
  }
}

// CLI entry point
async function main() {
  const chatbot = new ChatbotAgent();
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    await chatbot.stop();
  });
  
  process.on('SIGTERM', async () => {
    await chatbot.stop();
  });
  
  await chatbot.start();
}

if (require.main === module) {
  main().catch(console.error);
}
