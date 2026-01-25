/**
 * Custom error classes for better error handling
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string, public resource?: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class AIServiceError extends Error {
  constructor(
    message: string,
    public retryable: boolean = false,
    public retryAfter?: number
  ) {
    super(message)
    this.name = 'AIServiceError'
  }
}

export class FirestoreError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'FirestoreError'
  }
}

/**
 * Convert error to user-friendly message
 */
export function toUserFriendlyError(error: unknown): string {
  if (error instanceof ValidationError) {
    return `入力エラー: ${error.message}`
  }

  if (error instanceof NotFoundError) {
    return `見つかりません: ${error.message}`
  }

  if (error instanceof AIServiceError) {
    return error.retryable
      ? 'AIサービスのエラーが発生しました。しばらく待ってから再試行してください。'
      : 'AIサービスのエラーが発生しました。再生成してください。'
  }

  if (error instanceof FirestoreError) {
    return `データベースエラー: ${error.message}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return '予期しないエラーが発生しました'
}
