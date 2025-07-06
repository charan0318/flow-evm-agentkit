
import { Agent, Config, Logger } from '../index';

async function main() {
  console.log('🤖 Starting Flow EVM Trading Agent...');
  
  try {
    const config = Config.load();
    const logger = Logger.initialize(config);
    const agent = new Agent(config);
    
    // Add comprehensive trading goals
    agent.addGoal('Monitor Flow EVM for trading opportunities');
    agent.addGoal('Maintain minimum balance of 10 FLOW tokens');
    agent.addGoal('Execute trades when profitable conditions are met');
    agent.addGoal('Monitor gas prices and optimize transaction costs');
    
    // Set up comprehensive event handling
    agent.on('event', async (event) => {
      switch (event.type) {
        case 'transaction':
          const tx = event.data.transaction;
          
          // Analyze large transactions for trading signals
          const valueInFlow = tx.value ? Number(tx.value) / 1e18 : 0;
          if (valueInFlow > 100) {
            logger.info('Large transaction detected:', {
              hash: tx.hash,
              value: `${valueInFlow.toFixed(2)} FLOW`,
              from: tx.from,
              to: tx.to
            });
            
            // Agent can analyze this for trading opportunities
            await agent.query(`Analyze this large transaction: ${tx.hash} worth ${valueInFlow} FLOW`);
          }
          break;
          
        case 'log':
          const log = event.data.log;
          logger.debug('Contract event observed:', {
            address: log.address,
            topics: log.topics.slice(0, 2)
          });
          break;
          
        case 'block':
          const block = event.data.block;
          if (Number(block.number) % 100 === 0) {
            logger.info(`Block ${block.number} processed - checking market conditions`);
            
            // Periodic market analysis
            const marketAnalysis = await agent.query('Analyze current market conditions and suggest actions');
            logger.info('Market analysis:', marketAnalysis);
          }
          break;
      }
    });
    
    agent.on('started', async () => {
      console.log('✅ Trading Agent started successfully!');
      console.log(`👤 Agent address: ${agent.getStatus().address}`);
      console.log('📊 Monitoring Flow EVM for trading opportunities...');
      
      // Initial market analysis
      const initialBalance = await agent.query('What is my current FLOW balance?');
      console.log('💰 Current balance:', initialBalance);
      
      const marketOverview = await agent.query('Analyze current market conditions on Flow EVM');
      console.log('📈 Market overview:', marketOverview);
    });
    
    // Set up periodic market analysis
    setInterval(async () => {
      try {
        const status = agent.getStatus();
        if (status.running) {
          logger.info('Performing periodic analysis...');
          
          // Check if we should rebalance portfolio
          const rebalanceAdvice = await agent.query('Should I rebalance my portfolio based on current conditions?');
          logger.info('Rebalance recommendation:', rebalanceAdvice);
          
          // Check for new opportunities
          const opportunities = await agent.query('Are there any new trading opportunities?');
          logger.info('Trading opportunities:', opportunities);
        }
      } catch (error) {
        logger.error('Error in periodic analysis:', error);
      }
    }, 300000); // Every 5 minutes
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down trading agent...');
      await agent.stop();
      process.exit(0);
    });
    
    await agent.start();
    
  } catch (error) {
    console.error('❌ Failed to start trading agent:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
