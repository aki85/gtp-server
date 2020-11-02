import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { DBService } from '../db/db.service'
import { GitHubApiService } from '../github/api.service'
import { AccountsService } from '../accounts/accounts.service'
import { MailService } from '../mail/mail.service'
import { jwtSignOptions } from './constants'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET_KEY,
          signOptions: { expiresIn: jwtSignOptions.expiresIn },
        }
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, DBService, GitHubApiService, AccountsService, MailService],
  exports: [AuthService],
})
export class AuthModule {}
