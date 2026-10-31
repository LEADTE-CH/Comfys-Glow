import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types/index.ts';
import { supabase } from '../lib/supabase.ts';

interface RegisterUserData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  city?: string;
  state?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterUserData) => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await readJson<{ user?: User | null }>(response);
      if (!response.ok || !data?.user) {
        if (response.status === 401) await supabase?.auth.signOut();
        setUser(null);
        return;
      }
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching current user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.removeItem('cg_auth_token');
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const accessToken = session?.access_token || null;
      setToken(accessToken);
      if (accessToken) {
        void fetchCurrentUser(accessToken);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error('Error restoring Supabase session:', error);
        setLoading(false);
        return;
      }
      if (!data.session) setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured for this website yet.' };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    if (!data.session) return { success: false, error: 'Supabase did not create an authenticated session.' };

    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const profile = await readJson<{ user?: User | null }>(response);
      if (!response.ok || !profile?.user) {
        await supabase.auth.signOut();
        return { success: false, error: 'Your Supabase account has no store profile. Complete the data migration first.' };
      }
      setUser(profile.user);
      setToken(data.session.access_token);
      return { success: true };
    } catch (error) {
      await supabase.auth.signOut();
      return { success: false, error: error instanceof Error ? error.message : 'Could not load your store profile.' };
    }
  };

  const register = async (userData: RegisterUserData) => {
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured for this website yet.' };
    }
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const result = await readJson<{ error?: string }>(response);
      if (!response.ok) return { success: false, error: result?.error || 'Registration failed.' };
      return login(userData.email, userData.password);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  };

  const sendPasswordReset = async (email: string) => {
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured for this website yet.' };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return error
      ? { success: false, error: error.message }
      : { success: true };
  };

  const updatePassword = async (password: string) => {
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured for this website yet.' };
    }
    const { error } = await supabase.auth.updateUser({ password });
    return error
      ? { success: false, error: error.message }
      : { success: true };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (supabase) {
      void supabase.auth.signOut().then(({ error }) => {
        if (error) console.error('Supabase sign-out failed:', error);
      });
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!token) return false;
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await readJson<{ user?: User }>(response);
      if (!response.ok || !data?.user) return false;
      setUser(data.user);
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  const refreshUser = async () => {
    if (token) await fetchCurrentUser(token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        sendPasswordReset,
        updatePassword,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
