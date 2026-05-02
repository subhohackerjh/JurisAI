import { useState, useEffect } from 'react';
import { draftsApi } from '@/lib/api';
import { DraftRequest } from '@/lib/types';

export function useDrafts() {
  const [drafts, setDrafts] = useState<DraftRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await draftsApi.listDrafts();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setDrafts(response.data as DraftRequest[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  return {
    drafts,
    isLoading,
    error,
    refetch: fetchDrafts,
  };
}

export function useDraftDetail(id: string) {
  const [draft, setDraft] = useState<DraftRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDraft = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await draftsApi.getDraftDetail(id);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setDraft(response.data as DraftRequest);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch draft');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDraft();
    }
  }, [id]);

  return {
    draft,
    isLoading,
    error,
    refetch: fetchDraft,
  };
}

export function useCreateDraft() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDraft = async (draftData: {
    advocate: string;
    document_type: string;
    requirements: string;
    additional_notes?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await draftsApi.createDraft(draftData);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create draft';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createDraft,
    isLoading,
    error,
  };
}

export function useUpdateDraftStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDraftStatus = async (id: string, data: {
    status?: string;
    agreed_price?: number;
    expected_delivery?: string;
    draft_document?: string;
    final_document?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await draftsApi.updateDraftStatus(id, data);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update draft';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateDraftStatus,
    isLoading,
    error,
  };
}
