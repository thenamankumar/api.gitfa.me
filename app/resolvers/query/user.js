import fetchData from '../../actions/fetchData';
import signale from 'signale';

export default async (parent, { username, fresh }, { db }, info) => {
  username = (username || '').toLowerCase(); // eslint-disable-line
  // find user data in db
  const findUser = await db.query.user({ where: { username } }, `{ time }`);
  const updateTimeThreshold = 24 * 60 * 60 * 1000; // 1 day
  let result; // final result

  if (findUser && (!fresh || new Date() - new Date(findUser.time) <= updateTimeThreshold)) {
    /*
      return data preset in db if fresh data not requested
      or if requested then data is already latest
    */
    result = await db.query.user({ where: { username } }, info);
  } else if (!findUser || (fresh && new Date() - new Date(findUser.time) > updateTimeThreshold)) {
    /*
      fetch new data for:
      1) user not found in db
      2) user data is old and requested fresh
    */

    if (!findUser) {
      signale.note(`Data for user ${username} not present.`);
    } else {
      signale.star(`Fresh data requested for ${username}.`);
    }
    // fetch fresh user data
    const { status, data } = await fetchData(username);

    if (status === 200) {
      // fresh data fetch successful
      const { pinnedRepositories, pullRequests, repos, ...profileData } = data;

      const addUserDataPayload = {
        ...profileData,
        pinnedRepositories: {
          create: pinnedRepositories,
        },
        pullRequests: {
          create: pullRequests,
        },
        repos: {
          create: repos.map(({ languages, ...rest }) => ({
            ...rest,
            languages: {
              create: languages,
            },
          })),
        },
      };

      if (findUser) {
        /*
          temporarily update/upsert mutation not working
          delete and create new user
        */
        const deleted = await db.mutation.deleteUser({ where: { username } }, `{username}`);
        if (deleted.username === username) {
          result = await db.mutation.createUser({ data: addUserDataPayload }, info);
        }
      } else {
        result = await db.mutation.createUser({ data: addUserDataPayload }, info);
      }
    } else {
      // fresh data fetch unsuccessful
      return {
        status,
        username,
      };
    }
  }

  // return final result
  return {
    ...result,
    status: 200,
  };
};
