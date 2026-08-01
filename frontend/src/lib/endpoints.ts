import { api } from './api'
import type {
  Availability,
  AuthResponse,
  CollaborationRequestCreate,
  CollaborationRequestResponse,
  IdeaCreateRequest,
  IdeaResponse,
  LoginRequest,
  MatchRecommendationResponse,
  NotificationResponse,
  PageResponse,
  ProfileResponse,
  ProfileUpdateRequest,
  RegisterRequest,
  SubscriptionInfoResponse,
  UserSummary,
} from './types'

export const authApi = {
  register: (body: RegisterRequest) => api.post<AuthResponse>('/auth/register', body).then((r) => r.data),
  login: (body: LoginRequest) => api.post<AuthResponse>('/auth/login', body).then((r) => r.data),
  logout: () => api.post<void>('/auth/logout'),
  me: () => api.get<UserSummary>('/auth/me').then((r) => r.data),
}

export interface ProfileSearchParams {
  skill?: string
  interest?: string
  availability?: Availability
  location?: string
  timezone?: string
  page?: number
  size?: number
}

export const profileApi = {
  me: () => api.get<ProfileResponse>('/profiles/me').then((r) => r.data),
  byUserId: (userId: number) => api.get<ProfileResponse>(`/profiles/${userId}`).then((r) => r.data),
  update: (body: ProfileUpdateRequest) => api.put<ProfileResponse>('/profiles/me', body).then((r) => r.data),
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post<ProfileResponse>('/profiles/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },
  search: (params: ProfileSearchParams = {}) =>
    api
      .get<PageResponse<ProfileResponse>>('/profiles/search', {
        params: { page: 0, size: 20, ...params },
      })
      .then((r) => r.data),
}

export const matchApi = {
  recommendations: (limit = 10) =>
    api.get<MatchRecommendationResponse[]>('/matches', { params: { limit } }).then((r) => r.data),
}

export const ideaApi = {
  list: (params: { domain?: string; stage?: string; query?: string; page?: number; size?: number } = {}) =>
    api.get<PageResponse<IdeaResponse>>('/ideas', { params: { page: 0, size: 20, ...params } }).then((r) => r.data),
  mine: (page = 0, size = 20) =>
    api.get<PageResponse<IdeaResponse>>('/ideas/mine', { params: { page, size } }).then((r) => r.data),
  get: (id: number) => api.get<IdeaResponse>(`/ideas/${id}`).then((r) => r.data),
  create: (body: IdeaCreateRequest) => api.post<IdeaResponse>('/ideas', body).then((r) => r.data),
  update: (id: number, body: IdeaCreateRequest) => api.put<IdeaResponse>(`/ideas/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete<void>(`/ideas/${id}`),
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
  send: (body: CollaborationRequestCreate) =>
    api.post<CollaborationRequestResponse>('/requests', body).then((r) => r.data),
  accept: (id: number) => api.patch<CollaborationRequestResponse>(`/requests/${id}/accept`).then((r) => r.data),
  reject: (id: number) => api.patch<CollaborationRequestResponse>(`/requests/${id}/reject`).then((r) => r.data),
}

export const subscriptionApi = {
  info: () => api.get<SubscriptionInfoResponse>('/subscription').then((r) => r.data),
}

export const notificationApi = {
  list: (page = 0, size = 20) =>
    api.get<PageResponse<NotificationResponse>>('/notifications', { params: { page, size } }).then((r) => r.data),
  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count').then((r) => r.data.count),
  markRead: (id: number) => api.patch<void>(`/notifications/${id}/read`),
  markAllRead: () => api.post<void>('/notifications/read-all'),
}
