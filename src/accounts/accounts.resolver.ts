import { Resolver, Query, Args, ID, Mutation } from '@nestjs/graphql'
import { BadRequestException, Req, UseGuards } from '@nestjs/common'

import Account from '../models/account/account'

import { AccountsService } from './accounts.service'
import { DBService } from '../db/db.service'
import { JwtAuthGuardGql } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/currentUser.decorator'
import AccountInput from '../models/account/account.input'
import GithubAnalysis from '../models/account/githubAnalysis'

@Resolver()
@UseGuards(JwtAuthGuardGql)
export class AccountsResolver {
  constructor(
    private readonly dbservice: DBService,
    private readonly service: AccountsService,
  ) {}

  getClient() {
    return this.dbservice.getClient()
  }
  
  @Query(
    returns => Account,
    {
      description: 'accountを取得',
    },
  )

  async account(
    @CurrentUser() user,
  ): Promise<Account> {
    const client = this.getClient()
    const res = await this.service.get(client, user.id)
    if (!res) {
      throw new BadRequestException()
    }
    return res
  }

  @Mutation(
    returns => Account,
    {
      description: 'acountを更新',
    },
  )
  async updateAccount(
    @CurrentUser() user,
    @Args('input') input: AccountInput,
  ): Promise<Account> {
    const client = this.getClient()
    const res = await this.service.get(client, user.id)
    if (!res) {
      throw new BadRequestException()
    }
    return await this.service.update(client, {
      ...res,
      ...input,
    })
  }
  
  @Mutation(
    returns => String,
    {
      description: 'accountのgithubAnalysisを保存',
      nullable: true
    },
  )

  async saveGithubAnalysis(
    @CurrentUser() user,
  ): Promise<String> {
    const client = this.getClient()
    const res = await this.service.get(client, user.id)
    if (!res) {
      throw new BadRequestException()
    }
    return this.service.saveGithubAnalysis(client, user.id)
  }
  
  @Query(
    returns => [GithubAnalysis],
    {
      description: 'accountの保存したgithubAnalysisの一覧を取得'
    },
  )

  async githubAnalysisLogs(
    @CurrentUser() user,
  ): Promise<GithubAnalysis[]> {
    const client = this.getClient()
    const res = await this.service.get(client, user.id)
    if (!res) {
      throw new BadRequestException()
    }
    return this.service.getGithubAnalysisLogs(client, user.id)
  }
  
  @Mutation(
    returns => String,
    {
      description: 'accountのgithubAnalysisを保存',
      nullable: true
    },
  )

  async deleteGithubAnalysis(
    @CurrentUser() user,
    @Args('id') id: string,
  ): Promise<String> {
    const client = this.getClient()
    const res = await this.service.get(client, user.id)
    if (!res) {
      throw new BadRequestException()
    }
    return this.service.deleteGithubAnalysis(client, id)
  }
}
