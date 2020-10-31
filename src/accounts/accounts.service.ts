import { Injectable } from '@nestjs/common'
import { DynamoDB } from 'aws-sdk'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

import Account from '../models/account/account'
import CoopInfo from '../models/account/coopInfo'

import { CoopType } from '../types/account/account'

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

  async scan(client): Promise<Account[]> {
    const params = {
      TableName: this.tableName,
    }
    const res = await client.scan(params).promise()
    const accounts = res.Items as Account[]
    return accounts
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
      return null;
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
    const item: Account = {
        id,
        name: coopInfo.name || coopInfo.alias,
        [coopType+'Info']: coopInfo,
        createdAt,
        updatedAt,
    }
    const params = {
      TableName: this.tableName,
      Item: item,
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
}
