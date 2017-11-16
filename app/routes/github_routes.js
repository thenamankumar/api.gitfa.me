const fetch = require('node-fetch');

module.exports = function(app, db) {
	app.get('/users/:name', (req, res) => {
		fetch('https://api.github.com/users/' + req.params.name + '?client_id=306bffb6acf1e4b78303&client_secret=64f16f44d1346f04b72e6c9cb3f60e727b400c88')
			.then(response => {
				return response.json();
			})
			.then(data => {
				console.log(data);
				res.send(data);
			})
			.catch(error => {
				console.log(error);
				res.json({'error': error});
			});
	});
};