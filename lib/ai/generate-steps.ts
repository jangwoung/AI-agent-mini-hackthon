import { getVertexAI, model } from './vertex-ai'
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
  // Remove markdown code fence if present
  const withoutFence = stripped.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  const start = withoutFence.indexOf('[')
  const end = withoutFence.lastIndexOf(']') + 1
  if (start === -1 || end <= start) {
    console.error('[generate-steps] extractJson: no JSON array found. raw length=%d, preview=%s', text.length, text.slice(0, 200))
    throw new AIServiceError(USER_MSG, false)
  }
  return withoutFence.slice(start, end)
}

async function callVertexAI(prompt: string): Promise<string> {
  const generativeModel = getVertexAI().getGenerativeModel({
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
    const finishReason = candidate?.finishReason ?? 'unknown'
    const blockReason = (candidate as { safetyRatings?: unknown } | undefined)?.safetyRatings
    console.error('[generate-steps] Vertex AI empty text. finishReason=%s, blockReason=%s, raw=%j', finishReason, blockReason, { candidates: response?.candidates?.length })
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
    let parsed: unknown
    try {
      parsed = JSON.parse(jsonStr) as unknown
    } catch (e) {
      console.error('[generate-steps] JSON.parse failed. preview=%s', jsonStr.slice(0, 500), e)
      throw e
    }
    try {
      return StepsResponseSchema.parse(parsed) as AIStep[]
    } catch (e) {
      console.error('[generate-steps] Zod parse failed. parsed=%j', parsed, e)
      throw e
    }
  }

  try {
    return await run()
  } catch (e) {
    if (e instanceof AIServiceError) throw e
    console.error('[generate-steps] first attempt failed:', e)
    try {
      return await run()
    } catch (e2) {
      console.error('[generate-steps] retry failed:', e2)
      throw new AIServiceError(USER_MSG, false)
    }
  }
}
