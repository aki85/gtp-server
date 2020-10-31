import { Resolver, Query, Args, ID, Mutation } from '@nestjs/graphql'
import { BadRequestException, UseGuards } from '@nestjs/common'

import Todo from '../models/todo/todo'

import { TodoService } from './todo.service'
import { DBService } from '../db/db.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import TodoInput from '../models/todo/todo.input'

@Resolver()
@UseGuards(JwtAuthGuard)
export class TodoResolver {
  constructor(
    private readonly dbservice: DBService,
    private readonly service: TodoService,
  ) {}

  getClient() {
    return this.dbservice.getClient()
  }
  
  @Query(
    returns => Todo,
    {
      description: 'todoを取得',
    },
  )

  async todo(
    @Args({ name: 'id', type: () => ID }) id: string
  ): Promise<Todo> {
    const client = this.getClient()
    const res = await this.service.get(client, id)
    if (!res) {
      throw new BadRequestException(`Todo Not Found id: ${id}`)
    }
    return res
  }
  
  @Query(
    returns => [Todo],
    {
      description: 'todo一覧を取得',
    },
  )

  async todos(): Promise<Todo[]> {
    const client = this.getClient()
    const res = await this.service.scan(client)
    return res
  }
  
  @Mutation(
    returns => Todo,
    {
      description: 'todoを作成',
    },
  )
  async createTodo(@Args('input') input: TodoInput): Promise<Todo> {
    const client = this.getClient()
    const res = await this.service.create(client, input)
    return res
  }

  @Mutation(
    returns => Todo,
    {
      description: 'todoを更新',
    },
  )
  async updateTodo(
    @Args({ name: 'id', type: () => ID }) id: string,
    @Args('input') input: TodoInput,
  ): Promise<Todo> {
    const client = this.getClient()
    const res = await this.service.get(client, id)
    if (!res) {
      throw new BadRequestException(`Todo Not Found id: ${id}`)
    }
    return await this.service.update(client, {
      ...res,
      ...input,
    })
  }

  @Mutation(
    returns => String,
    {
      description: 'todoを削除',
    },
  )
  async deleteTodo(
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<string> {
    const client = this.getClient()
    const res = await this.service.get(client, id)
    if (!res) {
      throw new BadRequestException(`Todo Not Found id: ${id}`)
    }
    await this.service.delete(client, id)
    return id
  }
}
