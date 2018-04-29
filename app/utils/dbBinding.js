import { Prisma } from 'prisma-binding';

const dbBinding = () =>
  new Prisma({
    typeDefs: 'app/database/api.graphql', // prisma generated db api schema
    endpoint: `http://localhost:4466/${process.env.DB_API_NAME}/${process.env.DB_API_STAGE}`,
    secret: process.env.DB_API_SECRET, // secret for db api auth
    debug: true,
  });

export default dbBinding;
