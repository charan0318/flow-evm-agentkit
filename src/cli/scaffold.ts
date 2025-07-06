
#!/usr/bin/env node

import { Command } from 'commander';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const program = new Command();

interface ScaffoldOptions {
  name: string;
  type: 'observer' | 'executor' | 'full';
  directory?: string;
}

program
  .name('flow-agent-scaffold')
  .description('Scaffold a new Flow EVM agent')
  .version('0.1.0');

program
  .command('create')
  .description('Create a new Flow EVM agent')
  .requiredOption('-n, --name <name>', 'Agent name')
  .option('-t, --type <type>', 'Agent type (observer|executor|full)', 'full')
  .option('-d, --directory <dir>', 'Output directory', '.')
  .action(async (options: ScaffoldOptions) => {
    await scaffoldAgent(options);
  });

async function scaffoldAgent(options: ScaffoldOptions) {
  const { name, type, directory = '.' } = options;
  const agentDir = join(directory, name);

  console.log(`🚀 Creating Flow EVM agent: ${name}`);
  console.log(`📁 Directory: ${agentDir}`);
  console.log(`🔧 Type: ${type}`);

  // Create directory if it doesn't exist
  if (!existsSync(agentDir)) {
    mkdirSync(agentDir, { recursive: true });
  }

  // Create package.json
  const packageJson = {
    name,
    version: '0.1.0',
    description: `Flow EVM agent: ${name}`,
    main: 'dist/index.js',
    scripts: {
      build: 'tsc',
      start: 'node dist/index.js',
      dev: 'tsx src/index.ts'
    },
    dependencies: {
      'flow-evm-agentkit': '^0.1.0'
    },
    devDependencies: {
      'typescript': '^5.0.0',
      'tsx': '^4.0.0',
      '@types/node': '^20.0.0'
    }
  };

  writeFileSync(
    join(agentDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'commonjs',
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  };

  writeFileSync(
    join(agentDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );

  // Create .env.example
  const envExample = `# Flow EVM Configuration
FLOW_RPC_URL=https://mainnet.evm.nodes.onflow.org
PRIVATE_KEY=your_private_key_here

# Optional: OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Agent Configuration
AGENT_NAME=${name}
LOG_LEVEL=info
POLLING_INTERVAL=5000
`;

  writeFileSync(join(agentDir, '.env.example'), envExample);

  // Create src directory
  const srcDir = join(agentDir, 'src');
  if (!existsSync(srcDir)) {
    mkdirSync(srcDir);
  }

  // Create main agent file based on type
  let agentCode = '';

  switch (type) {
    case 'observer':
      agentCode = generateObserverAgent(name);
      break;
    case 'executor':
      agentCode = generateExecutorAgent(name);
      break;
    case 'full':
    default:
      agentCode = generateFullAgent(name);
      break;
  }

  writeFileSync(join(srcDir, 'index.ts'), agentCode);

  // Create README
  const readme = generateReadme(name, type);
  writeFileSync(join(agentDir, 'README.md'), readme);

  console.log(`✅ Agent scaffolded successfully!`);
  console.log(`\nNext steps:`);
  console.log(`1. cd ${name}`);
  console.log(`2. npm install`);
  console.log(`3. cp .env.example .env`);
  console.log(`4. Edit .env with your configuration`);
  console.log(`5. npm run dev`);
}

function generateObserverAgent(name: string): string {
  return `import { Agent, Config, Logger } from 'flow-evm-agentkit';

async function main() {
  console.log('🔍 Starting ${name} Observer Agent...');
  
  try {
    const config = Config.load();
    const logger = Logger.initialize(config);
    const agent = new Agent(config);
    
    // Add observation goals
    agent.addGoal('Monitor specific contract events');
    agent.addGoal('Log transaction patterns');
    
    // Set up event handlers
    agent.on('event', (event) => {
      if (event.type === 'transaction') {
        logger.info('Transaction observed:', {
          hash: event.data.transaction.hash,
          from: event.data.transaction.from,
          to: event.data.transaction.to
        });
      }
      
      if (event.type === 'log') {
        logger.info('Log event observed:', {
          address: event.data.log.address,
          topics: event.data.log.topics
        });
      }
    });
    
    agent.on('started', () => {
      console.log('✅ ${name} started successfully!');
      console.log('🔍 Observing Flow EVM...');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\\n🛑 Shutting down...');
      await agent.stop();
      process.exit(0);
    });
    
    await agent.start();
    
  } catch (error) {
    console.error('❌ Failed to start agent:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
`;
}

function generateExecutorAgent(name: string): string {
  return `import { Agent, Config, Logger } from 'flow-evm-agentkit';

async function main() {
  console.log('⚡ Starting ${name} Executor Agent...');
  
  try {
    const config = Config.load();
    const logger = Logger.initialize(config);
    const agent = new Agent(config);
    
    // Add execution goals
    agent.addGoal('Execute transactions based on conditions');
    agent.addGoal('Manage portfolio automatically');
    
    // Custom execution logic
    agent.on('event', async (event) => {
      // Add your custom logic here
      if (event.type === 'transaction') {
        // React to specific transactions
        const tx = event.data.transaction;
        
        // Example: React to large transfers
        if (tx.value && Number(tx.value) > 1e18) { // > 1 FLOW
          logger.info('Large transfer detected, taking action...');
          // Add custom execution logic
        }
      }
    });
    
    agent.on('started', async () => {
      console.log('✅ ${name} started successfully!');
      console.log(\`👤 Agent address: \${agent.getStatus().address}\`);
      
      // Example: Check balance on startup
      const status = agent.getStatus();
      logger.info('Agent status:', status);
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\\n🛑 Shutting down...');
      await agent.stop();
      process.exit(0);
    });
    
    await agent.start();
    
  } catch (error) {
    console.error('❌ Failed to start agent:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
`;
}

function generateFullAgent(name: string): string {
  return `import { Agent, Config, Logger } from 'flow-evm-agentkit';

async function main() {
  console.log('🤖 Starting ${name} Full Agent...');
  
  try {
    const config = Config.load();
    const logger = Logger.initialize(config);
    const agent = new Agent(config);
    
    // Add comprehensive goals
    agent.addGoal('Monitor Flow EVM for opportunities');
    agent.addGoal('Execute optimal strategies');
    agent.addGoal('Maintain portfolio health');
    
    // Set up comprehensive event handling
    agent.on('event', async (event) => {
      switch (event.type) {
        case 'transaction':
          const tx = event.data.transaction;
          logger.info('Transaction observed:', {
            hash: tx.hash,
            value: tx.value?.toString(),
            gasPrice: tx.gasPrice?.toString()
          });
          break;
          
        case 'log':
          const log = event.data.log;
          logger.info('Contract event observed:', {
            address: log.address,
            topics: log.topics.slice(0, 2) // First 2 topics for brevity
          });
          break;
          
        case 'block':
          const block = event.data.block;
          if (Number(block.number) % 100 === 0) { // Log every 100 blocks
            logger.info(\`Block \${block.number} processed\`);
          }
          break;
      }
    });
    
    agent.on('started', async () => {
      console.log('✅ ${name} started successfully!');
      console.log(\`👤 Agent address: \${agent.getStatus().address}\`);
      console.log('🧠 AI planning enabled:', !!config.openaiApiKey);
      console.log('🔍 Full monitoring active...');
    });
    
    // Status reporting
    setInterval(() => {
      const status = agent.getStatus();
      console.log(\`
📊 Agent Status:
Running: \${status.running}
Active Goals: \${status.goals.filter(g => !g.completed).length}
Completed Goals: \${status.goals.filter(g => g.completed).length}
Recent Tasks: \${status.recentTasks.length}
      \`);
    }, 60000); // Every minute
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\\n🛑 Shutting down...');
      await agent.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      await agent.stop();
      process.exit(0);
    });
    
    await agent.start();
    
  } catch (error) {
    console.error('❌ Failed to start agent:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
`;
}

function generateReadme(name: string, type: string): string {
  return `# ${name}

A Flow EVM agent generated by Flow EVM AgentKit.

## Type: ${type}

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Configure environment:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

3. Run the agent:
\`\`\`bash
npm run dev
\`\`\`

## Configuration

Edit \`.env\` with your Flow EVM configuration:

- \`FLOW_RPC_URL\`: Flow EVM RPC endpoint
- \`PRIVATE_KEY\`: Your private key (without 0x prefix)
- \`OPENAI_API_KEY\`: OpenAI API key for AI planning (optional)

## Customization

Edit \`src/index.ts\` to customize your agent's behavior:

- Add custom goals
- Implement event handlers
- Configure execution logic
- Set up monitoring rules

## Documentation

See the [Flow EVM AgentKit documentation](https://github.com/your-org/flow-evm-agentkit) for more details.
`;
}

if (require.main === module) {
  program.parse();
}

export { scaffoldAgent };
`;
