import { useState, useEffect } from 'react';
import { internshipsApi } from '@/lib/api';
import { Internship, InternshipApplication } from '@/lib/types';

export function useInternships(params?: { practice_area?: string; mine?: boolean }) {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInternships = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await internshipsApi.listInternships(params);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const data = response.data as any;
        setInternships(Array.isArray(data) ? data : data.results ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch internships');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [params?.practice_area, params?.mine]);

  return {
    internships,
    isLoading,
    error,
    refetch: fetchInternships,
  };
}

export function useInternshipDetail(id: string) {
  const [internship, setInternship] = useState<Internship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInternship = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await internshipsApi.getInternship(id);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setInternship(response.data as Internship);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch internship');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInternship();
    }
  }, [id]);

  return {
    internship,
    isLoading,
    error,
    refetch: fetchInternship,
  };
}

export function useCreateInternship() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInternship = async (data: {
    title: string;
    description: string;
    practice_area?: string;
    duration_months?: number;
    stipend?: number;
    openings?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await internshipsApi.createInternship(data);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create internship';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { createInternship, isLoading, error };
}

export function useMyApplications() {
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await internshipsApi.myApplications();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const data = response.data as any;
        setApplications(Array.isArray(data) ? data : data.results ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  const apply = async (internshipId: string, formData: FormData) => {
    setError(null);
    try {
      const response = await internshipsApi.apply(internshipId, formData);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      await fetchApplications();
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateStatus = async (applicationId: string, status: 'shortlisted' | 'selected' | 'rejected') => {
    setError(null);
    try {
      const response = await internshipsApi.updateApplicationStatus(applicationId, status);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      await fetchApplications();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update application status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const uploadOfferLetter = async (applicationId: string, formData: FormData) => {
    setError(null);
    try {
      const response = await internshipsApi.uploadOfferLetter(applicationId, formData);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      await fetchApplications();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload offer letter';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return {
    applications,
    isLoading,
    error,
    refetch: fetchApplications,
    apply,
    updateStatus,
    uploadOfferLetter,
  };
}
