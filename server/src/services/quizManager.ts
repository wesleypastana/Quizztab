import { v4 as uuidv4 } from 'uuid';
import { Quiz, QuizImport } from '../types/index.js';

// Em produção, isso seria substituído por um banco de dados
const quizzes = new Map<string, QuizImport>();

export class QuizManager {
  static createQuiz(quiz: Quiz, fileName?: string): QuizImport {
    const id = uuidv4();
    const quizImport: QuizImport = {
      id,
      quiz,
      fileName,
      createdAt: new Date(),
    };

    quizzes.set(id, quizImport);
    return quizImport;
  }

  static getQuiz(quizId: string): QuizImport | undefined {
    return quizzes.get(quizId);
  }

  static getAllQuizzes(): QuizImport[] {
    return Array.from(quizzes.values());
  }

  static deleteQuiz(quizId: string): boolean {
    return quizzes.delete(quizId);
  }

  static updateQuiz(quizId: string, quiz: Quiz): QuizImport | null {
    const existing = quizzes.get(quizId);
    if (!existing) {
      return null;
    }

    const updated: QuizImport = {
      ...existing,
      quiz,
    };

    quizzes.set(quizId, updated);
    return updated;
  }
}

