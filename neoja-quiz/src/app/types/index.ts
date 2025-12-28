export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  lastActive: Date;
  progress?: UserProgress;
}

export interface QuizQuestion {
  id: string;
  locationId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  hint: string;
  nextLocationHint: string;
}

export interface UserProgress {
  userId: string;
  answeredQuestions: {
    questionId: string;
    answeredAt: Date;
    timeTaken: number;
    points: number;
  }[];
  totalScore: number;
  dailyScore: number;
  monthlyScore: number;
  yearlyScore: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  timeFrame: 'daily' | 'monthly' | 'yearly';
  rank: number;
  answeredQuestions: number;
  averageTimePerQuestion: number;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  questionId: string;
} 