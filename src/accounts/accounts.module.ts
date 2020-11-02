import { Module } from '@nestjs/common'
import { AccountsResolver } from './accounts.resolver'
import { AccountsService } from './accounts.service'
import { GitHubApiService } from '../github/api.service'
import { DBService } from '../db/db.service'

@Module({
  providers: [AccountsResolver, AccountsService, GitHubApiService, DBService],
})
export class AccountsModule { }
