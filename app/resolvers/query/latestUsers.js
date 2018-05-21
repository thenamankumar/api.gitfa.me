export default async (parent, { first }, { redisClient }, info) =>
  first === 0
    ? []
    : redisClient
        .zrevrangeAsync('latestUsersSet', 0, first ? first - 1 : 19)
        .then(users => users.map(user => JSON.parse(user)));
