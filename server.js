// To enable HTTPS: see https://stackoverflow.com/questions/11744975/enabling-https-on-express-js?rq=1

// For HTTP

const express = require('express');
const body_parser = require('body-parser');

const app = express();

const port = 3000;

app.use(body_parser.urlencoded({extended: true}));

require('./app/routes')(app, {});
app.listen(port, () => {
	console.log('Running on ' + port);
});

// on error 404
app.use((req, res) => res.status(404).json({url: req.originalUrl + ' not found'}));
