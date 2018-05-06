import fetchData from '../../actions/fetchData';

export default async (parent, { username, fresh }, { db }, info) => {
  // find user data in db
  const findUser = await db.query.user(
    { where: { username } },
    `{ 
      bio
      followers
      following
      name
      pic
      profileCreatedAt
      repos {
          branch
          forks
          fullName
          isFork
          languages {
            name
            color
          }
          size
          stars
          url
          userCommits
          watchers
      }
      time 
      uid
      url
      username
    }`,
  );
  const updateTimeThreshold = 24 * 60 * 60 * 1000; // 1 day
  let result; // final result

  if (findUser && (!fresh || new Date() - new Date(findUser.time) <= updateTimeThreshold)) {
    /*
      return data preset in db if fresh data not requested
      or if requested then data is already latest
    */
    result = findUser;
  } else if (!findUser || (fresh && new Date() - new Date(findUser.time) > updateTimeThreshold)) {
    /*
      fetch new data for:
      1) user not found in db
      2) user data is old and requested fresh
    */

    if (!findUser) {
      console.log(`Data for user ${username} not present.`);
    } else {
      console.log(`Fresh data requested for ${username}.`);
    }
    // fetch fresh user data
    const { status, data } = await fetchData(username);

    if (status === 200) {
      // fresh data fetch successful
      const { repos, ...profileData } = data;

      const addUserDataPayload = {
        ...profileData,
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
          temporarily update mutation not working
          delete and create new user
        */
        result = await db.mutation.upsertUser(
          {
            where: { username },
            create: addUserDataPayload,
            update: addUserDataPayload,
          },
          info,
        );
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
