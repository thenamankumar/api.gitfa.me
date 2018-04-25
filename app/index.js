const path = require('path');
require('dotenv').config({path: path.resolve(process.cwd(), `env/${process.env === 'production' ? 'prod' : 'dev'}.env`)});
const {GraphQLServer} = require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const Query = require('./resolvers/query/');
const Mutation = require('./resolvers/mutation/');

const resolvers = {
  Query,
  Mutation,
};

const server = new GraphQLServer({
  typeDefs: 'app/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'app/database/api.graphql',
      endpoint: `http://localhost:4466/${process.env.DB_API_NAME}/${process.env.DB_API_STAGE}`,
      secret: process.env.DB_API_SECRET,
      debug: true,
    }),
  }),
});

server.start(() => console.log(`Server is running on http://localhost:4000`));
