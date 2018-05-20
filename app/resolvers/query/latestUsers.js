export default async (parent, { first }, { getRedisAsync }, info) =>
  (JSON.parse(await getRedisAsync('api.gitfa.me/user')) || []).slice(0, first);
