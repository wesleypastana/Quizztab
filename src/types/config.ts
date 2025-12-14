export interface QuizConfig {
  questionsPerRound: number;
  optionsPerQuestion: number;
  timerPerQuestion: number; // em segundos
  themes: string[];
  enableMusic: boolean;
  backgroundColor: string;
  textColor: string;
  videoFormat: 'webm' | 'mp4';
  videoResolution: '1080x1920' | '720x1280' | '540x960';
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

export const VIDEO_RESOLUTIONS = {
  '1080x1920': { width: 1080, height: 1920 },
  '720x1280': { width: 720, height: 1280 },
  '540x960': { width: 540, height: 960 },
} as const;

