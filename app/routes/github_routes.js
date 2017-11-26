const fetch = require('node-fetch');

// return GraphQL query
function get_payload(user_name) {
	return {
		"query": `
			{
				user(login: "samkit-jain") {
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
					repositories(first: 100, orderBy: {field: NAME,direction: ASC}) {
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
										... repoStats
									}
									... repoStats
								}
							}
						}
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
		`
	}
}

module.exports = function(app, db) {
	app.get('/users/:name', (req, res) => {
		// get basic user information
		fetch('https://api.github.com/graphql', {
			method: 'POST',
			body: JSON.stringify(get_payload(req.params.name)),
			headers: {
				'Authorization': 'bearer ' + process.env.GITHUBKEY,
				'Content-Type': 'application/json'
			}
		})
			.then(response => {
				if(response.ok) return response.json();

				throw new Error('error');
			})
			.then(user_data => {
				let user_info = {
					'success': true,
				};

				user_data = user_data['data']['user'];
				user_info['public_repos'] = user_data['repositories']['totalCount'];
				user_info['avatar_url'] = user_data['avatar_url'];
				user_info['followers'] = user_data['followers']['totalCount'];
				user_info['following'] = user_data['following']['totalCount'];
				user_info['html_url'] = user_data['url'];
				user_info['login'] = user_data['login'];
				user_info['name'] = user_data['name'];
				user_info['bio'] = user_data['bio'];

				user_info['repos'] = [];

				user_data['repositories']['edges'].forEach((repo_node) => {
					repo_node = repo_node['node'];

					if(repo_node['isFork'])	repo_node = repo_node['parent'];

					user_info['repos'].push({
						'full_name': repo_node['nameWithOwner'],
						'stargazers_count': repo_node['stargazers']['totalCount'],
						'watchers_count': repo_node['watchers']['totalCount'],
						'owner_login': repo_node['owner']['login'],
						'forks_count': repo_node['forks']['totalCount'],
						'html_url': repo_node['url'],
						'all_commits': repo_node['ref']['target']['history']['totalCount'],
						'commits': repo_node['nameWithOwner'],
					});
				})

				res.json(user_info);
			})
			.catch(error => {
				return res.json({'success': false, 'message': error.message});
			});
	});
};
