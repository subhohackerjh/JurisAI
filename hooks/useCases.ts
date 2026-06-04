import { useState, useEffect } from 'react';
import { casesApi } from '@/lib/api';
import { Case, DashboardStats, Hearing, CaseDocument, CaseUpdate } from '@/lib/types';

export function useCases(params?: {
  status?: string;
  case_type?: string;
  search?: string;
  ordering?: string;
}) {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await casesApi.listCases(params);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const data = response.data as any;
        setCases(Array.isArray(data) ? data : data.results ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cases');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [params?.status, params?.case_type, params?.search, params?.ordering]);

  return {
    cases,
    isLoading,
    error,
    refetch: fetchCases,
  };
}

export function useCaseDetail(id: string) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await casesApi.getCaseDetail(id);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setCaseData(response.data as Case);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch case');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCase();
    }
  }, [id]);

  return {
    case: caseData,
    isLoading,
    error,
    refetch: fetchCase,
  };
}

export function useCreateCase() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCase = async (caseData: {
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
    setIsLoading(true);
    setError(null);

    try {
      const response = await casesApi.createCase(caseData);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create case';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCase,
    isLoading,
    error,
  };
}

export function useCaseDocuments(caseId: string) {
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await casesApi.listDocuments(caseId);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const data = response.data as any;
        setDocuments(Array.isArray(data) ? data : data.results ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocument = async (formData: FormData) => {
    setError(null);
    try {
      const response = await casesApi.uploadDocument(caseId, formData);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      await fetchDocuments();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteDocument = async (documentId: string) => {
    setError(null);
    try {
      const response = await casesApi.deleteDocument(caseId, documentId);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      await fetchDocuments();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    if (caseId) {
      fetchDocuments();
    }
  }, [caseId]);

  return {
    documents,
    isLoading,
    error,
    refetch: fetchDocuments,
    uploadDocument,
    deleteDocument,
  };
}

export function useCaseHearings(caseId: string) {
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHearings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await casesApi.listHearings(caseId);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const data = response.data as any;
        setHearings(Array.isArray(data) ? data : data.results ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hearings');
    } finally {
      setIsLoading(false);
    }
  };

  const createHearing = async (hearingData: {
    hearing_date: string;
    hearing_type: string;
    court_room?: string;
    judge_name?: string;
    purpose: string;
    outcome?: string;
    next_date?: string;
  }) => {
    setError(null);
    try {
      const response = await casesApi.createHearing(caseId, hearingData);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      await fetchHearings();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create hearing';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateHearing = async (hearingId: string, hearingData: {
    hearing_date?: string;
    hearing_type?: string;
    court_room?: string;
    judge_name?: string;
    purpose?: string;
    outcome?: string;
    next_date?: string;
    is_completed?: boolean;
  }) => {
    setError(null);
    try {
      const response = await casesApi.updateHearing(caseId, hearingId, hearingData);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      await fetchHearings();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update hearing';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteHearing = async (hearingId: string) => {
    setError(null);
    try {
      const response = await casesApi.deleteHearing(caseId, hearingId);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      await fetchHearings();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete hearing';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    if (caseId) {
      fetchHearings();
    }
  }, [caseId]);

  return {
    hearings,
    isLoading,
    error,
    refetch: fetchHearings,
    createHearing,
    updateHearing,
    deleteHearing,
  };
}

export function useCaseUpdates(caseId: string) {
  const [updates, setUpdates] = useState<CaseUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpdates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await casesApi.listUpdates(caseId);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const data = response.data as any;
        setUpdates(Array.isArray(data) ? data : data.results ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch updates');
    } finally {
      setIsLoading(false);
    }
  };

  const createUpdate = async (updateData: {
    update_type: string;
    title: string;
    description: string;
    is_customer_visible?: boolean;
  }) => {
    setError(null);
    try {
      const response = await casesApi.createUpdate(caseId, updateData);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      await fetchUpdates();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create update';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    if (caseId) {
      fetchUpdates();
    }
  }, [caseId]);

  return {
    updates,
    isLoading,
    error,
    refetch: fetchUpdates,
    createUpdate,
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await casesApi.getDashboardStats();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setStats(response.data as DashboardStats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}

export function useCaseSearch() {
  const [results, setResults] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCases = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await casesApi.searchCases(query);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const data = response.data as any;
        setResults(Array.isArray(data) ? data : data.results ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    isLoading,
    error,
    searchCases,
  };
}

export function useUpcomingHearings() {
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHearings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await casesApi.getUpcomingHearings();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const data = response.data as any;
        setHearings(Array.isArray(data) ? data : data.results ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hearings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHearings();
  }, []);

  return {
    hearings,
    isLoading,
    error,
    refetch: fetchHearings,
  };
}
