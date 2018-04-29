import Raven from 'raven';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dbBinding from '../../utils/dbBinding';

export default new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.API_BASE}auth/github/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    const profileData = profile._json;
    try {
      const db = dbBinding(); // create new prisma binding instance
      /*
      There are 3 cases:
        1) first time login
        2) this github integration
        3) another github integration
        4) none github integration
      */
      const [presentUser] = await db.query.users(
        {
          where: {
            OR: [{ email: profileData.email }, { integrations_some: { type: 'GITHUB', uid: profileData.id } }],
          },
        },
        `
        {
          id
          email
          integrations {
            type
            uid
          }
        }
      `,
      );
      let user;
      if (presentUser) {
        // account exists either with github integration or not
        const presentGithubIntegration = (presentUser.integrations || []).find(({ type }) => type === 'GITHUB');

        if (presentGithubIntegration) {
          if (presentGithubIntegration.uid === profileData.id.toString()) {
            /*
              case 2 - this github integration
              get present user data and return
            */
            user = await db.query.user({ where: { id: presentUser.id } });
          } else {
            /*
              case 3 - another github integration
              throw error
            */
            return done('github already integrated');
          }
        } else {
          /*
            case 4 - none github integration
            add this integration and return user data
          */
          const newIntegration = await db.mutation.createIntegration({
            data: {
              type: 'GITHUB',
              uid: profileData.id,
              accessToken,
              refreshToken,
              user: { connect: { id: presentUser.id } },
            },
          });

          user = newIntegration.then(() => db.query.user({ where: { id: presentUser.id } }));
        }
      } else {
        /*
          case 1 - first time login
          create a new account
        */
        user = await db.mutation.createUser({
          data: {
            name: profileData.name,
            email: profileData.email,
            integrations: { create: { type: 'GITHUB', uid: profileData.id, accessToken, refreshToken } },
          },
        });
      }

      // return user data
      return done(null, user);
    } catch (err) {
      Raven.captureException(err); // send error to sentry
      return done(err); // return error
    }
  },
);
