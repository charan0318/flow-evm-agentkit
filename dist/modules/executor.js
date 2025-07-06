"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Executor = void 0;
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const logger_1 = require("../logger");
class Executor {
    walletClient;
    publicClient;
    account;
    config;
    logger;
    constructor(config) {
        this.config = config;
        this.logger = logger_1.Logger.get();
        // Create account from private key
        const privateKey = config.privateKey.startsWith('0x')
            ? config.privateKey
            : `0x${config.privateKey}`;
        this.account = (0, accounts_1.privateKeyToAccount)(privateKey);
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
        this.walletClient = (0, viem_1.createWalletClient)({
            account: this.account,
            chain: flowEvm,
            transport: (0, viem_1.http)(config.flowRpcUrl)
        });
        this.publicClient = (0, viem_1.createPublicClient)({
            chain: flowEvm,
            transport: (0, viem_1.http)(config.flowRpcUrl)
        });
    }
    async getAddress() {
        return this.account.address;
    }
    async getBalance(address) {
        const targetAddress = address || this.account.address;
        return await this.publicClient.getBalance({ address: targetAddress });
    }
    async estimateGas(to, value, data) {
        try {
            return await this.walletClient.estimateGas({
                account: this.account,
                to,
                value: value || 0n,
                data
            });
        }
        catch (error) {
            this.logger.error('Gas estimation failed:', error);
            throw error;
        }
    }
    async sendTransaction(to, value = 0n, data, gasLimit) {
        try {
            this.logger.info(`Preparing transaction to ${to}, value: ${(0, viem_1.formatEther)(value)} FLOW`);
            // Estimate gas if not provided
            const estimatedGas = gasLimit || await this.estimateGas(to, value, data);
            // Send transaction
            const hash = await this.walletClient.sendTransaction({
                account: this.account,
                to,
                value,
                data,
                gas: estimatedGas
            });
            this.logger.info(`Transaction sent: ${hash}`);
            // Wait for confirmation
            const receipt = await this.walletClient.waitForTransactionReceipt({ hash });
            if (receipt.status === 'success') {
                this.logger.info(`Transaction confirmed: ${hash}, Gas used: ${receipt.gasUsed}`);
                return {
                    success: true,
                    transactionHash: hash,
                    result: receipt,
                    gasUsed: receipt.gasUsed
                };
            }
            else {
                this.logger.error(`Transaction failed: ${hash}`);
                return {
                    success: false,
                    transactionHash: hash,
                    error: 'Transaction reverted',
                    gasUsed: receipt.gasUsed
                };
            }
        }
        catch (error) {
            this.logger.error('Transaction execution failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async transferFlow(to, amount) {
        const value = (0, viem_1.parseEther)(amount);
        return await this.sendTransaction(to, value);
    }
    async deployContract(bytecode, constructorArgs) {
        try {
            this.logger.info('Deploying contract...');
            const hash = await this.walletClient.deployContract({
                abi: [], // ABI would be provided by the calling code
                bytecode,
                args: constructorArgs || []
            });
            this.logger.info(`Contract deployment transaction: ${hash}`);
            const receipt = await this.walletClient.waitForTransactionReceipt({ hash });
            if (receipt.status === 'success') {
                this.logger.info(`Contract deployed at: ${receipt.contractAddress}`);
                return {
                    success: true,
                    transactionHash: hash,
                    result: {
                        contractAddress: receipt.contractAddress,
                        receipt
                    },
                    gasUsed: receipt.gasUsed
                };
            }
            else {
                return {
                    success: false,
                    transactionHash: hash,
                    error: 'Contract deployment failed',
                    gasUsed: receipt.gasUsed
                };
            }
        }
        catch (error) {
            this.logger.error('Contract deployment failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async callContract(contractAddress, abi, functionName, args = [], value = 0n) {
        try {
            this.logger.info(`Calling contract function ${functionName} on ${contractAddress}`);
            const data = (0, viem_1.encodeFunctionData)({
                abi,
                functionName,
                args
            });
            return await this.sendTransaction(contractAddress, value, data);
        }
        catch (error) {
            this.logger.error('Contract call failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async readContract(contractAddress, abi, functionName, args = []) {
        try {
            return await this.publicClient.readContract({
                address: contractAddress,
                abi,
                functionName,
                args
            });
        }
        catch (error) {
            this.logger.error('Contract read failed:', error);
            throw error;
        }
    }
    // ERC-20 token utilities
    async transferToken(tokenAddress, to, amount) {
        const erc20Abi = (0, viem_1.parseAbi)([
            'function transfer(address to, uint256 amount) returns (bool)'
        ]);
        return await this.callContract(tokenAddress, erc20Abi, 'transfer', [to, amount]);
    }
    async getTokenBalance(tokenAddress, address) {
        const erc20Abi = (0, viem_1.parseAbi)([
            'function balanceOf(address owner) view returns (uint256)'
        ]);
        const targetAddress = address || this.account.address;
        return await this.readContract(tokenAddress, erc20Abi, 'balanceOf', [targetAddress]);
    }
}
exports.Executor = Executor;
//# sourceMappingURL=executor.js.map