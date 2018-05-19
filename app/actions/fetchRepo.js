import signale from 'signale';
import fetch from 'node-fetch';
import { repoPayload } from './payload';

const fetchRepo = async (owner, name, username, uid) => {
  /*
    Fetch detailed repo data
  */
  signale.time('Fetch Details for a Repository');

  const repoResponse = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    body: JSON.stringify(repoPayload(owner, name, uid)),
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!repoResponse.ok) {
    // throw error
    throw new Error(`Unsuccessful: repos ${username}@${owner}/${name} fetch from github`);
  }

  const repoData = await repoResponse.json(); // json response

  if (!repoData.data) {
    // throw error
    throw new Error(`Unsuccessful: repos ${username}@${owner}/${name} fetch from github ${JSON.stringify(repoData)}`);
  }

  const repo = repoData.data.repository || {};
  signale.success(`Successfully repo ${username}@${owner}/${name} detailed data fetched`);

  signale.timeEnd('Fetch Repository');

  // return repo data
  return {
    forks: (repo.forks || {}).totalCount,
    languages: (repo.languages || {}).nodes || [],
    size: (repo.languages || {}).totalSize || 0,
    stars: (repo.stargazers || {}).totalCount || 0,
    url: repo.url || '',
    watchers: (repo.watchers || {}).totalCount || 0,
    userCommits: repo.contributions ? repo.contributions.target.userCommits.totalCount : 0,
  };
};

export default fetchRepo;
