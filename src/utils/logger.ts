/**
 * Logger utility that automatically removes logs in production builds
 * Use this instead of console.log/error/warn for better production performance
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log messages (only in development)
   */
  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log errors (always shown, even in production)
   */
  error: (...args: unknown[]): void => {
    console.error(...args);
  },

  /**
   * Log warnings (always shown, even in production)
   */
  warn: (...args: unknown[]): void => {
    console.warn(...args);
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log info messages (only in development)
   */
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
};







