import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types.ts';
import { supabase } from '../lib/supabase.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  toggleFavorite: (doctorId: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('mb_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Auth error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('mb_token', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mb_token');
  };

  const toggleFavorite = async (doctorId: string) => {
    if (!user) return;
    try {
      // 1. Always update local backend API first (Guaranteed success)
      const res = await fetch('/api/users/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ doctorId })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => prev ? { ...prev, favoriteDoctorIds: data.favoriteDoctorIds } : null);
      }

      // 2. Safely sync with Supabase in background (non-blocking)
      try {
        const isCurrentlyFavorite = user.favoriteDoctorIds?.includes(doctorId);
        const isUserUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
        const isDocUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doctorId);

        if (isUserUuid && isDocUuid) {
          if (isCurrentlyFavorite) {
            await supabase
              .from('favorites')
              .delete()
              .match({ user_id: user.id, doctor_id: doctorId });
          } else {
            await supabase
              .from('favorites')
              .insert([{ user_id: user.id, doctor_id: doctorId }]);
          }
        }
      } catch (sbErr) {
        console.warn('Supabase favorite sync notice:', sbErr);
      }
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, toggleFavorite, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
