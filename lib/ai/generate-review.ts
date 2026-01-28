import { getVertexAI, model } from './vertex-ai'
import { ReviewResponseSchema, type ReviewResponse } from './schemas'
import { AIServiceError } from '@/lib/utils/errors'
import type { SkillType } from '@/lib/firebase/types'

const USER_MSG = 'AIレビュー生成に失敗しました。再生成してください。'

function buildUserPrompt(
  skillType: SkillType,
  goalText: string,
  stepTitle: string,
  stepTask: string,
  deliverable: string,
  submission: string
): string {
  return `技術: ${skillType}
目標: ${goalText}
今のステップ: ${stepTitle}
タスク: ${stepTask}
成果物条件: ${deliverable}
提出物:
${submission}

上記の提出物に対して、Keep / Problem / Try / Next の4項目で、日本語で具体的にフィードバックしてください。
出力はJSONのみ。 { "keep": "...", "problem": "...", "try": "...", "next": "..." } の形にしてください。マークダウンや説明文は含めないでください。`
}

function extractJson(text: string): string {
  const stripped = text.trim()
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}') + 1
  if (start === -1 || end <= start) {
    throw new AIServiceError(USER_MSG, false)
  }
  return stripped.slice(start, end)
}

async function callVertexAI(prompt: string): Promise<string> {
  const generativeModel = getVertexAI().getGenerativeModel({
    model,
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
 * Generate review (Keep/Problem/Try/Next) via Vertex AI (Gemini). Validates with Zod.
 * Retries once on validation failure.
 */
export async function generateReview(
  skillType: SkillType,
  goalText: string,
  stepTitle: string,
  stepTask: string,
  deliverable: string,
  submission: string
): Promise<ReviewResponse> {
  const prompt = buildUserPrompt(
    skillType,
    goalText,
    stepTitle,
    stepTask,
    deliverable,
    submission
  )

  const run = async (): Promise<ReviewResponse> => {
    const raw = await callVertexAI(prompt)
    const jsonStr = extractJson(raw)
    const parsed = JSON.parse(jsonStr) as unknown
    return ReviewResponseSchema.parse(parsed)
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
