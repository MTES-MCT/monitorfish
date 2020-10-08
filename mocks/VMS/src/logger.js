const winston = require('winston');

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console()
    ],
    exitOnError: false
});

module.exports=logger;