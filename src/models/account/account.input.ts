import { InputType, Field } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@InputType()
export default class AccountInput {
  @Field()
  @IsString()
  name: string
}