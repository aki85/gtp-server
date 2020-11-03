import { Injectable } from '@nestjs/common'
import { DynamoDB } from 'aws-sdk'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

import { GitHubApiService } from '../api.service'

import GithubAnalysis, { Language, LanguagesTotal } from '../../models/account/githubAnalysis'

import { IGithubRowData, createGetRowDataQuery } from '../graphql'

@Injectable()
export class GithubAnalysisService {
  private readonly tableName: string = 'githubAnalyses'

  constructor(
    private githubApiService: GitHubApiService,
  ) {}

  private createLoginQueryParam(login) {
    return  {
      TableName: this.tableName,
      IndexName: 'login',
      ExpressionAttributeNames: {
        '#login': 'login',
      },
      KeyConditionExpression: '#login = :login',
      ExpressionAttributeValues: {
        ':login': login,
      }
    }
  }

  async scan(client): Promise<GithubAnalysis[]> {
    const params = {
      TableName: this.tableName,
    }
    const res = await client.scan(params).promise()
    const accounts = res.Items as GithubAnalysis[]
    return accounts
  }

  async get(
    client: DynamoDB.DocumentClient,
    id: string
  ): Promise<GithubAnalysis | null> {
    const params = {
      TableName: this.tableName,
      Key: {
        id
      },
    }
    const res = await client.get(params).promise()
    if (!res.Item) {
      return null
    }
    return res.Item as GithubAnalysis
  }

  async getLogs(
    client: DynamoDB.DocumentClient,
    login: string
  ): Promise<GithubAnalysis[] | null> {
    const params = this.createLoginQueryParam(login)
    const res = await client.query(params).promise()
    if (res.Items.length === 0) {
      return null
    }
    const githubAnalysisLogs = res.Items.filter(item => item.savedAt)
    return githubAnalysisLogs as GithubAnalysis[]
  }

  async getByLogin(
    client: DynamoDB.DocumentClient,
    login: string
  ): Promise<GithubAnalysis | null> {
    const params = this.createLoginQueryParam(login)

    const res = await client.query(params).promise()
    if (res.Items.length === 0) {
      return await this.create(client, login)
    }
    return res.Items[0] as GithubAnalysis
  }

  async create(
    client: DynamoDB.DocumentClient,
    login: string
  ): Promise<GithubAnalysis | null> {
    const id = uuidv4()
    const now = dayjs()
    const syncedAt = now.format()
    let githubAnalysis
    try {
      githubAnalysis = await this.analyze(login)
    } catch(e) {
      console.log('e: ', e)
      return null
    }
    const item: GithubAnalysis = {
      ...githubAnalysis,
      id,
      syncedAt,
    }
    const params = {
      TableName: this.tableName,
      Item: item,
    }
    await client.put(params).promise()
    return item
  }
  
  async sync(
    client: DynamoDB.DocumentClient,
    id: string
  ): Promise<GithubAnalysis> {
    let githubAnalysis = await this.get(client, id)
    if (!githubAnalysis.login) {
      return null
    }
    const now = dayjs()
    const syncedAt = now.format()
    githubAnalysis = await this.analyze(githubAnalysis.login)
    const item: GithubAnalysis = {
      ...githubAnalysis,
      id,
      syncedAt,
    }
    const params = {
      TableName: this.tableName,
      Item: item,
    }
    await client.put(params).promise()
    return item
  }
  
  async save(
    client: DynamoDB.DocumentClient,
    githubAnalysis: GithubAnalysis
  ): Promise<GithubAnalysis> {
    const now = dayjs()
    const savedAt = now.format()
    const item: GithubAnalysis = {
      ...githubAnalysis,
      savedAt,
    }
    const params = {
      TableName: this.tableName,
      Item: item,
    }
    await client.put(params).promise()
    return item
  }

  async delete(
    client: DynamoDB.DocumentClient,
    id: string
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        id
      },
    }
    await client.delete(params).promise()
  }

  async analyze(
    login: string
  ): Promise<GithubAnalysis> {
    const client = this.githubApiService.getClient()
    const res: IGithubRowData = await client.post('/graphql', {query: createGetRowDataQuery(login)})
    const data = res.data.data
    login = data.repositoryOwner.login
    const involvedLanguages: Language[] = []
    const ownerLanguages: Language[] = []

    const languagesDataList = [
      {languages: involvedLanguages, type: 'invalved'},
      {languages: ownerLanguages, type: 'owner'},
    ]
    for (const repository of data.repositoryOwner.repositories.nodes) {
      const edges = repository.languages.edges
      for (const [index, lang] of repository.languages.nodes.entries()) {
        for (const languagesData of languagesDataList) {
          if (languagesData.type === 'owner' && repository.owner.login !== login) continue
          
          const languages = languagesData.languages
          const language = languages.find(language => language.name === lang.name)
          if (!language) {
            languages.push({
              name: lang.name,
              color: lang.color || '#24292E',
              size: edges[index].size,
              level: 0
            })
          } else {
            language.size += edges[index].size
          }
        }
      }
    }

    const adjustedInvolvedLanguages = this.adjustLanguages(involvedLanguages)
    const adjustedOwnerLanguages = this.adjustLanguages(ownerLanguages)
    return {
      login,
      repositoryCountData: {
        involvedCount: data.repositoryOwner.repositories.totalCount,
        ownerCount: data.repositoryOwner.repositories.nodes.filter(repository => repository.owner.login === login).length,
      },
      languagesData: {
        involvedLanguages: adjustedInvolvedLanguages.languages,
        involvedLanguagesTotal: adjustedInvolvedLanguages.total,
        ownerLanguages: adjustedOwnerLanguages.languages,
        ownerLanguagesTotal: adjustedOwnerLanguages.total
      },
      syncedAt: dayjs().format()
    }
  }

  private adjustLanguages(languages: Language[]): {languages: Language[], total: LanguagesTotal} {
    const total: LanguagesTotal = {
      size: 0, level: 0
    }
    languages.sort((a, b) => a.size - b.size)
    let level = 1
    for (const language of languages) {
      while (2500 * 2 ** level <= language.size) {
        level += 1
      }
      language.level = level
      total.size += language.size
      total.level += level
    }
    return {
      languages: languages.sort((a, b) => b.size - a.size),
      total
    }
  }
}
