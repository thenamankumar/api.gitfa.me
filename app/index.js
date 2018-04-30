import 'babel-polyfill';
import { GraphQLServer } from '@fabien0102/graphql-yoga';
import { ApolloEngine } from 'apollo-engine';
import compression from 'compression';
import Raven from 'raven';
import cors from 'cors';
import _ from './env';
import resolvers from './resolvers/';
import directiveResolvers from './directives';
import dbBinding from './utils/dbBinding';
import passport from './passport/passportHandler';
import generateToken from './utils/signToken';
import verifyToken from './utils/verifyToken';

// server port
const port = process.env.port || 4000;

// create a new graphql server
const server = new GraphQLServer({
  typeDefs: 'app/schema.graphql', // application api schema
  resolvers,
  directiveResolvers,
  context: req => ({
    ...req,
    // verify request jwt token and add user payload to context
    user: verifyToken(req.request.headers.authorization),
    db: dbBinding(),
  }),
});

// graphql server options
const serverOptions = {
  tracing: true, // tracking for apollo engine
  cacheControl: true, // cache control data in response for apollo engine
  cors: {
    origin: [
      'https://sharecake.io', // client
      'http://localhost:5000', // client on local
      'https://docs.sharecake.io', // api docs with graphiql
      'http://localhost:3000', // graphql playground
    ],
    methods: ['GET', 'POST', 'OPTIONS', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    credentials: true,
  },
};

// allow cors from express
server.express.use(cors(serverOptions.cors));
// enable gzip compression
server.express.use(compression());

// initiate passport
server.express.use(passport.initialize());
server.express.use(passport.session());

// github auth routes
server.express.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['read:user', 'user:email', 'read:org', 'read:discussion'] }),
);
server.express.get('/auth/github/callback', passport.authenticate('github'), (req, res) => {
  if (req.user.status === 200) {
    // return token on successful auth
    res.json({ status: 200, token: generateToken(req.user.data) });
  } else {
    // return error object
    res.json(req.user);
  }
});

if (process.env.NODE_ENV === 'production') {
  // initiate sentry on production
  Raven.config(process.env.SENTRY_KEY).install();

  if (process.env.APOLLO_ENGINE_KEY) {
    // create a new apollo engine instance
    const engine = new ApolloEngine({
      apiKey: process.env.APOLLO_ENGINE_KEY, // apollo engine api key
    });

    const httpServer = server.createHttpServer(serverOptions); // create a http server from graphql server instance

    // start server with apollo engine
    engine.listen(
      {
        port, // default 4000
        httpServer, // graphql server
        graphqlPaths: ['/'], // graphql api path
      },
      () => console.log(`Server with Apollo Engine and Sentry is running on http://localhost:${port}`),
    );
  }
} else {
  // start server without apollo engine
  server.start(
    {
      port,
      cors: serverOptions.cors, // allow cors from graphql
    },
    () => console.log(`Server is running on http://localhost:${port}`),
  );
}
