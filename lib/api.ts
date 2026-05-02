// API Service Layer for Backend Integration

import { cacheService } from './cache';
import { debouncePromise, memoizeAsync } from './debounce';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api`;

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Helper function to make API calls
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    
    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    
    // Handle non-JSON responses (like HTML error pages)
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      // If we get HTML instead of JSON, it's likely an authentication error
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        return { error: 'Authentication required. Please login again.' };
      }
      // Try to parse as JSON anyway
      try {
        data = JSON.parse(text);
      } catch {
        return { error: 'Invalid response from server' };
      }
    }
    
    if (!response.ok) {
      // Handle specific authentication errors
      if (response.status === 401) {
        // Clear invalid token
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return { error: 'Session expired. Please login again.' };
      }
      if (response.status === 403) {
        return { error: 'Access denied. Admin privileges required.' };
      }
      return { error: data.detail || data.message || data.error || 'An error occurred' };
    }
    
    return { data };
  } catch (error) {
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
  }) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined)
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
    if (params?.type) queryParams.append('feedback_type', params.type);
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
