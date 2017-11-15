const github_routes = require('./github_routes');

module.exports = function(app, db) {
	// mention all routes here
	github_routes(app, db);
}