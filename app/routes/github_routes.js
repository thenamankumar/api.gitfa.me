const fetch = require('node-fetch');

// list all repositories by a user
const get_repositories = url => fetch(url)
	.then(response => response.json());

module.exports = function(app, db) {
	app.get('/users/:name', (req, res) => {
		fetch('https://api.github.com/users/' + req.params.name + '?client_id=306bffb6acf1e4b78303&client_secret=64f16f44d1346f04b72e6c9cb3f60e727b400c88')
			.then(response => {
				return response.json();
			})
			.then(user_data => {
				// dictionary to store all the fields (data) of the user
				let user_info = {
					'stars': 0,
					'forks': 0,
					'commits': 0,
					'repos': [],
				};
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

				repo_url = 'https://api.github.com/users/' + req.params.name + '/repos?client_id=306bffb6acf1e4b78303&client_secret=64f16f44d1346f04b72e6c9cb3f60e727b400c88&type=all&per_page=50&page=';

				for(let page_count = 1; page_count <= Math.floor(user_info['public_repos'] / 50) + 1; page_count++) {
					repo_urls.push(repo_url + page_count)
				}

				Promise
					.all(repo_urls.map(get_repositories))
					.then(values => {
						values.forEach((repo_data) => {
							for(let i = 0; i < repo_data.length; i++) {
								if(repo_data[i]['owner']['login'] === user_info['login']) {
									user_info['stars'] += repo_data[i]['stargazers_count'];
									user_info['forks'] += repo_data[i]['forks_count'];
								}
								
								user_info['repos'].push({
									'html_url': repo_data[i]['html_url'],
									'full_name': repo_data[i]['full_name'],
									'stargazers_count': repo_data[i]['stargazers_count'],
									'forks_count': repo_data[i]['forks_count'],
									'watchers_count': repo_data[i]['watchers_count'],
									// 'commits': repo_data[i]['commits'],
									// 'all_commits': repo_data[i]['all_commits'],
								});
							}
						});

						res.json(user_info)
					});
			})
			.catch(error => {
				console.log(error);
				res.json({'error': error});
			});
	});
};