import signale from 'signale';
import fetch from 'node-fetch';
import { pullRequestsPayload } from './payload';

const fetchPullRequests = async (username, acm = [], endCursor = null) => {
  /*
    Accumulate all pull requests in series and return
    array of pull requests (acm). Fetch 100 PR at a time
  */
  const startTime = new Date();

  const prResponse = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    body: JSON.stringify(pullRequestsPayload(username, endCursor)),
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!prResponse.ok) {
    // throw error
    throw new Error(`pull requests ${endCursor} error`);
  }

  const prData = await prResponse.json(); // json response

  // current cursor
  const cursor = prData.data.user.pullRequests.pageInfo.endCursor;
  // current set of pull requests
  const pullRequests = prData.data.user.pullRequests.nodes || [];
  signale.success(`Successfully ${pullRequests.length} pull requests ${cursor} fetched in ${new Date() - startTime}ms`);

  // compile pull requests data and push current set of pull requests to accumulator
  const updatedAcm = [
    ...acm,
    ...pullRequests.map(({ commits, repository: { id, name, owner }, ...rest }) => ({
      ...rest,
      commits: commits.totalCount || 0,
      repository: {
        uid: id,
        name,
        owner: owner.login || '',
      },
      isFork: (owner.login || '').toLowerCase() !== username,
    })),
  ];

  if (prData.data.user.pullRequests.pageInfo.hasNextPage) {
    // fetch next cursor if hasNext
    return fetchPullRequests(username, updatedAcm, cursor);
  }

  // return accumulated pull requests if no next page
  return updatedAcm;
};

export default fetchPullRequests;
