import fetch from 'node-fetch';
import { userPayload } from './payload';
import fetchAllCursors from './fetchAllCursors';
import fetchRepos from './fetchRepos';

const fetchData = async username => {
  console.log(`Fetching data from github: ${username}`);
  let data = {}; // final data to return

  try {
    // fetch user profile data
    const profileResponse = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      body: JSON.stringify(userPayload(username)),
      headers: {
        Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!profileResponse.ok) {
      // throw error if request not success
      throw new Error('profile request error');
    }

    const profile = ((await profileResponse.json()).data || {}).user; // user profile
    if (!profile) {
      // return 404 if user not found on github
      console.log(`User non found on github: ${username}`);
      return {
        status: 404,
        message: 'User not found',
      };
    }

    // compile profile data
    data = {
      bio: profile.bio,
      followers: profile.followers.totalCount,
      following: profile.following.totalCount,
      name: profile.name,
      pic: profile.avatarUrl,
      profileCreatedAt: profile.createdAt,
      uid: profile.id,
      url: profile.url,
      username: profile.login,
    };

    /*
      Accumulate all cursors in series and return array of cursors.
      Fetch cursor for 20 repos at a time.
    */
    const startCursorsTime = new Date();
    const cursors = await fetchAllCursors(username);
    console.log(`Fetched ${cursors.length} cursors for user: ${username} in ${new Date() - startCursorsTime}ms`);

    /*
      For each cursor fetch repo collections in parallel
      20 repos per request
    */
    const startReposTime = new Date();
    const reposCollections = await Promise.all(
      cursors.reduce((acm, cursor) => [...acm, fetchRepos(username, data.uid, cursor)], [
        fetchRepos(username, data.uid),
      ]),
    );

    // accumulate repos and add to data
    data.repos = reposCollections.reduce((acm, reposCollection) => [...acm, ...reposCollection], []);
    console.log(`Fetched ${data.repos.length} repos for user: ${username} in ${new Date() - startReposTime}ms`);

    // set current time
    data.time = new Date();
  } catch (err) {
    console.log(`Error fetching data from github: ${username}, message: ${err}`);
    return {
      status: 500,
      message: err,
    };
  }

  return {
    status: 200,
    data,
  };
};

export default fetchData;
