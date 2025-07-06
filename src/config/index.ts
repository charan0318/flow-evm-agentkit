
import dotenv from 'dotenv';
import { AgentConfig } from '../types';

dotenv.config();

export class Config {
  static load(): AgentConfig {
    const requiredEnvVars = ['FLOW_RPC_URL', 'PRIVATE_KEY'];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    return {
      name: process.env.AGENT_NAME || 'flow-evm-agent',
      flowRpcUrl: process.env.FLOW_RPC_URL!,
      privateKey: process.env.PRIVATE_KEY!,
      openaiApiKey: process.env.OPENAI_API_KEY,
      pollingInterval: parseInt(process.env.POLLING_INTERVAL || '5000'),
      logLevel: (process.env.LOG_LEVEL as any) || 'info',
      logFile: process.env.LOG_FILE || './logs/agent.log'
    };
  }

  static validateFlowRpcUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  static validatePrivateKey(key: string): boolean {
    const cleanKey = key.startsWith('0x') ? key.slice(2) : key;
    return /^[0-9a-fA-F]{64}$/.test(cleanKey);
  }
}
