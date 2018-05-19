import signale from 'signale';
import fetch from 'node-fetch';
import { cursorPayload } from './payload';

const fetchAllCursors = async (username, acm = [], endCursor = null) => {
  /*
    Accumulate all cursors in series and return array of cursors (acm).
    Fetch cursor for 20 repos at a time.
  */
  const startTime = new Date();

  const cursorResponse = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    body: JSON.stringify(cursorPayload(username, endCursor)),
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!cursorResponse.ok) {
    // throw error
    throw new Error(`cursor ${endCursor} error`);
  }

  const cursorData = await cursorResponse.json(); // json response

  // current cursor
  const cursor = cursorData.data.user.repositories.pageInfo.endCursor;
  signale.success(`Successfully cursor ${cursor} fetched in ${new Date() - startTime}ms`);

  // push current cursor to accumulator
  acm.push(cursor);

  if (cursorData.data.user.repositories.pageInfo.hasNextPage) {
    // fetch next cursor if hasNext
    return fetchAllCursors(username, acm, cursor);
  }

  // return accumulated cursors if no next page
  return acm;
};

export default fetchAllCursors;
