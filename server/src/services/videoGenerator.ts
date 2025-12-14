import { VideoJob, Quiz } from '../types/index.js';
import { JobManager } from './jobManager.js';
import { QuizManager } from './quizManager.js';
import { saveVideo, deleteVideo } from './storage.js';
import { AppError } from '../middleware/errorHandler.js';
import { triggerWebhook } from './webhookManager.js';

/**
 * Gera um vídeo para um quiz
 * NOTA: Esta é uma implementação de placeholder.
 * Em produção, você precisaria usar:
 * - Puppeteer para renderizar canvas no servidor
 * - FFmpeg para gerar o vídeo
 * - Ou uma solução de renderização de vídeo no servidor
 */
export async function generateVideo(jobId: string): Promise<void> {
  const job = JobManager.getJob(jobId);
  if (!job) {
    throw new AppError(404, 'Job não encontrado');
  }

  const quiz = QuizManager.getQuiz(job.quizId);
  if (!quiz) {
    JobManager.updateJob(jobId, {
      status: 'failed',
      error: 'Quiz não encontrado',
    });
    throw new AppError(404, 'Quiz não encontrado');
  }

  try {
    // Atualiza status para processando
    JobManager.updateJob(jobId, {
      status: 'processing',
      progress: 0,
    });

    // Simula progresso (em produção, isso seria baseado no progresso real)
    // TODO: Implementar geração real de vídeo usando Puppeteer + FFmpeg
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      JobManager.updateJob(jobId, {
        progress: i,
      });
    }

    // TODO: Implementar geração real de vídeo
    // Por enquanto, criamos um arquivo placeholder
    // Em produção, você usaria:
    // 1. Puppeteer para renderizar o canvas
    // 2. FFmpeg para converter frames em vídeo
    // 3. Ou uma biblioteca de renderização de vídeo

    const videoBuffer = Buffer.from('PLACEHOLDER_VIDEO'); // Placeholder
    const videoPath = await saveVideo(jobId, videoBuffer, job.config.videoFormat);

    // Atualiza job como completo
    const completedJob = JobManager.updateJob(jobId, {
      status: 'completed',
      progress: 100,
      videoPath,
    });

    // Dispara webhook de conclusão
    if (completedJob) {
      await triggerWebhook('video.completed', {
        jobId: completedJob.id,
        quizId: completedJob.quizId,
        videoPath: completedJob.videoPath,
        config: completedJob.config,
      }, jobId);
    }
  } catch (error) {
    const failedJob = JobManager.updateJob(jobId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });

    // Dispara webhook de falha
    if (failedJob) {
      await triggerWebhook('video.failed', {
        jobId: failedJob.id,
        quizId: failedJob.quizId,
        error: failedJob.error,
      }, jobId);
    }
    
    throw error;
  }
}

/**
 * Cancela a geração de um vídeo
 */
export async function cancelVideoGeneration(jobId: string): Promise<void> {
  const job = JobManager.getJob(jobId);
  if (!job) {
    throw new AppError(404, 'Job não encontrado');
  }

  if (job.status === 'completed' || job.status === 'failed') {
    throw new AppError(400, 'Não é possível cancelar um job já finalizado');
  }

  // Remove o vídeo se existir
  if (job.videoPath) {
    await deleteVideo(jobId, job.config.videoFormat);
  }

  JobManager.deleteJob(jobId);
}

