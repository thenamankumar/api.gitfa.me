# api.gitfa.me
The graphql api for [gitfame](https://github.com/hereisnaman/gitfame)

## Technologies
|**Name**|**Description**|
|----|---|
|**graphq-yoga**| with graphql-tools as its core, it provides a better way of building graphql aplications|
|**prisma**| db as a graphql api, this project uses the postgres connector|
|**apollo engine**| Tracking and analytics for the gql api|
|**prettier**| pre-commit code formating|

## Setup Environment
Create `env/dev.env` and `env/prod.env` for development and production respectively. Example env:
```
NODE_ENV=development
API_BASE=http://localhost:4000/
DB_USER= #postgres user
DB_SECRET= #postgres pass
DB_API_NAME= #cluster name
DB_API_STAGE= #cluster stage
DB_API_SECRET= #secret to sign and verify JWT token for prisma api
APOLLO_ENGINE_KEY=
SENTRY_KEY=
GITHUB_TOKEN=
```


## Quick Start (Development)
```
# Install Prisma and Postgres images
DB_USER=<pgUser> DB_SECRET=<pgPass> docker-compose up -d

# Install dependencies
yarn

# Deploy Prisma
yarn prisma-dev

# Start dev server on localhost:4000
yarn dev
```

Frontend repo : <https://github.com/hereisnaman/gitfame>
