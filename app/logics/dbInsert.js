require('dotenv').config();
const fetchFresh = require('../logics/fetchFresh');

const dbInsert = (db, username) => {
  return fetchFresh(username)
    .then((finalData) => {
      // save to db
      finalData['_id'] = finalData['login'];

      db.collection('stats').insert(finalData, (err, result) => {
        if (err) {
          console.log('DB insert failed:', '\'' + finalData['_id'] + '\'', 'Error:', err.message);
        } else {
          console.log('DB insert:', '\'' + result.ops[0]['_id'] + '\'');
        }
      });
      return finalData;
    })
};

module.exports = dbInsert;