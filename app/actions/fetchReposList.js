import fetch from 'node-fetch';
import { reposBasicPayload } from './payload';

const fetchReposList = async (username, acm = [], endCursor = null) => {
  /*
    Accumulate list of all repos with basic details including
    in series and return array of repos (acm).
    Fetch basic details for 100 repos at a time.
  */
  const startTime = new Date();

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
  console.log(`Successfully ${repos.length} repos list fetched in ${new Date() - startTime}ms`);

  // compile repos data and push current set of repos to accumulator
  const updatedAcm = [
    ...acm,
    ...repos.map(repo => ({
      forks: repo.forks.totalCount,
      isFork: repo.isFork,
      languages: repo.languages.nodes || [],
      name: repo.name,
      owner: repo.owner.login,
      size: repo.languages.totalSize,
      stars: repo.stargazers.totalCount,
      url: repo.url,
      watchers: repo.watchers.totalCount,
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
