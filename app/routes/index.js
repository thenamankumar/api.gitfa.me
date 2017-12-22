const root = require('./root');

module.exports = (app, db) => {
  // mention all routes here
  root(app, db);
}