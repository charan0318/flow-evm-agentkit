
import winston from 'winston';
import { AgentConfig } from '../types';

export class Logger {
  private static instance: winston.Logger;

  static initialize(config: AgentConfig): winston.Logger {
    if (Logger.instance) {
      return Logger.instance;
    }

    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `${timestamp} [${level}]: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
            }`;
          })
        )
      })
    ];

    if (config.logFile) {
      transports.push(
        new winston.transports.File({
          filename: config.logFile,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      );
    }

    Logger.instance = winston.createLogger({
      level: config.logLevel || 'info',
      transports,
      exceptionHandlers: [
        new winston.transports.Console(),
        ...(config.logFile ? [new winston.transports.File({ filename: config.logFile })] : [])
      ],
      rejectionHandlers: [
        new winston.transports.Console(),
        ...(config.logFile ? [new winston.transports.File({ filename: config.logFile })] : [])
      ]
    });

    return Logger.instance;
  }

  static get(): winston.Logger {
    if (!Logger.instance) {
      throw new Error('Logger not initialized. Call Logger.initialize() first.');
    }
    return Logger.instance;
  }
}
