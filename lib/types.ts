// User Types
export type UserRole = 'customer' | 'advocate' | 'police' | 'admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string | number;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  specialization?: string;
  experience_years?: number;
  bar_council_id?: string;
  rating?: string;
  cases_handled?: number;
  badge_number?: string;
  station?: string;
  approval_status?: ApprovalStatus;
  rejection_reason?: string;
  is_active?: boolean;
  date_joined?: string;
  last_login?: string;
  avatar?: string;
  createdAt?: string;
}

export interface Advocate extends User {
  role: 'advocate';
  licenseNumber?: string;
  specializations?: string[];
  experience?: number; // years
  rating?: string; // 1-5
  reviewCount?: number;
  hourlyRate?: number;
  bio?: string;
  isAvailable?: boolean;
}

export interface Customer extends User {
  role: 'customer';
  caseCount: number;
  totalSpent: number;
}

export interface PoliceOfficer extends User {
  role: 'police';
  badge_number: string;
  station: string;
  department?: string;
}

export interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
}

// Case Types
export type CaseStatus = 'draft' | 'filed' | 'pending' | 'hearing' | 'evidence' | 'arguments' | 'judgment' | 'closed' | 'dismissed' | 'appealed';
export type CaseType = 'civil' | 'criminal' | 'family' | 'property' | 'corporate' | 'labour' | 'consumer' | 'writ' | 'other';

export interface Case {
  id: string;
  cnr_number?: string;
  title: string;
  case_type: CaseType;
  case_type_display?: string;
  description: string;
  status: CaseStatus;
  status_display?: string;
  customer: User;
  advocate?: User;
  customer_name?: string;
  advocate_name?: string;
  court_name?: string;
  court_address?: string;
  judge_name?: string;
  filing_date?: string;
  next_hearing_date?: string;
  registration_date?: string;
  disposal_date?: string;
  advocate_fee?: number;
  total_cost: number;
  is_active: boolean;
  is_public: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
  documents_count?: number;
  hearings_count?: number;
  documents?: CaseDocument[];
  hearings?: Hearing[];
  updates?: CaseUpdate[];
}

export interface CaseDocument {
  id: string;
  case: string;
  title: string;
  document_type: 'petition' | 'affidavit' | 'evidence' | 'order' | 'judgment' | 'agreement' | 'notice' | 'other';
  file?: string;
  file_url?: string;
  file_size?: number;
  uploaded_by: string;
  uploaded_by_name?: string;
  description?: string;
  created_at: string;
}

export interface Hearing {
  id: string;
  case: string;
  hearing_date: string;
  hearing_type: 'mention' | 'arguments' | 'evidence' | 'cross_examination' | 'judgment' | 'miscellaneous';
  court_room?: string;
  judge_name?: string;
  purpose: string;
  outcome?: string;
  next_date?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CaseUpdate {
  id: string;
  case: string;
  update_type: 'status_change' | 'document_added' | 'hearing_scheduled' | 'hearing_completed' | 'note' | 'client_communication' | 'other';
  title: string;
  description: string;
  created_by: string;
  created_by_name?: string;
  old_status?: string;
  new_status?: string;
  is_customer_visible: boolean;
  created_at: string;
}

export interface Document {
  id: string;
  caseId: string;
  name: string;
  url: string;
  type: string;
  uploadedDate: string;
  uploadedBy: string;
}

export interface CaseNote {
  id: string;
  caseId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  isPrivate: boolean;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  title: string;
  description: string;
  date: string;
  type: 'hearing' | 'filing' | 'verdict' | 'update' | 'other';
}

// Police Station
export interface PoliceStation {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  officerCount: number;
  caseCount: number;
}

// Authentication
export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  accessToken?: string;
  refreshToken?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface ProfileUpdateResponse {
  message: string;
  user: User;
}

export interface UserStats {
  role: string;
  cases_count: number;
  pending_cases: number;
  completed_cases: number;
  rating?: string;
  cases_handled?: number;
}

export interface DashboardStats {
  total_cases: number;
  pending_cases: number;
  active_cases: number;
  completed_cases: number;
  rating?: string;
  cases_handled?: number;
  recent_cases: Case[];
}

export interface DraftRequest {
  id: string;
  document_type: 'contract' | 'notice' | 'power_of_attorney' | 'will' | 'partnership' | 'rental' | 'employment' | 'nda' | 'mou' | 'complaint' | 'other';
  document_type_display?: string;
  requirements: string;
  additional_notes?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  status_display?: string;
  customer: User;
  advocate: User;
  customer_name?: string;
  advocate_name?: string;
  agreed_price?: number;
  expected_delivery?: string;
  delivered_date?: string;
  draft_document?: string;
  final_document?: string;
  created_at: string;
  updated_at: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    sourceDocument?: string;
    ipcSections?: string[];
  };
}

// Legal Knowledge Base
export interface IPCSection {
  number: string;
  title: string;
  description: string;
  punishment: string;
  keywords: string[];
}

// Case Selection for Advocates
export interface AvailableCase {
  id: string;
  title: string;
  description: string;
  category: CaseType;
  budget: number;
  urgency: 'low' | 'medium' | 'high';
  location: string;
  customerId: string;
  customerName: string;
  postedDate: string;
  requirements: string[];
  status: 'available' | 'claimed' | 'assigned';
  claimedBy?: string;
  claimedAt?: string;
}

// Internship Applications
export interface InternshipApplication {
  id: string;
  advocateId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  education: string;
  university: string;
  year: string;
  resume: string;
  coverLetter: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  experience?: string;
  skills?: string[];
}

// Location-based Search
export interface LocationSearch {
  latitude: number;
  longitude: number;
  radius: number; // in km
}

export interface NearbyAdvocate {
  id: string;
  name: string;
  specializations: string[];
  rating: number;
  experience: number;
  hourlyRate: number;
  distance: number; // in km
  isAvailable: boolean;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  avatar?: string;
  phone?: string;
  email: string;
}

// AI Chat
export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  category?: 'legal_advice' | 'procedure' | 'document_help' | 'general';
  suggestedActions?: string[];
}

// Feedback & Ratings
export type FeedbackType = 'general' | 'bug_report' | 'feature_request' | 'complaint' | 'compliment' | 'support';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'urgent';
export type FeedbackStatus = 'new' | 'under_review' | 'in_progress' | 'resolved' | 'closed' | 'rejected';

export interface Feedback {
  id: string;
  user: string;
  user_name?: string;
  feedback_type: FeedbackType;
  feedback_type_display?: string;
  subject: string;
  message: string;
  related_case?: string;
  related_draft?: string;
  priority: FeedbackPriority;
  priority_display?: string;
  status: FeedbackStatus;
  status_display?: string;
  assigned_to?: string;
  admin_notes?: string;
  resolution?: string;
  resolved_at?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
  responses_count?: number;
  responses?: FeedbackResponse[];
}

export interface FeedbackResponse {
  id: string;
  feedback: string;
  responder: string;
  responder_name?: string;
  responder_role?: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

export interface AdvocateRating {
  id: string;
  customer: string;
  customer_name?: string;
  advocate: string;
  advocate_name?: string;
  related_case?: string;
  related_draft?: string;
  rating: number; // 1-5
  review?: string;
  professionalism?: number; // 1-5
  communication?: number; // 1-5
  expertise?: number; // 1-5
  timeliness?: number; // 1-5
  is_verified: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemRating {
  id: string;
  user: string;
  user_name?: string;
  rating: number; // 1-5
  review?: string;
  ease_of_use?: number; // 1-5
  features?: number; // 1-5
  support?: number; // 1-5
  would_recommend?: boolean;
  created_at: string;
}

export interface AdvocateRatingSummary {
  advocate_id: string;
  average_rating: number;
  total_ratings: number;
  rating_breakdown: {
    [key: string]: { count: number; percentage: number };
  };
  category_averages: {
    professionalism?: number;
    communication?: number;
    expertise?: number;
    timeliness?: number;
  };
  recent_reviews: AdvocateRating[];
}

export interface SystemRatingSummary {
  average_rating: number;
  total_ratings: number;
  rating_breakdown: {
    [key: string]: { count: number; percentage: number };
  };
  category_averages: {
    ease_of_use?: number;
    features?: number;
    support?: number;
  };
  would_recommend_percentage: number;
}

export interface FeedbackStats {
  by_status: { [key: string]: number };
  by_type: { [key: string]: number };
  by_priority: { [key: string]: number };
  total: number;
  unresolved: number;
  recent: Feedback[];
}

// eCourts Types
export interface ECourtsStatus {
  configured: boolean;
  has_api_key: boolean;
  message: string;
}

export interface ECourtsCaseData {
  case_title?: string;
  case_type?: string;
  case_description?: string;
  court_name?: string;
  judge_name?: string;
  filing_date?: string;
  case_status?: string;
  cnr?: string;
  [key: string]: any;
}

export interface ECourtsCaseResponse {
  source: 'cache' | 'ecourts_api';
  data: ECourtsCaseData;
}

export interface ECourtsImportResponse {
  message: string;
  case_id?: string;
  cnr?: string;
  data?: any;
}

export interface ECourtsSearchResult {
  [key: string]: any;
}

export interface ECourtsCauseListEntry {
  [key: string]: any;
}

export interface ECourtsCauseListResponse {
  [key: string]: any;
}
