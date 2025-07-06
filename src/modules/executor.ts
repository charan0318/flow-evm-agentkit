
import { createWalletClient, createPublicClient, http, parseEther, formatEther, Address, Hash, encodeFunctionData, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { Logger } from '../logger';
import { AgentConfig, ExecutorResult } from '../types';

export class Executor {
  private walletClient: any;
  private publicClient: any;
  private account: any;
  private config: AgentConfig;
  private logger: any;

  constructor(config: AgentConfig) {
    this.config = config;
    this.logger = Logger.get();
    
    // Create account from private key
    const privateKey = config.privateKey.startsWith('0x') 
      ? config.privateKey as Hash
      : `0x${config.privateKey}` as Hash;
    
    this.account = privateKeyToAccount(privateKey);

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

    this.walletClient = createWalletClient({
      account: this.account,
      chain: flowEvm,
      transport: http(config.flowRpcUrl)
    });

    this.publicClient = createPublicClient({
      chain: flowEvm,
      transport: http(config.flowRpcUrl)
    });
  }

  async getAddress(): Promise<Address> {
    return this.account.address;
  }

  async getBalance(address?: Address): Promise<bigint> {
    const targetAddress = address || this.account.address;
    return await this.publicClient.getBalance({ address: targetAddress });
  }

  async estimateGas(to: Address, value?: bigint, data?: Hash): Promise<bigint> {
    try {
      return await this.walletClient.estimateGas({
        account: this.account,
        to,
        value: value || 0n,
        data
      });
    } catch (error) {
      this.logger.error('Gas estimation failed:', error);
      throw error;
    }
  }

  async sendTransaction(
    to: Address,
    value: bigint = 0n,
    data?: Hash,
    gasLimit?: bigint
  ): Promise<ExecutorResult> {
    try {
      this.logger.info(`Preparing transaction to ${to}, value: ${formatEther(value)} FLOW`);

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
      } else {
        this.logger.error(`Transaction failed: ${hash}`);
        return {
          success: false,
          transactionHash: hash,
          error: 'Transaction reverted',
          gasUsed: receipt.gasUsed
        };
      }
    } catch (error) {
      this.logger.error('Transaction execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async transferFlow(to: Address, amount: string): Promise<ExecutorResult> {
    const value = parseEther(amount);
    return await this.sendTransaction(to, value);
  }

  async deployContract(bytecode: Hash, constructorArgs?: any[]): Promise<ExecutorResult> {
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
      } else {
        return {
          success: false,
          transactionHash: hash,
          error: 'Contract deployment failed',
          gasUsed: receipt.gasUsed
        };
      }
    } catch (error) {
      this.logger.error('Contract deployment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async callContract(
    contractAddress: Address,
    abi: any[],
    functionName: string,
    args: any[] = [],
    value: bigint = 0n
  ): Promise<ExecutorResult> {
    try {
      this.logger.info(`Calling contract function ${functionName} on ${contractAddress}`);

      const data = encodeFunctionData({
        abi,
        functionName,
        args
      });

      return await this.sendTransaction(contractAddress, value, data);
    } catch (error) {
      this.logger.error('Contract call failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async readContract(
    contractAddress: Address,
    abi: any[],
    functionName: string,
    args: any[] = []
  ): Promise<any> {
    try {
      return await this.publicClient.readContract({
        address: contractAddress,
        abi,
        functionName,
        args
      });
    } catch (error) {
      this.logger.error('Contract read failed:', error);
      throw error;
    }
  }

  // ERC-20 token utilities
  async transferToken(
    tokenAddress: Address,
    to: Address,
    amount: bigint
  ): Promise<ExecutorResult> {
    const erc20Abi = parseAbi([
      'function transfer(address to, uint256 amount) returns (bool)'
    ]);

     return await this.callContract(tokenAddress, erc20Abi as unknown as any[], 'transfer', [to, amount]);
  }

  async getTokenBalance(tokenAddress: Address, address?: Address): Promise<bigint> {
    const erc20Abi = parseAbi([
      'function balanceOf(address owner) view returns (uint256)'
    ]);

    const targetAddress = address || this.account.address;
    return await this.readContract(tokenAddress, erc20Abi as unknown as any[], 'balanceOf', [targetAddress]);
  }
}
