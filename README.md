# Flow EVM AgentKit

TypeScript SDK for building LLM-integrated autonomous agents on Flow EVM blockchain.

## 📖 Project Description

Flow EVM AgentKit is a comprehensive TypeScript SDK that enables developers to build intelligent, autonomous agents capable of interacting with the Flow EVM blockchain. The kit provides a complete framework for agents that can observe blockchain events, make intelligent decisions using Large Language Models, and execute complex on-chain operations.

Key capabilities include:
- **Autonomous Operation**: Self-directed agents that observe, plan, and execute
- **LLM Integration**: OpenAI/LangChain integration for intelligent decision making
- **Real-time Monitoring**: Live blockchain event observation and response
- **Memory & Learning**: Persistent knowledge storage and retrieval
- **Modular Architecture**: Extensible components for custom use cases

## 🗂 Repository Structure

```
flow-evm-agentkit/
├── README.md                 # This file
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── .env.example            # Environment variables template
├── src/
│   ├── core/
│   │   └── agent.ts        # Main Agent class
│   ├── modules/
│   │   ├── executor.ts     # Action execution
│   │   ├── knowledge.ts    # Memory and learning
│   │   ├── observer.ts     # Event monitoring
│   │   └── planner.ts      # Decision making
│   ├── examples/
│   │   └── tx-echo-agent.ts # Transaction monitoring example
│   ├── cli/
│   │   └── scaffold.ts     # Agent scaffolding tool
│   ├── config/
│   │   └── index.ts        # Configuration management
│   ├── logger/
│   │   └── index.ts        # Logging utilities
│   ├── types/
│   │   └── index.ts        # Type definitions
│   └── index.ts            # Main exports
└── logs/                   # Application logs
```

## 🚀 Quickstart

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Flow EVM wallet with private key
- (Optional) OpenAI API key for LLM features

### Installation

```bash
npm install flow-evm-agentkit
```

### Environment Variables

Copy the environment template:
```bash
cp .env.example .env
```

Configure your environment:
```bash
# Required
FLOW_RPC_URL=https://mainnet.evm.nodes.onflow.org
PRIVATE_KEY=your_private_key_here

# Optional
OPENAI_API_KEY=your_openai_api_key_here
AGENT_NAME=MyFlowAgent
LOG_LEVEL=info
```

## 🔧 Usage

### Basic Setup

```typescript
import { Agent, Config } from 'flow-evm-agentkit';

// Load configuration from environment
const config = Config.load();

// Create and start agent
const agent = new Agent(config);
await agent.start();

// Add goals
agent.addGoal('Monitor Flow EVM for opportunities');
agent.addGoal('Execute optimal trading strategies');

// Handle events
agent.on('event', (event) => {
  console.log('Agent observed:', event.type);
});
```

### Using with LLM Planning

```typescript
import { Agent, Config } from 'flow-evm-agentkit';

const config = Config.load();
const agent = new Agent(config);

// Agent will use LLM for intelligent planning
agent.addGoal('Analyze market conditions and execute trades');
await agent.start();

// Query the agent
const response = await agent.query('What is my current balance?');
console.log(response);
```

## 💬 Example Interactions

### Transaction Monitoring
```typescript
import { Agent } from 'flow-evm-agentkit';

const agent = new Agent(config);
agent.addGoal('Monitor and log all transactions on Flow EVM');

agent.on('event', (event) => {
  if (event.type === 'transaction') {
    console.log(`New transaction: ${event.data.transaction.hash}`);
  }
});

await agent.start();
```

### Balance Checking
```typescript
// Agent can check balances and respond intelligently
const response = await agent.query('Check my current FLOW balance');
// Output: "Your current balance is 10.5 FLOW tokens"
```

### Basic Operations
```typescript
// Add goal for token transfer
agent.addGoal('Transfer 1 FLOW to 0x742d35Cc8C15C80085E31c65E8bB38C98b2a3B86');

// Agent will plan and execute the transfer
await agent.start();
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run example agents:
```bash
# Transaction echo agent
npm run example:tx-echo

# Custom agent development
npm run dev
```

## 📝 License

MIT License - see LICENSE file for details.

## 🔒 Legal and Privacy

This SDK is provided as-is for educational and development purposes. Users are responsible for:
- Securing their private keys and API credentials
- Complying with local regulations regarding blockchain interactions
- Understanding the risks of autonomous agent operations
- Monitoring agent behavior in production environments

## 🙏 Credits

Built with:
- [Viem](https://viem.sh/) - Ethereum client
- [LangChain](https://langchain.com/) - LLM framework
- [OpenAI](https://openai.com/) - Language model provider
- [Flow](https://flow.com/) - Blockchain platform

## 📌 Notes

This is a generic agent framework that can be adapted for various blockchain networks. Replace `<CHAIN_NAME>` placeholders with specific network details as needed.

For production use, ensure proper security measures including:
- Secure key management
- Rate limiting
- Error handling
- Monitoring and alerting

## 🚀 Features

- **Agent Core Module**: Manages agent lifecycle with composable modules
- **Observer Module**: Listens to on-chain events on Flow EVM via viem/ethers.js
- **Executor Module**: Sends transactions with gas estimation and nonce management
- **Planner Module**: LLM-powered decision making using OpenAI/LangChain
- **Knowledge Module**: Memory system with vector store support
- **Logger & Config**: Structured logging and environment-based configuration

## 🛠️ Tech Stack

- TypeScript + Node.js
- viem for Ethereum interactions
- OpenAI for LLM integration
- ChromaDB for vector storage (optional)
- dotenv for configuration

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure:

```bash
FLOW_RPC_URL=https://mainnet.evm.nodes.onflow.org
PRIVATE_KEY=your_private_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

## 🚀 Quick Start

### Basic Agent

```typescript
import { FlowEVMAgent } from './src';

const agent = new FlowEVMAgent({
  privateKey: process.env.PRIVATE_KEY!,
  rpcUrl: process.env.FLOW_RPC_URL!,
  openaiApiKey: process.env.OPENAI_API_KEY,
});

await agent.start();
```

### Transaction Echo Agent

```typescript
import { TxEchoAgent } from './src/examples/tx-echo-agent';

const echoAgent = new TxEchoAgent();
await echoAgent.start();
```

### Price Monitor Agent

```typescript
import { PriceMonitorAgent } from './src/examples/price-monitor-agent';

const priceAgent = new PriceMonitorAgent();
await priceAgent.start();
```

## 🏗️ Architecture

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

## 📚 Examples

### 1. Transaction Echo Agent
Observes Flow EVM transactions and echoes them with analysis.

## 🔧 CLI Scaffold

Generate a new agent:

```bash
npx ts-node src/cli/scaffold.ts my-new-agent
```

## 🧪 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build project
npm run build

# Run tests
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Issues & Support

Please report issues on [GitHub Issues](https://github.com/your-repo/flow-evm-agentkit/issues).

## 🔗 Flow EVM Resources

- [Flow EVM Documentation](https://developers.flow.com/evm/build)
- [Flow EVM RPC Endpoints](https://developers.flow.com/networks/flow-evm/endpoints)
- [Flow EVM Bridge](https://bridge.flow.com/)
