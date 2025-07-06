import winston from 'winston';
import { AgentConfig } from '../types';
export declare class Logger {
    private static instance;
    static initialize(config: AgentConfig): winston.Logger;
    static get(): winston.Logger;
}
//# sourceMappingURL=index.d.ts.map