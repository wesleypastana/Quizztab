import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { url, secret, events = ['*'], jobId } = req.body;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'URL é obrigatória',
        });
      }

      const webhookId = jobId || 'global';
      const existing = storage.webhooks.get(webhookId) || [];
      
      storage.webhooks.set(webhookId, [
        ...existing,
        { url, secret, events },
      ]);

      return res.status(201).json({
        success: true,
        message: 'Webhook registrado com sucesso',
        data: {
          id: webhookId,
          url,
          events,
        },
      });
    } catch (error) {
      console.error('Erro ao registrar webhook:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  }

  if (req.method === 'DELETE') {
    const { url, jobId } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL é obrigatória',
      });
    }

    const webhookId = jobId || 'global';
    const existing = storage.webhooks.get(webhookId) || [];
    storage.webhooks.set(webhookId, existing.filter((w: any) => w.url !== url));

    return res.json({
      success: true,
      message: 'Webhook removido com sucesso',
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

