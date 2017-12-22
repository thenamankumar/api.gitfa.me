const express = require('express');
const body_parser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const db = require('./config/db');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(cors());

const port = 3000;

app.use(body_parser.urlencoded({extended: true}));

// connect to database
MongoClient.connect(db.url, (err, database) => {
  if(err) {
    return console.log(err);
  }

  require('./app/routes')(app, database);

  app.listen(port, process.env.ADDRESS, () => {
    console.log('Running on ' + port);
  });

  // on error 404
  app.use((req, res) => res.status(404).json({url: req.originalUrl + 'This is not the correct way to use the API.'}));

});
