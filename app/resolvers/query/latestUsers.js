import redis from 'redis';
import signale from 'signale';
import { promisify } from 'util';

export default async (parent, { user }, info) => {
  // username = (username || '').toLowerCase(); // eslint-disable-line

  const redisClient = redis.createClient();
  redisClient.on('error', signale.error);
  const getAsync = promisify(redisClient.get).bind(redisClient);
  const redisCache = JSON.parse(await getAsync('api.gitfa.me/user')) || [];

  return (
    redisCache[user] || {
      username: '',
      status: 404,
    }
  );
};
