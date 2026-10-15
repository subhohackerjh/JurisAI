// API Service Layer for Backend Integration

import { cacheService } from './cache';
import { debouncePromise, memoizeAsync } from './debounce';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  .replace(/\/+$/, '')
  .replace(/\/api$/i, '');
const API_BASE_URL = `${API_ORIGIN}/api`;

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Attempt a silent token refresh. Returns the new access token or null on failure.
async function tryRefreshToken(): Promise<string | null> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const newAccess: string = data.access;
    if (!newAccess) return null;

    // Persist the new access token (and rotated refresh token if provided)
    localStorage.setItem('accessToken', newAccess);
    if (data.refresh) {
      localStorage.setItem('refreshToken', data.refresh);
      // Keep authSession in sync
      const saved = localStorage.getItem('authSession');
      if (saved) {
        try {
          const session = JSON.parse(saved);
          session.accessToken = newAccess;
          session.refreshToken = data.refresh;
          localStorage.setItem('authSession', JSON.stringify(session));
        } catch {}
      }
    }
    return newAccess;
  } catch {
    return null;
  }
}

/** Turn DRF validation payloads into a single user-facing string */
function formatApiError(data: Record<string, unknown> | null | undefined): string {
  if (!data) return 'An error occurred';
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) return data.detail.map(String).join(' ');
  if (typeof data.message === 'string') return data.message;
  if (typeof data.error === 'string') return data.error;

  const fieldMessages: string[] = [];
  for (const [field, value] of Object.entries(data)) {
    if (field === 'detail' || field === 'message' || field === 'error') continue;
    if (Array.isArray(value)) {
      const text = value.map(String).join(' ');
      if (field === 'old_password') {
        fieldMessages.push(text.includes('incorrect') ? 'Current password is incorrect' : text);
      } else if (field === 'new_password' || field === 'new_password_confirm') {
        fieldMessages.push(text);
      } else {
        fieldMessages.push(`${field}: ${text}`);
      }
    } else if (typeof value === 'string') {
      fieldMessages.push(value);
    }
  }
  return fieldMessages.length > 0 ? fieldMessages.join('. ') : 'An error occurred';
}

// Parse the HTTP response body safely, returning { data } or { error }
async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');
  let data: any;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      return { error: 'Authentication required. Please login again.' };
    }
    try {
      data = JSON.parse(text);
    } catch {
      return { error: 'Invalid response from server' };
    }
  }

  if (!response.ok) {
    if (response.status === 403) {
      return { error: 'Access denied. Admin privileges required.' };
    }
    return { error: formatApiError(data) };
  }

  return { data };
}

// Helper function to make API calls — auto-refreshes token once on 401
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const buildHeaders = (token: string | null): Record<string, string> => {
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
      };
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      return headers;
    };

    // First attempt
    let token = localStorage.getItem('accessToken');
    let response = await fetch(url, { ...options, headers: buildHeaders(token) });

    // On 401: try to silently refresh and retry once
    if (response.status === 401) {
      const newToken = await tryRefreshToken();
      if (newToken) {
        response = await fetch(url, { ...options, headers: buildHeaders(newToken) });
      } else {
        // Refresh also failed — clear session and report
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authSession');
        return { error: 'Session expired. Please login again.' };
      }
    }

    // If still 401 after retry, clear and bail
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authSession');
      return { error: 'Session expired. Please login again.' };
    }

    return parseResponse<T>(response);
  } catch (error) {
    if (error instanceof TypeError) {
      return {
        error: `Cannot reach the backend at ${API_ORIGIN}. Start the local Django server and check that this origin is reachable from your browser.`,
      };
    }
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Auth APIs
export const authApi = {
  register: async (userData: {
    email: string;
    name: string;
    role: string;
    phone?: string;
    password: string;
    password_confirm: string;
    specialization?: string;
    experience_years?: number;
    bar_council_id?: string;
    badge_number?: string;
    station?: string;
    law_college?: string;
    year_of_study?: string;
    graduation_year?: number;
  }) => {
    return apiCall('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (email: string, password: string) => {
    return apiCall('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async (refreshToken: string) => {
    return apiCall('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  },

  refreshToken: async (refreshToken: string) => {
    return apiCall('/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  },
};

// Profile APIs
export const profileApi = {
  getProfile: async () => {
    return apiCall('/auth/profile/', {});
  },

  updateProfile: async (profileData: {
    name?: string;
    phone?: string;
    specialization?: string;
    experience_years?: number;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    bio?: string;
    consultation_fee?: number;
  }) => {
    return apiCall('/auth/profile/update/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  changePassword: async (passwordData: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => {
    return apiCall('/auth/password/change/', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },

  getStats: async () => {
    return apiCall('/auth/stats/', {});
  },
};

// Advocates APIs
export const advocatesApi = {
  listAdvocates: async (params?: {
    specialization?: string;
    availability?: string;
    search?: string;
    nearby?: boolean;
  }) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();

    return apiCall(`/auth/advocates/${queryString ? `?${queryString}` : ''}`);
  },

  getAdvocateDetail: async (id: string) => {
    return apiCall(`/auth/advocates/${id}/`);
  },

  // Advocate Approval (Admin)
  listPendingAdvocates: async () => {
    return apiCall('/auth/advocates/pending/');
  },

  approveAdvocate: async (userId: string) => {
    return apiCall(`/auth/advocates/${userId}/approve/`, {
      method: 'POST',
    });
  },

  rejectAdvocate: async (userId: string, rejectionReason?: string) => {
    return apiCall(`/auth/advocates/${userId}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ rejection_reason: rejectionReason }),
    });
  },
};

// Cases APIs
export const casesApi = {
  listCases: async (params?: {
    status?: string;
    case_type?: string;
    search?: string;
    ordering?: string;
  }) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined)
    ).toString();
    
    return apiCall(`/cases/${queryString ? `?${queryString}` : ''}`);
  },

  getCaseDetail: async (id: string) => {
    return apiCall(`/cases/${id}/`);
  },

  createCase: async (caseData: {
    title: string;
    case_type: string;
    description: string;
    advocate?: string;
    court_name?: string;
    court_address?: string;
    judge_name?: string;
    filing_date?: string;
    advocate_fee?: number;
  }) => {
    return apiCall('/cases/', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  },

  updateCaseStatus: async (id: string, data: {
    status: string;
    note?: string;
  }) => {
    return apiCall(`/cases/${id}/status/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCase: async (id: string) => {
    return apiCall(`/cases/${id}/`, {
      method: 'DELETE',
    });
  },

  // Documents
  listDocuments: async (caseId: string) => {
    return apiCall(`/cases/${caseId}/documents/`);
  },

  uploadDocument: async (caseId: string, formData: FormData) => {
    return apiCall(`/cases/${caseId}/documents/`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let apiCall handle headers, but don't set Content-Type for FormData
    });
  },

  deleteDocument: async (caseId: string, documentId: string) => {
    return apiCall(`/cases/${caseId}/documents/${documentId}/`, {
      method: 'DELETE',
    });
  },

  // Hearings
  listHearings: async (caseId: string) => {
    return apiCall(`/cases/${caseId}/hearings/`);
  },

  createHearing: async (caseId: string, hearingData: {
    hearing_date: string;
    hearing_type: string;
    court_room?: string;
    judge_name?: string;
    purpose: string;
    outcome?: string;
    next_date?: string;
  }) => {
    return apiCall(`/cases/${caseId}/hearings/`, {
      method: 'POST',
      body: JSON.stringify(hearingData),
    });
  },

  updateHearing: async (caseId: string, hearingId: string, hearingData: {
    hearing_date?: string;
    hearing_type?: string;
    court_room?: string;
    judge_name?: string;
    purpose?: string;
    outcome?: string;
    next_date?: string;
    is_completed?: boolean;
  }) => {
    return apiCall(`/cases/${caseId}/hearings/${hearingId}/`, {
      method: 'PUT',
      body: JSON.stringify(hearingData),
    });
  },

  deleteHearing: async (caseId: string, hearingId: string) => {
    return apiCall(`/cases/${caseId}/hearings/${hearingId}/`, {
      method: 'DELETE',
    });
  },

  // Updates
  listUpdates: async (caseId: string) => {
    return apiCall(`/cases/${caseId}/updates/`);
  },

  createUpdate: async (caseId: string, updateData: {
    update_type: string;
    title: string;
    description: string;
    is_customer_visible?: boolean;
  }) => {
    return apiCall(`/cases/${caseId}/updates/`, {
      method: 'POST',
      body: JSON.stringify(updateData),
    });
  },

  // Dashboard
  getDashboardStats: async () => {
    return apiCall('/cases/dashboard/stats/');
  },

  // Search
  searchCases: async (query: string) => {
    return apiCall(`/cases/search/?q=${encodeURIComponent(query)}`);
  },

  // Upcoming Hearings
  getUpcomingHearings: async () => {
    return apiCall('/cases/upcoming-hearings/');
  },
};

// Draft Requests APIs
export const draftsApi = {
  listDrafts: async () => {
    return apiCall('/cases/drafts/');
  },

  getDraftDetail: async (id: string) => {
    return apiCall(`/cases/drafts/${id}/`);
  },

  createDraft: async (draftData: {
    advocate: string;
    document_type: string;
    requirements: string;
    additional_notes?: string;
  }) => {
    return apiCall('/cases/drafts/', {
      method: 'POST',
      body: JSON.stringify(draftData),
    });
  },

  updateDraftStatus: async (id: string, data: {
    status?: string;
    agreed_price?: number;
    expected_delivery?: string;
    draft_document?: string;
    final_document?: string;
  }) => {
    return apiCall(`/cases/drafts/${id}/status/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteDraft: async (id: string) => {
    return apiCall(`/cases/drafts/${id}/`, {
      method: 'DELETE',
    });
  },
};

// Feedback APIs
export const feedbackApi = {
  // Feedback
  listFeedback: async (params?: {
    status?: string;
    type?: string;
    priority?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.priority) queryParams.append('priority', params.priority);
    const queryString = queryParams.toString();
    return apiCall(`/feedback/${queryString ? `?${queryString}` : ''}`);
  },

  getFeedbackDetail: async (id: string) => {
    return apiCall(`/feedback/${id}/`);
  },

  createFeedback: async (data: {
    feedback_type: string;
    subject: string;
    message: string;
    related_case?: string;
    related_draft?: string;
    contact_email?: string;
    contact_phone?: string;
  }) => {
    return apiCall('/feedback/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateFeedback: async (id: string, data: {
    status?: string;
    priority?: string;
    assigned_to?: string;
    admin_notes?: string;
    resolution?: string;
  }) => {
    return apiCall(`/feedback/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Feedback Responses
  listFeedbackResponses: async (feedbackId: string) => {
    return apiCall(`/feedback/${feedbackId}/responses/`);
  },

  createFeedbackResponse: async (feedbackId: string, data: {
    message: string;
    is_internal?: boolean;
  }) => {
    return apiCall(`/feedback/${feedbackId}/responses/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Advocate Ratings
  listAdvocateRatings: async (params?: {
    advocate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.advocate) queryParams.append('advocate', params.advocate);
    const queryString = queryParams.toString();
    return apiCall(`/feedback/ratings/advocate/${queryString ? `?${queryString}` : ''}`);
  },

  getAdvocateRatingDetail: async (id: string) => {
    return apiCall(`/feedback/ratings/advocate/${id}/`);
  },

  createAdvocateRating: async (data: {
    advocate: string;
    related_case?: string;
    related_draft?: string;
    rating: number;
    review?: string;
    professionalism?: number;
    communication?: number;
    expertise?: number;
    timeliness?: number;
  }) => {
    return apiCall('/feedback/ratings/advocate/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAdvocateRating: async (id: string, data: {
    rating?: number;
    review?: string;
    professionalism?: number;
    communication?: number;
    expertise?: number;
    timeliness?: number;
    is_public?: boolean;
  }) => {
    return apiCall(`/feedback/ratings/advocate/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAdvocateRating: async (id: string) => {
    return apiCall(`/feedback/ratings/advocate/${id}/`, {
      method: 'DELETE',
    });
  },

  getAdvocateRatingSummary: async (advocateId: string) => {
    return apiCall(`/feedback/ratings/advocate/${advocateId}/summary/`);
  },

  // System Ratings
  listSystemRatings: async () => {
    return apiCall('/feedback/ratings/system/');
  },

  getSystemRatingDetail: async (id: string) => {
    return apiCall(`/feedback/ratings/system/${id}/`);
  },

  createSystemRating: async (data: {
    rating: number;
    review?: string;
    ease_of_use?: number;
    features?: number;
    support?: number;
    would_recommend?: boolean;
  }) => {
    return apiCall('/feedback/ratings/system/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteSystemRating: async (id: string) => {
    return apiCall(`/feedback/ratings/system/${id}/`, {
      method: 'DELETE',
    });
  },

  getSystemRatingSummary: async () => {
    return apiCall('/feedback/ratings/system/summary/');
  },

  // Stats
  getFeedbackStats: async () => {
    return apiCall('/feedback/stats/');
  },
};

// Create debounced search function (500ms delay)
const debouncedSearchCases = debouncePromise(
  async (params: {
    court_code?: string;
    case_type?: string;
    filing_year?: number;
    litigant_name?: string;
    advocate_name?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.court_code) queryParams.append('court_code', params.court_code);
    if (params.case_type) queryParams.append('case_type', params.case_type);
    if (params.filing_year) queryParams.append('filing_year', params.filing_year.toString());
    if (params.litigant_name) queryParams.append('litigant_name', params.litigant_name);
    if (params.advocate_name) queryParams.append('advocate_name', params.advocate_name);
    const queryString = queryParams.toString();
    
    const response = await apiCall(`/ecourts/search/${queryString ? `?${queryString}` : ''}`);
    
    // Cache successful response
    if (response.data && !response.error) {
      cacheService.set('search_cases', response.data, params);
    }
    
    return response;
  },
  500 // 500ms debounce delay
);

// Create memoized case by CNR function
const memoizedGetCaseByCNR = memoizeAsync(
  async (cnr: string) => {
    // Check cache first
    const cached = cacheService.get('case_by_cnr', { cnr });
    if (cached) {
      return { data: cached, cached: true };
    }

    const response = await apiCall(`/ecourts/case/?cnr=${encodeURIComponent(cnr)}`);
    
    // Cache successful response
    if (response.data && !response.error) {
      cacheService.set('case_by_cnr', response.data, { cnr });
    }
    
    return response;
  },
  300000 // 5 minutes cache for memoization
);

// eCourts APIs
export const ecourtsApi = {
  // Status
  getStatus: async () => {
    // Check cache first
    const cached = cacheService.get('status');
    if (cached) {
      return { data: cached, cached: true };
    }

    const response = await apiCall('/ecourts/status/');
    
    // Cache successful response
    if (response.data && !response.error) {
      cacheService.set('status', response.data);
    }
    
    return response;
  },

  // Case by CNR (memoized)
  getCaseByCNR: memoizedGetCaseByCNR,

  // Import Case
  importCase: async (data: {
    cnr: string;
    advocate_id?: string;
  }) => {
    return apiCall('/ecourts/import/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Search Cases (debounced)
  searchCases: debouncedSearchCases,

  // Cause List
  getCauseList: async (court_code: string, date: string) => {
    // Check cache first
    const cached = cacheService.get('cause_list', { court_code, date });
    if (cached) {
      return { data: cached, cached: true };
    }

    const response = await apiCall(`/ecourts/causelist/?court_code=${encodeURIComponent(court_code)}&date=${encodeURIComponent(date)}`);
    
    // Cache successful response
    if (response.data && !response.error) {
      cacheService.set('cause_list', response.data, { court_code, date });
    }
    
    return response;
  },

  // Cache management
  clearCache: (method?: string, params?: Record<string, any>) => {
    if (method) {
      cacheService.clear(method, params);
    } else {
      cacheService.clearAll();
    }
  },

  getCacheStats: () => {
    return cacheService.getStats();
  },

  cleanupCache: () => {
    cacheService.cleanup();
  },
};

// Internships APIs
export const internshipsApi = {
  listInternships: async (params?: { practice_area?: string; mine?: boolean }) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return apiCall(`/internships/${queryString ? `?${queryString}` : ''}`);
  },

  getInternship: async (id: string) => {
    return apiCall(`/internships/${id}/`);
  },

  createInternship: async (data: {
    title: string;
    description: string;
    practice_area?: string;
    duration_months?: number;
    stipend?: number;
    openings?: number;
  }) => {
    return apiCall('/internships/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateInternship: async (id: string, data: Partial<{
    title: string;
    description: string;
    practice_area: string;
    duration_months: number;
    stipend: number;
    openings: number;
    status: 'open' | 'closed';
  }>) => {
    return apiCall(`/internships/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  apply: async (internshipId: string, formData: FormData) => {
    return apiCall(`/internships/${internshipId}/apply/`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let apiCall handle headers, but don't set Content-Type for FormData
    });
  },

  myApplications: async () => {
    return apiCall('/internships/applications/');
  },

  updateApplicationStatus: async (applicationId: string, applicationStatus: 'shortlisted' | 'selected' | 'rejected') => {
    return apiCall(`/internships/applications/${applicationId}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: applicationStatus }),
    });
  },

  uploadOfferLetter: async (applicationId: string, formData: FormData) => {
    return apiCall(`/internships/applications/${applicationId}/offer-letter/`, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
};
