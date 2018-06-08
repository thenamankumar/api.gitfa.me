import signale from 'signale';
import fetchRepos from '../../actions/fetchRepos';

export default async (parent, { username, uid }) => {
  try {
    return await fetchRepos(username, uid);
  } catch (error) {
    signale.error(error);
    return [];
  }
};
