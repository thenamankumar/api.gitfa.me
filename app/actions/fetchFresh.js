require('dotenv').config();

const fetch = require('node-fetch');
const userPayload = require('./payload').userPayload;
const reposPayload = require('./payload').reposPayload;
const cursorPayload = require('./payload').cursorPayload;

const winston = require('winston');

// load loggers
const debug_logs = winston.loggers.get('debug_logs');
const error_logs = winston.loggers.get('error_logs');

const fetchFresh = (username) => {
  debug_logs.info('Fetching fresh data: \'' + username + '\'');

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

      error_logs.error('error fetching user data');
      console.log(response);
      throw new Error('error fetching user data');
    })
    .then(userData => {
      let userInfo = {};

      if (userData['data'] === null) throw new Error(userData['errors'][0]['message']);
      if (userData['data']['user'] === null) {
        error_logs.error('\'' + username + '\' do not exist');
        return {
          status: 404,
          login: username,
          message: 'user not found',
        };
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
      userInfo['own_repos'] = 0;
      userInfo['repos'] = [];

      return userInfo;
    })
    .then(userInfo => {

      if (userInfo.status === 404) {
        return userInfo;
      }

      function traverseAllCursors(prevCursors, endCursor) {
        const time = new Date();
        return fetch('https://api.github.com/graphql', {
          method: 'POST',
          body: JSON.stringify(cursorPayload(username, endCursor)),
          headers: {
            'Authorization': 'bearer ' + process.env.GIT_TOKEN,
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            console.log('cursor fetch time', new Date() - time);
            if (response.ok) return response.json();

            error_logs.error('error fetching cursor');
            throw new Error('error fetching cursor');
          })
          .then((userData) => {
            debug_logs.debug('Cursor fetched. Points remaining: ' + userData['data']['rateLimit']['remaining']);

            if (userData['data'] === null) {
              console.log(userData);
              error_logs.error('error fetching cursor');
              throw new Error('error fetching cursor');
            }
            const cursor = userData['data']['user']['repositories']['pageInfo']['endCursor'];
            prevCursors.push(cursor);

            if (userData['data']['user']['repositories']['pageInfo']['hasNextPage']) {
              return traverseAllCursors(prevCursors, cursor);
            }
            return prevCursors;
          });
      }

      // get repositories and contributions
      function fetchRepos(endCursor) {
        const time = new Date();
        return fetch('https://api.github.com/graphql', {
          method: 'POST',
          body: JSON.stringify(reposPayload(username, userInfo['id'], endCursor)),
          headers: {
            'Authorization': 'bearer ' + process.env.GIT_TOKEN,
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            console.log('repos fetch time', new Date() - time);
            if (response.ok) return response.json();

            error_logs.error('error fetching repos');
            throw new Error('error fetching repos');
          })
          .then(userData => {
            debug_logs.debug('Repo data fetched. Points remaining: ' + userData['data']['rateLimit']['remaining']);

            if (userData['data'] === null) {
              error_logs.error('error fetching repos');
              throw new Error('error fetching repos');
            }
            userData = userData['data']['user'];
            let repos = [];
            for (let i = 0; i < userData['repositories']['nodes'].length; i++) {
              let repoNode = userData['repositories']['nodes'][i];
              if (!repoNode['isFork']) {
                userInfo['own_repos']++;
              }

              // contributions null for empty repos
              let userCommits = repoNode['contributions'] ? repoNode['contributions']['target']['userCommits']['totalCount'] : 0;

              repos.push({
                'full_name': repoNode['nameWithOwner'],
                'branch': repoNode['branch'] ? repoNode['branch']['name'] : "", // branch null for empty repos
                'stars': repoNode['stargazers']['totalCount'],
                'watchers': repoNode['watchers']['totalCount'],
                'forks': repoNode['forks']['totalCount'],
                'url': repoNode['url'],
                'languages': repoNode['languages'],
                'size': repoNode['languages'].totalSize,
                'user_commits': userCommits,
                'isFork': repoNode['isFork']
              });

              // count total stars, forks and watchers of owned repos
              if (userInfo['login'] === repoNode['owner']['login']) {
                userInfo['stars'] += repoNode['stargazers']['totalCount'];
                userInfo['forks'] += repoNode['forks']['totalCount'];
                userInfo['watchers'] += repoNode['watchers']['totalCount'];
              }

              // count total commits in owned or parent of forked repos.
              userInfo['commits'] += userCommits;
            }

            return repos;
          });
      }

      return traverseAllCursors([], null)
        .then((allCursors) => {
          const reposPromises = [];

          reposPromises.push(fetchRepos(null));

          allCursors.forEach((cursor) => {
            reposPromises.push(fetchRepos(cursor));
          });

          return Promise.all(reposPromises)
            .then((reposArray) => {
              return reposArray.reduce((prev, cur) => prev.concat(cur));
            });
        })
        .then((allRepos) => {
          // add all repos
          userInfo['repos'] = allRepos;
          return userInfo;
        });
    })
    .then((userInfo) => {

      if (userInfo.status === 404) {
        return userInfo;
      }

      userInfo['time'] = new Date();
      userInfo['fresh'] = true;
      userInfo['status'] = 200;
      debug_logs.info('Fresh data fetched: \'' + username + '\' at ' + userInfo['time']);
      return userInfo;
    })
    .catch((e) => {
      console.log(e);
      return {
        status: 500,
        login: username,
        message: 'internal server error'
      };
    });
};

module.exports = fetchFresh;
