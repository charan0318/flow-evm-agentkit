"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agent_1 = require("../core/agent");
const config_1 = require("../config");
const logger_1 = require("../logger");
async function main() {
    console.log('🤖 Starting Flow EVM Transaction Echo Agent...');
    try {
        // Load configuration
        const config = config_1.Config.load();
        // Initialize logger
        const logger = logger_1.Logger.initialize(config);
        // Create agent
        const agent = new agent_1.Agent(config);
        // Add goal to echo all transactions
        agent.addGoal('Monitor and log all transactions on Flow EVM');
        // Set up event handlers
        agent.on('event', (event) => {
            if (event.type === 'transaction') {
                const tx = event.data.transaction;
                logger.info(`📡 Transaction detected:`, {
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: tx.value?.toString(),
                    gasPrice: tx.gasPrice?.toString(),
                    blockNumber: event.data.block.number?.toString()
                });
                console.log(`
🔄 NEW TRANSACTION
Hash: ${tx.hash}
From: ${tx.from}
To: ${tx.to || 'Contract Creation'}
Value: ${tx.value ? (Number(tx.value) / 1e18).toFixed(4) : '0'} FLOW
Gas Price: ${tx.gasPrice ? (Number(tx.gasPrice) / 1e9).toFixed(2) : '0'} Gwei
Block: ${event.data.block.number}
        `);
            }
        });
        agent.on('started', () => {
            console.log('✅ Agent started successfully!');
            console.log(`👤 Agent address: ${agent.getStatus().address}`);
            console.log('🔍 Monitoring Flow EVM for transactions...');
            console.log('Press Ctrl+C to stop');
        });
        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Shutting down agent...');
            await agent.stop();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            await agent.stop();
            process.exit(0);
        });
        // Start the agent
        await agent.start();
    }
    catch (error) {
        console.error('❌ Failed to start agent:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    main().catch(console.error);
}
//# sourceMappingURL=tx-echo-agent.js.map