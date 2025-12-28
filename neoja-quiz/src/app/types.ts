export interface QuizQuestion {
  _id: string;
  questionId: number;
  questionText: string;
  options: {
    _id: string;
    text: string;
    isCorrect: boolean;
  }[];
  correctAnswer: number;
  category: string;
  difficulty: string;
  qrCode?: string;
  qrCodeId?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
} 