
// NFT Collection Monitor Template
import { Agent, Config } from 'flow-evm-agentkit';
import { config } from 'dotenv';

config();

const COLLECTION_ADDRESS = '0x...'; // Your NFT collection

async function main() {
  const agent = new Agent(Config.load());
  
  agent.addGoal(`Monitor ${COLLECTION_ADDRESS} for new mints`);
  agent.addGoal('Track floor price changes');
  agent.addGoal('Alert on rare NFTs');
  
  agent.on('event', (event) => {
    if (event.type === 'log' && 
        event.data.log.address.toLowerCase() === COLLECTION_ADDRESS.toLowerCase()) {
      console.log('🎨 NFT activity detected');
    }
  });
  
  await agent.start();
  console.log('🖼️ NFT monitor started');
}

main().catch(console.error);
