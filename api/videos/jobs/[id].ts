import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ID é obrigatório',
      });
    }

    const job = storage.jobs.get(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job não encontrado',
      });
    }

    return res.json({
      success: true,
      data: job,
    });
  }

  if (req.method === 'DELETE') {
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ID é obrigatório',
      });
    }

    const job = storage.jobs.get(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job não encontrado',
      });
    }

    if (job.status === 'completed' || job.status === 'failed') {
      return res.status(400).json({
        success: false,
        error: 'Não é possível cancelar um job já finalizado',
      });
    }

    storage.jobs.delete(id);
    return res.json({
      success: true,
      message: 'Job cancelado com sucesso',
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

