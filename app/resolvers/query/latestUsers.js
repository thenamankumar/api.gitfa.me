export default async (parent, { first }, { getRedisAsync }, info) => {
  return (JSON.parse(await getRedisAsync('api.gitfa.me/user')) || []).slice(0, first);
};
