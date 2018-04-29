import passport from 'passport';
import Raven from 'raven';
import dbBinding from '../utils/dbBinding';
import { twitter, github, local } from './strategies/';

// use the strategies
passport.use('twitter', twitter);
passport.use('github', github);
passport.use('local', local);

// serialize user
passport.serializeUser((user, cb) => {
  console.log('SERIALIZE - - - -');
  console.log(user);
  cb(null, user.id);
});

// deserialize user
passport.deserializeUser(async (userId, cb) => {
  console.log('DESERIALIZE - - - -');
  console.log(userId);
  try {
    const db = dbBinding(); // create new prisma binding instance
    // search user in db
    const user = await db.query.user({
      where: {
        id: userId,
      },
    });
    cb(null, user);
  } catch (err) {
    Raven.captureException(err); // send error to sentry
  }
});

export default passport;
