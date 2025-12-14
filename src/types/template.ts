export interface QuizTemplate {
  // Cores
  backgroundColor: string;
  textColor: string;
  questionBgColor: string;
  optionBgColor: string;
  optionHoverColor: string;
  correctAnswerColor: string;
  timerBgColor: string;
  timerProgressColor: string;
  timerTextColor: string;
  
  // Fontes
  questionFont: string;
  questionFontSize: number;
  optionFont: string;
  optionFontSize: number;
  timerFont: string;
  timerFontSize: number;
  letterFontSize: number;
  
  // Estilos
  borderRadius: number;
  optionBorderRadius: number;
  timerBorderRadius: number;
  shadowBlur: number;
  shadowColor: string;
  
  // Espaçamentos
  padding: number;
  optionSpacing: number;
  optionHeight: number;
  
  // Efeitos
  glassmorphism: boolean;
  gradientEnabled: boolean;
  animationSpeed: number;
}

export const DEFAULT_TEMPLATE: QuizTemplate = {
  // Cores
  backgroundColor: '#1a1a2e',
  textColor: '#ffffff',
  questionBgColor: 'rgba(255, 255, 255, 0.15)',
  optionBgColor: 'rgba(255, 255, 255, 0.12)',
  optionHoverColor: 'rgba(255, 255, 255, 0.2)',
  correctAnswerColor: '#4ade80',
  timerBgColor: 'rgba(255, 255, 255, 0.15)',
  timerProgressColor: '#4ade80',
  timerTextColor: '#ffffff',
  
  // Fontes
  questionFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  questionFontSize: 52,
  optionFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  optionFontSize: 38,
  timerFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  timerFontSize: 48,
  letterFontSize: 36,
  
  // Estilos
  borderRadius: 24,
  optionBorderRadius: 24,
  timerBorderRadius: 7,
  shadowBlur: 15,
  shadowColor: 'rgba(0, 0, 0, 0.6)',
  
  // Espaçamentos
  padding: 80,
  optionSpacing: 20,
  optionHeight: 140,
  
  // Efeitos
  glassmorphism: true,
  gradientEnabled: true,
  animationSpeed: 0.5,
};


