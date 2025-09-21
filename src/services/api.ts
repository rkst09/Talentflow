import type { Job, Candidate, Assessment, PaginatedResponse, CandidateStage } from '../types'

const BASE_URL = '/api'

// Generic API error handling
class ApiError extends Error {
  status: number
  
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status
      )
    }
    
    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('Network error', 0)
  }
}

// ============ JOBS API ============

export const jobsApi = {
  // Get paginated jobs list
  getJobs: (params: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
    department?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<PaginatedResponse<Job & { candidateCount: number }>> => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    
    return apiRequest(`/jobs?${searchParams.toString()}`)
  },

  // Get single job
  getJob: (id: string): Promise<Job & { candidateCount: number; recentCandidates: Candidate[] }> => {
    return apiRequest(`/jobs/${id}`)
  },

  // Create new job
  createJob: (jobData: Partial<Job>): Promise<Job> => {
    return apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    })
  },

  // Update job
  updateJob: (id: string, jobData: Partial<Job>): Promise<Job> => {
    return apiRequest(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData)
    })
  },

  // Reorder jobs (for drag and drop)
  reorderJob: (id: string, fromOrder: number, toOrder: number): Promise<{ success: boolean }> => {
    return apiRequest(`/jobs/${id}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ fromOrder, toOrder })
    })
  }
}

// ============ CANDIDATES API ============

export const candidatesApi = {
  // Get paginated candidates list
  getCandidates: (params: {
    page?: number
    pageSize?: number
    search?: string
    stage?: string
    jobId?: string
  } = {}): Promise<PaginatedResponse<Candidate>> => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    
    return apiRequest(`/candidates?${searchParams.toString()}`)
  },

  // Get single candidate
  getCandidate: (id: string): Promise<Candidate & { job: Job }> => {
    return apiRequest(`/candidates/${id}`)
  },

  // Update candidate stage
  updateCandidateStage: (id: string, stage: CandidateStage, note?: string): Promise<Candidate> => {
    return apiRequest(`/candidates/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage, note })
    })
  },

  // Get candidates for kanban view
  getKanbanData: (jobId?: string): Promise<Record<string, Candidate[]>> => {
    const params = jobId ? `?jobId=${jobId}` : ''
    return apiRequest(`/candidates/kanban${params}`)
  }
}

// ============ ASSESSMENTS API ============

export const assessmentsApi = {
  // Get assessments list
  getAssessments: (jobId?: string): Promise<Assessment[]> => {
    const params = jobId ? `?jobId=${jobId}` : ''
    return apiRequest(`/assessments${params}`)
  },

  // Create new assessment
  createAssessment: (assessmentData: Partial<Assessment>): Promise<Assessment> => {
    return apiRequest('/assessments', {
      method: 'POST',
      body: JSON.stringify(assessmentData)
    })
  }
}

// Export everything
export const api = {
  jobs: jobsApi,
  candidates: candidatesApi,
  assessments: assessmentsApi
}

export default api
