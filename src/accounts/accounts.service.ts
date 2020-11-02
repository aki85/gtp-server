import { Injectable } from '@nestjs/common'
import { DynamoDB } from 'aws-sdk'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

import { GitHubApiService } from '../github/api.service'

import Account from '../models/account/account'
import CoopInfo from '../models/account/coopInfo'
import GithubAnalysis, { Language, LanguagesTotal } from '../models/account/githubAnalysis'

import { CoopType } from '../types/account/account'

import { IGithubRowData, createGetRowDataQuery } from '../github/graphql'

class CoopDynamoAccessObject {
  constructor(private coopType: string, public id: string) {}

  get Index() {
    return this.coopType + 'Id'
  }
  
  get NameKey() {
    return '#' + this.Index
  }
  
  get ValueKey() {
    return ':' + this.Index
  }
}

@Injectable()
export class AccountsService {
  private readonly tableName: string = 'accounts'

  constructor(
    private githubApiService: GitHubApiService,
  ) {}

  async scan(client): Promise<Account[]> {
    const params = {
      TableName: this.tableName,
    }
    const res = await client.scan(params).promise()
    const accounts = res.Items as Account[]
    return accounts
  }

  async get(
    client: DynamoDB.DocumentClient,
    id: string
  ): Promise<Account | null> {
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
    return res.Item as Account
  }

  async getByCoopId(
    client: DynamoDB.DocumentClient,
    coopType: CoopType,
    coopId: string
  ): Promise<Account | null> {
    const CoopDAO = new CoopDynamoAccessObject(coopType, coopId)

    const params = {
      TableName: this.tableName,
      IndexName: CoopDAO.Index,
      ExpressionAttributeNames: {
        [CoopDAO.NameKey]: CoopDAO.Index,
      },
      KeyConditionExpression: CoopDAO.NameKey + ' = ' + CoopDAO.ValueKey,
      ExpressionAttributeValues: {
        [CoopDAO.ValueKey]: CoopDAO.id,
      }
    }

    const res = await client.query(params).promise()
    if (res.Items.length === 0) {
      return null
    }
    return res.Items[0] as Account
  }

  async createByCoop(
    client: DynamoDB.DocumentClient,
    coopType: CoopType,
    coopInfo: CoopInfo
  ): Promise<Account> {
    const id = uuidv4()
    const now = dayjs()
    const createdAt = now.format()
    const updatedAt = now.format()
    let githubAnalysis, githubId
    if (coopType === 'github') {
      githubId = coopInfo.id
      githubAnalysis = await this.analyzeGithub(coopInfo.alias)
    }
    const item: Account = {
        id,
        githubId,
        name: coopInfo.name || coopInfo.alias,
        [coopType+'Info']: coopInfo,
        createdAt,
        updatedAt,
        githubAnalysis,
    }
    const params = {
      TableName: this.tableName,
      Item: item,
    }
    await client.put(params).promise()
    return item
  }

  async updateGithubAnalysis(
    client: DynamoDB.DocumentClient,
    id: string
  ): Promise<Account> {
    const account = await this.get(client, id)
    const githubAnalysis = await this.analyzeGithub(account.githubInfo.alias)
    const item = {
      ...account,
      githubAnalysis
    }
    const params = {
      TableName: this.tableName,
      Item: item
    }
    await client.put(params).promise()
    return item
  }

  async update(
    client: DynamoDB.DocumentClient,
    update: Account,
  ): Promise<Account> {
    const item = {
      ...update
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

  async analyzeGithub(
    login: string
  ): Promise<GithubAnalysis> {
    const client = this.githubApiService.getClient()
    const res: IGithubRowData = await client.post('/graphql', {query: createGetRowDataQuery(login)})
    const data = res.data.data
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
              color: lang.color,
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
      repositoryCountData: {
        involvedCount: data.repositoryOwner.repositories.totalCount,
        ownerCount: data.repositoryOwner.repositories.nodes.filter(repository => repository.owner.login === login).length,
      },
      languagesData: {
        involvedLanguages: adjustedInvolvedLanguages.languages,
        involvedLanguagesTotal: adjustedInvolvedLanguages.total,
        ownerLanguages: adjustedOwnerLanguages.languages,
        ownerLanguagesTotal: adjustedOwnerLanguages.total
      }
    }
  }

  adjustLanguages(languages: Language[]): {languages: Language[], total: LanguagesTotal} {
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
