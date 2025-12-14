import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const quizzes = storage.quizzes.getAll();
    return res.json({
      success: true,
      data: quizzes,
      count: quizzes.length,
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

