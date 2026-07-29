export type UserRole = 'USER' | 'ADMIN'
export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE'
export type Availability = 'FULL_TIME' | 'PART_TIME' | 'WEEKENDS' | 'EXPLORING'
export type IdeaStage = 'IDEA' | 'VALIDATION' | 'MVP' | 'GROWTH'
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'

export interface UserSummary {
  id: number
  email: string
  role: UserRole
  emailVerified: boolean
  subscriptionTier: SubscriptionTier
  firstName: string
  lastName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserSummary
}

export interface EndorsementResponse {
  id: number
  skill: string
  message: string | null
  endorserName: string
  createdAt: string
}

export interface ProfileResponse {
  id: number
  userId: number
  firstName: string
  lastName: string
  bio: string | null
  headline: string | null
  location: string | null
  timezone: string | null
  availability: Availability
  linkedinUrl: string | null
  portfolioUrl: string | null
  avatarUrl: string | null
  yearsExperience: number | null
  skills: string[]
  interests: string[]
  createdAt: string
  updatedAt: string
  bookmarked: boolean
  endorsements: EndorsementResponse[]
}

export interface ProfileUpdateRequest {
  firstName: string
  lastName: string
  bio?: string
  headline?: string
  location?: string
  timezone?: string
  availability?: Availability
  linkedinUrl?: string
  portfolioUrl?: string
  yearsExperience?: number
  skills?: string[]
  interests?: string[]
}

export interface OpenRoleResponse {
  id: number
  title: string
  description: string | null
  skillsRequired: string[]
  filled: boolean
  createdAt: string
}

export interface OpenRoleRequest {
  title: string
  description?: string
  skillsRequired?: string[]
}

export interface IdeaResponse {
  id: number
  ownerId: number
  ownerName: string
  title: string
  domain: string
  description: string
  stage: IdeaStage
  equityOffered: string | null
  roleExpectations: string | null
  active: boolean
  openRoles: OpenRoleResponse[]
  createdAt: string
  updatedAt: string
}

export interface IdeaCreateRequest {
  title: string
  domain: string
  description: string
  stage?: IdeaStage
  equityOffered?: string
  roleExpectations?: string
  openRoles?: OpenRoleRequest[]
}

export interface CollaborationRequestCreate {
  recipientId: number
  ideaId?: number
  openRoleId?: number
  message?: string
}

export interface CollaborationRequestResponse {
  id: number
  senderId: number
  senderName: string
  recipientId: number
  recipientName: string
  ideaId: number | null
  ideaTitle: string | null
  openRoleId: number | null
  openRoleTitle: string | null
  message: string | null
  status: RequestStatus
  conversationId: number | null
  createdAt: string
  updatedAt: string
}

export interface NotificationResponse {
  id: number
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean
  createdAt: string
}

export interface MatchBreakdown {
  skillOverlap: number
  interestOverlap: number
  availabilityFit: number
  domainFit: number
  sharedSkills: string[]
  sharedInterests: string[]
}

export interface MatchRecommendationResponse {
  profile: ProfileResponse
  score: number
  breakdown: MatchBreakdown
  summary: string
}

export interface ChatMessageResponse {
  id: number
  conversationId: number
  senderId: number
  senderName: string
  content: string
  createdAt: string
}

export interface SubscriptionInfoResponse {
  tier: SubscriptionTier
  requestsSentToday: number
  dailyRequestLimit: number
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ApiErrorBody {
  message: string
  status?: number
}
