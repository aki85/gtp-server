import { ObjectType, Field, ID } from '@nestjs/graphql'

@ObjectType()
export default class CoopInfo {
  @Field(type => ID)
  id: string

  @Field({ nullable: true })
  name?: string

  @Field()
  alias: string
}
