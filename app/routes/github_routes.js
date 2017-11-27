const fetch = require('node-fetch');

// return GraphQL query
function getPayload(username, showUserData, endCursor) {
	return {
		"query": `
			query($username: String!, $showUserData: Boolean!)
			{
				user(login: $username) {
					...userData @include (if: $showUserData)
					repositories(first: 100,` + (endCursor != null ? ` after: "` + endCursor + `",` : ``) + ` orderBy: {field: NAME,direction: ASC}) {
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
				"showUserData": ` + showUserData + `
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

				userData = userData['data']['user'];
				userInfo['public_repos'] = userData['repositories']['totalCount'];
				userInfo['avatar_url'] = userData['avatar_url'];
				userInfo['followers'] = userData['followers']['totalCount'];
				userInfo['following'] = userData['following']['totalCount'];
				userInfo['html_url'] = userData['url'];
				userInfo['login'] = userData['login'];
				userInfo['name'] = userData['name'];
				userInfo['bio'] = userData['bio'];

				userInfo['repos'] = [];

				userData['repositories']['edges'].forEach((repoNode) => {
					repoNode = repoNode['node'];

					if(repoNode['isFork'])	repoNode = repoNode['parent'];

					userInfo['repos'].push({
						'full_name': repoNode['nameWithOwner'],
						'stargazers_count': repoNode['stargazers']['totalCount'],
						'watchers_count': repoNode['watchers']['totalCount'],
						'owner_login': repoNode['owner']['login'],
						'forks_count': repoNode['forks']['totalCount'],
						'html_url': repoNode['url'],
						'all_commits': repoNode['ref']['target']['history']['totalCount'],
						'commits': repoNode['nameWithOwner'],
					});
				});

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

								userData['repositories']['edges'].forEach((repoNode) => {
									repoNode = repoNode['node'];

									if(repoNode['isFork'])	repoNode = repoNode['parent'];

									userInfo['repos'].push({
										'full_name': repoNode['nameWithOwner'],
										'stargazers_count': repoNode['stargazers']['totalCount'],
										'watchers_count': repoNode['watchers']['totalCount'],
										'owner_login': repoNode['owner']['login'],
										'forks_count': repoNode['forks']['totalCount'],
										'html_url': repoNode['url'],
										'all_commits': repoNode['ref']['target']['history']['totalCount'],
										'commits': repoNode['nameWithOwner'],
									});
								});

								if(userData['repositories']['pageInfo']['hasNextPage']) return traverseAllCursors(userData['repositories']['pageInfo']['endCursor']);
								
								return userInfo;
							})
							.catch(error => console.log(error.message))
					}

					return Promise.all(contributionPromises);
				}
				else {
					return userInfo;
				}
			})
			.then(userInfo => {
				if(Array.isArray(userInfo)) {
					res.json(userInfo[0]);
				}
				else {
					res.json(userInfo);
				}
			})
			.catch(error => {
				return res.json({'success': false, 'message': error.message});
			});
	});
};

/*

SHOULD ALSO RETURN GRAPHQL ERROR RESPONSE
{ data: null,
  errors: 
   [ { message: 'Argument \'after\' on Field \'repositories\' has an invalid value. Expected type \'String\'.',
       locations: [Array] } ] }
usercommit: history(author: {id: "MDQ6VXNlcjE1MTI3MTE1"}, first: 50) {
          totalCount
          nodes {
            commitUrl
            author {
              name
            }
          }
        }
  */