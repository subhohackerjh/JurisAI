import { useState, useEffect } from 'react';
import { ecourtsApi } from '@/lib/api';
import type {
  ECourtsStatus,
  ECourtsCaseResponse,
  ECourtsImportResponse,
  ECourtsSearchResult,
  ECourtsCauseListResponse,
} from '@/lib/types';

// Status Hook
export const useECourtsStatus = () => {
  const [status, setStatus] = useState<ECourtsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const response = await ecourtsApi.getStatus();
        if (response.data) {
          setStatus(response.data as ECourtsStatus);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch eCourts status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  return { status, isLoading, error };
};

// Case by CNR Hook
export const useECourtsCaseByCNR = (cnr: string) => {
  const [caseData, setCaseData] = useState<ECourtsCaseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCase = async () => {
    if (!cnr) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await ecourtsApi.getCaseByCNR(cnr);
      if (response.data) {
        setCaseData(response.data as ECourtsCaseResponse);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch case';
      setError(errorMessage);
      setCaseData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cnr) {
      fetchCase();
    }
  }, [cnr]);

  return { caseData, isLoading, error, refetch: fetchCase };
};

// Import Case Hook
export const useImportECourtsCase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importCase = async (data: {
    cnr: string;
    advocate_id?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ecourtsApi.importCase(data);
      return { success: true, data: response.data as ECourtsImportResponse };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to import case';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { importCase, isLoading, error };
};

// Search Cases Hook
export const useECourtsSearch = (params: {
  court_code?: string;
  case_type?: string;
  filing_year?: number;
  litigant_name?: string;
  advocate_name?: string;
}) => {
  const [results, setResults] = useState<ECourtsSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ecourtsApi.searchCases(params);
      if (response.data) {
        setResults(response.data as ECourtsSearchResult);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search cases';
      setError(errorMessage);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only auto-search if at least one parameter is provided
    if (Object.values(params).some(v => v !== undefined && v !== null && v !== '')) {
      search();
    }
  }, [params.court_code, params.case_type, params.filing_year, params.litigant_name, params.advocate_name]);

  return { results, isLoading, error, search };
};

// Cause List Hook
export const useECourtsCauseList = (court_code: string, date: string) => {
  const [causeList, setCauseList] = useState<ECourtsCauseListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCauseList = async () => {
    if (!court_code || !date) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await ecourtsApi.getCauseList(court_code, date);
      if (response.data) {
        setCauseList(response.data as ECourtsCauseListResponse);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch cause list';
      setError(errorMessage);
      setCauseList(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (court_code && date) {
      fetchCauseList();
    }
  }, [court_code, date]);

  return { causeList, isLoading, error, refetch: fetchCauseList };
};
