const path = require('path');
require('dotenv').config({path: path.resolve(process.cwd(), `env/${process.env === 'production' ? 'prod' : 'dev'}.env`)});
const {GraphQLServer} = require('graphql-yoga');
const {Prisma} = require('prisma-binding');
const compression = require('compression');

// resolvers
const Query = require('./resolvers/query/');
const Mutation = require('./resolvers/mutation/');

const resolvers = {
  Query,
  Mutation,
};

// create a new graphql server
const server = new GraphQLServer({
  typeDefs: 'app/schema.graphql',
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

// enable gzip compression
server.express.use(compression());

// start server at default port 4000
server.start({
  tracing: true, // tracking for apollo engine
  cacheControl: true, // cache control data in response for apollo engine
}, () => console.log(`Server is running on http://localhost:4000`));
