const path = require('path');
require('dotenv').config({
  path: path.resolve(process.cwd(), process.env.NODE_ENV === 'production' ? 'env/prod.env' : 'env/dev.env'),
});
const { GraphQLServer } = require('@fabien0102/graphql-yoga');
const { Prisma } = require('prisma-binding');
const { ApolloEngine } = require('apollo-engine');
const compression = require('compression');
const Raven = require('raven');
const resolvers = require('./resolvers/');

// server port
const port = process.env.port || 4000;

// create a new graphql server
const server = new GraphQLServer({
  typeDefs: 'app/schema.graphql', // application api schema
  resolvers,
  context: req => ({
    ...req,
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
      'https://sharecake.io', // client
      'http://localhost:5000', // client on local
      'https://docs.sharecake.io', // api docs with graphiql
      'http://localhost:3000', // graphql playground
    ],
    methods: ['GET', 'POST', 'OPTIONS', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
};

// enable gzip compression
server.express.use(compression());

if (process.env.NODE_ENV === 'production') {
  // initiate sentry on production
  Raven.config(process.env.SENTRY_KEY).install();
  console.log('Sentry deployed');

  if (process.env.APOLLO_ENGINE_KEY) {
    // create a new apollo engine instance
    const engine = new ApolloEngine({
      apiKey: process.env.APOLLO_ENGINE_KEY, // apollo engine api key
    });

    const httpServer = server.createHttpServer(serverOptions); // create a http server from graphql server instance

    // start server with apollo engine
    engine.listen(
      {
        port,
        httpServer,
        graphqlPaths: ['/'],
      },
      () => console.log(`Server with Apollo Engine is running on http://localhost:${port}`),
    );
  }
} else {
  // start server without apollo engine
  server.start(
    {
      port,
    },
    () => console.log(`Server is running on http://localhost:${port}`),
  );
}
