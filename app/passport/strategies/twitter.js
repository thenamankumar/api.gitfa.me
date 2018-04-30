import Raven from 'raven';
import { Strategy } from 'passport-twitter';
import dbBinding from '../../utils/dbBinding';

export default new Strategy(
  {
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: `${process.env.API_BASE}auth/twitter/callback`,
    userProfileURL: 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
  },
  async (token, tokenSecret, profile, done) => {
    const profileData = profile._json;
    let user;
    /*
    There are 3 cases:
      1) first time login
      2) this twitter integration
      3) another twitter integration
      4) no twitter integration
    */
    try {
      const db = dbBinding(); // create new prisma binding instance
      const [presentUser] = await db.query.users(
        {
          where: {
            OR: [{ email: profileData.email }, { integrations_some: { type: 'TWITTER', uid: profileData.id } }],
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
        // account exists either with twitter integration or not
        const presentIntegration = (presentUser.integrations || []).find(({ type }) => type === 'TWITTER');

        if (presentIntegration) {
          if (presentIntegration.uid === profileData.id.toString()) {
            /*
              case 2 - this twitter integration
              get present user data and return
            */
            user = {
              id: presentUser.id,
              username: presentUser.username,
            };
          } else {
            /*
              case 3 - another twitter integration
              throw error
            */
            return done(null, {
              status: 409,
              message: 'A twitter account already integrated.',
            });
          }
        } else {
          /*
            case 4 - no twitter integration
            add this integration and return user data
          */
          const newIntegration = await db.mutation.createIntegration(
            {
              data: {
                type: 'TWITTER',
                uid: profileData.id,
                data: {
                  token,
                  tokenSecret,
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
              integrations: { create: { type: 'TWITTER', uid: profileData.id, data: { token, tokenSecret } } },
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
