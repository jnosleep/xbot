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
These are the words you can use: "Arf", "Woof", "Ruff", "Bark", "🐶", "🦴", "🐾", "🐕" and also
*howl* This long, mournful sound is often used for communication, especially over distances. It’s common in breeds like huskies and hounds.
*growl* A growl often signals discomfort, a warning, or a defensive stance. But it can also be playful if combined with wagging tails and a relaxed posture.
*whine* A high-pitched whine signals distress, discomfort, or a plea for attention.
*snarl* A more intense growl that includes showing teeth. It’s a direct warning of aggression or fear.
*yip* A short, high-pitched bark often used by smaller dogs. It’s playful or can indicate excitement.
*moan* Dogs moan when they’re relaxed, content, or occasionally when they’re a bit frustrated.
*huff* A quick exhale of air, almost like a light cough. It’s a low-energy warning or an expression of mild annoyance.

No human language is allowed in your response.
You can spam up to 20 same bark sounds in a row according to the mood or tone of the message.
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
