const express = require('express');
const body_parser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const db = require('./config/db');
const cors = require('cors');
const winston = require('winston');  // logger
const fs = require('fs');  // for file IO
const logDir = 'logs';  // name of directory where logs will be stored


// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const tsFormat = () => new Date();  // timestamp format

// configure the logger for debug and below logs
winston.loggers.add('debug_logs', {
  console: {
    level: 'debug',
    colorize: true,
    timestamp: false,
    prettyPrint: true
  },
  file: {
    filename: `${logDir}/debug.log`,
    timestamp: tsFormat,
    json: false,
    level: 'debug',
    prettyPrint: true
  }
});

// configure the logger for error logs
winston.loggers.add('error_logs', {
  console: {
    level: 'error',
    colorize: true,
    label: 'error logs',
    timestamp: false,
    prettyPrint: true
  },
  file: {
    filename: `${logDir}/error.log`,
    timestamp: tsFormat,
    json: false,
    level: 'error',
    prettyPrint: true
  }
});


require('dotenv').config();

const app = express();
app.use(cors());

const port = 3000;

// load loggers
const debug_logs = winston.loggers.get('debug_logs');
const error_logs = winston.loggers.get('error_logs');

app.use(body_parser.urlencoded({extended: true}));

// connect to database
MongoClient.connect(db.url, (err, database) => {
  if(err) {
    error_logs.error(err);
    return console.log(err);
  }

  require('./app/routes')(app, database);

  app.listen(port, process.env.ADDRESS, () => {
    debug_logs.info('Running on ' + port);
  });

  // on error 404
  app.use((req, res) => {
    debug_logs.info(req.originalUrl + 'This is not the correct way to use the API.');
    res.status(404).json({url: req.originalUrl + 'This is not the correct way to use the API.'})
  });

});
