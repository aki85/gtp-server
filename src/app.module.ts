import { GraphQLModule } from '@nestjs/graphql'
import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { AccountsModule } from './accounts/accounts.module'

import { AppController } from './app.controller'

import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      playground: true,
      autoSchemaFile: 'schema.graphql'
    }),
    AuthModule,
    AccountsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
