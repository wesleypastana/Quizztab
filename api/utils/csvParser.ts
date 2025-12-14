import { Question, Quiz } from '../types.js';

export interface CSVParseResult {
  success: boolean;
  quiz?: Quiz;
  error?: string;
}

export function parseCSV(content: string): CSVParseResult {
  try {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      return {
        success: false,
        error: 'O arquivo CSV está vazio',
      };
    }

    const questions: Question[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      if (index === 0 && line.toLowerCase().includes('pergunta')) {
        return;
      }

      const columns = parseCSVLine(line);
      
      if (columns.length < 3) {
        errors.push(`Linha ${index + 1}: Formato inválido`);
        return;
      }

      const [text, correctAnswer, ...options] = columns;

      if (!text || text.trim().length === 0) {
        errors.push(`Linha ${index + 1}: Pergunta vazia`);
        return;
      }

      if (!correctAnswer || correctAnswer.trim().length === 0) {
        errors.push(`Linha ${index + 1}: Resposta correta vazia`);
        return;
      }

      if (options.length === 0) {
        errors.push(`Linha ${index + 1}: Nenhuma opção fornecida`);
        return;
      }

      const trimmedCorrectAnswer = correctAnswer.trim();
      const trimmedOptions = options.map(opt => opt.trim());
      const allOptionsSet = new Set([trimmedCorrectAnswer, ...trimmedOptions]);
      const allOptions = Array.from(allOptionsSet);
      const shuffledOptions = shuffleArray([...allOptions]);

      questions.push({
        id: `q${index + 1}`,
        text: text.trim(),
        correctAnswer: trimmedCorrectAnswer,
        options: shuffledOptions,
      });
    });

    if (questions.length === 0) {
      return {
        success: false,
        error: errors.length > 0 
          ? errors.join('\n') 
          : 'Nenhuma questão válida encontrada',
      };
    }

    return {
      success: true,
      quiz: {
        questions,
        metadata: {
          title: `Quiz com ${questions.length} questões`,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao processar CSV',
    };
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function validateQuiz(quiz: Quiz): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!quiz.questions || quiz.questions.length === 0) {
    errors.push('O quiz deve conter pelo menos uma questão');
  }
  quiz.questions?.forEach((question, index) => {
    if (!question.text || question.text.trim().length === 0) {
      errors.push(`Questão ${index + 1}: Texto vazio`);
    }
    if (!question.correctAnswer || question.correctAnswer.trim().length === 0) {
      errors.push(`Questão ${index + 1}: Resposta correta vazia`);
    }
    if (!question.options || question.options.length < 2) {
      errors.push(`Questão ${index + 1}: Deve ter pelo menos 2 opções`);
    }
    if (!question.options.includes(question.correctAnswer)) {
      errors.push(`Questão ${index + 1}: Resposta correta deve estar nas opções`);
    }
  });
  return { valid: errors.length === 0, errors };
}

