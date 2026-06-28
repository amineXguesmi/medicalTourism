import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = Cookies.get('medtour_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) Cookies.remove('medtour_token')
    return Promise.reject(err)
  }
)

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password })

export const register = (data: {
  fullName: string
  email: string
  password: string
  phone: string
  countryCode: string
  residenceCity: string
  languageCode?: string
  currencyCode?: string
  biologicalSex?: 'FEMALE' | 'MALE' | 'INTERSEX' | 'UNKNOWN'
  travelRadiusKm?: number
  medicalSummary?: string
}) => api.post('/auth/register/patient', data)

export const getMe = () => api.get('/users/me')

// Search
export const searchOffers = (params: Record<string, string | number | undefined>) =>
  api.get('/search/offers', { params })

export const compareOffers = (offerIds: string[]) =>
  api.get('/search/compare', { params: { offerIds: offerIds.join(',') } })

// Procedures
export const getProcedures = (params?: Record<string, string>) =>
  api.get('/procedures', { params })

export const getSpecialties = () => api.get('/procedures/specialties')

export const getProcedureBySlug = (slug: string) => api.get(`/procedures/${slug}`)

// Clinics
export const getClinics = (params?: Record<string, string>) =>
  api.get('/clinics', { params })

export const getClinic = (id: string) => api.get(`/clinics/${id}`)

// Quote requests
export const createQuoteRequest = (data: {
  offerIds: string[]
  antiBypassTermsAccepted: boolean
  patientMessage?: string
}) => api.post('/quote-requests', data)

export const getMyQuoteRequests = () => api.get('/quote-requests/mine')

export const getQuoteRequest = (id: string) => api.get(`/quote-requests/${id}`)

// AI Summary (demo endpoint)
export const uploadAndSummarize = (file: File, language = 'en') => {
  const form = new FormData()
  form.append('file', file)
  form.append('language', language)
  return api.post('/ai/summarize', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// Clinic portal
export const getClinicRequests = () => api.get('/clinic-portal/requests')
export const getClinicRequest = (id: string) => api.get(`/clinic-portal/requests/${id}`)
export const sendClinicQuote = (requestId: string, data: {
  totalPriceCents: number
  currencyCode: string
  includedItems: string[]
  excludedItems: string[]
  validityDays: number
  clinicNotes?: string
  proposedDate?: string
}) => api.post(`/clinic-portal/requests/${requestId}/quote`, data)
