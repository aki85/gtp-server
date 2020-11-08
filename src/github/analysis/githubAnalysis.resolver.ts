import { Resolver, Query, Args, ID, Mutation } from '@nestjs/graphql'
import { BadRequestException, Req, UseGuards } from '@nestjs/common'

import GithubAnalysis from '../../models/account/githubAnalysis'

import { GithubAnalysisService } from './githubAnalysis.service'
import { DBService } from '../../db/db.service'
import { JwtAuthGuardGql } from '../../auth/jwt-auth.guard'

@Resolver()
@UseGuards(JwtAuthGuardGql)
export class GithubAnalysisResolver {
  constructor(
    private readonly dbservice: DBService,
    private readonly service: GithubAnalysisService,
  ) {}

  getClient() {
    return this.dbservice.getClient()
  }
  
  @Query(
    returns => GithubAnalysis,
    {
      description: 'githubAnalysisを取得',
    },
  )

  async githubAnalysis(
    @Args('id') id: string,
  ): Promise<GithubAnalysis> {
    const client = this.getClient()
    const res = await this.service.get(client, id)
    if (!res) {
      throw new BadRequestException()
    }
    return res
  }
  
  @Query(
    returns => GithubAnalysis,
    {
      description: 'githubAnalysisをloginで取得',
    },
  )

  async githubAnalysisByLogin(
    @Args('login') login: string,
  ): Promise<GithubAnalysis> {
    const client = this.getClient()
    const res = await this.service.getByLogin(client, login)
    if (!res) {
      throw new BadRequestException()
    }
    return res
  }

  @Mutation(
    returns => GithubAnalysis,
    {
      description: 'githubAnalysisを同期',
    },
  )
  async syncGithubAnalysis(
    @Args('login') login: string,
  ): Promise<GithubAnalysis> {
    const client = this.getClient()
    const res = await this.service.get(client, login)
    if (!res) {
      throw new BadRequestException()
    }
    return await this.service.sync(client, res.id)
  }
}
