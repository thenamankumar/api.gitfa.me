const {GraphQLServer} = require('graphql-yoga');
const Query = require('./resolvers/query/');

const resolvers = {
  Query,
};

const server = new GraphQLServer({
  typeDefs: 'app/schema.graphql',
  resolvers,
  context: req => ({
    ...req
  }),
});

server.start(() => console.log(`Server is running on http://localhost:4000`));
