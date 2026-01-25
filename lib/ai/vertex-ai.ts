import { VertexAI } from '@google-cloud/vertexai'

const project = process.env.GOOGLE_CLOUD_PROJECT
if (!project) {
  throw new Error(
    'Missing GOOGLE_CLOUD_PROJECT environment variable. Please set it in .env.local'
  )
}

export const vertexAI = new VertexAI({
  project,
  location: 'us-central1',
})

export const model = 'gemini-1.5-flash'
