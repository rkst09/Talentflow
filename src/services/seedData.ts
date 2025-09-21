import { v4 as uuidv4 } from 'uuid'
import type { Job, Candidate, Assessment, CandidateStage, Question } from '../types'

// Sample data arrays
const jobTitles = [
  'Senior React Developer', 'UI/UX Designer', 'Product Manager', 'Backend Engineer',
  'DevOps Engineer', 'Data Scientist', 'Frontend Developer', 'Full Stack Developer',
  'Mobile Developer', 'QA Engineer', 'Technical Writer', 'Sales Manager',
  'Marketing Specialist', 'HR Coordinator', 'Business Analyst', 'System Administrator',
  'Database Administrator', 'Security Engineer', 'ML Engineer', 'Cloud Architect',
  'Scrum Master', 'Project Manager', 'Customer Success Manager', 'Solutions Architect',
  'Site Reliability Engineer'
]

const departments = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'Operations']
const locations = ['San Francisco, CA', 'New York, NY', 'Remote', 'London, UK', 'Austin, TX', 'Seattle, WA']
const techTags = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL', 'PostgreSQL', 'MongoDB', 'Redis']
const designTags = ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'InVision', 'Principle', 'Framer']
const businessTags = ['Strategy', 'Analytics', 'Agile', 'Scrum', 'Leadership', 'Communication', 'Project Management']

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Amanda', 'Robert', 'Lisa', 'Mark', 'Jennifer', 'Daniel', 'Michelle', 'James', 'Jessica', 'Andrew', 'Ashley', 'Brian', 'Stephanie']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']

const stages: CandidateStage[] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected']

// Utility functions
const randomChoice = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)]
const randomChoices = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, array.length))
}
const randomDate = (daysBack: number) => {
  const now = new Date()
  const past = new Date(now.getTime() - (Math.random() * daysBack * 24 * 60 * 60 * 1000))
  return past.toISOString()
}

// Generate Jobs
export const generateJobs = (count: number = 25): Job[] => {
  const jobs: Job[] = []

  for (let i = 0; i < count; i++) {
    const title = randomChoice(jobTitles)
    const department = randomChoice(departments)
    const location = randomChoice(locations)

    // Select relevant tags based on department
    let availableTags = techTags
    if (department === 'Design') availableTags = designTags
    if (['Product', 'Marketing', 'Sales', 'HR'].includes(department)) availableTags = businessTags

    const tags = randomChoices(availableTags, Math.floor(Math.random() * 4) + 2)

    const job: Job = {
      id: uuidv4(),
      title: `${title} ${i > 0 ? `(${i + 1})` : ''}`,
      slug: title.toLowerCase().replace(/\s+/g, '-') + (i > 0 ? `-${i + 1}` : ''),
      status: Math.random() > 0.3 ? 'active' : 'archived',
      tags,
      order: i,
      description: `We are looking for an experienced ${title} to join our ${department} team. This is an exciting opportunity to work with cutting-edge technologies and make a significant impact on our product.`,
      department,
      location,
      requirements: [
        `5+ years of experience in ${title.toLowerCase()}`,
        'Strong communication and teamwork skills',
        'Experience with agile development methodologies',
        `Proficiency in ${tags.slice(0, 2).join(' and ')}`
      ],
      salary: {
        min: 80000 + Math.floor(Math.random() * 50000),
        max: 120000 + Math.floor(Math.random() * 80000),
        currency: 'USD'
      },
      createdAt: randomDate(90),
    }

    jobs.push(job)
  }

  return jobs
}

// Generate Candidates
export const generateCandidates = (jobs: Job[], count: number = 1000): Candidate[] => {
  const candidates: Candidate[] = []

  for (let i = 0; i < count; i++) {
    const firstName = randomChoice(firstNames)
    const lastName = randomChoice(lastNames)
    const name = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`
    const jobId = randomChoice(jobs).id
    const stage = randomChoice(stages)
    const appliedDate = randomDate(60)

    // Generate timeline based on stage
    const timeline: Candidate['timeline'] = []
    timeline.push({
      id: uuidv4(),
      stage: 'applied' as CandidateStage,
      timestamp: appliedDate,
      note: 'Application received and under review',
      userId: 'system',
      userName: 'System'
    })

    // Add progressive timeline entries based on current stage
    const stageOrder: CandidateStage[] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected']
    const currentStageIndex = stageOrder.indexOf(stage)

    for (let j = 1; j <= currentStageIndex; j++) {
      if (j < stageOrder.length) {
        timeline.push({
          id: uuidv4(),
          stage: stageOrder[j],
          timestamp: new Date(new Date(appliedDate).getTime() + j * 2 * 24 * 60 * 60 * 1000).toISOString(),
          note: getStageNote(stageOrder[j]),
          userId: 'hr-1',
          userName: 'HR Team'
        })
      }
    }

    const candidate: Candidate = {
      id: uuidv4(),
      name,
      email,
      phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      stage,
      jobId,
      appliedAt: appliedDate,
      rating: Math.floor(Math.random() * 5) + 1,
      notes: [],
      timeline,
      skills: randomChoices(techTags, Math.floor(Math.random() * 5) + 2),
      createdAt: appliedDate
    }

    candidates.push(candidate)
  }

  return candidates
}

const getStageNote = (stage: CandidateStage): string => {
  const notes: Record<CandidateStage, string> = {
    applied: 'Application received and under review',
    screen: 'Phone screening completed successfully',
    tech: 'Technical interview scheduled',
    offer: 'Offer extended to candidate',
    hired: 'Candidate accepted offer and joined the team',
    rejected: 'Not selected for this position'
  }
  return notes[stage] || 'Status updated'
}

// Generate Assessments
export const generateAssessments = (jobs: Job[]): Assessment[] => {
  const assessments: Assessment[] = []

  // Create 1-2 assessments per job
  jobs.forEach(job => {
    if (Math.random() > 0.3) { // 70% of jobs have assessments
      const assessment: Assessment = {
        id: uuidv4(),
        jobId: job.id,
        title: `${job.title} Assessment`,
        description: `Technical and behavioral assessment for ${job.title} position`,
        sections: generateAssessmentSections(job),
        isActive: job.status === 'active',
        timeLimit: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
        createdAt: job.createdAt
      }

      assessments.push(assessment)
    }
  })

  return assessments
}

const generateAssessmentSections = (job: Job) => {
  const sections: Assessment['sections'] = []

  // Technical Knowledge Section
  sections.push({
    id: uuidv4(),
    title: 'Technical Knowledge',
    description: 'Evaluate technical skills and experience',
    questions: generateTechnicalQuestions(job.tags)
  })

  // Behavioral Section
  sections.push({
    id: uuidv4(),
    title: 'Behavioral Assessment',
    description: 'Assess soft skills and cultural fit',
    questions: generateBehavioralQuestions()
  })

  // Role-specific Section
  if (job.department === 'Engineering') {
    sections.push({
      id: uuidv4(),
      title: 'Coding Challenge',
      description: 'Practical coding assessment',
      questions: generateCodingQuestions()
    })
  }

  return sections
}

const generateTechnicalQuestions = (tags: string[]): Question[] => {
  return [
    {
      id: uuidv4(),
      type: 'single-choice',
      title: `What is your experience level with ${tags[0]}?`,
      required: true,
      options: ['Beginner (0-1 years)', 'Intermediate (2-4 years)', 'Advanced (5-7 years)', 'Expert (8+ years)']
    },
    {
      id: uuidv4(),
      type: 'multi-choice',
      title: 'Which technologies have you worked with? (Select all that apply)',
      required: true,
      options: tags.concat(['Git', 'CI/CD', 'Testing', 'Docker'])
    },
    {
      id: uuidv4(),
      type: 'long-text',
      title: 'Describe a challenging technical problem you solved recently',
      required: true,
      validation: { minLength: 100, maxLength: 1000 }
    }
  ]
}

const generateBehavioralQuestions = (): Question[] => {
  return [
    {
      id: uuidv4(),
      type: 'long-text',
      title: 'Tell us about a time when you had to work with a difficult team member',
      required: true,
      validation: { minLength: 50, maxLength: 500 }
    },
    {
      id: uuidv4(),
      type: 'single-choice',
      title: 'How do you prefer to receive feedback?',
      required: true,
      options: ['Regular one-on-ones', 'Written feedback', 'Immediate verbal feedback', 'Peer reviews']
    }
  ]
}

const generateCodingQuestions = (): Question[] => {
  return [
    {
      id: uuidv4(),
      type: 'long-text',
      title: 'Write a function that reverses a string without using built-in reverse methods',
      required: true,
      validation: { minLength: 50, maxLength: 2000 }
    },
    {
      id: uuidv4(),
      type: 'file',
      title: 'Upload your solution to the coding challenge (if you prefer to code in your IDE)',
      required: false
    }
  ]
}

// Main seed function
export const seedDatabase = async () => {
  const { db } = await import('./database')

  // Check if data already exists
  const existingJobs = await db.jobs.count()
  if (existingJobs > 0) {
    console.log('Database already seeded')
    return
  }

  console.log('Seeding database...')

  try {
    // Generate and insert jobs
    const jobs = generateJobs(25)
    await db.jobs.bulkAdd(jobs)
    console.log(`✅ Added ${jobs.length} jobs`)

    // Generate and insert candidates
    const candidates = generateCandidates(jobs, 1000)
    await db.candidates.bulkAdd(candidates)
    console.log(`✅ Added ${candidates.length} candidates`)

    // Generate and insert assessments
    const assessments = generateAssessments(jobs)
    await db.assessments.bulkAdd(assessments)
    console.log(`✅ Added ${assessments.length} assessments`)

    console.log('🎉 Database seeding completed!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}
