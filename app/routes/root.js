require('dotenv').config();
const dbInsert = require('../logics/dbInsert');
const dbUpdate = require('../logics/dbUpdate');
const winston = require('winston');

// load loggers
const debug_logs = winston.loggers.get('debug_logs');
const error_logs = winston.loggers.get('error_logs');

module.exports = function (app, db) {
  app.post('/', (req, res) => {
    debug_logs.verbose('Request: %j', req.body);

    if (!req.body.name) {
      error_logs.error('This is not the correct way to use the API.');
      return res.json({'success': false, 'message': 'This is not the correct way to use the API.'});
    }
    else {
      req.body.name = req.body.name.toLowerCase();
      
      const idDict = {'_id': req.body.name};

      db.collection('users').findOne(idDict, (err, item) => {
        if (err) {
          error_logs.error(err.message);
          return res.json({'success': false, 'message': err.message});
        }
        else if (item === null) {
          // ID not present in DB
          dbInsert(db, req.body.name)
            .then((finalData) => {
              debug_logs.verbose('Response: %j', {name: req.body.name, fresh: finalData['fresh']});
              return res.json(finalData);
            })
            .catch(error => {
              error_logs.error(error.message);
              const response = {'success': false, 'message': error.message};
              return res.json(response);
            });
        }
        else {
          // id present in DB
          let lastFetch = new Date(item['time']);
          let now = new Date();

          if ((now.getTime() - lastFetch.getTime()) > 86400000 && (req.body.latest === true || req.body.latest == 'true')) {
            dbUpdate(db, req.body.name, item)
              .then((finalData) => {
                debug_logs.verbose('Response: %j', {name: req.body.name, fresh: finalData['fresh']});
                return res.json(finalData);
              })
              .catch(error => {
                error_logs.error(error.message);
                const response = {'success': false, 'message': error.message};
                return res.json(response);
              });
          }
          else {
            // send what is in DB
            item['fresh'] = false;
            debug_logs.verbose('Response: %j', {name: req.body.name, fresh: item['fresh']});
            return res.json(item);
          }
        }
      });
    }
  });
};