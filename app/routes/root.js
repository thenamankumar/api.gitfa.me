require('dotenv').config();
const dbInsert = require('../logics/dbInsert');
const dbUpdate = require('../logics/dbUpdate');

module.exports = function (app, db) {
  app.post('/', (req, res) => {
    console.log('Request:', req.body);
    if (!req.body.name) {
      return res.json({'success': false, 'message': 'This is not the correct way to use the API.'});
    }
    else {
      const idDict = {'_id': req.body.name};

      db.collection('stats').findOne(idDict, (err, item) => {
        if (err) {
          return res.json({'success': false, 'message': err.message});
        }
        else if (item === null) {
          // ID not present in DB
          dbInsert(db, req.body.name)
            .then((finalData) => {
              console.log('Response:', {name: finalData['login'], fresh: finalData['fresh']});
              return res.json(finalData);
            })
            .catch(error => {
              const response = {'success': false, 'message': error.message};
              console.log('Response:', response);
              return res.json(response);
            });
        }
        else {
          // id present in DB
          let lastFetch = new Date(item['time']);
          let now = new Date();

          if ((now.getTime() - lastFetch.getTime()) > 86400000 && (req.fresh === true || req.fresh == 'true')) {
            dbUpdate(db, req.body.name, item)
              .then((finalData) => {
                console.log('Response:', {name: finalData['login'], fresh: finalData['fresh']});
                return req.json(finalData);
              })
              .catch(error => {
                const response = {'success': false, 'message': error.message};
                console.log('Response:', response);
                return res.json(response);
              });
          }
          else {
            // send what is in DB
            item['fresh'] = false;
            console.log('Response:', {name: item['login'], fresh: item['fresh']});
            return res.json(item);
          }
        }
      });
    }
  });
};