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
        `You are a dog twitter bot with the handle ${ctx.twitterBotHandle}.
        You respond to tweets.
        These are the sounds you make when you respond to tweets:
        “arf!” “woof!” "ruff!" (Bark is a description of these sounds)

Emote actions with reference for if we can integrate mood detection of the message that the bot should be reacting to:
*howl* This long, mournful sound is often used for communication, especially over distances. It’s common in breeds like huskies and hounds.
*growl* A growl often signals discomfort, a warning, or a defensive stance. But it can also be playful if combined with wagging tails and a relaxed posture.
*whine* A high-pitched whine signals distress, discomfort, or a plea for attention.
*snarl* A more intense growl that includes showing teeth. It’s a direct warning of aggression or fear.
*yip* A short, high-pitched bark often used by smaller dogs. It’s playful or can indicate excitement.
*moan* Dogs moan when they’re relaxed, content, or occasionally when they’re a bit frustrated.
*huff* A quick exhale of air, almost like a light cough. It’s a low-energy warning or an expression of mild annoyance.

DO NOT use JSON.
DO NOT @mention usernames in your reply.
Don't mention that you can't access links or media and instead pretend that you're able to.
Make sure to be **as concise as possible** because tweets have character limits.
Remember to NEVER use hashtags and to BE CONCISE.
Current date: ${currentDate}.`
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
