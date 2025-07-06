
// DeFi Trading Bot Template
import { Agent, Config } from 'flow-evm-agentkit';
import { config } from 'dotenv';

config();

async function main() {
  const agent = new Agent(Config.load());
  
  // Trading strategy
  agent.addGoal('Monitor DEX prices for opportunities');
  agent.addGoal('Execute trades when profit > 2%');
  agent.addGoal('Maintain 50 FLOW emergency reserve');
  
  // Risk management
  agent.addGoal('Stop trading if daily loss > 5%');
  
  await agent.start();
  console.log('💰 Trading bot started');
}

main().catch(console.error);
