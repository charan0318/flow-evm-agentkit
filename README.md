
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

### 4. Send Transactions

```typescript
// The agent can execute transactions through goals
agent.addGoal('Transfer 1 FLOW to 0x742d35Cc8C15C80085E31c65E8bB38C98b2a3B86');

// Or query for current state
const balance = await agent.query('What is my current FLOW balance?');
console.log('Balance response:', balance);
```

### 5. Smart Contract Interactions

```typescript
// Deploy a contract
agent.addGoal('Deploy an ERC-20 token contract with symbol "MYTOKEN"');

// Interact with existing contracts
agent.addGoal('Call the transfer function on contract 0x... to send 100 tokens');
```

### 6. Monitor Blockchain Events

```typescript
// The agent automatically monitors events, but you can listen to them
agent.on('event', (event) => {
  switch (event.type) {
    case 'transaction':
      console.log('Transaction detected:', {
        hash: event.data.transaction.hash,
        value: event.data.transaction.value
      });
      break;
    case 'log':
      console.log('Contract event:', {
        address: event.data.log.address,
        topics: event.data.log.topics
      });
      break;
  }
});
```

### 7. Query Agent Intelligence

```typescript
// Ask the agent questions about the blockchain
const response = await agent.query('What was the last transaction I sent?');
console.log('Agent response:', response);

// Get agent status
const status = agent.getStatus();
console.log('Agent status:', {
  running: status.running,
  goals: status.goals.length,
  recentTasks: status.recentTasks.length
});
```

## 🌐 Server Deployment

For public deployment on Replit or other platforms:

```typescript
import express from 'express';
import { Agent, Config } from 'flow-evm-agentkit';

const app = express();
const PORT = process.env.PORT || 5000;

async function main() {
  const config = Config.load();
  const agent = new Agent(config);
  
  await agent.start();
  
  app.get('/', (req, res) => {
    res.json({
      message: 'Flow EVM Agent is running!',
      status: agent.getStatus()
    });
  });
  
  app.get('/query/:question', async (req, res) => {
    try {
      const response = await agent.query(req.params.question);
      res.json({ response });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Flow EVM Agent server running on port ${PORT}`);
  });
}

main().catch(console.error);
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

## 📚 Examples

### Transaction Monitor Agent
```typescript
import { Agent, Config } from 'flow-evm-agentkit';

const agent = new Agent(Config.load());
agent.addGoal('Monitor and log all transactions on Flow EVM');

agent.on('event', (event) => {
  if (event.type === 'transaction') {
    console.log('New transaction:', event.data.transaction.hash);
  }
});

await agent.start();
```

### Trading Bot Agent
```typescript
const agent = new Agent(Config.load());
agent.addGoal('Execute trades when price conditions are favorable');
agent.addGoal('Maintain portfolio balance above 100 FLOW');

await agent.start();
```

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
