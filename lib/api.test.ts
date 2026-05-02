/**
 * Frontend API Test Suite
 * 
 * This file contains test cases for all frontend API calls.
 * These tests verify that the API service layer is correctly configured
 * and matches the backend endpoints.
 */

import { authApi, profileApi, advocatesApi, casesApi, draftsApi, feedbackApi, ecourtsApi } from './api';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Auth API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('register - should call correct endpoint with correct data', async () => {
    const mockResponse = { data: { user: { id: 1, email: 'test@test.com' } } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const userData = {
      email: 'test@test.com',
      name: 'Test User',
      role: 'customer',
      password: 'password123',
      password_confirm: 'password123',
    };

    await authApi.register(userData);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounts/register/'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(userData),
      })
    );
  });

  test('login - should call correct endpoint', async () => {
    const mockResponse = { data: { access: 'token', user: { id: 1 } } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await authApi.login('test@test.com', 'password123');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounts/login/'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
      })
    );
  });

  test('logout - should call correct endpoint', async () => {
    const mockResponse = { data: { message: 'Logged out' } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await authApi.logout('refresh_token');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounts/logout/'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ refresh: 'refresh_token' }),
      })
    );
  });
});

describe('Profile API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('accessToken', 'test_token');
  });

  test('getProfile - should call correct endpoint with auth', async () => {
    const mockResponse = { data: { id: 1, email: 'test@test.com' } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await profileApi.getProfile();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounts/profile/'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test_token',
        }),
      })
    );
  });

  test('updateProfile - should call correct endpoint with PUT', async () => {
    const mockResponse = { data: { id: 1, name: 'Updated Name' } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await profileApi.updateProfile({ name: 'Updated Name' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounts/profile/update/'),
      expect.objectContaining({
        method: 'PUT',
      })
    );
  });

  test('getStats - should call correct endpoint', async () => {
    const mockResponse = { data: { role: 'advocate', cases_count: 5 } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await profileApi.getStats();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounts/stats/')
    );
  });
});

describe('Advocates API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('accessToken', 'test_token');
  });

  test('listAdvocates - should call correct endpoint', async () => {
    const mockResponse = { data: [{ id: 1, name: 'Advocate 1' }] };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await advocatesApi.listAdvocates({ specialization: 'Criminal Law' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounts/advocates/?specialization=Criminal%20Law')
    );
  });

  test('listPendingAdvocates - should call correct endpoint', async () => {
    const mockResponse = { data: [{ id: 1, name: 'Pending Advocate' }] };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await advocatesApi.listPendingAdvocates();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounts/advocates/pending/')
    );
  });

  test('approveAdvocate - should call correct endpoint with POST', async () => {
    const mockResponse = { data: { message: 'Approved' } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await advocatesApi.approveAdvocate('user-123');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounts/advocates/user-123/approve/'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  test('rejectAdvocate - should call correct endpoint with reason', async () => {
    const mockResponse = { data: { message: 'Rejected' } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await advocatesApi.rejectAdvocate('user-123', 'Invalid ID');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounts/advocates/user-123/reject/'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ rejection_reason: 'Invalid ID' }),
      })
    );
  });
});

describe('Cases API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('accessToken', 'test_token');
  });

  test('listCases - should call correct endpoint', async () => {
    const mockResponse = { data: [{ id: 1, title: 'Case 1' }] };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await casesApi.listCases({ status: 'open' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cases/?status=open')
    );
  });

  test('createCase - should call correct endpoint with POST', async () => {
    const mockResponse = { data: { id: 1, title: 'New Case' } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await casesApi.createCase({
      title: 'New Case',
      case_type: 'civil',
      description: 'Test description',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cases/'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  test('updateCaseStatus - should call correct endpoint', async () => {
    const mockResponse = { data: { id: 1, status: 'in_progress' } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await casesApi.updateCaseStatus('case-123', { status: 'in_progress' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cases/case-123/status/'),
      expect.objectContaining({
        method: 'PUT',
      })
    );
  });

  test('createHearing - should call correct endpoint', async () => {
    const mockResponse = { data: { id: 1, date: '2024-01-01' } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await casesApi.createHearing('case-123', {
      hearing_date: '2024-01-01',
      hearing_type: 'regular',
      purpose: 'Test hearing',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cases/case-123/hearings/'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });
});

describe('Drafts API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('accessToken', 'test_token');
  });

  test('listDrafts - should call correct endpoint', async () => {
    const mockResponse = { data: [{ id: 1, title: 'Draft 1' }] };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await draftsApi.listDrafts();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cases/drafts/')
    );
  });

  test('createDraft - should call correct endpoint with POST', async () => {
    const mockResponse = { data: { id: 1, title: 'New Draft' } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await draftsApi.createDraft({
      advocate: 'advocate-123',
      document_type: 'affidavit',
      requirements: 'Test requirements',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cases/drafts/'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });
});

describe('Feedback API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('accessToken', 'test_token');
  });

  test('listFeedback - should call correct endpoint', async () => {
    const mockResponse = { data: [{ id: 1, subject: 'Feedback 1' }] };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await feedbackApi.listFeedback({ status: 'new' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/feedback/?status=new')
    );
  });

  test('createFeedback - should call correct endpoint with POST', async () => {
    const mockResponse = { data: { id: 1, subject: 'New Feedback' } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await feedbackApi.createFeedback({
      feedback_type: 'bug',
      subject: 'Test Bug',
      message: 'Test message',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/feedback/'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  test('createAdvocateRating - should call correct endpoint', async () => {
    const mockResponse = { data: { id: 1, rating: 5 } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await feedbackApi.createAdvocateRating({
      advocate: 'advocate-123',
      rating: 5,
      communication: 5,
      professionalism: 5,
      expertise: 5,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/feedback/ratings/advocate/'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  test('getAdvocateRatingSummary - should call correct endpoint', async () => {
    const mockResponse = { data: { average_rating: 4.5 } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await feedbackApi.getAdvocateRatingSummary('advocate-123');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/feedback/ratings/advocate/advocate-123/summary/')
    );
  });
});

describe('eCourts API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('accessToken', 'test_token');
  });

  test('getStatus - should call correct endpoint', async () => {
    const mockResponse = { data: { configured: true } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await ecourtsApi.getStatus();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/ecourts/status/')
    );
  });

  test('getCaseByCNR - should call correct endpoint with CNR param', async () => {
    const mockResponse = { data: { case_title: 'Test Case' } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await ecourtsApi.getCaseByCNR('TEST1234567890');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/ecourts/case/?cnr=TEST1234567890')
    );
  });

  test('importCase - should call correct endpoint with POST', async () => {
    const mockResponse = { data: { message: 'Imported' } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await ecourtsApi.importCase({ cnr: 'TEST1234567890' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/ecourts/import/'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  test('searchCases - should call correct endpoint with params', async () => {
    const mockResponse = { data: { results: [] } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await ecourtsApi.searchCases({ court_code: 'DLHC01' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/ecourts/search/?court_code=DLHC01')
    );
  });

  test('getCauseList - should call correct endpoint with params', async () => {
    const mockResponse = { data: { cause_list: [] } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await ecourtsApi.getCauseList('DLHC01', '2024-01-01');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/ecourts/causelist/?court_code=DLHC01&date=2024-01-01')
    );
  });
});
