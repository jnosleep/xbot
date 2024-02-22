import type { Prompt } from '@dexaai/dexter'
import defaultKy, { type KyInstance } from 'ky'

export class DexaClient {
  readonly apiKey: string
  readonly apiBaseUrl: string
  readonly ky: KyInstance

  constructor({
    apiKey = process.env.DEXA_API_KEY,
    apiBaseUrl = process.env.DEXA_API_BASE_URL || 'https://dexa.ai',
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    if (!apiKey) {
      throw new Error('DEXA_API_KEY is required')
    }

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl
    this.ky = ky.extend({ prefixUrl: this.apiBaseUrl })
  }

  async generateResponse({ messages }: { messages: Prompt.Msg[] }) {
    return this.ky
      .post('api/ask-dexa', {
        json: {
          secret: this.apiKey,
          messages
        },
        timeout: 60000
      })
      .json<string>()
  }
}
