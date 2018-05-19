import fetch from 'node-fetch';
import signale from 'signale';
import { reposBasicPayload } from './payload';

const fetchReposList = async (username, acm = [], endCursor = null) => {
  /*
    Accumulate list of all repos with basic details including
    in series and return array of repos (acm).
    Fetch basic details for 100 repos at a time.
  */

  const reposResponse = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    body: JSON.stringify(reposBasicPayload(username, endCursor)),
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!reposResponse.ok) {
    // throw error
    throw new Error(`repos list ${endCursor} error`);
  }

  const reposList = await reposResponse.json(); // json response

  // current cursor
  const cursor = reposList.data.user.repositories.pageInfo.endCursor;
  // current set of repos
  const repos = reposList.data.user.repositories.nodes;
  signale.success(`Fetched ${repos.length} repos list for ${username}`);

  // compile repos data and push current set of repos to accumulator
  const updatedAcm = [
    ...acm,
    ...repos.map(repo => ({
      isFork: repo.isFork,
      name: repo.name,
      owner: repo.parent ? repo.parent.owner.login : username,
    })),
  ];

  if (reposList.data.user.repositories.pageInfo.hasNextPage) {
    // fetch next set of repos if hasNext
    return fetchReposList(username, updatedAcm, cursor);
  }

  // return accumulated repos if no next page
  return updatedAcm;
};

export default fetchReposList;
