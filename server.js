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

const logger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true,
      level: 'debug'
    }),
    // save to file
    new (winston.transports.File)({
      filename: `${logDir}/all.log`,
      timestamp: tsFormat,
      level: 'debug'
    })
  ]
});


require('dotenv').config();

const app = express();
app.use(cors());

const port = 3000;

app.use(body_parser.urlencoded({extended: true}));

// connect to database
MongoClient.connect(db.url, (err, database) => {
  if(err) {
  	logger.error(err);
    return console.log(err);
  }

  require('./app/routes')(app, database);

  app.listen(port, process.env.ADDRESS, () => {
    logger.info('Running on ' + port);
    console.log('Running on ' + port);
  });

  // on error 404
  app.use((req, res) => {
  	logger.info(req.originalUrl + 'This is not the correct way to use the API.');
  	res.status(404).json({url: req.originalUrl + 'This is not the correct way to use the API.'})
  });

});
