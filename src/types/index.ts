// Base entity interface
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt?: string
}

// Job related types
export interface Job extends BaseEntity {
  title: string
  slug: string
  status: 'active' | 'archived'
  tags: string[]
  order: number
  description: string
  department: string
  location: string
  requirements: string[]
  salary?: {
    min: number
    max: number
    currency: string
  }
}

// Candidate related types
export type CandidateStage = 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected'

export interface Candidate extends BaseEntity {
  name: string
  email: string
  phone?: string
  stage: CandidateStage
  jobId: string
  appliedAt: string
  rating?: number
  notes: CandidateNote[]
  timeline: TimelineEntry[]
  resume?: string
  skills: string[]
}

export interface CandidateNote {
  id: string
  text: string
  authorId: string
  authorName: string
  createdAt: string
  mentions: string[] // @mentioned users
}

export interface TimelineEntry {
  id: string
  stage: CandidateStage
  timestamp: string
  note?: string
  userId: string
  userName: string
}

// Assessment related types
export type QuestionType = 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file'

export interface Question {
  id: string
  type: QuestionType
  title: string
  description?: string
  required: boolean
  options?: string[] // for choice questions
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
  }
  conditionalLogic?: {
    dependsOn: string // question id
    showIf: string // answer value
  }
}

export interface AssessmentSection {
  id: string
  title: string
  description?: string
  questions: Question[]
}

export interface Assessment extends BaseEntity {
  jobId: string
  title: string
  description?: string
  sections: AssessmentSection[]
  isActive: boolean
  timeLimit?: number // in minutes
}

export interface AssessmentResponse extends BaseEntity {
  assessmentId: string
  candidateId: string
  responses: Record<string, any> // questionId -> answer
  completedAt?: string
  score?: number
  status: 'in-progress' | 'completed' | 'expired'
}

// API related types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}
