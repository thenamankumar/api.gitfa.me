const getUserAll = async (username, db) => {
  const user = await db.query.user({ where: { username } });
  const pinnedRepositories = await db.query.pinnedRepoes({ where: { user: { username } } });
  const pullRequests = await db.query.pullRequests({ where: { user: { username } } });
  const repos = await db.query.repoes({ where: { user: { username } } });

  return {
    ...user,
    pinnedRepositories,
    pullRequests,
    repos,
  };
};

export default getUserAll;
