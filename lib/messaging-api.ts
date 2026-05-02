import { apiCall } from './api';

export interface Conversation {
  id: string;
  customer: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  advocate: {
    id: string;
    name: string;
    email: string;
    role: string;
    specialization?: string;
    experience_years?: number;
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
  messages: Message[];
  unread_count: number;
}

export interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  content: string;
  timestamp: string;
  is_read: boolean;
  read_at?: string;
  attachments?: any[];
}

export interface CreateMessageData {
  content: string;
}

export const messagingApi = {
  // Conversations
  listConversations: () => {
    return apiCall('/messaging/conversations/', { method: 'GET' });
  },

  startConversation: (advocateId: string) => {
    return apiCall(`/messaging/conversations/start/${advocateId}/`, { method: 'POST' });
  },

  getConversation: (conversationId: string) => {
    return apiCall(`/messaging/conversations/${conversationId}/`, { method: 'GET' });
  },

  // Messages
  sendMessage: (conversationId: string, data: CreateMessageData) => {
    return apiCall(`/messaging/conversations/${conversationId}/send/`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  markMessagesRead: (conversationId: string) => {
    return apiCall(`/messaging/conversations/${conversationId}/mark-read/`, { method: 'POST' });
  },

  // Case Creation Workflow
  requestCase: (conversationId: string, caseDetails: any) => {
    return apiCall(`/messaging/conversations/${conversationId}/request-case/`, {
      method: 'POST',
      body: JSON.stringify({ case_details: caseDetails })
    });
  },

  confirmCase: (conversationId: string, advocateNotes?: string) => {
    return apiCall(`/messaging/conversations/${conversationId}/confirm-case/`, {
      method: 'POST',
      body: JSON.stringify({ advocate_notes: advocateNotes || '' })
    });
  },

  rejectCase: (conversationId: string, reason?: string) => {
    return apiCall(`/messaging/conversations/${conversationId}/reject-case/`, {
      method: 'POST',
      body: JSON.stringify({
        reason: reason || 'No reason provided',
        advocate_notes: ''
      })
    });
  },
};
