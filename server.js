// For HTTP

const express = require('express');
const body_parser = require('body-parser');

const app = express();

const port = 8080

app.use(body_parser.urlencoded({extended: true}));

app.use(function(req, res) {
	res.status(404).json({url: req.originalUrl + ' not found'})
});

require('./app/routes')(app, {});
app.listen(port, () => {
	console.log('Running on ' + port);
});

/*
app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
*/