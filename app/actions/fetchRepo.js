import fetch from 'node-fetch';
import { repoPayload } from './payload';

const fetchRepo = async (owner, name, username, uid) => {
  /*
    Fetch detailed repo data
  */
  const startTime = new Date();
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

  const repo = repoData.data.repository;
  console.log(`Successfully repo ${username}@${owner}/${name} detailed data fetched in ${new Date() - startTime}ms`);

  // return repo data
  return {
    userCommits: repo.contributions ? repo.contributions.target.userCommits.totalCount : 0,
  };
};

export default fetchRepo;
