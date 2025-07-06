import { Address, Hash } from 'viem';
import { AgentConfig, ExecutorResult } from '../types';
export declare class Executor {
    private walletClient;
    private publicClient;
    private account;
    private config;
    private logger;
    constructor(config: AgentConfig);
    getAddress(): Promise<Address>;
    getBalance(address?: Address): Promise<bigint>;
    estimateGas(to: Address, value?: bigint, data?: Hash): Promise<bigint>;
    sendTransaction(to: Address, value?: bigint, data?: Hash, gasLimit?: bigint): Promise<ExecutorResult>;
    transferFlow(to: Address, amount: string): Promise<ExecutorResult>;
    deployContract(bytecode: Hash, constructorArgs?: any[]): Promise<ExecutorResult>;
    callContract(contractAddress: Address, abi: any[], functionName: string, args?: any[], value?: bigint): Promise<ExecutorResult>;
    readContract(contractAddress: Address, abi: any[], functionName: string, args?: any[]): Promise<any>;
    transferToken(tokenAddress: Address, to: Address, amount: bigint): Promise<ExecutorResult>;
    getTokenBalance(tokenAddress: Address, address?: Address): Promise<bigint>;
}
//# sourceMappingURL=executor.d.ts.map