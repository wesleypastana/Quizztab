import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ID é obrigatório',
      });
    }

    const quiz = storage.quizzes.get(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz não encontrado',
      });
    }

    return res.json({
      success: true,
      data: quiz,
    });
  }

  if (req.method === 'DELETE') {
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ID é obrigatório',
      });
    }

    const deleted = storage.quizzes.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Quiz não encontrado',
      });
    }

    return res.json({
      success: true,
      message: 'Quiz removido com sucesso',
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

