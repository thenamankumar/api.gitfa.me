require('dotenv').config();
const userPayload = (username) => {
  return {
    'query': `
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
        repositories {
          totalCount
        }
      }
    `,
    "variables": `
      {
        "username": "` + username + `"
      }
    `
  }
}
const reposPayload = (username, id, endCursor) => {
  return {
    "query": `
      query($username: String!, $id: ID!, $afterCursor: String)
      {
        user(login: $username) {
          repositories(first: 100, after: $afterCursor, orderBy: {field: NAME,direction: ASC}) {
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
        primaryLanguage {
          name
          color
        }
        languages(first: 100){
          nodes{
            name
            color
          }
        }
        contributions: defaultBranchRef {
          target {
            ... on Commit {
              userCommits: history(author: {id: $id}) {
                totalCount
              }
              totalCommits: history {
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
            parent {
              ...repoStats
            }
            ...repoStats
          }
        }
      }
    `,
    "variables": `
      {
        "username": "` + username + `",
        "id": "` + id + `",
        "afterCursor": ` + (endCursor !== null ? `"` + endCursor + `"` : `null`) + `
      }
    `
  }
}

module.exports =  {
  userPayload,
  reposPayload
};
