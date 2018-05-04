const userPayload = username => ({
  query: `
      query($username: String!)
      {
        user(login: $username) {
          ...userData
        }
        rateLimit {
          limit
          cost
          remaining
          resetAt
        }
      }
      
      fragment userData on User {
        id
        login
        name
        bio
        createdAt
        avatarUrl
        url
        followers {
          totalCount
        }
        following {
          totalCount
        }
      }
    `,
  variables: `
      {
        "username": "${username}"
      }
    `,
});

const reposPayload = (username, id, endCursor) => ({
  query: `
      query($username: String!, $id: ID!, $afterCursor: String)
      {
        user(login: $username) {
          repositories(first: 20, after: $afterCursor, orderBy: {field: NAME,direction: ASC}) {
            ...repoData
          }
        }
        rateLimit {
          limit
          cost
          remaining
          resetAt
        }
      }

      fragment repoStats on Repository {
        nameWithOwner
        url
        owner {
          login
        }
        stargazers {
          totalCount
        }
        watchers {
          totalCount
        }
        forks {
          totalCount
        }
        branch: defaultBranchRef {
          name
        }
        languages(first: 10, orderBy: {field: SIZE,direction: DESC}){
          nodes{
            name
            color
          }
          totalSize
        }
        contributions: defaultBranchRef {
          target {
            ... on Commit {
              userCommits: history(first: 0, author: {id: $id}) {
                totalCount
              }
            }
          }
        }
      }

      fragment repoData on RepositoryConnection {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ... on Repository {
            isFork
            ...repoStats
          }
        }
      }
    `,
  variables: `
      {
        "username": "${username}",
        "id": "${id}",
        "afterCursor": ${endCursor !== null ? `"${endCursor}"` : `null`}
      }
    `,
});

const cursorPayload = (username, endCursor) => ({
  query: `
      query($username: String!, $afterCursor: String)
      {
        user(login: $username) {
          repositories(first: 20, after: $afterCursor, orderBy: {field: NAME,direction: ASC}) {
            ...repoData
          }
        }
        rateLimit {
          limit
          cost
          remaining
          resetAt
        }
      }
      fragment repoData on RepositoryConnection {
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    `,
  variables: `
      {
        "username": "${username}",
        "afterCursor": ${endCursor !== null ? `"${endCursor}"` : `null`}
      }
    `,
});

module.exports = {
  userPayload,
  reposPayload,
  cursorPayload,
};
