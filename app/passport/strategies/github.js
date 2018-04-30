import Raven from 'raven';
import { Strategy } from 'passport-github2';
import dbBinding from '../../utils/dbBinding';

export default new Strategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.API_BASE}auth/github/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    const profileData = profile._json;
    let user;
    /*
    There are 3 cases:
      1) first time login
      2) this github integration
      3) another github integration
      4) no github integration
    */
    try {
      const db = dbBinding(); // create new prisma binding instance
      const [presentUser] = await db.query.users(
        {
          where: {
            OR: [{ email: profileData.email }, { integrations_some: { type: 'GITHUB', uid: profileData.id } }],
          },
        },
        `{
          id
          username
          email
          integrations {
            type
            uid
          }
        }`,
      );

      if (presentUser) {
        // account exists either with github integration or not
        const presentGithubIntegration = (presentUser.integrations || []).find(({ type }) => type === 'GITHUB');

        if (presentGithubIntegration) {
          if (presentGithubIntegration.uid === profileData.id.toString()) {
            /*
              case 2 - this github integration
              get present user data and return
            */
            user = {
              id: presentUser.id,
              username: presentUser.username,
            };
          } else {
            /*
              case 3 - another github integration
              throw error
            */
            return done(null, {
              status: 409,
              message: 'A github account already integrated.',
            });
          }
        } else {
          /*
            case 4 - no github integration
            add this integration and return user data
          */
          const newIntegration = await db.mutation.createIntegration(
            {
              data: {
                type: 'GITHUB',
                uid: profileData.id,
                data: {
                  accessToken,
                  refreshToken,
                },
                user: { connect: { id: presentUser.id } },
              },
            },
            `{
              user {
                id
                username
              }
            }`,
          );

          user = newIntegration.user; // eslint-disable-line
        }
      } else {
        /*
          case 1 - first time login
          create a new account
        */
        user = await db.mutation.createUser(
          {
            data: {
              name: profileData.name,
              email: profileData.email,
              integrations: { create: { type: 'GITHUB', uid: profileData.id, data: { accessToken, refreshToken } } },
            },
          },
          `{
            id
            username
          }`,
        );
      }

      // return user data
      return done(null, {
        status: 200,
        data: user,
      });
    } catch (err) {
      Raven.captureException(err); // send error to sentry
      return done({
        status: 500,
        message: err,
      }); // return error
    }
  },
);
