import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { storage } from '../../storage.js';
import { DEFAULT_QUIZ_CONFIG } from '../../types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { quizId, config } = req.body;

      if (!quizId) {
        return res.status(400).json({
          success: false,
          error: 'quizId é obrigatório',
        });
      }

      const quiz = storage.quizzes.get(quizId);
      if (!quiz) {
        return res.status(404).json({
          success: false,
          error: 'Quiz não encontrado',
        });
      }

      const jobId = randomUUID();
      const job = {
        id: jobId,
        quizId,
        config: { ...DEFAULT_QUIZ_CONFIG, ...config },
        status: 'pending' as const,
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.jobs.set(jobId, job);

      // Inicia geração em background (simulado)
      // Em produção, você usaria uma queue ou processamento assíncrono
      processJob(jobId).catch(console.error);

      return res.status(201).json({
        success: true,
        data: job,
        message: 'Job de geração de vídeo criado',
      });
    } catch (error) {
      console.error('Erro ao criar job:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  }

  if (req.method === 'GET') {
    const { quizId, status } = req.query;
    let jobs = storage.jobs.getAll();

    if (quizId && typeof quizId === 'string') {
      jobs = jobs.filter((j: any) => j.quizId === quizId);
    }
    if (status && typeof status === 'string') {
      jobs = jobs.filter((j: any) => j.status === status);
    }

    return res.json({
      success: true,
      data: jobs,
      count: jobs.length,
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

async function processJob(jobId: string) {
  const job = storage.jobs.get(jobId);
  if (!job) return;

  // Atualiza para processando
  storage.jobs.set(jobId, {
    ...job,
    status: 'processing',
    progress: 0,
    updatedAt: new Date().toISOString(),
  });

  // Simula processamento
  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const currentJob = storage.jobs.get(jobId);
    if (currentJob) {
      storage.jobs.set(jobId, {
        ...currentJob,
        progress: i,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Marca como completo
  const finalJob = storage.jobs.get(jobId);
  if (finalJob) {
    storage.jobs.set(jobId, {
      ...finalJob,
      status: 'completed',
      progress: 100,
      videoUrl: `https://api.quizztab.com/videos/${jobId}/download`,
      updatedAt: new Date().toISOString(),
    });

    // Dispara webhooks
    triggerWebhooks('video.completed', {
      jobId: finalJob.id,
      quizId: finalJob.quizId,
      videoUrl: finalJob.videoUrl,
    });
  }
}

async function triggerWebhooks(event: string, data: any) {
  const allWebhooks = storage.webhooks.get('global') || [];
  const promises = allWebhooks
    .filter((webhook: any) => webhook.events.includes(event) || webhook.events.includes('*'))
    .map(async (webhook: any) => {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, data, timestamp: new Date().toISOString() }),
        });
        if (!response.ok) {
          console.warn(`Webhook falhou: ${webhook.url} - Status: ${response.status}`);
        }
      } catch (error) {
        console.error(`Erro ao enviar webhook para ${webhook.url}:`, error);
      }
    });
  
  await Promise.allSettled(promises);
}

