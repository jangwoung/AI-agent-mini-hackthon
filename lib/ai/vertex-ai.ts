// Vertex AI configuration
// Note: Actual VertexAI client initialization will be done in Phase 3
// For Gemini models, we'll use @google-cloud/vertexai or appropriate SDK
const project = process.env.GOOGLE_CLOUD_PROJECT
if (!project) {
  throw new Error(
    'Missing GOOGLE_CLOUD_PROJECT environment variable. Please set it in .env.local'
  )
}

export const vertexAIConfig = {
  project,
  location: 'us-central1', // Change to your preferred region
}

export const model = 'gemini-1.5-flash'

// VertexAI client will be initialized in generate-steps.ts and generate-review.ts
// Using @google-cloud/vertexai for Gemini models (to be installed in Phase 3)
export type VertexAIClient = any // Will be replaced with actual type from @google-cloud/vertexai
