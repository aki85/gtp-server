export interface IGithubRowData {
  data: {
    data: {
      repositoryOwner: {
        repositories: {
          totalCount: number,
          nodes: {
            name: string,
            owner: {
              login: string,
            },
            languages: {
              totalCount: number,
              nodes: {
                name: string,
                color: string,
              }[],
              edges: {
                size: number,
              }[],
            },
          }[],
        },
      }
    }
  }
}

export const createGetRowDataQuery = (login) => `
  query {
    repositoryOwner(login:"${login}"){
      repositories(first:100, privacy:PUBLIC){
        totalCount
        nodes{
          name
          owner{
            login
          }
          assignableUsers{
            totalCount
          }
          languages(first:10){
            totalCount
            nodes{
              name
              color
            }
            edges{
              size
            }
          }
        }
      }
    }
  }`