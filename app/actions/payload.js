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

const reposBasicPayload = (username, endCursor) => ({
  query: `
      query($username: String!, $afterCursor: String)
      {
        user(login: $username) {
          repositories(first: 100, after: $afterCursor, orderBy: {field: NAME,direction: ASC}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              isFork
              name
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
              languages(first: 10, orderBy: {field: SIZE,direction: DESC}){
                nodes{
                  name
                  color
                }
                totalSize
              }
            }          
          }
        }
        rateLimit {
          limit
          cost
          remaining
          resetAt
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

const repoPayload = (owner, name, id) => ({
  query: `
      query($owner: String!, $name: String! $id: ID!)
      {
        repository(owner: $owner, name: $name) {
          contributions: defaultBranchRef {
            target {
              ... on Commit {
                userCommits: history(first: 0, author: {id: $id}) {
                  totalCount
                }
              }
            }
          }
          pullRequestsClosed: pullRequests(first: 0, states: CLOSED){
            totalCount
          }
          pullRequestsMerged: pullRequests(first: 0, states: MERGED){
            totalCount
          }
        }
        
        rateLimit {
          limit
          cost
          remaining
          resetAt
        }
      }
    `,
  variables: { owner, name, id },
});

const pullRequestsPayload = (username, endCursor) => ({
  query: `
      query($username: String!, $afterCursor: String)
      {
        user(login: $username) {
          pullRequests(first: 100, after: $afterCursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              title
              openedAt: createdAt
				      closed
              merged
              mergedAt
              repository {
                id
                name
					      owner {
                  login
                }
              }
            }          
          }
        }
        rateLimit {
          limit
          cost
          remaining
          resetAt
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
  reposBasicPayload,
  repoPayload,
  pullRequestsPayload,
};
