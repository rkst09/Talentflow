import { http, HttpResponse, delay } from 'msw'
import { db } from '../services/database'
import type { Job, Assessment, PaginatedResponse } from '../types'

// Utility function to simulate API delay
const randomDelay = () => Math.random() * 1000 + 200
const shouldError = (errorRate: number = 0.05) => Math.random() < errorRate

export const handlers = [
  // GET /api/jobs - Example handler
  http.get('/api/jobs', async ({ request }) => {
    if (shouldError()) {
      await delay(randomDelay())
      return HttpResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      )
    }

    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''
    const status = url.searchParams.get('status')
    const department = url.searchParams.get('department')
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const sortBy = url.searchParams.get('sortBy') || 'createdAt'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'

    try {
      let jobs = await db.jobs.orderBy('order').toArray()

      if (search) {
        const searchTerm = search.toLowerCase()
        jobs = jobs.filter(job =>
          job.title.toLowerCase().includes(searchTerm) ||
          job.department.toLowerCase().includes(searchTerm) ||
          job.location.toLowerCase().includes(searchTerm) ||
          job.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
      }
      if (status && status !== 'all') {
        jobs = jobs.filter(job => job.status === status)
      }
      if (department && department !== 'all') {
        jobs = jobs.filter(job => job.department === department)
      }
      jobs.sort((a, b) => {
        const aValue = a[sortBy as keyof Job]
        const bValue = b[sortBy as keyof Job]
        if (aValue == null && bValue == null) return 0
        if (aValue == null) return 1
        if (bValue == null) return -1
        if (sortOrder === 'desc') {
          return aValue > bValue ? -1 : 1
        }
        return aValue > bValue ? 1 : -1
      })

      const total = jobs.length
      const startIndex = (page - 1) * pageSize
      const paginatedJobs = jobs.slice(startIndex, startIndex + pageSize)

      const jobsWithCounts: Array<Job & { candidateCount: number }> = await Promise.all(
        paginatedJobs.map(async (job) => {
          const candidateCount = await db.candidates
            .where('jobId')
            .equals(job.id)
            .count()
          return {
            ...job,
            candidateCount
          }
        })
      )

      const response: PaginatedResponse<Job & { candidateCount: number }> = {
        data: jobsWithCounts,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }

      await delay(randomDelay())
      return HttpResponse.json(response)
    } catch (error) {
      await delay(randomDelay())
      return HttpResponse.json(
        { message: 'Failed to fetch jobs' },
        { status: 500 }
      )
    }
  }),

  // POST /api/assessments - Create new assessment
  http.post('/api/assessments', async ({ request }) => {
    try {
      const assessmentData = await request.json() as Partial<Assessment>
      const newAssessment: Assessment = {
        id: crypto.randomUUID(),
        jobId: assessmentData.jobId!,
        title: assessmentData.title!,
        description: assessmentData.description,
        sections: assessmentData.sections || [],
        isActive: true,
        timeLimit: assessmentData.timeLimit,
        createdAt: new Date().toISOString()
      }
      await db.assessments.add(newAssessment)
      await delay(randomDelay())
      return HttpResponse.json(newAssessment, { status: 201 })
    } catch (error) {
      await delay(randomDelay())
      return HttpResponse.json(
        { message: 'Failed to create assessment' },
        { status: 500 }
      )
    }
  }),
  // Add more handlers below as needed...
]
