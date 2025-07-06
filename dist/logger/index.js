"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
class Logger {
    static instance;
    static initialize(config) {
        if (Logger.instance) {
            return Logger.instance;
        }
        const transports = [
            new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp(), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
                    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
                }))
            })
        ];
        if (config.logFile) {
            transports.push(new winston_1.default.transports.File({
                filename: config.logFile,
                format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json())
            }));
        }
        Logger.instance = winston_1.default.createLogger({
            level: config.logLevel || 'info',
            transports,
            exceptionHandlers: [
                new winston_1.default.transports.Console(),
                ...(config.logFile ? [new winston_1.default.transports.File({ filename: config.logFile })] : [])
            ],
            rejectionHandlers: [
                new winston_1.default.transports.Console(),
                ...(config.logFile ? [new winston_1.default.transports.File({ filename: config.logFile })] : [])
            ]
        });
        return Logger.instance;
    }
    static get() {
        if (!Logger.instance) {
            throw new Error('Logger not initialized. Call Logger.initialize() first.');
        }
        return Logger.instance;
    }
}
exports.Logger = Logger;
//# sourceMappingURL=index.js.map