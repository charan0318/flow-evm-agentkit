"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class Config {
    static load() {
        const requiredEnvVars = ['FLOW_RPC_URL', 'PRIVATE_KEY'];
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                throw new Error(`Missing required environment variable: ${envVar}`);
            }
        }
        return {
            name: process.env.AGENT_NAME || 'flow-evm-agent',
            flowRpcUrl: process.env.FLOW_RPC_URL,
            privateKey: process.env.PRIVATE_KEY,
            openaiApiKey: process.env.OPENAI_API_KEY,
            pollingInterval: parseInt(process.env.POLLING_INTERVAL || '5000'),
            logLevel: process.env.LOG_LEVEL || 'info',
            logFile: process.env.LOG_FILE || './logs/agent.log'
        };
    }
    static validateFlowRpcUrl(url) {
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        }
        catch {
            return false;
        }
    }
    static validatePrivateKey(key) {
        const cleanKey = key.startsWith('0x') ? key.slice(2) : key;
        return /^[0-9a-fA-F]{64}$/.test(cleanKey);
    }
}
exports.Config = Config;
//# sourceMappingURL=index.js.map