import { useState, useEffect } from 'react';
import { profileApi } from '@/lib/api';
import { User, UserStats } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export function useProfile() {
  const { updateUser } = useAuth();
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
        const data = response.data as User;
        setProfile(data);
        updateUser(data); // keep auth session in sync
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<User> & Record<string, any>) => {
    setError(null);
    try {
      const response = await profileApi.updateProfile(profileData);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      if (response.data) {
        const body = response.data as { user?: User; message?: string };
        const updatedUser = body.user ?? (response.data as User);
        setProfile(updatedUser);
        updateUser(updatedUser); // ← sync to AuthContext + localStorage
        return { success: true, data: updatedUser };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const changePassword = async (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => {
    setError(null);
    try {
      const response = await profileApi.changePassword(data);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to change password';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  useEffect(() => { fetchProfile(); }, []); // eslint-disable-line

  return { profile, isLoading, error, refetch: fetchProfile, updateProfile, changePassword };
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
      if (response.error) setError(response.error);
      else if (response.data) setStats(response.data as UserStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []); // eslint-disable-line

  return { stats, isLoading, error, refetch: fetchStats };
}
