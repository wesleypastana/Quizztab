import { useState, useEffect } from 'react';
import { QuizConfig, DEFAULT_QUIZ_CONFIG } from '../types/config';

const STORAGE_KEY = 'quizztab_config';

export function useQuizConfig() {
  const [config, setConfig] = useState<QuizConfig>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_QUIZ_CONFIG, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_QUIZ_CONFIG;
      }
    }
    return DEFAULT_QUIZ_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const updateConfig = (updates: Partial<QuizConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_QUIZ_CONFIG);
  };

  return {
    config,
    updateConfig,
    resetConfig,
  };
}

