
import { createPublicClient, http, Log, Block, Transaction, Hash, Address } from 'viem';
import { EventEmitter } from 'events';
import { Logger } from '../logger';
import { AgentConfig, EventFilter, AgentEvent } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class Observer extends EventEmitter {
  private client: any;
  private config: AgentConfig;
  private logger: any;
  private isRunning: boolean = false;
  private eventFilters: Map<string, EventFilter> = new Map();
  private lastProcessedBlock: bigint = 0n;

  constructor(config: AgentConfig) {
    super();
    this.config = config;
    this.logger = Logger.get();
    
    // Define Flow EVM chain
    const flowEvm = {
      id: 747,
      name: 'Flow EVM',
      network: 'flow-evm',
      nativeCurrency: {
        decimals: 18,
        name: 'Flow',
        symbol: 'FLOW',
      },
      rpcUrls: {
        default: {
          http: [config.flowRpcUrl],
        },
        public: {
          http: [config.flowRpcUrl],
        },
      },
    } as const;

    this.client = createPublicClient({
      chain: flowEvm,
      transport: http(config.flowRpcUrl)
    });
  }

  async start(): Promise<void> {
    this.logger.info('Starting Flow EVM Observer...');
    this.isRunning = true;
    
    try {
      // Get the latest block to start from
      this.lastProcessedBlock = await this.client.getBlockNumber();
      this.logger.info(`Starting observation from block: ${this.lastProcessedBlock}`);
      
      // Start polling for new blocks
      this.pollForNewBlocks();
      
      this.emit('started');
    } catch (error) {
      this.logger.error('Failed to start observer:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping Flow EVM Observer...');
    this.isRunning = false;
    this.emit('stopped');
  }

  addEventFilter(id: string, filter: EventFilter): void {
    this.eventFilters.set(id, filter);
    this.logger.info(`Added event filter: ${id}`, filter);
  }

  removeEventFilter(id: string): void {
    this.eventFilters.delete(id);
    this.logger.info(`Removed event filter: ${id}`);
  }

  private async pollForNewBlocks(): Promise<void> {
    while (this.isRunning) {
      try {
        const currentBlock = await this.client.getBlockNumber();
        
        if (currentBlock > this.lastProcessedBlock) {
          await this.processBlockRange(this.lastProcessedBlock + 1n, currentBlock);
          this.lastProcessedBlock = currentBlock;
        }
        
        await this.sleep(this.config.pollingInterval || 5000);
      } catch (error) {
        this.logger.error('Error in block polling:', error);
        await this.sleep(5000); // Wait before retrying
      }
    }
  }

  private async processBlockRange(fromBlock: bigint, toBlock: bigint): Promise<void> {
    this.logger.debug(`Processing blocks ${fromBlock} to ${toBlock}`);
    
    for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
      await this.processBlock(blockNumber);
    }
  }

  private async processBlock(blockNumber: bigint): Promise<void> {
    try {
      const block = await this.client.getBlock({
        blockNumber,
        includeTransactions: true
      });

      // Emit block event
      this.emitAgentEvent('block', {
        block,
        blockNumber,
        timestamp: new Date(Number(block.timestamp) * 1000)
      });

      // Process transactions in the block
      if (block.transactions) {
        for (const tx of block.transactions) {
          await this.processTransaction(tx as Transaction, block);
        }
      }

      // Process logs based on event filters
      await this.processLogsForBlock(blockNumber);
      
    } catch (error) {
      this.logger.error(`Error processing block ${blockNumber}:`, error);
    }
  }

  private async processTransaction(tx: Transaction, block: Block): Promise<void> {
    // Emit transaction event
    this.emitAgentEvent('transaction', {
      transaction: tx,
      block,
      timestamp: new Date(Number(block.timestamp) * 1000)
    });
  }

  private async processLogsForBlock(blockNumber: bigint): Promise<void> {
    for (const [filterId, filter] of this.eventFilters) {
      try {
        const logs = await this.client.getLogs({
          ...filter,
          fromBlock: blockNumber,
          toBlock: blockNumber
        });

        for (const log of logs) {
          this.emitAgentEvent('log', {
            log,
            filterId,
            blockNumber,
            timestamp: new Date()
          });
        }
      } catch (error) {
        this.logger.error(`Error processing logs for filter ${filterId}:`, error);
      }
    }
  }

  private emitAgentEvent(type: 'transaction' | 'log' | 'block', data: any): void {
    const event: AgentEvent = {
      id: uuidv4(),
      type,
      timestamp: new Date(),
      data,
      processed: false
    };

    this.emit('event', event);
    this.emit(type, event);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility methods for specific event subscriptions
  async subscribeToContract(address: Address, topics?: (Hash | Hash[] | null)[]): Promise<string> {
    const filterId = uuidv4();
    this.addEventFilter(filterId, {
      address,
      topics
    });
    return filterId;
  }

  async subscribeToTokenTransfers(tokenAddress?: Address): Promise<string> {
    const filterId = uuidv4();
    this.addEventFilter(filterId, {
      address: tokenAddress,
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer event signature
      ]
    });
    return filterId;
  }
}
