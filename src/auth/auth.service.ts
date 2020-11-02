import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DBService } from '../db/db.service'
import { AccountsService } from '../accounts/accounts.service'
import { MailService } from '../mail/mail.service'

import Account from '../models/account/account'
import CoopInfo from '../models/account/coopInfo'
import { CoopType } from '../types/account/account'

type RegisterTokenData = {
  type: CoopType
  coopInfo: CoopInfo
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private dbService: DBService,
    private accountsService: AccountsService,
    private mailService: MailService,
  ) {}

  getClient() {
    return this.dbService.getClient()
  }

  async signupByCoop(coopInfo: {type: CoopType} & CoopInfo) {
    const client = this.getClient()
    let account
    try {
      account = await this.accountsService.getByCoopId(client, coopInfo.type, coopInfo.id)
    } catch(e) {
      throw new BadRequestException()
    }

    if (account) {
      throw new BadRequestException('The account is already created')
    }

    const token = this.jwtService.sign({
      type: coopInfo.type, coopInfo
    })

    this.mailService.send({
      to: coopInfo.email,
      subject: '[GitLev] 登録確認用メールです',
      text: `
GitLev に登録申請して頂き、誠にありがとうございます。
登録の手続きはまだ完了していません。下記URLからメールアドレスを認証して、登録の手続きを完了してください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 登録用URL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${process.env.FRONT_URL}/register/${token}

24時間以内に上記のURLをクリックすることで、GitLevへの登録が完了します。
      `
    })

    return
  }

  async register(token: string) {
    const client = this.getClient()
    let registerTokenData: RegisterTokenData
    try {
      registerTokenData = this.jwtService.verify(token)
    } catch (e) {
      throw new BadRequestException('Invalid Token')
    }

    let account: Account
    if (registerTokenData.type) {
      account = await this.accountsService.getByCoopId(client, registerTokenData.type, registerTokenData.coopInfo.id)
      if (account) {
        throw new BadRequestException('The account is already created')
      }
      account = await this.accountsService.createByCoop(client, registerTokenData.type, registerTokenData.coopInfo)
    } else {
      // TODO: 連携以外の登録方法の実装
      throw new BadRequestException('Invalid Token')
    }

    return {
      token: this.jwtService.sign(account)
    }
  }

  async loginByCoop(coopInfo: {type: CoopType} & CoopInfo) {
    const client = this.getClient()
    let account = await this.accountsService.getByCoopId(client, coopInfo.type, coopInfo.id)

    if (!account) {
      throw new UnauthorizedException()
    }

    return {
      token: this.jwtService.sign(account)
    }
  }

  async verify(id: string) {
    const client = this.getClient()
    const account = await this.accountsService.get(client, id)

    if (!account) {
      throw new BadRequestException('Invalid Token')
    }
    
    return
  }

  async cancelMembership(id: string) {
    const client = this.getClient()
    const account = await this.accountsService.get(client, id)

    if (!account) {
      return
    }

    return await this.accountsService.delete(client, id)
  }
}
