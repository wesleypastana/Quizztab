import { useState, useEffect, useCallback } from 'react';
import { QuizTemplate, DEFAULT_TEMPLATE } from '../types/template';

const TEMPLATE_STORAGE_KEY = 'quizztab_template';

export function useTemplate() {
  const [template, setTemplate] = useState<QuizTemplate>(() => {
    // Carrega do localStorage ou usa o padrão
    try {
      const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_TEMPLATE, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Erro ao carregar template:', error);
    }
    return DEFAULT_TEMPLATE;
  });

  // Salva no localStorage sempre que o template mudar
  useEffect(() => {
    try {
      localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(template));
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    }
  }, [template]);

  const updateTemplate = useCallback((newTemplate: QuizTemplate) => {
    setTemplate(newTemplate);
  }, []);

  const resetTemplate = useCallback(() => {
    setTemplate(DEFAULT_TEMPLATE);
  }, []);

  return {
    template,
    updateTemplate,
    resetTemplate,
  };
}


