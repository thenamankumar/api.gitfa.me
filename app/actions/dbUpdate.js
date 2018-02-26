require('dotenv').config();
const fetchFresh = require('./fetchFresh');
const winston = require('winston');

// load loggers
const debug_logs = winston.loggers.get('debug_logs');
const error_logs = winston.loggers.get('error_logs');

const dbUpdate = (db, username, item) => {
  // more than 24 hours old data
  // get new data and update
  return fetchFresh(username)
    .then((finalData) => {
      // update to db
      if (finalData.status !== 200) {
        return finalData;
      }
      finalData['_id'] = finalData['login'].toLowerCase();

      db.collection('users').update({'_id': item['_id']}, finalData, (err, result) => {
        if (err) {
          error_logs.error('DB update failed: \'' + finalData['_id'] + '\' Error: ' + err.message);
          throw new Error('Error in updating details');
        } else {
          debug_logs.info('DB update: \'' + finalData['_id'] + '\'');
        }
      });

      return finalData;
    });
};

module.exports = dbUpdate;
