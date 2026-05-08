const PREFIX = '[Bookmark Master Pro]';
export const logger = {
  debug: (...args) => console.debug(PREFIX, ...args),
  info: (...args) => console.info(PREFIX, ...args),
  warn: (...args) => console.warn(PREFIX, ...args),
  error: (...args) => console.error(PREFIX, ...args)
};
