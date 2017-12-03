const fetch = require('node-fetch');
require('dotenv').config();

function userPayload(username) {
  return {
    'query': `
    	query($username: String!)
    	{
				user(login: $username) {
					...userData
				}
			}
			
			fragment userData on User {
			  id
			  login
			  name
			  bio
				avatarUrl
				url
				followers {
					totalCount
				}
				following {
					totalCount
				}
				repositories {
				  totalCount
				}
			}
		`,
    "variables": `
			{
				"username": "` + username + `"
			}
		`
  }
}

function reposPayload(username, id, endCursor) {
  return {
    "query": `
			query($username: String!, $id: ID!, $afterCursor: String)
			{
				user(login: $username) {
					repositories(first: 100, after: $afterCursor, orderBy: {field: NAME,direction: ASC}) {
						...repoData
					}
				}
			}

			fragment repoStats on Repository {
				nameWithOwner
				url
				owner {
					login
				}
				stargazers {
					totalCount
				}
				watchers {
					totalCount
				}
				forks {
					totalCount
				}
				branch: defaultBranchRef {
				  name
				}
				languages(first: 100){
          nodes{
            name
            color
          }
        }
				contributions: defaultBranchRef {
					target {
						... on Commit {
							userCommits: history(author: {id: $id}) {
								totalCount
							}
							totalCommits: history {
								totalCount
							}
						}
					}
				}
			}

			fragment repoData on RepositoryConnection {
				totalCount
				pageInfo {
					hasNextPage
					endCursor
				}
				nodes {
					... on Repository {
						isFork
					  parent {
 							...repoStats
 						}
						...repoStats
					}
				}
			}
		`,
    "variables": `
			{
				"username": "` + username + `",
				"id": "` + id + `",
				"afterCursor": ` + (endCursor !== null ? `"` + endCursor + `"` : `null`) + `
			}
		`
  }
}

function fetchData(req, res) {
  return fetch('https://api.github.com/graphql', {
    method: 'POST',
    body: JSON.stringify(userPayload(req.body.name, true, null)),
    headers: {
      'Authorization': 'bearer ' + process.env.GIT_TOKEN,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (response.ok) return response.json();

      throw new Error('error');
    })
    .then(userData => {
      let userInfo = {
        'success': true,
      };

      if (userData['data'] === null) throw new Error(userData['errors'][0]['message']);
      if (userData['data']['user'] === null) throw new Error('Not found');

      userData = userData['data']['user'];
      userInfo['public_repos'] = userData['repositories']['totalCount'];
      userInfo['avatar_url'] = userData['avatarUrl'];
      userInfo['followers'] = userData['followers']['totalCount'];
      userInfo['following'] = userData['following']['totalCount'];
      userInfo['html_url'] = userData['url'];
      userInfo['id'] = userData['id'];
      userInfo['login'] = userData['login'];
      userInfo['name'] = userData['name'];
      userInfo['bio'] = userData['bio'];
      userInfo['commits'] = 0;
      userInfo['stars'] = 0;
      userInfo['forks'] = 0;
      userInfo['watchers'] = 0;
      userInfo['languages'] = [];
      userInfo['repos'] = [];

      return userInfo;
    })
    .then(userInfo => {
      // get repositories and contributions
      let repositoryPromises = [];
      repositoryPromises.push(traverseAllCursors(null));

      function traverseAllCursors(endCursor) {
        return fetch('https://api.github.com/graphql', {
          method: 'POST',
          body: JSON.stringify(reposPayload(userInfo['login'], userInfo['id'], endCursor)),
          headers: {
            'Authorization': 'bearer ' + process.env.GIT_TOKEN,
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            if (response.ok) return response.json();

            throw new Error('error');
          })
          .then(userData => {
            if (userData['data'] === null) throw new Error(userData['errors'][0]['message']);

            userData = userData['data']['user'];
            let repos = [];
            for (let i = 0; i < userData['repositories']['nodes'].length; i++) {
              let repoNode = userData['repositories']['nodes'][i];
              if (repoNode['isFork']) repoNode = repoNode['parent'];

              // contributions null for empty repos
              let userCommits = repoNode['contributions'] ? repoNode['contributions']['target']['userCommits']['totalCount'] : 0;
              let totalCommits = repoNode['contributions'] ? repoNode['contributions']['target']['totalCommits']['totalCount'] : 0;

              repos.push({
                'full_name': repoNode['nameWithOwner'],
                'branch': repoNode['branch'] ? repoNode['branch']['name'] : "", // branch null for empty repos
                'stars': repoNode['stargazers']['totalCount'],
                'watchers': repoNode['watchers']['totalCount'],
                'forks': repoNode['forks']['totalCount'],
                'url': repoNode['url'],
                'languages': repoNode['languages']['nodes'],
                'total_commits': totalCommits,
                'user_commits': userCommits,
              });

              // count total stars, forks and watchers of owned repos
              if (userInfo['login'] === repoNode['owner']['login']) {
                userInfo['stars'] += repoNode['stargazers']['totalCount'];
                userInfo['forks'] += repoNode['forks']['totalCount'];
                userInfo['watchers'] += repoNode['watchers']['totalCount'];
              }

              // count total commits in owned or parent of forked repos.
              userInfo['commits'] += userCommits;

              let languages = repoNode['languages']['nodes'];
              for (let j = 0; j < languages.length; j++) {
                let flag = 0;
                for (let k = 0; k < userInfo['languages'].length; k++) {
                  let langPresent = userInfo['languages'][k];

                  if (langPresent['name'] === languages[j]['name']) {
                    langPresent['commits'] += userCommits;
                    langPresent['repos']++;
                    flag = 1;
                    break;
                  }
                }
                if (!flag) {
                  userInfo['languages'].push({
                    name: languages[j]['name'],
                    color: languages[j]['color'],
                    commits: userCommits,
                    repos: 1,
                  });
                }
              }
            }

            if (userData['repositories']['pageInfo']['hasNextPage']) {
              repositoryPromises.push(traverseAllCursors(userData['repositories']['pageInfo']['endCursor']));
            }
            return repos;
          })
          .catch(error => console.log(error.message))
      }

      return Promise.all(repositoryPromises)
        .then((repos) => {
          // add all repos
          for (let i = 0; i < repos.length; i++) {
            userInfo['repos'] = userInfo['repos'].concat(repos[i]);
          }
          return userInfo;
        });
    })
    .then((userInfo) => {
      // sort repositories for most commits and
      userInfo['repos'].sort((l, r) => {
        if (l['user_commits'] < r['user_commits'])
          return 1;
        else if (l['user_commits'] === r['user_commits']) {
          if (l['total_commits'] < r['total_commits'])
            return 1;
          return -1;
        }
        return -1;
      });

      // sort languages for maximum product of commits*repos
      userInfo['languages'].sort((l, r) => {
        if (l['commits'] * l['repos'] <= r['commits'] * r['repos']) {
          return 1;
        }
        return -1;
      });
      userInfo['time'] = new Date();
      return userInfo;
    })
}

module.exports = function (app, db) {
  app.post('/', (req, res) => {
    if(req.body.name === undefined || req.body.name === null || req.body.latest === undefined || req.body.latest === null) {
      return res.json({'success': false, 'message': 'parameters missing'});
    } else {
      const idDict = {'_id': req.body.name};

      if(req.body.latest === true) {
        // if 24 hours passed
        // get new data and save
        // else return whatever's in DB

        db.collection('stats').findOne(idDict, (err, item) => {
          if(err) {
            return res.json({'success': false, 'message': err.message});
          } else if(item === null) {
            // ID not present in DB
            fetchData(req, res)
              .then((finalData) => {
                // save to db
                finalData['_id'] = finalData['login'];

                db.collection('stats').insert(finalData, (err, result) => {
                  if (err) {
                    console.log('Insert failed. Error - ' + err.message); 
                  } else {
                    console.log('Inserted. ID: ' + result.ops[0]['_id']);
                  }
                });

                return res.json(finalData);
              })
              .catch(error => {
                return res.json({'success': false, 'message': error.message});
              });
          } else {
            // id present in DB

            var staDate = new Date(item['time']); // time when entry was saved
            var curDate = new Date();  // current time

            if((curDate.getTime() - staDate.getTime()) > 86400000) {
              // more than 24 hours old data
              // get new data and update

              fetchData(req, res)
                .then((finalData) => {
                  // update to db
                  finalData['_id'] = finalData['login'];

                  db.collection('stats').update(idDict, finalData, (err, result) => {
                    if (err) {
                      console.log('Update failed. Error - ' + err.message); 
                    } else {
                      console.log('Updated. ID: ' + finalData['_id']);
                    }
                  });

                  return res.json(finalData);
                })
                .catch(error => {
                  return res.json({'success': false, 'message': error.message});
                });
            } else {
              // data is fresh
              return res.json(item);
            }
          }
        });
      } else {
        // return whatever's in db
        // if nothing in db then get from GitHub and save

        db.collection('stats').findOne(idDict, (err, item) => {
          if(err) {
            return res.json({'success': false, 'message': err.message});
          } else if(item === null) {
            // ID not present in DB
            fetchData(req, res)
              .then((finalData) => {
                // save to db
                finalData['_id'] = finalData['login'];

                db.collection('stats').insert(finalData, (err, result) => {
                  if (err) {
                    console.log('Insert failed. Error - ' + err.message); 
                  } else {
                    console.log('Inserted. ID: ' + result.ops[0]['_id']);
                  }
                });

                return res.json(finalData);
              })
              .catch(error => {
                return res.json({'success': false, 'message': error.message});
              });
          } else {
            // id present in DB

            return res.json(item);
          }
        });
      }
    }
  });
};