export interface Question {
  id: string;
  text: string;
  correctAnswer: string;
  options: string[];
  theme?: string;
}

export interface Quiz {
  questions: Question[];
  metadata?: {
    title?: string;
    description?: string;
  };
}

export interface QuizConfig {
  questionsPerRound: number;
  optionsPerQuestion: number;
  timerPerQuestion: number;
  themes: string[];
  enableMusic: boolean;
  backgroundColor: string;
  textColor: string;
  videoFormat: 'webm' | 'mp4';
  videoResolution: '1080x1920' | '720x1280' | '540x960';
}

export interface VideoJob {
  id: string;
  quizId: string;
  config: QuizConfig;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizImport {
  id: string;
  quiz: Quiz;
  fileName?: string;
  createdAt: string;
}

export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  questionsPerRound: 10,
  optionsPerQuestion: 4,
  timerPerQuestion: 10,
  themes: [],
  enableMusic: true,
  backgroundColor: '#1a1a2e',
  textColor: '#ffffff',
  videoFormat: 'webm',
  videoResolution: '1080x1920',
};

