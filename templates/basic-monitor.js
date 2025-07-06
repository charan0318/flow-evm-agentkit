
// Basic Flow EVM Monitoring Agent Template
import { Agent, Config } from 'flow-evm-agentkit';
import { config } from 'dotenv';

config();

async function main() {
  const agent = new Agent(Config.load());
  
  // Basic monitoring goals
  agent.addGoal('Monitor all transactions on Flow EVM');
  agent.addGoal('Log important events');
  
  // Event handling
  agent.on('event', (event) => {
    if (event.type === 'transaction') {
      console.log('📊 New transaction:', event.data.transaction.hash);
    }
  });
  
  await agent.start();
  console.log('✅ Basic monitor started');
}

main().catch(console.error);
