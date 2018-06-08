import fetch from 'node-fetch';
import signale from 'signale';
import { reposPayload } from './payload';

const fetchRepos = async (username, uid, acm = [], endCursor = null) => {
  /*
    Fetch next 20 repos based on cursor
  */

  const reposResponse = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    body: JSON.stringify(reposPayload(username, uid, endCursor)),
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!reposResponse.ok) {
    // throw error
    throw new Error(`Unsuccessful: repos ${endCursor} fetch from github`);
  }

  const reposData = await reposResponse.json(); // json response

  if (!reposData.data) {
    // throw error
    throw new Error(`Unsuccessful: repos ${endCursor} fetch from github`);
  }

  if (!reposData.data.user) {
    throw new Error(`User with username ${username} not found`);
  }

  // collection of 20 repos
  const repos = reposData.data.user.repositories.nodes;

  signale.success(`Fetched ${repos.length} repos collection for ${username}`);

  const cursor = reposData.data.user.repositories.pageInfo.endCursor;

  const updatedAcm = [
    ...acm,
    ...repos.map(repo => ({
      forks: repo.forks.totalCount,
      name: repo.nameWithOwner.slice(repo.owner.login.length + 1),
      isFork: repo.isFork,
      owner: repo.owner.login,
      languages: repo.languages.nodes || [],
      size: repo.languages.totalSize,
      stars: repo.stargazers.totalCount,
      url: repo.url,
      userCommits: repo.contributions ? repo.contributions.target.userCommits.totalCount : 0,
      watchers: repo.watchers.totalCount,
    })),
  ];

  if (reposData.data.user.repositories.pageInfo.hasNextPage) {
    return fetchRepos(username, uid, updatedAcm, cursor);
  }

  // compile repo data
  return updatedAcm;
};

export default fetchRepos;
