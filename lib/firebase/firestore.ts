import { getDb } from './config'

const db = () => getDb()
import type {
  SkillGoal,
  SkillStep,
  Submission,
  Review,
} from './types'
import {
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase-admin/firestore'

// Convert Firestore Timestamp to Date
function toDate(timestamp: Timestamp | Date | undefined): Date {
  if (!timestamp) return new Date()
  if (timestamp instanceof Date) return timestamp
  return timestamp.toDate()
}

// Convert Date to Firestore Timestamp
function toTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date)
}

/**
 * Create a new skill goal in Firestore
 */
export async function createSkillGoal(
  skillType: SkillGoal['skillType'],
  goalText: string,
  userId?: string
): Promise<SkillGoal> {
  const goalRef = db().collection('skillGoals').doc()
  const now = new Date()

  const goal: Omit<SkillGoal, 'id'> = {
    skillType,
    goalText,
    createdAt: now,
    ...(userId && { userId }),
  }

  await goalRef.set({
    ...goal,
    createdAt: toTimestamp(now),
  })

  return {
    id: goalRef.id,
    ...goal,
  }
}

/**
 * Create 5 skill steps in Firestore (batch write)
 */
export async function createSkillSteps(
  goalId: string,
  steps: Array<{
    index: number
    title: string
    task: string
    deliverable: string
  }>
): Promise<SkillStep[]> {
  if (steps.length !== 5) {
    throw new Error('Must create exactly 5 steps')
  }

  const batch = db().batch()
  const now = new Date()
  const createdSteps: SkillStep[] = []

  steps.forEach((step) => {
    const stepRef = db().collection('skillSteps').doc()
    const stepData: Omit<SkillStep, 'id'> = {
      goalId,
      index: step.index,
      title: step.title,
      task: step.task,
      deliverable: step.deliverable,
      done: false,
      createdAt: now,
    }

    batch.set(stepRef, {
      ...stepData,
      createdAt: toTimestamp(now),
    })

    createdSteps.push({
      id: stepRef.id,
      ...stepData,
    })
  })

  await batch.commit()
  return createdSteps
}

/**
 * Get all steps for a goal, ordered by index
 */
export async function getStepsByGoalId(goalId: string): Promise<SkillStep[]> {
  const snapshot = await db()
    .collection('skillSteps')
    .where('goalId', '==', goalId)
    .orderBy('index', 'asc')
    .get()

  return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
    const data = doc.data()
    return {
      id: doc.id,
      goalId: data.goalId,
      index: data.index,
      title: data.title,
      task: data.task,
      deliverable: data.deliverable,
      done: data.done ?? false,
      createdAt: toDate(data.createdAt),
    }
  })
}

/**
 * Update step completion status
 */
export async function updateStepCompletion(
  stepId: string,
  done: boolean
): Promise<void> {
  await db().collection('skillSteps').doc(stepId).update({ done })
}

/**
 * Create or update a submission for a step
 */
export async function createSubmission(
  stepId: string,
  content: string,
  contentType: Submission['contentType']
): Promise<Submission> {
  // Delete existing submission for this step (if any)
  const existingSnapshot = await db()
    .collection('submissions')
    .where('stepId', '==', stepId)
    .limit(1)
    .get()

  if (!existingSnapshot.empty) {
    await existingSnapshot.docs[0].ref.delete()
  }

  // Create new submission
  const submissionRef = db().collection('submissions').doc()
  const now = new Date()

  const submission: Omit<Submission, 'id'> = {
    stepId,
    content,
    contentType,
    createdAt: now,
  }

  await submissionRef.set({
    ...submission,
    createdAt: toTimestamp(now),
  })

  return {
    id: submissionRef.id,
    ...submission,
  }
}

/**
 * Get submission for a step
 */
export async function getSubmissionByStepId(
  stepId: string
): Promise<Submission | null> {
  const snapshot = await db()
    .collection('submissions')
    .where('stepId', '==', stepId)
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  const data = doc.data()

  return {
    id: doc.id,
    stepId: data.stepId,
    content: data.content,
    contentType: data.contentType,
    createdAt: toDate(data.createdAt),
  }
}

/**
 * Create or update a review for a step
 */
export async function createReview(
  stepId: string,
  keep: string,
  problem: string,
  tryText: string,
  next: string
): Promise<Review> {
  // Delete existing review for this step (if any)
  const existingSnapshot = await db()
    .collection('reviews')
    .where('stepId', '==', stepId)
    .limit(1)
    .get()

  if (!existingSnapshot.empty) {
    await existingSnapshot.docs[0].ref.delete()
  }

  // Create new review
  const reviewRef = db().collection('reviews').doc()
  const now = new Date()

  const review: Omit<Review, 'id'> = {
    stepId,
    keep,
    problem,
    try: tryText,
    next,
    createdAt: now,
  }

  await reviewRef.set({
    ...review,
    createdAt: toTimestamp(now),
  })

  return {
    id: reviewRef.id,
    ...review,
  }
}

/**
 * Get review for a step
 */
export async function getReviewByStepId(stepId: string): Promise<Review | null> {
  const snapshot = await db()
    .collection('reviews')
    .where('stepId', '==', stepId)
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  const data = doc.data()

  return {
    id: doc.id,
    stepId: data.stepId,
    keep: data.keep,
    problem: data.problem,
    try: data.try,
    next: data.next,
    createdAt: toDate(data.createdAt),
  }
}

/**
 * Get a skill goal by ID
 */
export async function getSkillGoalById(goalId: string): Promise<SkillGoal | null> {
  const doc = await db().collection('skillGoals').doc(goalId).get()

  if (!doc.exists) {
    return null
  }

  const data = doc.data()!

  return {
    id: doc.id,
    skillType: data.skillType,
    goalText: data.goalText,
    createdAt: toDate(data.createdAt),
    ...(data.userId && { userId: data.userId }),
  }
}

/**
 * Get a skill step by ID
 */
export async function getSkillStepById(stepId: string): Promise<SkillStep | null> {
  const doc = await db().collection('skillSteps').doc(stepId).get()

  if (!doc.exists) {
    return null
  }

  const data = doc.data()!

  return {
    id: doc.id,
    goalId: data.goalId,
    index: data.index,
    title: data.title,
    task: data.task,
    deliverable: data.deliverable,
    done: data.done ?? false,
    createdAt: toDate(data.createdAt),
  }
}
