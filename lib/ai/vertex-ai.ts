import { VertexAI } from '@google-cloud/vertexai'

let _vertexAI: VertexAI | null = null

export function getVertexAI(): VertexAI {
  if (_vertexAI) return _vertexAI
  const project = process.env.GOOGLE_CLOUD_PROJECT
  if (!project) {
    throw new Error(
      'Missing GOOGLE_CLOUD_PROJECT. Set it in .env.local'
    )
  }
  _vertexAI = new VertexAI({ project, location: 'us-central1' })
  return _vertexAI
}

/** Stable model. See https://cloud.google.com/vertex-ai/generative-ai/docs/learn/model-versions */
export const model = 'gemini-2.0-flash-001'
