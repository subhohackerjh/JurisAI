import { useState, useEffect } from 'react';
import { profileApi } from '@/lib/api';
import { User, UserStats } from '@/lib/types';

export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await profileApi.getProfile();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setProfile(response.data as User);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    setError(null);
    try {
      const response = await profileApi.updateProfile(profileData);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      } else if (response.data) {
        setProfile(response.data as User);
        return { success: true, data: response.data };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (passwordData: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => {
    setError(null);
    try {
      const response = await profileApi.changePassword(passwordData);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile,
    changePassword,
  };
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await profileApi.getStats();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setStats(response.data as UserStats);
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
