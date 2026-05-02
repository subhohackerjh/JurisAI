import { useState, useEffect } from 'react';
import { feedbackApi } from '@/lib/api';
import type {
  Feedback,
  FeedbackResponse,
  AdvocateRating,
  SystemRating,
  AdvocateRatingSummary,
  SystemRatingSummary,
  FeedbackStats,
} from '@/lib/types';

// Feedback Hooks
export const useFeedback = (params?: {
  status?: string;
  type?: string;
  priority?: string;
}) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setIsLoading(true);
        const response = await feedbackApi.listFeedback(params);
        if (response.data) {
          const data = response.data as any;
          setFeedbacks(Array.isArray(data) ? data : data.results || []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch feedbacks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, [params?.status, params?.type, params?.priority]);

  return { feedbacks, isLoading, error };
};

export const useFeedbackDetail = (id: string) => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setIsLoading(true);
        const response = await feedbackApi.getFeedbackDetail(id);
        if (response.data) {
          setFeedback(response.data as Feedback);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch feedback');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchFeedback();
    }
  }, [id]);

  return { feedback, isLoading, error };
};

export const useCreateFeedback = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFeedback = async (data: {
    feedback_type: string;
    subject: string;
    message: string;
    related_case?: string;
    related_draft?: string;
    contact_email?: string;
    contact_phone?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await feedbackApi.createFeedback(data);
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create feedback';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { createFeedback, isLoading, error };
};

export const useUpdateFeedback = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFeedback = async (id: string, data: {
    status?: string;
    priority?: string;
    assigned_to?: string;
    admin_notes?: string;
    resolution?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await feedbackApi.updateFeedback(id, data);
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update feedback';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { updateFeedback, isLoading, error };
};

// Feedback Response Hooks
export const useFeedbackResponses = (feedbackId: string) => {
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setIsLoading(true);
        const response = await feedbackApi.listFeedbackResponses(feedbackId);
        if (response.data) {
          const data = response.data as any;
          setResponses(Array.isArray(data) ? data : data.results || []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch responses');
      } finally {
        setIsLoading(false);
      }
    };

    if (feedbackId) {
      fetchResponses();
    }
  }, [feedbackId]);

  return { responses, isLoading, error };
};

export const useCreateFeedbackResponse = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createResponse = async (feedbackId: string, data: {
    message: string;
    is_internal?: boolean;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await feedbackApi.createFeedbackResponse(feedbackId, data);
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create response';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { createResponse, isLoading, error };
};

// Advocate Rating Hooks
export const useAdvocateRatings = (params?: { advocate?: string }) => {
  const [ratings, setRatings] = useState<AdvocateRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setIsLoading(true);
        const response = await feedbackApi.listAdvocateRatings(params);
        if (response.data) {
          const data = response.data as any;
          setRatings(Array.isArray(data) ? data : data.results || []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch ratings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [params?.advocate]);

  return { ratings, isLoading, error };
};

export const useAdvocateRatingDetail = (id: string) => {
  const [rating, setRating] = useState<AdvocateRating | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        setIsLoading(true);
        const response = await feedbackApi.getAdvocateRatingDetail(id);
        if (response.data) {
          setRating(response.data as AdvocateRating);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch rating');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRating();
    }
  }, [id]);

  return { rating, isLoading, error };
};

export const useCreateAdvocateRating = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRating = async (data: {
    advocate: string;
    related_case?: string;
    related_draft?: string;
    rating: number;
    review?: string;
    professionalism?: number;
    communication?: number;
    expertise?: number;
    timeliness?: number;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await feedbackApi.createAdvocateRating(data);
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create rating';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { createRating, isLoading, error };
};

export const useUpdateAdvocateRating = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRating = async (id: string, data: {
    rating?: number;
    review?: string;
    professionalism?: number;
    communication?: number;
    expertise?: number;
    timeliness?: number;
    is_public?: boolean;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await feedbackApi.updateAdvocateRating(id, data);
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update rating';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { updateRating, isLoading, error };
};

export const useDeleteAdvocateRating = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRating = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await feedbackApi.deleteAdvocateRating(id);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete rating';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteRating, isLoading, error };
};

export const useAdvocateRatingSummary = (advocateId: string) => {
  const [summary, setSummary] = useState<AdvocateRatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const response = await feedbackApi.getAdvocateRatingSummary(advocateId);
        if (response.data) {
          setSummary(response.data as AdvocateRatingSummary);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch rating summary');
      } finally {
        setIsLoading(false);
      }
    };

    if (advocateId) {
      fetchSummary();
    }
  }, [advocateId]);

  return { summary, isLoading, error };
};

// System Rating Hooks
export const useSystemRatings = () => {
  const [ratings, setRatings] = useState<SystemRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setIsLoading(true);
        const response = await feedbackApi.listSystemRatings();
        if (response.data) {
          const data = response.data as any;
          setRatings(Array.isArray(data) ? data : data.results || []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch system ratings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, []);

  return { ratings, isLoading, error };
};

export const useCreateSystemRating = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRating = async (data: {
    rating: number;
    review?: string;
    ease_of_use?: number;
    features?: number;
    support?: number;
    would_recommend?: boolean;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await feedbackApi.createSystemRating(data);
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create system rating';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { createRating, isLoading, error };
};

export const useDeleteSystemRating = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRating = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await feedbackApi.deleteSystemRating(id);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete system rating';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteRating, isLoading, error };
};

export const useSystemRatingSummary = () => {
  const [summary, setSummary] = useState<SystemRatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const response = await feedbackApi.getSystemRatingSummary();
        if (response.data) {
          setSummary(response.data as SystemRatingSummary);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch system rating summary');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return { summary, isLoading, error };
};

// Stats Hook
export const useFeedbackStats = () => {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await feedbackApi.getFeedbackStats();
        if (response.data) {
          setStats(response.data as FeedbackStats);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch feedback stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
};
