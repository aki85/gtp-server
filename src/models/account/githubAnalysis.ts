import { ObjectType, Field, Int } from '@nestjs/graphql'

@ObjectType()
class RepositoryCountData {
  @Field(type => Int)
  involvedCount: number

  @Field(type => Int)
  ownerCount: number
}

@ObjectType()
export class Language {
  @Field()
  name: string

  @Field()
  color: string

  @Field(type => Int)
  size: number

  @Field(type => Int)
  level: number
}

@ObjectType()
export class LanguagesTotal {
  @Field(type => Int)
  size: number

  @Field(type => Int)
  level: number
}

@ObjectType()
class LanguagesData {
  @Field(type => [Language])
  involvedLanguages: Language[]
  
  @Field(type => LanguagesTotal)
  involvedLanguagesTotal: LanguagesTotal

  @Field(type => [Language])
  ownerLanguages: Language[]
  
  @Field(type => LanguagesTotal)
  ownerLanguagesTotal: LanguagesTotal
}

@ObjectType()
export default class GithubAnalysis {
  @Field()
  repositoryCountData: RepositoryCountData

  @Field()
  languagesData: LanguagesData
}
