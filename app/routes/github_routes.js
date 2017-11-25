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
				bio
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
				console.log(user_data);
			})
			.catch(error => {
				return res.json({'success': false, 'message': error.message});
			});
	});
};