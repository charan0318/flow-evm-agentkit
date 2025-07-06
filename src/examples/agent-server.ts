
import express from 'express';
import cors from 'cors';
import { Agent, Config, Logger } from '../index';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let agent: Agent;
let logger: any;

async function initializeAgent() {
  try {
    const config = Config.load();
    logger = Logger.initialize(config);
    agent = new Agent(config);
    
    // Add default goals
    agent.addGoal('Monitor Flow EVM blockchain');
    agent.addGoal('Respond to user queries about blockchain data');
    agent.addGoal('Execute transactions when requested');
    
    await agent.start();
    
    logger.info('Agent initialized successfully');
    return true;
  } catch (error) {
    logger?.error('Failed to initialize agent:', error);
    return false;
  }
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Flow EVM AgentKit Server is running!',
    status: agent ? agent.getStatus() : 'Not initialized',
    timestamp: new Date().toISOString()
  });
});

// Agent status endpoint
app.get('/status', (req, res) => {
  if (!agent) {
    return res.status(503).json({ error: 'Agent not initialized' });
  }
  
  res.json({
    status: agent.getStatus(),
    timestamp: new Date().toISOString()
  });
});

// Query endpoint
app.post('/query', async (req, res) => {
  try {
    if (!agent) {
      return res.status(503).json({ error: 'Agent not initialized' });
    }
    
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    const response = await agent.query(question);
    
    res.json({
      question,
      response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger?.error('Query error:', error);
    res.status(500).json({ 
      error: 'Query failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add goal endpoint
app.post('/goals', async (req, res) => {
  try {
    if (!agent) {
      return res.status(503).json({ error: 'Agent not initialized' });
    }
    
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Goal description is required' });
    }
    
    const goalId = agent.addGoal(description);
    
    res.json({
      success: true,
      goalId,
      description,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger?.error('Add goal error:', error);
    res.status(500).json({ 
      error: 'Failed to add goal',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get goals endpoint
app.get('/goals', (req, res) => {
  if (!agent) {
    return res.status(503).json({ error: 'Agent not initialized' });
  }
  
  res.json({
    goals: agent.getGoals(),
    timestamp: new Date().toISOString()
  });
});

// Balance check endpoint
app.get('/balance', async (req, res) => {
  try {
    if (!agent) {
      return res.status(503).json({ error: 'Agent not initialized' });
    }
    
    const balanceResponse = await agent.query('What is my current FLOW balance?');
    
    res.json({
      balance: balanceResponse,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger?.error('Balance check error:', error);
    res.status(500).json({ 
      error: 'Failed to check balance',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Transfer endpoint
app.post('/transfer', async (req, res) => {
  try {
    if (!agent) {
      return res.status(503).json({ error: 'Agent not initialized' });
    }
    
    const { to, amount } = req.body;
    
    if (!to || !amount) {
      return res.status(400).json({ error: 'Recipient address and amount are required' });
    }
    
    // Add transfer goal
    const goalId = agent.addGoal(`Transfer ${amount} FLOW to ${to}`);
    
    res.json({
      success: true,
      message: 'Transfer goal added',
      goalId,
      to,
      amount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger?.error('Transfer error:', error);
    res.status(500).json({ 
      error: 'Transfer failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger?.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

async function startServer() {
  console.log('🚀 Starting Flow EVM AgentKit Server...');
  
  // Initialize agent
  const agentReady = await initializeAgent();
  
  if (!agentReady) {
    console.error('❌ Failed to initialize agent');
    process.exit(1);
  }
  
  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Access your agent at: http://localhost:${PORT}`);
    console.log('📊 Available endpoints:');
    console.log('  GET  / - Health check');
    console.log('  GET  /status - Agent status');
    console.log('  POST /query - Ask agent questions');
    console.log('  GET  /goals - List goals');
    console.log('  POST /goals - Add new goal');
    console.log('  GET  /balance - Check FLOW balance');
    console.log('  POST /transfer - Transfer FLOW tokens');
  });
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    if (agent) {
      await agent.stop();
    }
    process.exit(0);
  });
}

if (require.main === module) {
  startServer().catch(console.error);
}
