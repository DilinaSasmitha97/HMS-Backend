const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = process.env.LOG_LEVEL || 'info';

function shouldLog(level) {
  return LEVELS[level] >= LEVELS[currentLevel];
}

const ts = () => new Date().toISOString();

module.exports = {
  debug: (...args) => {
    if (shouldLog('debug')) {
      console.debug(`[${ts()}] DEBUG`, ...args);
    }
  },
  info: (...args) => {
    if (shouldLog('info')) {
      console.info(`[${ts()}] INFO`, ...args);
    }
  },
  warn: (...args) => {
    if (shouldLog('warn')) {
      console.warn(`[${ts()}] WARN`, ...args);
    }
  },
  error: (...args) => {
    if (shouldLog('error')) {
      console.error(`[${ts()}] ERROR`, ...args);
    }
  }
};
