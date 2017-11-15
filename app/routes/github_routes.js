module.exports = function(app, db) {
	app.get('/git', (req, res) => {
		res.send('Hello');
	});
};