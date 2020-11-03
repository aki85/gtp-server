import { Module } from '@nestjs/common'
import { AccountsResolver } from './accounts.resolver'
import { AccountsService } from './accounts.service'
import { GitHubApiService } from '../github/api.service'
import { GithubAnalysisService } from '../github/analysis/githubAnalysis.service'
import { DBService } from '../db/db.service'

@Module({
  providers: [AccountsResolver, AccountsService, GitHubApiService, GithubAnalysisService, DBService],
})
export class AccountsModule { }
