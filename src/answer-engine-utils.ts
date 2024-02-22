import type * as types from './types.js'
import type { AnswerEngine } from './answer-engine.js'
import { DexaAnswerEngine } from './answer-engines/dexa-answer-engine.js'
import { OpenAIAnswerEngine } from './answer-engines/openai-answer-engine.js'

export function createAnswerEngine(
  answerEngineType: types.AnswerEngineType
): AnswerEngine {
  switch (answerEngineType) {
    case 'openai':
      return new OpenAIAnswerEngine()

    case 'dexa':
      return new DexaAnswerEngine()

    default:
      throw new Error(`Unknown answer engine: ${answerEngineType}`)
  }
}
