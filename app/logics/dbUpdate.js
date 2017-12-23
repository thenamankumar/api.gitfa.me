require('dotenv').config();
const fetchFresh = require('../logics/fetchFresh');
const winston = require('winston');

// load loggers
const debug_logs = winston.loggers.get('debug_logs');
const error_logs = winston.loggers.get('error_logs');

const dbUpdate = (db, username, item) => {
    // more than 24 hours old data
    // get new data and update
    return fetchFresh(req.body.name)
      .then((finalData) => {
        // update to db
        finalData['_id'] = finalData['login'];

        db.collection('stats').update(idDict, finalData, (err, result) => {
          if (err) {
            error_logs.error('DB update failed: \'' + finalData['_id'] + '\' Error: ' + err.message);
          } else {
            debug_logs.info('DB update: \'' + finalData['_id'] + '\'');
          }
        });

        return finalData;
      });
  };

module.exports = dbUpdate;