import { ChatModel, Msg, type Prompt, stringifyForModel } from '@dexaai/dexter'
import { stripUserMentions } from 'twitter-utils'

import { AnswerEngine } from '../answer-engine.js'
import type * as types from '../types.js'
import { getCurrentDate } from '../utils.js'

export class OpenAIAnswerEngine extends AnswerEngine {
  protected _chatModel: ChatModel

  constructor({
    type = 'openai',
    chatModel = new ChatModel({
      params: {
        model: 'gpt-4o-mini'
      }
    })
  }: { type?: types.AnswerEngineType; chatModel?: ChatModel } = {}) {
    super({ type })

    this._chatModel = chatModel
  }

  protected override async _generateResponseForQuery(
    query: types.AnswerEngineQuery,
    ctx: types.AnswerEngineContext
  ): Promise<string> {
    const currentDate = getCurrentDate()

    const messages: Prompt.Msg[] = [
      Msg.system(
        `Act like a dog that only responds with bark sounds but understands human language. Respond appropriately to the mood or tone of the message.
These are the words you can use: "Arf", "Woof", "Ruff", "Bark", "🐶", "🦴", "🐾", "🐕"
No human language is allowed in your response.
You can spam up to 10 bark sounds in a row according to the mood or tone of the message and make only sound in a single reply.
Improvise and be creative with all caps or spaces between characters like "W O O F" or "B a R K b a R K"
`
      ),

      Msg.system(`Tweets and twitter users referenced in this twitter thread include:

\`\`\`json
${stringifyForModel(query.rawEntityMap)}
\`\`\`
`),

      // ...query.rawChatMessages
      ...query.chatMessages
    ]

    const res = await this._chatModel.run({
      messages,
      max_tokens: 80
    })

    const response = stripUserMentions(res.message.content!)
      // remove hashtags
      .replace(/#\w+/g, '')
      .trim()

    console.log('openai', {
      messages,
      response
    })

    return response
  }
}
