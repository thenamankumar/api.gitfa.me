import fetch from 'node-fetch';
import { userPayload } from './payload';
import fetchReposList from './fetchReposList';
import fetchRepo from './fetchRepo';
import fetchPullRequests from './fetchPullRequests';

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
    const startPRTime = new Date();
    const pullRequests = await fetchPullRequests(username);
    console.log(`Fetched ${pullRequests.length} pull requests for user: ${username} in ${new Date() - startPRTime}ms`);
    data.pullRequests = pullRequests;

    /*
      Accumulate list of all repos with basic details including
      in series and return array of repos (acm).
      Fetch basic details for 100 repos at a time.
    */
    const startReposListTime = new Date();
    const reposList = await fetchReposList(username);
    console.log(`Fetched ${reposList.length} repos list for user: ${username} in ${new Date() - startReposListTime}ms`);

    /*
      For each repo in the repo list fetch
      detailed stats data in parallel.
    */
    const startReposDataTime = new Date();
    // detailed repo stats
    const reposDetailedDataCollection = await Promise.all(
      reposList.map(({ owner, name }) => fetchRepo(owner, name, username, data.uid)),
    );

    // accumulate repos data and add to user data
    data.repos = reposList.map((repoBasicData, index) => ({ ...repoBasicData, ...reposDetailedDataCollection[index] }));

    console.log(
      `Fetched ${data.repos.length} repos detailed data for user: ${username} in ${new Date() - startReposDataTime}ms`,
    );

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
