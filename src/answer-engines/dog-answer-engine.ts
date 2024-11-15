import { stripUserMentions } from 'twitter-utils'

import { AnswerEngine } from '../answer-engine.js'
import type * as types from '../types.js'

export class DogAnswerEngine extends AnswerEngine {
  constructor() {
    super({ type: 'dog' })
  }

  protected override async _generateResponseForQuery(
    query: types.AnswerEngineQuery,
    _: types.AnswerEngineContext
  ): Promise<string> {
    const resps = ['arf!', 'woof!', 'ruff!']
    return Promise.resolve(
      resps[Math.floor(Math.random() * resps.length)] as string
    )
  }
}
