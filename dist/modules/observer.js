"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observer = void 0;
const viem_1 = require("viem");
const events_1 = require("events");
const logger_1 = require("../logger");
const uuid_1 = require("uuid");
class Observer extends events_1.EventEmitter {
    client;
    config;
    logger;
    isRunning = false;
    eventFilters = new Map();
    lastProcessedBlock = 0n;
    constructor(config) {
        super();
        this.config = config;
        this.logger = logger_1.Logger.get();
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
        };
        this.client = (0, viem_1.createPublicClient)({
            chain: flowEvm,
            transport: (0, viem_1.http)(config.flowRpcUrl)
        });
    }
    async start() {
        this.logger.info('Starting Flow EVM Observer...');
        this.isRunning = true;
        try {
            // Get the latest block to start from
            this.lastProcessedBlock = await this.client.getBlockNumber();
            this.logger.info(`Starting observation from block: ${this.lastProcessedBlock}`);
            // Start polling for new blocks
            this.pollForNewBlocks();
            this.emit('started');
        }
        catch (error) {
            this.logger.error('Failed to start observer:', error);
            throw error;
        }
    }
    async stop() {
        this.logger.info('Stopping Flow EVM Observer...');
        this.isRunning = false;
        this.emit('stopped');
    }
    addEventFilter(id, filter) {
        this.eventFilters.set(id, filter);
        this.logger.info(`Added event filter: ${id}`, filter);
    }
    removeEventFilter(id) {
        this.eventFilters.delete(id);
        this.logger.info(`Removed event filter: ${id}`);
    }
    async pollForNewBlocks() {
        while (this.isRunning) {
            try {
                const currentBlock = await this.client.getBlockNumber();
                if (currentBlock > this.lastProcessedBlock) {
                    await this.processBlockRange(this.lastProcessedBlock + 1n, currentBlock);
                    this.lastProcessedBlock = currentBlock;
                }
                await this.sleep(this.config.pollingInterval || 5000);
            }
            catch (error) {
                this.logger.error('Error in block polling:', error);
                await this.sleep(5000); // Wait before retrying
            }
        }
    }
    async processBlockRange(fromBlock, toBlock) {
        this.logger.debug(`Processing blocks ${fromBlock} to ${toBlock}`);
        for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
            await this.processBlock(blockNumber);
        }
    }
    async processBlock(blockNumber) {
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
                    await this.processTransaction(tx, block);
                }
            }
            // Process logs based on event filters
            await this.processLogsForBlock(blockNumber);
        }
        catch (error) {
            this.logger.error(`Error processing block ${blockNumber}:`, error);
        }
    }
    async processTransaction(tx, block) {
        // Emit transaction event
        this.emitAgentEvent('transaction', {
            transaction: tx,
            block,
            timestamp: new Date(Number(block.timestamp) * 1000)
        });
    }
    async processLogsForBlock(blockNumber) {
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
            }
            catch (error) {
                this.logger.error(`Error processing logs for filter ${filterId}:`, error);
            }
        }
    }
    emitAgentEvent(type, data) {
        const event = {
            id: (0, uuid_1.v4)(),
            type,
            timestamp: new Date(),
            data,
            processed: false
        };
        this.emit('event', event);
        this.emit(type, event);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Utility methods for specific event subscriptions
    async subscribeToContract(address, topics) {
        const filterId = (0, uuid_1.v4)();
        this.addEventFilter(filterId, {
            address,
            topics
        });
        return filterId;
    }
    async subscribeToTokenTransfers(tokenAddress) {
        const filterId = (0, uuid_1.v4)();
        this.addEventFilter(filterId, {
            address: tokenAddress,
            topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer event signature
            ]
        });
        return filterId;
    }
}
exports.Observer = Observer;
//# sourceMappingURL=observer.js.map