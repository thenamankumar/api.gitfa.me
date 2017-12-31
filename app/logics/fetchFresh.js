require('dotenv').config();

const fetch = require('node-fetch');
const userPayload = require('./payload').userPayload;
const reposPayload = require('./payload').reposPayload;
const winston = require('winston');

// load loggers
const debug_logs = winston.loggers.get('debug_logs');
const error_logs = winston.loggers.get('error_logs');

const fetchFresh = (username) => {
  debug_logs.info('Fetching fresh data: \'' + username + '\'');
  console.log('Fetching fresh data:', '\'' + username + '\'');

  return fetch('https://api.github.com/graphql', {
    method: 'POST',
    body: JSON.stringify(userPayload(username, true, null)),
    headers: {
      'Authorization': 'bearer ' + process.env.GIT_TOKEN,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (response.ok) return response.json();

      error_logs.error('error');
      throw new Error('error');
    })
    .then(userData => {
      let userInfo = {
        'success': true,
      };

      if (userData['data'] === null) throw new Error(userData['errors'][0]['message']);
      if (userData['data']['user'] === null) {
        error_logs.error('\'' + username + '\' do not exist');

        throw new Error('User not found')
      }

      debug_logs.debug('User data fetched. Points remaining: ' + userData['data']['rateLimit']['remaining']);

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
      userInfo['createdAt'] = userData['createdAt'];
      userInfo['commits'] = 0;
      userInfo['stars'] = 0;
      userInfo['forks'] = 0;
      userInfo['watchers'] = 0;
      userInfo['languages'] = [];
      userInfo['own_repos'] = 0;
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
          body: JSON.stringify(reposPayload(username, userInfo['id'], endCursor)),
          headers: {
            'Authorization': 'bearer ' + process.env.GIT_TOKEN,
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            if (response.ok) return response.json();

            error_logs.error('error');
            throw new Error('error');
          })
          .then(userData => {
            debug_logs.debug('Repo data fetched. Points remaining: ' + userData['data']['rateLimit']['remaining']);

            if (userData['data'] === null) {
              error_logs.error(userData['errors'][0]['message']);
              throw new Error(userData['errors'][0]['message']);
            }

            userData = userData['data']['user'];
            let repos = [];
            for (let i = 0; i < userData['repositories']['nodes'].length; i++) {
              let repoNode = userData['repositories']['nodes'][i];
              if (repoNode['isFork']) {
                repoNode = repoNode['parent'];
              } else {
                userInfo['own_repos']++;
              }


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
          .catch(error => console.log(error.message)) // error_logs already updated above, hence, not updating here
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
      userInfo['time'] = new Date();
      userInfo['fresh'] = true;

      debug_logs.info('Fresh data fetched: \'' + username + '\' at ' + userInfo['time']);
      return userInfo;
    })
};

module.exports = fetchFresh;
