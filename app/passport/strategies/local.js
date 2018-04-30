import Raven from 'raven';
import { Strategy } from 'passport-local';
import { compare } from 'bcryptjs';
import dbBinding from '../../utils/dbBinding';

export default new Strategy(async (login, password, done) => {
  /*
    search for user by username or email, match password and return data
  */
  try {
    const db = dbBinding();
    const user = await db.query.user(
      { where: { OR: [{ username: login }, { email: login }] } },
      `{
        id
        username
        password
      }`,
    );

    if (!user || !compare(password, user.password)) {
      // if user not found or password don't match return null
      return done(null, { status: 404, message: 'Username/email and password do not match' });
    }

    // return user data
    return done(null, {
      status: 200,
      data: { id: user.id, username: user.username },
    });
  } catch (err) {
    Raven.captureException(err); // send error to sentry
    return done({
      status: 500,
      message: err,
    }); // return error
  }
});
