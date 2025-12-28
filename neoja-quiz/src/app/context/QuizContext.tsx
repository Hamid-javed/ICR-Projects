'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface Question {
  _id: string;
  questionId: string;
  questionText: string;
  options: Array<{
    _id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

interface QuizSettings {
  questionTimeLimit: number;
  scorePerQuestion: number;
}

interface QuizContextType {
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  answeredQuestions: string[];
  currentQuestion: Question | null;
  isQuizComplete: boolean;
  quizSettings: QuizSettings | null;
  selectAnswer: (index: number) => void;
  moveToNextQuestion: () => void;
  resetQuiz: () => void;
  fetchUserScore: () => Promise<void>;
  fetchQuizSettings: () => Promise<void>;
  hasAnsweredQuestion: (questionId: string) => boolean;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [quizSettings, setQuizSettings] = useState<QuizSettings | null>(null);

  const fetchQuizSettings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/settings`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("🚀 ~ fetchQuizSettings ~ response:", response)

      if (response.ok) {
        const data = await response.json();
        setQuizSettings(data.data.settings);
      }
    } catch (error) {
      console.error('Error fetching quiz settings:', error);
    }
  };

  const fetchTotalQuestions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/questions/count`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("🚀 ~ fetchTotalQuestions ~ response:", response)

      if (response.ok) {
        const data = await response.json();
        setTotalQuestions(data.data.count);
      }
    } catch (error) {
      console.error('Error fetching total questions:', error);
    }
  };

  const fetchUserScore = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log("🚀 ~ fetchUserScore ~ response:", response)

      if (response.ok) {
        const data = await response.json();
        setScore(data.data.user.score || 0);
        setCurrentQuestionIndex(data.data.user.questionsAttempted?.length || 0);
        if (data.data.user.questionsAttempted) {
          setAnsweredQuestions(data.data.user.questionsAttempted.map((q: any) => q.questionId));
        }
      } else if (response.status === 401) {
        // Handle unauthorized error
        console.error('Authentication failed');
        Cookies.remove('token');
        // You might want to redirect to login page here
      }
    } catch (error) {
      console.error('Error fetching user score:', error);
    }
  };

  useEffect(() => {
    fetchUserScore();
    fetchQuizSettings();
    fetchTotalQuestions();
  }, []);

  const selectAnswer = (index: number) => {
    if (!currentQuestion) return;
    
    setAnsweredQuestions(prev => [...prev, currentQuestion.questionId]);
    fetchUserScore();
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnsweredQuestions([]);
    fetchUserScore();
  };

  const isQuizComplete = currentQuestionIndex >= totalQuestions;
  console.log("🚀 ~ QuizProvider ~ answeredQuestions:", answeredQuestions)
  const hasAnsweredQuestion = (questionId: string) => answeredQuestions.includes(questionId);

  return (
    <QuizContext.Provider
      value={{
        currentQuestionIndex,
        score,
        totalQuestions,
        answeredQuestions,
        currentQuestion,
        isQuizComplete,
        quizSettings,
        selectAnswer,
        moveToNextQuestion,
        resetQuiz,
        fetchUserScore,
        fetchQuizSettings,
        hasAnsweredQuestion,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
} 