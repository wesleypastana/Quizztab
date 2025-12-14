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

