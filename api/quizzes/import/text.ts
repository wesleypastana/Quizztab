import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { parseCSV, validateQuiz } from '../utils/csvParser.js';
import { storage } from '../storage.js';
import { DEFAULT_QUIZ_CONFIG } from '../types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { csvText, fileName } = req.body;

    if (!csvText || typeof csvText !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'csvText é obrigatório e deve ser uma string',
      });
    }

    const result = parseCSV(csvText);

    if (!result.success || !result.quiz) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Erro ao processar CSV',
      });
    }

    const validation = validateQuiz(result.quiz);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: `Erro de validação: ${validation.errors.join(', ')}`,
      });
    }

    const id = randomUUID();
    const quizImport = {
      id,
      quiz: result.quiz,
      fileName: fileName || 'quiz.csv',
      createdAt: new Date().toISOString(),
    };

    storage.quizzes.set(id, quizImport);

    return res.status(201).json({
      success: true,
      data: quizImport,
      message: 'Quiz importado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao importar quiz:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
}

