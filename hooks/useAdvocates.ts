import { useState, useEffect } from 'react';
import { advocatesApi } from '@/lib/api';
import { User } from '@/lib/types';

export function useAdvocates(params?: {
  specialization?: string;
  availability?: string;
  search?: string;
  nearby?: boolean;
}) {
  const [advocates, setAdvocates] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvocates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await advocatesApi.listAdvocates(params);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const data = response.data as any;
        setAdvocates(Array.isArray(data) ? data : data.results ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch advocates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvocates();
  }, [params?.specialization, params?.availability, params?.search, params?.nearby]);

  return {
    advocates,
    isLoading,
    error,
    refetch: fetchAdvocates,
  };
}

export function useAdvocateDetail(id: string) {
  const [advocate, setAdvocate] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvocate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await advocatesApi.getAdvocateDetail(id);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setAdvocate(response.data as User);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch advocate');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAdvocate();
    }
  }, [id]);

  return {
    advocate,
    isLoading,
    error,
    refetch: fetchAdvocate,
  };
}

// Advocate Approval Hooks (Admin)
export function usePendingAdvocates() {
  const [pendingAdvocates, setPendingAdvocates] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingAdvocates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await advocatesApi.listPendingAdvocates();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const data = response.data as any;
        setPendingAdvocates(Array.isArray(data) ? data : data.results ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending advocates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAdvocates();
  }, []);

  return {
    pendingAdvocates,
    isLoading,
    error,
    refetch: fetchPendingAdvocates,
  };
}

export function useApproveAdvocate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveAdvocate = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await advocatesApi.approveAdvocate(userId);
      if (response.error) {
        const errorMessage = response.error;
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to approve advocate';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { approveAdvocate, isLoading, error };
}

export function useRejectAdvocate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rejectAdvocate = async (userId: string, rejectionReason?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await advocatesApi.rejectAdvocate(userId, rejectionReason);
      if (response.error) {
        const errorMessage = response.error;
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reject advocate';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { rejectAdvocate, isLoading, error };
}
