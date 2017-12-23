require('dotenv').config();
const fetchFresh = require('../logics/fetchFresh');
const winston = require('winston');

// load loggers
const debug_logs = winston.loggers.get('debug_logs');
const error_logs = winston.loggers.get('error_logs');

const dbInsert = (db, username) => {
  return fetchFresh(username)
    .then((finalData) => {
      // save to db
      finalData['_id'] = finalData['login'];

      db.collection('stats').insert(finalData, (err, result) => {
        if (err) {
          error_logs.error('DB insert failed: \'' + finalData['_id'] + '\' Error: ' + err.message);
          console.log('DB insert failed:', '\'' + finalData['_id'] + '\'', 'Error:', err.message);
        } else {
          debug_logs.info('DB insert: \'' + result.ops[0]['_id'] + '\'');
          console.log('DB insert:', '\'' + result.ops[0]['_id'] + '\'');
        }
      });
      return finalData;
    })
};

module.exports = dbInsert;