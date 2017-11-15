// For HTTP

const express = require('express');
const body_parser = require('body-parser');

const app = express();

const port = 8080

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