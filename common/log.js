const log4js = require('log4js');
log4js.configure({
  appenders: {
    errorFile: { type: 'file', filename: './Logs/errors.log' },
    debugFile: { type: 'file', filename: './Logs/debugs.log' },
    infoFile: { type: 'file', filename: './Logs/info.log' },
    error: { type: 'logLevelFilter', level: 'error', appender: 'errorFile' },
    debug: { type: 'logLevelFilter', level: 'debug', appender: 'debugFile', maxLevel: 'debug' },
    info: { type: 'logLevelFilter', level: 'info', appender: 'infoFile', maxLevel: 'info' }
  },
  categories: {
    default: { appenders: ['info', 'debug', 'error'], level: 'trace' }
  }
});
const logger = log4js.getLogger();
module.exports = logger;