require('dotenv').config();
const fetchFresh = require('../logics/fetchFresh');

const dbUpdate = (db, username, item) => {
    // more than 24 hours old data
    // get new data and update
    return fetchFresh(req.body.name)
      .then((finalData) => {
        // update to db
        finalData['_id'] = finalData['login'];

        db.collection('stats').update(idDict, finalData, (err, result) => {
          if (err) {
            console.log('DB update failed:', '\'' + finalData['_id'] + '\'', 'Error:', err.message);
          } else {
            console.log('DB update:', '\'' + finalData['_id'] + '\'');
          }
        });

        return finalData;
      });
  };

module.exports = dbUpdate;