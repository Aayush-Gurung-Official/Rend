// Simple console-based logger placeholder. Replace with pino/winston if needed.

const info = (msg, ...args) => {
  // eslint-disable-next-line no-console
  console.log(`[INFO] ${msg}`, ...args);
};

const warn = (msg, ...args) => {
  // eslint-disable-next-line no-console
  console.warn(`[WARN] ${msg}`, ...args);
};

const error = (err, ...args) => {
  // eslint-disable-next-line no-console
  console.error('[ERROR]', err, ...args);
};

module.exports = {
  info,
  warn,
  error
};

