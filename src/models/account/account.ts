import { ObjectType, Field, ID } from '@nestjs/graphql'

import CoopInfo from './coopInfo'

@ObjectType()
export default class Account {
  @Field(type => ID)
  id: string

  @Field()
  name: string

  @Field(type => CoopInfo, { nullable: true })
  githubInfo?: CoopInfo

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}
