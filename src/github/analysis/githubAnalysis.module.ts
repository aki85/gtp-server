import { Module } from '@nestjs/common'
import { GithubAnalysisResolver } from './githubAnalysis.resolver'
import { GithubAnalysisService } from './githubAnalysis.service'
import { GitHubApiService } from '../api.service'
import { DBService } from '../../db/db.service'

@Module({
  providers: [GithubAnalysisResolver, GithubAnalysisService, GitHubApiService, DBService],
})
export class GithubAnalysisModule { }
