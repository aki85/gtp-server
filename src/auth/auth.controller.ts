import { Controller, Get, Post, Body, Res, Req, UseGuards, Delete } from '@nestjs/common'
import { AuthService } from './auth.service'

import CoopInfo from '../models/account/coopInfo'
import { CoopType } from '../types/account/account'

import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}
  
  @Post('/signupByCoop')
  async signupByCoop(@Body() body: {type: CoopType} & CoopInfo, @Res() response) {
    const result = await this.authService.signupByCoop(body)
    response.status(200).json(result)
  }
  
  @Post('/register')
  async register(@Body() body: {token: string}, @Res() response) {
    const result = await this.authService.register(body.token)
    response.status(201).json(result)
  }

  @Post('/loginByCoop')
  async loginByCoop(@Body() body: {type: CoopType} & CoopInfo, @Res() response) {
    const result = await this.authService.loginByCoop(body)
    response.status(200).json(result)
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('/verify')
  async verify(@Req() req, @Res() response) {
    const result = await this.authService.verify(req.user.id)
    response.status(200).json(result)
  }
  
  @UseGuards(JwtAuthGuard)
  @Delete('/cancelMembership')
  async cancelMembership(@Req() req, @Res() response) {
    const result = await this.authService.cancelMembership(req.user.id)
    response.status(200).json(result)
  }
}
