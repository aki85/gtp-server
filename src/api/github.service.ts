import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'

@Injectable()
export class GitHubService {
  private client: AxiosInstance = null

  getClient(): AxiosInstance {
    if (this.client) {
      return this.client
    }

    this.client = axios.create({
      baseURL: 'https://api.github.com/',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.GITHUB_AUTH_TOKEN}`,
      },
    })

    return this.client
  }
}