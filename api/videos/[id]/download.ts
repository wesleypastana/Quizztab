import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

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

  if (job.status !== 'completed' || !job.videoUrl) {
    return res.status(404).json({
      success: false,
      error: 'Vídeo ainda não foi gerado ou job falhou',
    });
  }

  // Redireciona para a URL do vídeo ou retorna placeholder
  // Em produção, você geraria o vídeo real e retornaria o blob
  return res.json({
    success: true,
    data: {
      videoUrl: job.videoUrl,
      downloadUrl: job.videoUrl,
    },
    message: 'Vídeo gerado com sucesso. Use a videoUrl para download.',
  });
}

