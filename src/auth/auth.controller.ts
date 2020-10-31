import { Controller, Get, Post, Body, Res } from '@nestjs/common'
import { AuthService } from './auth.service'

import CoopInfo from '../models/account/coopInfo'
import { CoopType } from '../types/account/account'

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('/accessByCoop')
  async accessByCoop(@Body() body: {type: CoopType} & CoopInfo, @Res() response) {
    const result = await this.authService.accessByCoop(body.type, body)
    response.status(201).json(result)
  }
  
  @Post('/verify')
  async verify(@Body() body: { token: string }, @Res() response) {
    const result = this.authService.verify(body.token)
    response.status(201).json(result)
  }
}
