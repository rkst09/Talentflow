import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { Job, Candidate, Assessment, AssessmentResponse } from '../types'

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job>
  candidates!: Table<Candidate>
  assessments!: Table<Assessment>
  assessmentResponses!: Table<AssessmentResponse>

  constructor() {
    super('TalentFlowDB')

    this.version(1).stores({
      jobs: '++id, title, status, slug, order, createdAt, department, location',
      candidates: '++id, name, email, stage, jobId, appliedAt, createdAt',
      assessments: '++id, jobId, title, isActive, createdAt',
      assessmentResponses: '++id, assessmentId, candidateId, status, createdAt, completedAt'
    })

    // Set timestamp when creating new entities
    this.jobs.hook('creating', function (_primKey, obj) {
      obj.createdAt = new Date().toISOString()
    })
    this.jobs.hook('updating', function (modifications/*, _primKey, obj*/) {
      // Type assertion for modifications to allow updatedAt
      (modifications as any).updatedAt = new Date().toISOString()
    })
    this.candidates.hook('creating', function (_primKey, obj) {
      obj.createdAt = new Date().toISOString()
      obj.appliedAt = obj.appliedAt || new Date().toISOString()
    })
    this.assessments.hook('creating', function (_primKey, obj) {
      obj.createdAt = new Date().toISOString()
    })
  }

  // Example helper method for candidate count per job
  async getJobsWithCandidateCount() {
    const jobs = await this.jobs.toArray()
    const jobsWithCount = await Promise.all(
      jobs.map(async (job) => {
        const candidateCount = await this.candidates
          .where('jobId')
          .equals(job.id)
          .count()
        return {
          ...job,
          candidateCount
        }
      })
    )
    return jobsWithCount
  }
}

// Export instance for app use
export const db = new TalentFlowDB()
