import { Advocate, Case, Customer, PoliceOfficer, PoliceStation, CaseNote, TimelineEvent, Feedback, AvailableCase, InternshipApplication, NearbyAdvocate } from './types';

export const mockAdvocates: Advocate[] = [
  {
    id: 'adv-1',
    name: 'Rajesh Kumar',
    email: 'rajesh@legalconnect.com',
    role: 'advocate',
    phone: '+91-9876543210',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh',
    licenseNumber: 'BAR/2015/001',
    specializations: ['Criminal Law', 'Constitutional Law', 'Corporate Law'],
    experience: 15,
    rating: 4.8,
    reviewCount: 124,
    hourlyRate: 2500,
    bio: 'Senior advocate with 15 years of experience in criminal and constitutional law. Known for strategic case management.',
    isAvailable: true,
    createdAt: '2015-06-15',
  },
  {
    id: 'adv-2',
    name: 'Priya Sharma',
    email: 'priya@legalconnect.com',
    role: 'advocate',
    phone: '+91-9876543211',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    licenseNumber: 'BAR/2018/045',
    specializations: ['Family Law', 'Property Rights', 'Women Rights'],
    experience: 8,
    rating: 4.9,
    reviewCount: 98,
    hourlyRate: 2000,
    bio: 'Passionate advocate specializing in family law and women rights. Track record of successful settlements.',
    isAvailable: true,
    createdAt: '2018-03-22',
  },
  {
    id: 'adv-3',
    name: 'Amit Patel',
    email: 'amit@legalconnect.com',
    role: 'advocate',
    phone: '+91-9876543212',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit',
    licenseNumber: 'BAR/2016/032',
    specializations: ['Labor Law', 'Employment Rights', 'Dispute Resolution'],
    experience: 12,
    rating: 4.7,
    reviewCount: 87,
    hourlyRate: 1800,
    bio: 'Expert in labor law and employment disputes. Dedicated to workers&apos; rights and fair treatment.',
    isAvailable: true,
    createdAt: '2016-09-10',
  },
  {
    id: 'adv-4',
    name: 'Neha Gupta',
    email: 'neha@legalconnect.com',
    role: 'advocate',
    phone: '+91-9876543213',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neha',
    licenseNumber: 'BAR/2019/067',
    specializations: ['Civil Law', 'Contract Law', 'Arbitration'],
    experience: 6,
    rating: 4.6,
    reviewCount: 54,
    hourlyRate: 1500,
    bio: 'Skilled in civil matters and contract disputes. Focus on amicable resolutions and arbitration.',
    isAvailable: false,
    createdAt: '2019-01-05',
  },
  {
    id: 'adv-5',
    name: 'Vikram Singh',
    email: 'vikram@legalconnect.com',
    role: 'advocate',
    phone: '+91-9876543214',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram',
    licenseNumber: 'BAR/2017/051',
    specializations: ['Criminal Law', 'White Collar Crime', 'Appeals'],
    experience: 11,
    rating: 4.8,
    reviewCount: 102,
    hourlyRate: 2800,
    bio: 'Renowned for handling complex criminal cases and appeals. High success rate in white collar crimes.',
    isAvailable: true,
    createdAt: '2017-05-18',
  },
];

export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Mohan Singh',
    email: 'mohan@example.com',
    role: 'customer',
    phone: '+91-9876543220',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mohan',
    caseCount: 2,
    totalSpent: 75000,
    createdAt: '2023-06-10',
  },
  {
    id: 'cust-2',
    name: 'Anjali Verma',
    email: 'anjali@example.com',
    role: 'customer',
    phone: '+91-9876543221',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anjali',
    caseCount: 1,
    totalSpent: 45000,
    createdAt: '2024-01-15',
  },
];

export const mockPoliceStations: PoliceStation[] = [
  {
    id: 'ps-1',
    name: 'Central Police Station',
    location: 'Downtown, New Delhi',
    phone: '+91-1123456789',
    email: 'central.ps@police.gov.in',
    officerCount: 45,
    caseCount: 234,
  },
  {
    id: 'ps-2',
    name: 'East Police Station',
    location: 'East Delhi',
    phone: '+91-1123456790',
    email: 'east.ps@police.gov.in',
    officerCount: 32,
    caseCount: 156,
  },
  {
    id: 'ps-3',
    name: 'West Police Station',
    location: 'West Delhi',
    phone: '+91-1123456791',
    email: 'west.ps@police.gov.in',
    officerCount: 38,
    caseCount: 198,
  },
];

export const mockPoliceOfficers: PoliceOfficer[] = [
  {
    id: 'po-1',
    name: 'Inspector Rajesh Patel',
    email: 'rajesh.patel@police.gov.in',
    role: 'police_officer',
    phone: '+91-9876543230',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=inspector-rajesh',
    badgeNumber: 'INSP-2015-001',
    station: 'ps-1',
    department: 'Criminal Investigation',
    createdAt: '2015-03-20',
  },
  {
    id: 'po-2',
    name: 'Constable Deepak Kumar',
    email: 'deepak.kumar@police.gov.in',
    role: 'police_officer',
    phone: '+91-9876543231',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=constable-deepak',
    badgeNumber: 'CONST-2018-045',
    station: 'ps-1',
    department: 'Traffic and Law',
    createdAt: '2018-06-10',
  },
];

const caseNotes: CaseNote[] = [
  {
    id: 'note-1',
    caseId: 'case-1',
    authorId: 'adv-1',
    authorName: 'Rajesh Kumar',
    content:
      'Initial hearing scheduled for next month. Need to gather FIR copies and witness statements. Client should prepare for cross-examination.',
    createdAt: '2024-04-10',
    isPrivate: false,
  },
  {
    id: 'note-2',
    caseId: 'case-1',
    authorId: 'po-1',
    authorName: 'Inspector Rajesh Patel',
    content:
      'Witnesses identified. FIR filed under sections 304A and 336. Investigation ongoing.',
    createdAt: '2024-04-05',
    isPrivate: true,
  },
];

const timelineEvents: TimelineEvent[] = [
  {
    id: 'timeline-1',
    caseId: 'case-1',
    title: 'FIR Filed',
    description:
      'First Information Report filed at Central Police Station under sections 304A and 336 IPC.',
    date: '2024-03-15',
    type: 'filing',
  },
  {
    id: 'timeline-2',
    caseId: 'case-1',
    title: 'Advocate Assignment',
    description: 'Rajesh Kumar assigned as advocate for the case.',
    date: '2024-03-22',
    type: 'update',
  },
  {
    id: 'timeline-3',
    caseId: 'case-1',
    title: 'Initial Hearing',
    description: 'First hearing in the magistrate court.',
    date: '2024-05-10',
    type: 'hearing',
  },
];

export const mockCases: Case[] = [
  {
    id: 'case-1',
    citizenId: 'cit-1',
    advocateId: 'adv-1',
    stationId: 'ps-1',
    title: 'Traffic Accident Case',
    description:
      'Traffic accident case involving a motorist and a pedestrian. Seeking compensation for injuries.',
    category: 'criminal',
    status: 'in_progress',
    caseNumber: 'CR/2024/0001',
    filedDate: '2024-03-15',
    updatedDate: '2024-04-10',
    documents: [
      {
        id: 'doc-1',
        caseId: 'case-1',
        name: 'FIR Copy',
        url: '/documents/fir-001.pdf',
        type: 'pdf',
        uploadedDate: '2024-03-15',
        uploadedBy: 'po-1',
      },
      {
        id: 'doc-2',
        caseId: 'case-1',
        name: 'Medical Report',
        url: '/documents/medical-report-001.pdf',
        type: 'pdf',
        uploadedDate: '2024-03-20',
        uploadedBy: 'cit-1',
      },
    ],
    notes: caseNotes,
    timeline: timelineEvents,
    budget: 50000,
    spent: 25000,
  },
  {
    id: 'case-2',
    citizenId: 'cit-2',
    advocateId: 'adv-2',
    title: 'Property Dispute Case',
    description:
      'Boundary dispute between neighboring properties. Seeking legal clarification on land ownership.',
    category: 'property',
    status: 'open',
    caseNumber: 'CV/2024/0045',
    filedDate: '2024-04-01',
    updatedDate: '2024-04-08',
    documents: [
      {
        id: 'doc-3',
        caseId: 'case-2',
        name: 'Land Deed',
        url: '/documents/deed-001.pdf',
        type: 'pdf',
        uploadedDate: '2024-04-01',
        uploadedBy: 'cit-2',
      },
    ],
    notes: [
      {
        id: 'note-3',
        caseId: 'case-2',
        authorId: 'adv-2',
        authorName: 'Priya Sharma',
        content:
          'Reviewed property documents. Need to file counter-claim. Suggest mediation before court proceedings.',
        createdAt: '2024-04-08',
        isPrivate: false,
      },
    ],
    timeline: [
      {
        id: 'timeline-4',
        caseId: 'case-2',
        title: 'Case Filed',
        description: 'Civil suit filed for property boundary dispute.',
        date: '2024-04-01',
        type: 'filing',
      },
    ],
    budget: 40000,
    spent: 8000,
  },
];

export const mockFeedback: Feedback[] = [
  {
    id: 'fb-1',
    userId: 'cit-1',
    userName: 'Mohan Singh',
    userEmail: 'mohan@example.com',
    userRole: 'customer',
    rating: 5,
    category: 'improvement',
    subject: 'Great advocate matching feature!',
    message: 'The platform helped me find the right advocate very quickly. The interface is intuitive and easy to navigate.',
    status: 'resolved',
    createdAt: '2024-04-01T10:30:00',
    response: 'Thank you for the positive feedback! We&apos;re glad you found the right advocate for your case.',
    respondedAt: '2024-04-02T14:15:00',
  },
  {
    id: 'fb-2',
    userId: 'adv-1',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh@legalconnect.com',
    userRole: 'advocate',
    rating: 4,
    category: 'feature',
    subject: 'Request: Document management improvements',
    message: 'Would like to see better document organization and tagging features for case management.',
    status: 'reviewed',
    createdAt: '2024-04-03T09:45:00',
  },
  {
    id: 'fb-3',
    userId: 'cit-2',
    userName: 'Anjali Verma',
    userEmail: 'anjali@example.com',
    userRole: 'customer',
    rating: 4,
    category: 'improvement',
    subject: 'Case timeline clarity',
    message: 'The case timeline is helpful but would benefit from email notifications on major updates.',
    status: 'new',
    createdAt: '2024-04-05T15:20:00',
  },
];

// Available Cases for Advocates
export const mockAvailableCases: AvailableCase[] = [
  {
    id: 'case-avail-1',
    title: 'Property Boundary Dispute',
    description: 'Client needs help with property boundary dispute with neighbor. Survey maps and documents available.',
    category: 'property',
    budget: 25000,
    urgency: 'high',
    location: 'Mumbai, Maharashtra',
    customerId: 'cust-1',
    customerName: 'Mohan Singh',
    postedDate: '2024-04-20',
    requirements: ['Property Law Expertise', 'Documentation Review', 'Court Representation'],
    status: 'available'
  },
  {
    id: 'case-avail-2',
    title: 'Employment Termination Case',
    description: 'Wrongful termination from corporate job. Need legal assistance for compensation claim.',
    category: 'labor',
    budget: 15000,
    urgency: 'medium',
    location: 'Delhi, NCR',
    customerId: 'cust-2',
    customerName: 'Anjali Verma',
    postedDate: '2024-04-19',
    requirements: ['Labor Law', 'Negotiation Skills', 'Documentation'],
    status: 'available'
  },
  {
    id: 'case-avail-3',
    title: 'Divorce Proceedings',
    description: 'Mutual consent divorce with child custody matters. Need peaceful resolution.',
    category: 'family',
    budget: 30000,
    urgency: 'low',
    location: 'Bangalore, Karnataka',
    customerId: 'cust-3',
    customerName: 'Rahul Sharma',
    postedDate: '2024-04-18',
    requirements: ['Family Law', 'Mediation', 'Child Custody'],
    status: 'claimed',
    claimedBy: 'adv-2',
    claimedAt: '2024-04-20'
  }
];

// Internship Applications
export const mockInternshipApplications: InternshipApplication[] = [
  {
    id: 'intern-1',
    advocateId: 'adv-1',
    studentName: 'Priya Nair',
    studentEmail: 'priya.nair@lawcollege.edu',
    studentPhone: '+91-9876543299',
    education: 'LLB 3rd Year',
    university: 'National Law School',
    year: '2025',
    resume: '/resume/priya_nair.pdf',
    coverLetter: 'Interested in criminal law internship to gain practical experience.',
    appliedDate: '2024-04-15',
    status: 'pending',
    experience: '6 months legal aid clinic',
    skills: ['Legal Research', 'Document Drafting', 'Client Interviewing']
  },
  {
    id: 'intern-2',
    advocateId: 'adv-1',
    studentName: 'Amit Kumar',
    studentEmail: 'amit.kumar@lawcollege.edu',
    studentPhone: '+91-9876543300',
    education: 'LLB 2nd Year',
    university: 'Delhi Law College',
    year: '2026',
    resume: '/resume/amit_kumar.pdf',
    coverLetter: 'Eager to learn constitutional law from experienced advocate.',
    appliedDate: '2024-04-10',
    status: 'reviewed',
    experience: '3 months moot court',
    skills: ['Legal Writing', 'Case Analysis', 'Public Speaking']
  },
  {
    id: 'intern-3',
    advocateId: 'adv-2',
    studentName: 'Sneha Reddy',
    studentEmail: 'sneha.reddy@lawcollege.edu',
    studentPhone: '+91-9876543301',
    education: 'LLM 1st Year',
    university: 'Hyderabad Law University',
    year: '2025',
    resume: '/resume/sneha_reddy.pdf',
    coverLetter: 'Specializing in family law, want to learn from expert.',
    appliedDate: '2024-04-12',
    status: 'accepted',
    experience: '1 year family law firm',
    skills: ['Family Law', 'Mediation', 'Counseling']
  }
];

// Nearby Advocates for Customers
export const mockNearbyAdvocates: NearbyAdvocate[] = [
  {
    id: 'adv-1',
    name: 'Rajesh Kumar',
    specializations: ['Criminal Law', 'Constitutional Law', 'Corporate Law'],
    rating: 4.8,
    experience: 15,
    hourlyRate: 2500,
    distance: 0.8,
    isAvailable: true,
    location: {
      latitude: 19.0760,
      longitude: 72.8777,
      address: '123, Bandra West, Mumbai, Maharashtra 400050'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh',
    phone: '+91-9876543210',
    email: 'rajesh@legalconnect.com'
  },
  {
    id: 'adv-2',
    name: 'Priya Sharma',
    specializations: ['Family Law', 'Property Rights', 'Women Rights'],
    rating: 4.9,
    experience: 8,
    hourlyRate: 2000,
    distance: 1.2,
    isAvailable: true,
    location: {
      latitude: 19.0822,
      longitude: 72.8816,
      address: '456, Andheri East, Mumbai, Maharashtra 400069'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    phone: '+91-9876543211',
    email: 'priya@legalconnect.com'
  },
  {
    id: 'adv-3',
    name: 'Amit Patel',
    specializations: ['Labor Law', 'Employment Rights', 'Dispute Resolution'],
    rating: 4.7,
    experience: 12,
    hourlyRate: 1800,
    distance: 2.5,
    isAvailable: true,
    location: {
      latitude: 19.1193,
      longitude: 72.8557,
      address: '789, Goregaon, Mumbai, Maharashtra 400063'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit',
    phone: '+91-9876543212',
    email: 'amit@legalconnect.com'
  },
  {
    id: 'adv-4',
    name: 'Sneha Reddy',
    specializations: ['Property Law', 'Real Estate', 'Civil Litigation'],
    rating: 4.6,
    experience: 6,
    hourlyRate: 1500,
    distance: 3.1,
    isAvailable: false,
    location: {
      latitude: 19.1355,
      longitude: 72.8424,
      address: '234, Powai, Mumbai, Maharashtra 400076'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha',
    phone: '+91-9876543213',
    email: 'sneha@legalconnect.com'
  },
  {
    id: 'adv-5',
    name: 'Vikram Singh',
    specializations: ['Tax Law', 'Corporate Law', 'Business Compliance'],
    rating: 4.8,
    experience: 11,
    hourlyRate: 2800,
    distance: 4.2,
    isAvailable: true,
    location: {
      latitude: 19.0992,
      longitude: 72.8748,
      address: '567, Worli, Mumbai, Maharashtra 400030'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram',
    phone: '+91-9876543214',
    email: 'vikram@legalconnect.com'
  }
];

// Feedback Storage Manager
export class FeedbackStorage {
  static addFeedback(feedback: Feedback) {
    mockFeedback.push(feedback);
  }

  static getFeedbackByUserId(userId: string) {
    return mockFeedback.filter(f => f.userId === userId);
  }

  static getAllFeedback() {
    return mockFeedback;
  }
}

// Export functions for backward compatibility
export const addFeedback = FeedbackStorage.addFeedback;
export const getFeedback = FeedbackStorage.getAllFeedback;
export const updateFeedbackStatus = (feedbackId: string, status: 'new' | 'reviewed' | 'resolved', response?: string) => {
  const feedback = mockFeedback.find(f => f.id === feedbackId);
  if (feedback) {
    feedback.status = status;
    if (response) {
      feedback.response = response;
      feedback.respondedAt = new Date().toISOString();
    }
  }
};
