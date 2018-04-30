import { Router } from 'express';
import passport from '../passport/passportHandler';
import signToken from '../utils/signToken';

const authRouter = Router();

const authCallbackHandler = async (req, res) => {
  if (req.user.status === 200) {
    // return token on successful auth
    res.json({ status: 200, token: await signToken(req.user.data) });
  } else {
    // return error object
    res.json(req.user);
  }
};

// twitter auth routes
authRouter.get('/twitter', passport.authenticate('twitter'));
authRouter.get('/twitter/callback', passport.authenticate('twitter'), authCallbackHandler);

// github auth routes
authRouter.get(
  '/github',
  passport.authenticate('github', { scope: ['read:user', 'user:email', 'read:org', 'read:discussion'] }),
);
authRouter.get('/github/callback', passport.authenticate('github'), authCallbackHandler);

// local auth routes
authRouter.post('/local', passport.authenticate('local'), authCallbackHandler);

export default authRouter;
