module.exports = function(app, db) {
	app.get('/git', (req, res) => {
		res.json({message: 'Hello'});
	});
};