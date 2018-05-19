import signale from 'signale';
import fetch from 'node-fetch';
import { userPayload } from './payload';
import fetchReposList from './fetchReposList';
import fetchRepo from './fetchRepo';
import fetchPullRequests from './fetchPullRequests';

const fetchData = async username => {
  let data = {}; // final data to return

  try {
    signale.time(`Fetching data from github for ${username}`);

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
      signale.warning(`User non found on github: ${username}`);

      return {
        status: 404,
        message: 'User not found',
      };
    }

    // compile profile data
    data = {
      bio: profile.bio || '',
      followers: profile.followers.totalCount || 0,
      following: profile.following.totalCount || 0,
      issues: profile.issues.totalCount || 0,
      name: profile.name,
      pic: profile.avatarUrl,
      pinnedRepositories: (profile.pinnedRepositories.nodes || []).map(({ name, owner }) => ({
        name,
        owner: owner.login || '',
      })),
      profileCreatedAt: profile.createdAt,
      uid: profile.id,
      url: profile.url,
      username: (profile.login || '').toLowerCase(),
    };

    /*
      Accumulate list of all pull requests
    */
    signale.time(`Fetching pull requests for ${username}`);
    const pullRequests = await fetchPullRequests(username);
    signale.timeEnd(`Fetching pull requests for ${username}`);
    data.pullRequests = pullRequests;

    /*
      Accumulate list of all repos with basic details including
      in series and return array of repos (acm).
      Fetch basic details for 100 repos at a time.
    */
    signale.time(`Fetching repos list for ${username}`);
    const reposList = await fetchReposList(username);
    signale.timeEnd(`Fetching repos list for ${username}`);

    /*
      For each repo in the repo list fetch
      detailed stats data in parallel.
    */

    signale.time(`Fetching repo data for ${username}`);
    // detailed repo stats
    const reposDetailedDataCollection = await Promise.all(
      reposList.map(({ owner, name }) => fetchRepo(owner, name, username, data.uid)),
    );
    signale.timeEnd(`Fetching repo data for ${username}`);

    // accumulate repos data and add to user data
    // set current time
    data.time = new Date();
    data.repos = reposList.map((repoBasicData, index) => ({ ...repoBasicData, ...reposDetailedDataCollection[index] }));

    signale.timeEnd(`Fetching data from github for ${username}`);
  } catch (err) {
    signale.fatal(`Error fetching data from github: ${username}, message: ${err}`);
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
