// To enable HTTPS: see https://stackoverflow.com/questions/11744975/enabling-https-on-express-js?rq=1

// For HTTP

const express = require('express');
const body_parser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const db = require('./config/db');

require('dotenv').config();

const app = express();

const port = 3000;

app.use(body_parser.urlencoded({extended: true}));

// connect to database
MongoClient.connect(db.url, (err, database) => {
	if(err) return console.log(err);
	
	require('./app/routes')(app, database);
	
	app.listen(port,process.env.ADDRESS,  () => {
		console.log('Running on ' + port);
	});
});

// on error 404
app.use((req, res) => res.status(404).json({url: req.originalUrl + ' not found'}));
