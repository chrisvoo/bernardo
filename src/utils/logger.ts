import winston from 'winston';

export enum WinstonLevel {
  error = 0,
  warn = 1,
  info = 2,
  http = 3,
  verbose = 4,
  debug = 5,
  silly = 6
}

/**
 * Sets the Winston logging level ('info' by default).
 * @returns {string} The selected logging level
 */
function getLevel(): string {
  const level: string = process.env.LOG_LEVEL?.toLowerCase() || 'info';
  if (!Object.keys(WinstonLevel).includes(level)) {
    throw new Error(`Wrong Winston logging level: ${level}`);
  }

  return level;
}

export const consoleTransport = new winston.transports.Console();
consoleTransport.name = 'console';

export default winston.createLogger({
  level: getLevel(),
  transports: [
    consoleTransport,
  ],
});
