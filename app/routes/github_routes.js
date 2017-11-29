const fetch = require('node-fetch');

// return GraphQL query
function getPayload(username, showUserData, endCursor) {
	return {
		"query": `
			query($username: String!, $showUserData: Boolean!, $afterCursor: String)
			{
				user(login: $username) {
					...userData @include (if: $showUserData)
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
				ref(qualifiedName: "master") {
					target {
						... on Commit {
							history {
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
				edges {
					node {
						... on Repository {
							isFork
							parent {
								...repoStats
							}
							...repoStats
						}
					}
				}
			}

			fragment userData on User {
				avatarUrl
				bio
				login
				name
				url
				followers {
					totalCount
				}
				following {
					totalCount
				}
			}
		`,
		"variables": `
			{
				"username": "` + username + `",
				"showUserData": ` + showUserData + `,
				"afterCursor": ` + (endCursor != null ? `"` + endCursor + `"` : `null`) + `
			}
		`
	}
}

module.exports = function(app, db) {
	app.get('/users/:name', (req, res) => {
		// get basic user information
		fetch('https://api.github.com/graphql', {
			method: 'POST',
			body: JSON.stringify(getPayload(req.params.name, true, null)),
			headers: {
				'Authorization': 'bearer ' + process.env.GITHUBKEY,
				'Content-Type': 'application/json'
			}
		})
			.then(response => {
				if(response.ok) return response.json();

				throw new Error('error');
			})
			.then(userData => {
				let userInfo = {
					'success': true,
				};

				if(userData['data'] === null) throw new Error(userData['errors'][0]['message']);
				if(userData['data']['user'] === null) throw new Error('Not found');

				userData = userData['data']['user'];
				userInfo['public_repos'] = userData['repositories']['totalCount'];
				userInfo['avatar_url'] = userData['avatarUrl'];
				userInfo['followers'] = userData['followers']['totalCount'];
				userInfo['following'] = userData['following']['totalCount'];
				userInfo['html_url'] = userData['url'];
				userInfo['login'] = userData['login'];
				userInfo['name'] = userData['name'];
				userInfo['bio'] = userData['bio'];
				userInfo['commits'] = 0;
				userInfo['stars'] = 0;
				userInfo['forks'] = 0;

				userInfo['repos'] = [];

				// avoid forEach. It's slooower. REF -> https://jsperf.com/fast-array-foreach
				for(let i = 0; i < userData['repositories']['edges'].length; i++) {
					repoNode = userData['repositories']['edges'][i]['node'];

					if(repoNode['isFork']) repoNode = repoNode['parent'];

					userInfo['repos'].push({
						'full_name': repoNode['nameWithOwner'],
						'stargazers_count': repoNode['stargazers']['totalCount'],
						'watchers_count': repoNode['watchers']['totalCount'],
						'owner_login': repoNode['owner']['login'],
						'forks_count': repoNode['forks']['totalCount'],
						'html_url': repoNode['url'],
						'all_commits': repoNode['ref']['target']['history']['totalCount'],
						'commits': 0,
					});
				}

				let contributionPromises = [];
				
				if(userData['repositories']['pageInfo']['hasNextPage']) {
					contributionPromises.push(traverseAllCursors(userData['repositories']['pageInfo']['endCursor']));

					function traverseAllCursors(endCursor) {
						return fetch('https://api.github.com/graphql', {
							method: 'POST',
							body: JSON.stringify(getPayload(req.params.name, false, endCursor)),
							headers: {
								'Authorization': 'bearer ' + process.env.GITHUBKEY,
								'Content-Type': 'application/json'
							}
						})
							.then(response => {
								if(response.ok) return response.json();

								throw new Error('error');
							})
							.then(userData => {
								userData = userData['data']['user'];

								for(let i = 0; i < userData['repositories']['edges'].length; i++) {
									repoNode = userData['repositories']['edges'][i]['node'];

									if(repoNode['isFork']) repoNode = repoNode['parent'];

									userInfo['repos'].push({
										'full_name': repoNode['nameWithOwner'],
										'stargazers_count': repoNode['stargazers']['totalCount'],
										'watchers_count': repoNode['watchers']['totalCount'],
										'owner_login': repoNode['owner']['login'],
										'forks_count': repoNode['forks']['totalCount'],
										'html_url': repoNode['url'],
										'all_commits': repoNode['ref']['target']['history']['totalCount'],
										'commits': 0,
									});
								}

								if(userData['repositories']['pageInfo']['hasNextPage']) return traverseAllCursors(userData['repositories']['pageInfo']['endCursor']);
								
								return userInfo;
							})
							.catch(error => console.log(error.message))
					}

					return Promise.all(contributionPromises);
				}
				else {
					return [userInfo];
				}
			})
			.then(userInfo => {
				userInfo = userInfo[0];
				let participationPromises = [];

				
				for(let i = 0; i < userInfo['repos'].length; i++) {
					// counting number of forks and stars
					if(userInfo['login'] === userInfo['repos'][i]['owner_login']) {
						userInfo['stars'] += userInfo['repos'][i]['stargazers_count'];
						userInfo['forks'] += userInfo['repos'][i]['forks_count'];
					}

					participationPromises.push(fetchParticipants(1));

					function fetchParticipants(page) {
						return fetch("http://api.github.com/repos/" + userInfo['repos'][i]['full_name'] + "/contributors?client_id=306bffb6acf1e4b78303&client_secret=64f16f44d1346f04b72e6c9cb3f60e727b400c88&anon=1&per_page=100&page=" + page)
							.then((response) => {
								if (response.ok)
									return response.text();
								else
									throw new Error("Error!");
							})
							.then((response) => {
								if (!response)
									throw new Error("no data");
		
								let contributors = JSON.parse(response);
								
								if (contributors.length === 0)
									return contributors;
								
								let our_user = contributors.find((item) => {
									return item['login'] === userInfo['login'];
								});
								
								// commits by our user
								if(our_user) {
									userInfo['repos'][i]['commits'] = our_user['contributions'];
									userInfo['commits'] += userInfo['repos'][i]['commits'];

									return userInfo;
								}
								
								return fetchParticipants(page + 1);
							})
							.catch(err => console.log(err));
					}
				}

				return Promise.all(participationPromises);
			})
			.then((userInfo) => {
				userInfo = userInfo[0];

				// sorting the repositories based on commits count
				userInfo['repos'].sort((l, r) => {
					if(l['commits'] < r['commits'])
						return 1;
					else if(l['commits'] === r['commits']) {
						if (l['all_commits'] < r['all_commits'])
							return 1;
						else return -1;
					}
					else return -1;
				});

				return res.json(userInfo);
			})
			.catch(error => {
				return res.json({'success': false, 'message': error.message});
			});
	});
};