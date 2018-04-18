require('dotenv').config();
const dbInsert = require('../actions/dbInsert');
const dbUpdate = require('../actions/dbUpdate');
const winston = require('winston');

// load loggers
const debug_logs = winston.loggers.get('debug_logs');
const error_logs = winston.loggers.get('error_logs');

module.exports = function (app, db) {
  app.get('/:username', (req, res) => {
    debug_logs.verbose('Request: %j', req.body);

    if (!req.params.username) {
      error_logs.error('`');
      return res.json({'success': false, 'message': 'This is not the correct way to use the API.'});
    }
    else {
      req.params.username = req.params.username.toLowerCase();

      const idDict = {'_id': req.params.username};

      db.collection('users').findOne(idDict, (err, item) => {
        if (err) {
          error_logs.error(err.message);
          return res.json({'status': false, 'message': err.message});
        }
        else if (item === null) {
          // ID not present in DB
          //   return res.status(404).json({'success':false,'message':'User not found'});
          dbInsert(db, req.params.username)
            .then((finalData) => {
              if (finalData.status !== 200) {
                return res.json(finalData);
              }
              debug_logs.verbose('Response: %j', {name: req.params.username, fresh: finalData['fresh']});
              return res.json(finalData);
            });
        }
        else {
          // id present in DB
          let lastFetch = new Date(item['time']);
          let now = new Date();

          if ((now.getTime() - lastFetch.getTime()) > 60 * 60 * 24 ** 1000 && (req.query.fresh === true || req.query.fresh === 'true')) {
            dbUpdate(db, req.params.username, item)
              .then((finalData) => {
                if (finalData.status !== 200) {
                  return res.json(item);
                }
                debug_logs.verbose('Response: %j', {name: req.params.username, fresh: finalData['fresh']});
                return res.json(finalData);
              });
          }
          else {
            // send what is in DB
            item['fresh'] = false;
            debug_logs.verbose('Response: %j', {name: req.params.username, fresh: item['fresh']});
            return res.json(item);
          }
        }
      });
    }
  });
};
