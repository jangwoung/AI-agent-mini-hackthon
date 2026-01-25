import { vertexAI, model } from './vertex-ai'
import { StepsResponseSchema, type AIStep } from './schemas'
import { AIServiceError } from '@/lib/utils/errors'
import type { SkillType } from '@/lib/firebase/types'

const USER_MSG = 'AIステップ生成に失敗しました。再生成してください。'

const SYSTEM = `あなたは技術メンターです。初心者でも進められるように、ステップを具体化してください。
制約: ステップは5つ、順序あり。各ステップは title / task / deliverable を含めてください。
出力はJSON配列のみ。マークダウンや説明文は含めないでください。`

function buildUserPrompt(skillType: SkillType, goalText: string): string {
  return `技術: ${skillType}
目標: ${goalText}

上記の技術と目標に基づき、5つの学習ステップをJSON配列で出力してください。
各要素は { "title": "ステップ名", "task": "具体的なタスク", "deliverable": "成果物" } の形にしてください。`
}

function extractJson(text: string): string {
  const stripped = text.trim()
  const start = stripped.indexOf('[')
  const end = stripped.lastIndexOf(']') + 1
  if (start === -1 || end <= start) {
    throw new AIServiceError(USER_MSG, false)
  }
  return stripped.slice(start, end)
}

async function callVertexAI(prompt: string): Promise<string> {
  const generativeModel = vertexAI.getGenerativeModel({
    model,
    systemInstruction: { role: 'system', parts: [{ text: SYSTEM }] },
    generationConfig: {
      maxOutputTokens: 4096,
      responseMimeType: 'application/json' as const,
    },
  })

  const result = await generativeModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })

  const response = result.response
  const candidate = response?.candidates?.[0]
  const part = candidate?.content?.parts?.[0]

  if (!part?.text) {
    throw new AIServiceError(USER_MSG, false)
  }

  return part.text
}

/**
 * Generate 5 learning steps via Vertex AI (Gemini). Validates with Zod.
 * Retries once on validation failure.
 */
export async function generateSteps(
  skillType: SkillType,
  goalText: string
): Promise<AIStep[]> {
  const prompt = buildUserPrompt(skillType, goalText)

  const run = async (): Promise<AIStep[]> => {
    const raw = await callVertexAI(prompt)
    const jsonStr = extractJson(raw)
    const parsed = JSON.parse(jsonStr) as unknown
    const validated = StepsResponseSchema.parse(parsed)
    return validated
  }

  try {
    return await run()
  } catch (e) {
    if (e instanceof AIServiceError) throw e
    try {
      return await run()
    } catch {
      throw new AIServiceError(USER_MSG, false)
    }
  }
}
