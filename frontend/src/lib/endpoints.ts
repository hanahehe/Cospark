import { api } from './api'
import type {
  AuthResponse,
  CollaborationRequestResponse,
  IdeaResponse,
  LoginRequest,
  MatchRecommendationResponse,
  NotificationResponse,
  PageResponse,
  ProfileResponse,
  RegisterRequest,
  UserSummary,
} from './types'

export const authApi = {
  register: (body: RegisterRequest) => api.post<AuthResponse>('/auth/register', body).then((r) => r.data),
  login: (body: LoginRequest) => api.post<AuthResponse>('/auth/login', body).then((r) => r.data),
  logout: () => api.post<void>('/auth/logout'),
  me: () => api.get<UserSummary>('/auth/me').then((r) => r.data),
}

export const profileApi = {
  me: () => api.get<ProfileResponse>('/profiles/me').then((r) => r.data),
  byUserId: (userId: number) => api.get<ProfileResponse>(`/profiles/${userId}`).then((r) => r.data),
}

export const matchApi = {
  recommendations: (limit = 10) =>
    api.get<MatchRecommendationResponse[]>('/matches', { params: { limit } }).then((r) => r.data),
}

export const ideaApi = {
  mine: (page = 0, size = 20) =>
    api.get<PageResponse<IdeaResponse>>('/ideas/mine', { params: { page, size } }).then((r) => r.data),
}

export const collaborationApi = {
  received: (page = 0, size = 20) =>
    api
      .get<PageResponse<CollaborationRequestResponse>>('/requests/received', { params: { page, size } })
      .then((r) => r.data),
  sent: (page = 0, size = 20) =>
    api
      .get<PageResponse<CollaborationRequestResponse>>('/requests/sent', { params: { page, size } })
      .then((r) => r.data),
}

export const notificationApi = {
  list: (page = 0, size = 20) =>
    api.get<PageResponse<NotificationResponse>>('/notifications', { params: { page, size } }).then((r) => r.data),
  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count').then((r) => r.data.count),
}
