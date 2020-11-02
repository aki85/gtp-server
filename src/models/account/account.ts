import { ObjectType, Field, ID } from '@nestjs/graphql'

import CoopInfo from './coopInfo'
import GithubAnalysis from './githubAnalysis'

@ObjectType()
export default class Account {
  @Field(type => ID)
  id: string

  @Field(type => ID, { nullable: true })
  githubId?: string

  @Field()
  name: string

  @Field(type => CoopInfo, { nullable: true })
  githubInfo?: CoopInfo

  @Field(type => GithubAnalysis, {nullable: true})
  githubAnalysis?: GithubAnalysis

  @Field()
  createdAt: string

  @Field()
  updatedAt: string
}
