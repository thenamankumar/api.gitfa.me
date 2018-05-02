import 'babel-polyfill';
import { GraphQLServer } from 'graphql-yoga';
import { Prisma } from 'prisma-binding';
import { ApolloEngine } from 'apollo-engine';
import compression from 'compression';
import Raven from 'raven';
import cors from 'cors';
import _ from './env'; // import before others
import resolvers from './resolvers/';

// server port
const port = process.env.port || 3000;

// create a new graphql server
const server = new GraphQLServer({
  typeDefs: 'app/schema.graphql', // application api schema
  resolvers,
  context: req => ({
    ...req,
    // verify request jwt token and add user payload to context
    db: new Prisma({
      typeDefs: 'app/database/api.graphql', // prisma generated db api schema
      endpoint: `http://localhost:4466/${process.env.DB_API_NAME}/${process.env.DB_API_STAGE}`,
      secret: process.env.DB_API_SECRET, // secret for db api auth
      debug: true,
    }),
  }),
});

// graphql server options
const serverOptions = {
  tracing: true, // tracking for apollo engine
  cacheControl: true, // cache control data in response for apollo engine
  cors: {
    origin: [
      'https://gitfa.me', // client
      'http://localhost:4000', // client on local
      'http://localhost:3000', // graphql playground
    ],
    methods: ['GET', 'POST', 'OPTIONS', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    credentials: true,
  },
};

// allow cors from express
server.express.use(cors(serverOptions.cors));

if (process.env.NODE_ENV === 'production') {
  // enable gzip compression
  server.express.use(compression());

  // initiate sentry on production
  Raven.config(process.env.SENTRY_KEY).install();

  // create a new apollo engine instance
  const engine = new ApolloEngine({
    apiKey: process.env.APOLLO_ENGINE_KEY, // apollo engine api key
  });

  const httpServer = server.createHttpServer(serverOptions); // create a http server from graphql server instance

  // start server with apollo engine
  engine.listen(
    {
      port, // default 3000
      httpServer, // graphql server
      graphqlPaths: ['/'], // graphql api path
    },
    () => console.log(`Server with Apollo Engine and Sentry is running on http://localhost:${port}`),
  );
} else {
  // start server without apollo engine
  server.start(
    {
      port, // default 3000
      cors: serverOptions.cors, // allow cors from graphql
    },
    () => console.log(`Server is running on http://localhost:${port}`),
  );
}
