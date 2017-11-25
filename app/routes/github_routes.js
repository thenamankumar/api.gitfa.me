const fetch = require('node-fetch');

// details repositories by the user
const get_repositories = url => fetch(url)
	.then(response => response.json());

// details of forked repositories by the user
const fork_details = url => fetch(url)
	.then(response => response.json());

// return GraphQL query
function get_payload(user_name) {
	return {
		"query": `{
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
				repositories(first: 100, orderBy: {field: NAME, direction: ASC}) {
					totalCount
					pageInfo {
						hasNextPage
						endCursor
					}
					edges {
						node {
							... on Repository {
								name
								isFork
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
								parent {
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
					}
				}
			}
		}`
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
				if(response.ok)
					return response.json();
				
				throw new Error("Not found");
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

				res.json(user_info);
			})
			.catch(error => {
				return res.json({'success': false, 'message': error.message});
			});
	});
};