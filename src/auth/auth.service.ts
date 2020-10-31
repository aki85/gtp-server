import { Injectable, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DBService } from '../db/db.service'
import { AccountsService } from '../accounts/accounts.service'

import Account from '../models/account/account'
import CoopInfo from '../models/account/coopInfo'
import { CoopType } from '../types/account/account'

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private dbService: DBService,
    private accountsService: AccountsService,
  ) {}

  getClient() {
    return this.dbService.getClient()
  }

  async accessByCoop(type: CoopType, coopInfo: CoopInfo) {
    const client = this.getClient()
    let account = await this.accountsService.getByCoopId(client, type, coopInfo.id)

    if (!account) {
      account = await this.accountsService.createByCoop(client, type, coopInfo)
    }

    return {
      token: this.jwtService.sign(account)
    }
  }

  verify(token: string) {
    let account: Account
    try {
      account = this.jwtService.verify(token)
    } catch (e) {
      throw new BadRequestException('Invalid Token')
    }
    
    return
  }
}
