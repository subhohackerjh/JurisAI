// User Types
export type UserRole = 'citizen' | 'advocate' | 'police_officer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface Advocate extends User {
  role: 'advocate';
  licenseNumber: string;
  specializations: string[];
  experience: number; // years
  rating: number; // 1-5
  reviewCount: number;
  hourlyRate: number;
  bio: string;
  isAvailable: boolean;
}

export interface Citizen extends User {
  role: 'citizen';
  caseCount: number;
  totalSpent: number;
}

export interface PoliceOfficer extends User {
  role: 'police_officer';
  badgeNumber: string;
  station: string;
  department: string;
}

export interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
}

// Case Types
export type CaseStatus = 'open' | 'in_progress' | 'closed' | 'pending';
export type CaseCategory = 'criminal' | 'civil' | 'family' | 'property' | 'labor' | 'other';

export interface Case {
  id: string;
  citizenId: string;
  advocateId?: string;
  stationId?: string;
  title: string;
  description: string;
  category: CaseCategory;
  status: CaseStatus;
  caseNumber: string;
  filedDate: string;
  updatedDate: string;
  documents: Document[];
  notes: CaseNote[];
  timeline: TimelineEvent[];
  budget: number;
  spent: number;
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

// Feedback
export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  rating: number; // 1-5
  category: 'bug' | 'feature' | 'improvement' | 'usability' | 'other';
  subject: string;
  message: string;
  attachments?: string[];
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: string;
  response?: string;
  respondedAt?: string;
}
