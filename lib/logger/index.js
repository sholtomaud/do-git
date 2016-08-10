var bunyan = require('bunyan'),
    config = require('../config');

module.exports =  bunyan.createLogger({
    name: config.dbName,
    streams: [
        {
            level: config.logLevel,
            stream: process.stdout,
        },
        {
            level: config.logLevel,
            path: config.logFileName
        }
    ]
});
