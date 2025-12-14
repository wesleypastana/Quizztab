import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { parseCSV, validateQuiz } from '../utils/csvParser.js';
import { storage } from '../storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // No Vercel, arquivos são enviados como base64 ou texto
    const file = req.body.file;
    const fileName = req.body.fileName || 'quiz.csv';

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Arquivo não fornecido',
      });
    }

    // Se for base64, decodifica
    let csvText: string;
    if (typeof file === 'string' && file.startsWith('data:')) {
      // Formato data:application/csv;base64,...
      const base64Data = file.split(',')[1];
      csvText = Buffer.from(base64Data, 'base64').toString('utf-8');
    } else if (typeof file === 'string') {
      csvText = file;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Formato de arquivo inválido',
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
      fileName,
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

