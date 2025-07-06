

# Flow EVM AgentKit

[![npm version](https://badge.fury.io/js/flow-evm-agentkit.svg)](https://badge.fury.io/js/flow-evm-agentkit)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

🚀 **Quick Start (2 minutes)**

Want to get started immediately? Here's the fastest way:

```bash
# 1. Install the package
npm install flow-evm-agentkit viem

# 2. Create a .env file
echo "FLOW_RPC_URL=https://testnet.evm.nodes.onflow.org
PRIVATE_KEY=your-private-key-here" > .env

# 3. Create a test file
// test.js
import { Agent, Config } from 'flow-evm-agentkit';
import { config } from 'dotenv';

config(); // Load .env file

async function test() {
  const agentConfig = Config.load();
  const agent = new Agent(agentConfig);
  
  await agent.start();
  const balance = await agent.query('Check my current FLOW balance');
  console.log('Agent response:', balance);
}

test();
```

That's it! You now have a working Flow EVM blockchain agent. Read on for more details.

## 📖 What is Flow EVM AgentKit?

The Flow EVM AgentKit is a comprehensive TypeScript SDK designed for building intelligent, autonomous agents on the Flow EVM blockchain. Think of it as your AI-powered Swiss Army knife for Flow blockchain development.

### What is Flow EVM?

- **Flow EVM** is Ethereum Virtual Machine compatibility on the Flow blockchain
- **High Performance**: Sub-second finality with high throughput
- **Developer Friendly**: Full Ethereum tooling compatibility
- **Cost Effective**: Lower gas fees compared to Ethereum mainnet
- **Secure**: Built on Flow's proven blockchain infrastructure

### What does this SDK do?

✅ **Transaction Management**: Send FLOW tokens and ERC-20 tokens  
✅ **Smart Contract Interaction**: Deploy and interact with contracts  
✅ **Real-time Monitoring**: Listen to blockchain events and transactions  
✅ **AI Integration**: LLM-powered decision making with OpenAI/LangChain  
✅ **Autonomous Operation**: Self-directed agents that observe, plan, and execute  
✅ **Memory & Learning**: Persistent knowledge storage and retrieval  
✅ **Gas Optimization**: Intelligent gas estimation and nonce management  

## ✨ Key Features

🤖 **AI-Powered**: Built-in LLM integration for intelligent decision making  
🔒 **Secure**: Enterprise-grade security with best practices built-in  
🚀 **High Performance**: Optimized for Flow EVM with robust RPC handling  
🛠️ **Developer Friendly**: Simple API design for beginners and experts  
🌐 **Universal**: Works in Node.js environments  
📊 **Comprehensive**: Complete toolkit for blockchain applications  
🎯 **Real-time**: Live blockchain event monitoring and response  
📝 **Type-safe**: Full TypeScript support with smart contract interactions  
🔍 **Observable**: Comprehensive logging and error tracking  
🧠 **Memory**: Vector-based knowledge storage with ChromaDB integration  

## 🛠️ Installation

### Basic Installation
```bash
npm install flow-evm-agentkit
```

### For AI Integration (LangChain)
```bash
npm install flow-evm-agentkit @langchain/openai @langchain/core
```

### For TypeScript projects:
```bash
npm install --save-dev @types/node typescript
```

## 🏗️ Basic Usage

### 1. Environment Setup

Create a `.env` file in your project root:

```bash
# Flow EVM Network Configuration
FLOW_RPC_URL=https://testnet.evm.nodes.onflow.org
PRIVATE_KEY=your-private-key-here

# For AI Integration (Optional)
OPENAI_API_KEY=your-openai-api-key-here

# Agent Configuration
AGENT_NAME=MyFlowAgent
LOG_LEVEL=info
POLLING_INTERVAL=5000
```

⚠️ **Security Warning**: Never commit your `.env` file to version control! Add it to `.gitignore`.

### 2. Initialize the Agent

```typescript
import { Agent, Config } from 'flow-evm-agentkit';
import { config } from 'dotenv';

config(); // Load environment variables

const agentConfig = Config.load();
const agent = new Agent(agentConfig);

console.log('Agent initialized for address:', agent.getStatus().address);
```

### 3. Basic Agent Operations

```typescript
// Start the agent
await agent.start();

// Add goals for the agent
agent.addGoal('Monitor Flow EVM for trading opportunities');
agent.addGoal('Maintain a minimum balance of 10 FLOW');

// Handle events
agent.on('event', (event) => {
  if (event.type === 'transaction') {
    console.log('New transaction observed:', event.data.transaction.hash);
  }
});
```

## 🚀 Agent Templates

### Template 1: Basic Monitoring Agent
```typescript
import { Agent, Config } from 'flow-evm-agentkit';
import { config } from 'dotenv';

config();

async function createMonitoringAgent() {
  const agent = new Agent(Config.load());
  
  // Set monitoring goals
  agent.addGoal('Monitor all transactions on Flow EVM');
  agent.addGoal('Alert when large transfers occur (>1000 FLOW)');
  
  // Event handling
  agent.on('event', (event) => {
    if (event.type === 'transaction') {
      const tx = event.data.transaction;
      const valueInFlow = parseFloat(tx.value) / 1e18;
      
      if (valueInFlow > 1000) {
        console.log(`🚨 Large transfer detected: ${valueInFlow} FLOW`);
        console.log(`Hash: ${tx.hash}`);
      }
    }
  });
  
  await agent.start();
  console.log('✅ Monitoring agent started');
}

createMonitoringAgent().catch(console.error);
```

### Template 2: DeFi Trading Agent
```typescript
import { Agent, Config } from 'flow-evm-agentkit';
import { config } from 'dotenv';

config();

async function createTradingAgent() {
  const agent = new Agent(Config.load());
  
  // Trading strategy goals
  agent.addGoal('Monitor DEX prices for arbitrage opportunities');
  agent.addGoal('Execute trades when profit margin > 2%');
  agent.addGoal('Maintain emergency reserve of 50 FLOW');
  agent.addGoal('Rebalance portfolio every 24 hours');
  
  // Risk management
  agent.addGoal('Stop trading if daily loss exceeds 5%');
  
  // Advanced event handling
  agent.on('event', async (event) => {
    if (event.type === 'log') {
      // Check for swap events on DEXes
      const log = event.data.log;
      if (log.topics[0] === '0xd78ad95f...') { // Swap event signature
        const swapData = parseSwapEvent(log);
        await analyzeArbitrageOpportunity(agent, swapData);
      }
    }
  });
  
  await agent.start();
  console.log('💰 Trading agent started');
}

async function analyzeArbitrageOpportunity(agent: Agent, swapData: any) {
  // Implement arbitrage logic
  const profitMargin = calculateProfitMargin(swapData);
  
  if (profitMargin > 0.02) { // 2% minimum profit
    agent.addGoal(`Execute arbitrage trade with ${profitMargin}% profit`);
  }
}

function parseSwapEvent(log: any) {
  // Parse DEX swap event data
  return {
    tokenIn: log.topics[1],
    tokenOut: log.topics[2],
    amountIn: parseInt(log.data.slice(0, 66), 16),
    amountOut: parseInt(log.data.slice(66, 132), 16)
  };
}

function calculateProfitMargin(swapData: any): number {
  // Implement profit calculation logic
  return 0.025; // 2.5% example
}

createTradingAgent().catch(console.error);
```

### Template 3: NFT Collection Monitor
```typescript
import { Agent, Config } from 'flow-evm-agentkit';
import { config } from 'dotenv';

config();

async function createNFTMonitor() {
  const agent = new Agent(Config.load());
  
  const COLLECTION_ADDRESS = '0x...'; // Your NFT collection address
  
  // NFT monitoring goals
  agent.addGoal(`Monitor ${COLLECTION_ADDRESS} for new mints`);
  agent.addGoal('Track floor price changes');
  agent.addGoal('Alert on rare trait combinations');
  agent.addGoal('Auto-bid on underpriced NFTs');
  
  // Collection analytics
  const collectionStats = {
    totalMinted: 0,
    floorPrice: 0,
    volume24h: 0,
    rareTrades: []
  };
  
  agent.on('event', async (event) => {
    if (event.type === 'log') {
      const log = event.data.log;
      
      // NFT Transfer event
      if (log.address.toLowerCase() === COLLECTION_ADDRESS.toLowerCase() &&
          log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
        
        const from = '0x' + log.topics[1].slice(26);
        const to = '0x' + log.topics[2].slice(26);
        const tokenId = parseInt(log.topics[3], 16);
        
        if (from === '0x0000000000000000000000000000000000000000') {
          // New mint
          console.log(`🎨 New NFT minted: Token #${tokenId}`);
          collectionStats.totalMinted++;
          
          // Analyze rarity
          const rarity = await analyzeNFTRarity(tokenId);
          if (rarity.score > 90) {
            agent.addGoal(`Consider bidding on rare NFT #${tokenId} (rarity: ${rarity.score})`);
          }
        } else {
          // Transfer/Sale
          console.log(`🔄 NFT #${tokenId} transferred from ${from} to ${to}`);
        }
      }
    }
  });
  
  // Periodic floor price updates
  setInterval(async () => {
    const newFloorPrice = await getCollectionFloorPrice(COLLECTION_ADDRESS);
    if (Math.abs(newFloorPrice - collectionStats.floorPrice) / collectionStats.floorPrice > 0.1) {
      console.log(`📈 Floor price changed: ${collectionStats.floorPrice} → ${newFloorPrice} FLOW`);
      collectionStats.floorPrice = newFloorPrice;
    }
  }, 300000); // Every 5 minutes
  
  await agent.start();
  console.log('🖼️ NFT monitor started');
}

async function analyzeNFTRarity(tokenId: number) {
  // Implement rarity analysis
  return { score: Math.random() * 100, traits: [] };
}

async function getCollectionFloorPrice(address: string): Promise<number> {
  // Implement floor price fetching
  return 1.5; // Example: 1.5 FLOW
}

createNFTMonitor().catch(console.error);
```

### Template 4: Governance Participation Agent
```typescript
import { Agent, Config } from 'flow-evm-agentkit';
import { config } from 'dotenv';

config();

async function createGovernanceAgent() {
  const agent = new Agent(Config.load());
  
  const DAO_CONTRACT = '0x...'; // DAO governance contract
  
  // Governance goals
  agent.addGoal('Monitor new governance proposals');
  agent.addGoal('Analyze proposal impacts on token economics');
  agent.addGoal('Vote on proposals based on predefined criteria');
  agent.addGoal('Delegate voting power when unavailable');
  
  // Voting criteria
  const votingCriteria = {
    maxTreasurySpend: 1000000, // Max 1M tokens
    requiresSecurityAudit: true,
    minDiscussionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
    autoApproveTypes: ['bug-fix', 'security-patch']
  };
  
  agent.on('event', async (event) => {
    if (event.type === 'log' && 
        event.data.log.address.toLowerCase() === DAO_CONTRACT.toLowerCase()) {
      
      const log = event.data.log;
      
      // New proposal event
      if (log.topics[0] === '0x...') { // ProposalCreated event signature
        const proposalId = parseInt(log.topics[1], 16);
        const proposal = await getProposalDetails(proposalId);
        
        console.log(`🗳️ New proposal #${proposalId}: ${proposal.title}`);
        
        // Analyze and decide vote
        const decision = analyzeProposal(proposal, votingCriteria);
        
        if (decision.autoVote) {
          agent.addGoal(`Vote ${decision.vote} on proposal #${proposalId}: ${decision.reason}`);
        } else {
          console.log(`⏳ Proposal #${proposalId} requires manual review: ${decision.reason}`);
        }
      }
      
      // Proposal executed
      if (log.topics[0] === '0x...') { // ProposalExecuted event signature
        const proposalId = parseInt(log.topics[1], 16);
        console.log(`✅ Proposal #${proposalId} executed`);
      }
    }
  });
  
  await agent.start();
  console.log('🏛️ Governance agent started');
}

async function getProposalDetails(proposalId: number) {
  // Fetch proposal details from contract or API
  return {
    id: proposalId,
    title: 'Example Proposal',
    description: 'Proposal description...',
    type: 'treasury-spend',
    amount: 500000,
    createdAt: Date.now()
  };
}

function analyzeProposal(proposal: any, criteria: any) {
  // Auto-approve certain types
  if (criteria.autoApproveTypes.includes(proposal.type)) {
    return {
      autoVote: true,
      vote: 'FOR',
      reason: `Auto-approved ${proposal.type}`
    };
  }
  
  // Check treasury spend limits
  if (proposal.type === 'treasury-spend' && proposal.amount > criteria.maxTreasurySpend) {
    return {
      autoVote: true,
      vote: 'AGAINST',
      reason: `Treasury spend exceeds limit (${proposal.amount} > ${criteria.maxTreasurySpend})`
    };
  }
  
  return {
    autoVote: false,
    reason: 'Requires manual review'
  };
}

createGovernanceAgent().catch(console.error);
```

### Template 5: Multi-Chain Bridge Monitor
```typescript
import { Agent, Config } from 'flow-evm-agentkit';
import { config } from 'dotenv';

config();

async function createBridgeMonitor() {
  const agent = new Agent(Config.load());
  
  const BRIDGE_CONTRACTS = {
    flowToEth: '0x...',
    ethToFlow: '0x...',
    flowToBsc: '0x...'
  };
  
  // Bridge monitoring goals
  agent.addGoal('Monitor cross-chain bridge activity');
  agent.addGoal('Track bridge liquidity levels');
  agent.addGoal('Alert on unusual bridge activity');
  agent.addGoal('Arbitrage cross-chain price differences');
  
  const bridgeStats = {
    dailyVolume: new Map(),
    liquidityLevels: new Map(),
    priceDiscrepancies: new Map()
  };
  
  agent.on('event', async (event) => {
    if (event.type === 'log') {
      const log = event.data.log;
      const contractAddress = log.address.toLowerCase();
      
      // Check if it's a bridge contract
      for (const [bridgeName, address] of Object.entries(BRIDGE_CONTRACTS)) {
        if (contractAddress === address.toLowerCase()) {
          await handleBridgeEvent(agent, bridgeName, log, bridgeStats);
        }
      }
    }
  });
  
  // Periodic arbitrage analysis
  setInterval(async () => {
    await analyzeCrossChainArbitrage(agent, bridgeStats);
  }, 60000); // Every minute
  
  await agent.start();
  console.log('🌉 Bridge monitor started');
}

async function handleBridgeEvent(agent: Agent, bridgeName: string, log: any, stats: any) {
  // Bridge deposit event
  if (log.topics[0] === '0x...') { // Deposit event signature
    const amount = parseInt(log.data.slice(0, 66), 16);
    const user = '0x' + log.topics[1].slice(26);
    
    console.log(`🔗 Bridge deposit: ${amount} tokens via ${bridgeName} from ${user}`);
    
    // Update volume stats
    const today = new Date().toDateString();
    const currentVolume = stats.dailyVolume.get(bridgeName + today) || 0;
    stats.dailyVolume.set(bridgeName + today, currentVolume + amount);
    
    // Check for unusual activity
    if (amount > 1000000) { // Large transfer threshold
      agent.addGoal(`Investigate large bridge transfer: ${amount} tokens via ${bridgeName}`);
    }
  }
  
  // Bridge withdrawal event
  if (log.topics[0] === '0x...') { // Withdrawal event signature
    const amount = parseInt(log.data.slice(0, 66), 16);
    console.log(`🔓 Bridge withdrawal: ${amount} tokens via ${bridgeName}`);
  }
}

async function analyzeCrossChainArbitrage(agent: Agent, stats: any) {
  // Get prices on different chains
  const prices = await getCrossChainPrices();
  
  for (const [tokenPair, priceData] of Object.entries(prices)) {
    const priceDiff = Math.abs(priceData.chainA - priceData.chainB) / priceData.chainA;
    
    if (priceDiff > 0.02) { // 2% price difference
      console.log(`💰 Arbitrage opportunity: ${tokenPair} (${(priceDiff * 100).toFixed(2)}% difference)`);
      agent.addGoal(`Execute arbitrage for ${tokenPair}: buy on ${priceData.cheaperChain}, sell on ${priceData.expensiveChain}`);
    }
  }
}

async function getCrossChainPrices() {
  // Implement price fetching from multiple chains
  return {
    'FLOW/USDC': {
      chainA: 1.25,
      chainB: 1.28,
      cheaperChain: 'Flow',
      expensiveChain: 'Ethereum'
    }
  };
}

createBridgeMonitor().catch(console.error);
```

## 🤖 AI Integration with LangChain

Create intelligent blockchain agents with AI decision-making:

```typescript
import { Agent, Config } from 'flow-evm-agentkit';

const config = Config.load();
const agent = new Agent(config);

// The agent will use AI for planning if OpenAI key is provided
agent.addGoal('Analyze market conditions and execute optimal trades');
agent.addGoal('Monitor for arbitrage opportunities');

await agent.start();

// The agent will automatically use LLM for intelligent planning
const response = await agent.query('Should I buy or sell based on current market conditions?');
console.log('AI recommendation:', response);
```

## 🏗️ Architecture

The SDK is organized into intelligent, modular services:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Observer      │    │    Planner      │    │   Executor      │
│                 │    │                 │    │                 │
│ • Event Filters │───▶│ • LLM Decision  │───▶│ • Tx Execution  │
│ • Block Monitor │    │ • Task Planning │    │ • Gas Estimation│
│ • Log Parsing   │    │ • Goal Setting  │    │ • Nonce Mgmt    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │   Knowledge     │
                    │                 │
                    │ • Vector Store  │
                    │ • Memory Logs   │
                    │ • Embeddings    │
                    └─────────────────┘
```

**Core Modules:**
- **Agent**: Main orchestrator with autonomous decision-making
- **Observer**: Real-time blockchain monitoring and event detection
- **Executor**: Transaction execution with gas optimization
- **Planner**: AI-powered decision making and task planning
- **Knowledge**: Vector-based memory storage and retrieval

## 🚀 Advanced Use Cases

### 1. MEV (Maximal Extractable Value) Bot
```typescript
// Implement sandwich attacks, arbitrage, and liquidation bots
const mevAgent = new Agent(Config.load());
mevAgent.addGoal('Monitor mempool for MEV opportunities');
mevAgent.addGoal('Execute front-running strategies when profitable');
```

### 2. Liquidity Management
```typescript
// Automated liquidity provision and yield farming
const liquidityAgent = new Agent(Config.load());
liquidityAgent.addGoal('Manage liquidity positions across multiple DEXes');
liquidityAgent.addGoal('Optimize yield farming strategies');
```

### 3. Risk Management System
```typescript
// Portfolio risk monitoring and automated hedging
const riskAgent = new Agent(Config.load());
riskAgent.addGoal('Monitor portfolio risk metrics');
riskAgent.addGoal('Execute hedging strategies when risk exceeds threshold');
```

## ⚠️ Error Handling

Built-in error handling with detailed error types:

```typescript
try {
  await agent.start();
} catch (error) {
  console.error('Agent failed to start:', error.message);
}

// Listen to agent events for error monitoring
agent.on('error', (error) => {
  console.error('Agent error:', error);
});
```

## 🔧 Troubleshooting

**Common Issues:**

- **"Missing environment variables"** → Check your `.env` file and `config()` call
- **"Failed to connect to Flow EVM"** → Verify `FLOW_RPC_URL` is correct
- **"Transaction failed"** → Check balance and gas fees
- **"Agent not responding"** → Check OpenAI API key for AI features

**Performance Tips:**
- Reuse agent instances instead of creating new ones
- Monitor gas prices before executing transactions  
- Use appropriate polling intervals for your use case
- Implement proper error handling and retries

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development mode
npm run dev

# Run linter
npm run lint
```

## 📋 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FLOW_RPC_URL` | Flow EVM RPC endpoint | ✅ Yes |
| `PRIVATE_KEY` | Your private key | ✅ Yes |
| `OPENAI_API_KEY` | OpenAI API key (for AI features) | ❌ Optional |
| `AGENT_NAME` | Agent identifier | ❌ Optional |
| `LOG_LEVEL` | Logging level ('info', 'debug', 'error') | ❌ Optional |
| `POLLING_INTERVAL` | Event polling interval in ms | ❌ Optional |

## 📚 Documentation & Resources

- 🌐 **Flow Developer Portal**: [developers.flow.com](https://developers.flow.com)
- 🔍 **Flow EVM Testnet Explorer**: [evm-testnet.flowscan.org](https://evm-testnet.flowscan.org)
- 📖 **Flow EVM Documentation**: [developers.flow.com/evm](https://developers.flow.com/evm)
- 🌉 **Flow EVM Bridge**: [bridge.flow.com](https://bridge.flow.com)

## 🤝 Contributing

We welcome contributions from the community!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a new Pull Request

Please open issues for bugs, questions, or feature requests.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔒 Legal and Privacy

This SDK is provided as-is for educational and development purposes. Users are responsible for:
- Securing their private keys and API credentials
- Complying with local regulations regarding blockchain interactions
- Understanding the risks of autonomous agent operations
- Monitoring agent behavior in production environments

---

**Ready to build intelligent agents on Flow EVM?** Start with the Quick Start above and explore the power of AI-driven blockchain automation!

