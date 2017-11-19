const fetch = require('node-fetch');

// list all repositories by a user
const get_repositories = url => fetch(url)
	.then(response => response.json());

// details of forked repos
const fork_details = url => fetch(url)
	.then(response => response.json());

module.exports = function(app, db) {
	app.get('/users/:name', (req, res) => {
		// get basic user information
		fetch('https://api.github.com/users/' + req.params.name + '?client_id=306bffb6acf1e4b78303&client_secret=64f16f44d1346f04b72e6c9cb3f60e727b400c88')
			.then(response => {
				if(response.ok)
					return response.json();
				else
					throw new Error("Not found");
			})
			.then(user_data => {
				// dictionary to store all the fields (data) of the user
				let user_info = {
					'success': true,
					'commits': 0,
					'repos': [],
					'stars': 0,
					'forks': 0,
				};
				// array to store repository URLs
				let repo_urls = [];

				// saving required fields in user_info
				user_info['public_repos'] = user_data['public_repos'];
				user_info['avatar_url'] = user_data['avatar_url'];
				user_info['followers'] = user_data['followers'];
				user_info['following'] = user_data['following'];
				user_info['html_url'] = user_data['html_url'];
				user_info['login'] = user_data['login'];
				user_info['name'] = user_data['name'];
				user_info['bio'] = user_data['bio'];

				repo_url = 'https://api.github.com/users/' + req.params.name + '/repos?client_id=306bffb6acf1e4b78303&client_secret=64f16f44d1346f04b72e6c9cb3f60e727b400c88&type=all&per_page=500&page=';

				for(let page_count = 1; page_count <= Math.floor(user_info['public_repos'] / 500) + 1; page_count++) {
					repo_urls.push(repo_url + page_count)
				}

				Promise
					.all(repo_urls.map(get_repositories))
					.then(values => {
						let forks_urls = [];

						values.forEach((repo_data) => {
							for(let i = 0; i < repo_data.length; i++) {
								if(repo_data[i]['fork']) {
									forks_urls.push(repo_data[i]['url'] + '?client_id=306bffb6acf1e4b78303&client_secret=64f16f44d1346f04b72e6c9cb3f60e727b400c88');
								} else {
									user_info['repos'].push({
										'stargazers_count': repo_data[i]['stargazers_count'],
										'contributors_url': repo_data[i]['contributors_url'],
										'watchers_count': repo_data[i]['watchers_count'],
										'owner_login': repo_data[i]['owner']['login'],
										'forks_count': repo_data[i]['forks_count'],
										'full_name': repo_data[i]['full_name'],
										'html_url': repo_data[i]['html_url'],
										'all_commits': 0,
										'commits': 0,
									});
								}
							}
						});

						return Promise.all(forks_urls.map(fork_details));
					})
					.then(forks => {
						forks.forEach((fork_data) => {
							user_info['repos'].push({
								'stargazers_count': fork_data['parent']['stargazers_count'],
								'contributors_url': fork_data['parent']['contributors_url'],
								'watchers_count': fork_data['parent']['watchers_count'],
								'owner_login': fork_data['parent']['owner']['login'],
								'forks_count': fork_data['parent']['forks_count'],
								'full_name': fork_data['parent']['full_name'],
								'html_url': fork_data['parent']['html_url'],
								'all_commits': 0,
								'commits': 0,
							});
						});

						let particpation_promises = [];

						// counting number of forks and stars on repos by user
						for(let i = 0; i < user_info['repos'].length; i++) {
							if(user_info['login'] === user_info['repos'][i]['owner_login']) {
								user_info['stars'] += user_info['repos'][i]['stargazers_count'];
								user_info['forks'] += user_info['repos'][i]['forks_count'];
							}

							particpation_promises.push(fetch_participants(1));

							function fetch_participants(page) {
								return fetch(user_info['repos'][i]['contributors_url'] + "?client_id=306bffb6acf1e4b78303&client_secret=64f16f44d1346f04b72e6c9cb3f60e727b400c88&anon=1&per_page=100&page=" + page)
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
											return item['login'] === user_info['login'];
										});
										
										if(our_user) {
											user_info['repos'][i]['commits'] = our_user['contributions'];
											user_info['commits'] += user_info['repos'][i]['commits'];
										}

										contributors.forEach((item) => {
											user_info['repos'][i]['all_commits'] += item['contributions'];
										});
										
										return fetch_participants(page + 1);
									})
									.catch(err => console.log(err));
							}
						}

						return Promise.all(particpation_promises);
						//res.json(user_info);
					})
					.then(() => {
						user_info['repos'].sort((l, r) => {
							if(l['commits'] < r['commits'])
								return 1;
							else if(l['commits'] === r['commits']) {
								if (l['all_commits'] < r['all_commits'])
									return 1;
								else return -1;
							}
							else return -1;
						});

						return res.json(user_info);
					});
			})
			.catch(error => {
				return res.json({'success': false, 'message': error.message});
			});
	});
};