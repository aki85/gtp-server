import { GraphQLModule } from '@nestjs/graphql'
import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { TodoModule } from './todo/todo.module'

import { AppController } from './app.controller'

import { AppService } from './app.service'
import { DBService } from './db/db.service'
import { GitHubService } from './api/github.service'
import { TodoService } from './todo/todo.service'

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      playground: true,
      autoSchemaFile: 'schema.graphql'
    }),
    AuthModule,
    TodoModule
  ],
  controllers: [AppController],
  providers: [AppService, DBService, GitHubService, TodoService],
})
export class AppModule {}
