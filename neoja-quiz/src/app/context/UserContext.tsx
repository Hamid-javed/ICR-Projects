'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserProgress } from '../types';

interface UserContextType {
  user: User | null;
  progress: UserProgress | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  updateProgress: (questionId: string, timeTaken: number, points: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const checkUserSession = async () => {
      try {
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            // Fetch user progress
            await fetchUserProgress(parsedUser.id);
          }
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const fetchUserProgress = async (userId: string) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/progress/${userId}`);
      const data = await response.json();
      setProgress(data);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const login = async (email: string) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      
      setUser(data.user);
      setProgress(data.progress);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setProgress(null);
    localStorage.removeItem('user');
  };

  const updateProgress = async (questionId: string, timeTaken: number, points: number) => {
    if (!user || !progress) return;

    const newProgress: UserProgress = {
      ...progress,
      answeredQuestions: [
        ...progress.answeredQuestions,
        {
          questionId,
          answeredAt: new Date(),
          timeTaken,
          points,
        },
      ],
      totalScore: progress.totalScore + points,
      dailyScore: progress.dailyScore + points,
      monthlyScore: progress.monthlyScore + points,
      yearlyScore: progress.yearlyScore + points,
    };

    setProgress(newProgress);

    try {
      // TODO: Replace with actual API call
      await fetch(`/api/progress/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProgress),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        progress,
        isLoading,
        login,
        logout,
        updateProgress,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 