export interface Experience {
  id?: string
  title: string
  company: string
  start_date: string
  end_date: string
  description: string
}

export interface Education {
  id?: string
  school: string
  degree: string
  start_date: string
  end_date: string
  description: string
}

export interface Project {
  id: string
  title: string
  description: string
  tech_stack: string
  demo_url: string
  github_url: string
  thumbnail_url: string | null
}

export interface ProfileImage {
  id: string
  url: string
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  headline: string
  bio: string
  avatar_url: string | null
  cv_url: string | null
  phone: string
  location: string
  website_url: string
  linkedin_url: string
  github_url: string
  skills: string
  interests: string
  is_public: boolean
  images: ProfileImage[]
  experiences: Experience[]
  educations: Education[]
  projects: Project[]
}

export type PostStatus = 'draft' | 'published'

export interface PostSummary {
  id: string
  title: string
  slug: string
  status: PostStatus
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface Post extends PostSummary {
  content: string
}

export interface CurrentUser {
  id: string
  email: string
  is_admin: boolean
  full_name: string
}

export interface StudyCategory {
  id: string
  name: string
  slug: string
}

export interface StudyTopic {
  id: string
  category_id: string
  name: string
  slug: string
}

export type CardType = 'flashcard' | 'quiz'
export type CardLevel = 'fresher' | 'junior' | 'middle' | 'senior'

export const CARD_LEVELS: CardLevel[] = ['fresher', 'junior', 'middle', 'senior']

export interface StudyCard {
  id: string
  topic_id: string
  type: CardType
  front: string
  back: string
  question: string
  choices: string[] | null
  correct_index: number | null
  explanation: string
  level: CardLevel
}

export interface StudyProgress {
  card_id: string
  status: 'new' | 'learning' | 'known'
  correct_count: number
  wrong_count: number
}

export interface QuizResultItem {
  card_id: string
  correct: boolean
  correct_index: number
  explanation: string
}

export interface QuizSubmitResponse {
  score: number
  total: number
  results: QuizResultItem[]
}

export interface CvScanResponse {
  full_name: string
  headline: string
  bio: string
  phone: string
  website_url: string
  linkedin_url: string
  github_url: string
  skills: string
  interests: string
  experiences: Experience[]
  educations: Education[]
}
