import { Router } from 'express';
import { z } from 'zod';
import { JobManager } from '../services/jobManager.js';
import { QuizManager } from '../services/quizManager.js';
import { generateVideo, cancelVideoGeneration } from '../services/videoGenerator.js';
import { getVideoPath, readFile } from '../services/storage.js';
import { validate } from '../middleware/validator.js';
import { AppError } from '../middleware/errorHandler.js';
import { DEFAULT_QUIZ_CONFIG } from '../types/index.js';

const router = Router();

// Schema de validação para criar job de vídeo
const createVideoJobSchema = z.object({
  body: z.object({
    quizId: z.string().uuid('ID do quiz inválido'),
    config: z.object({
      questionsPerRound: z.number().min(1).max(50).optional(),
      optionsPerQuestion: z.number().min(2).max(6).optional(),
      timerPerQuestion: z.number().min(5).max(60).optional(),
      themes: z.array(z.string()).optional(),
      enableMusic: z.boolean().optional(),
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
      videoFormat: z.enum(['webm', 'mp4']).optional(),
      videoResolution: z.enum(['1080x1920', '720x1280', '540x960']).optional(),
    }).optional(),
  }),
});

/**
 * @swagger
 * /api/videos/jobs:
 *   post:
 *     summary: Cria um job para gerar vídeo
 *     tags: [Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quizId
 *             properties:
 *               quizId:
 *                 type: string
 *               config:
 *                 type: object
 *     responses:
 *       201:
 *         description: Job criado com sucesso
 *       404:
 *         description: Quiz não encontrado
 */
router.post('/jobs', validate(createVideoJobSchema), async (req, res) => {
  const { quizId, config } = req.body;

  const quiz = QuizManager.getQuiz(quizId);
  if (!quiz) {
    throw new AppError(404, 'Quiz não encontrado');
  }

  const job = JobManager.createJob(quizId, config);

  // Inicia geração de vídeo em background
  generateVideo(job.id).catch((error) => {
    console.error(`Erro ao gerar vídeo para job ${job.id}:`, error);
  });

  res.status(201).json({
    success: true,
    data: job,
    message: 'Job de geração de vídeo criado',
  });
});

/**
 * @swagger
 * /api/videos/jobs:
 *   get:
 *     summary: Lista todos os jobs de vídeo
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: quizId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *     responses:
 *       200:
 *         description: Lista de jobs
 */
router.get('/jobs', (req, res) => {
  const { quizId, status } = req.query;

  let jobs;
  if (quizId && typeof quizId === 'string') {
    jobs = JobManager.getAllJobs(quizId);
  } else if (status && typeof status === 'string') {
    jobs = JobManager.getJobsByStatus(status as any);
  } else {
    jobs = JobManager.getAllJobs();
  }

  res.json({
    success: true,
    data: jobs,
    count: jobs.length,
  });
});

/**
 * @swagger
 * /api/videos/jobs/{id}:
 *   get:
 *     summary: Obtém status de um job específico
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status do job
 *       404:
 *         description: Job não encontrado
 */
router.get('/jobs/:id', (req, res) => {
  const { id } = req.params;
  const job = JobManager.getJob(id);

  if (!job) {
    throw new AppError(404, 'Job não encontrado');
  }

  res.json({
    success: true,
    data: job,
  });
});

/**
 * @swagger
 * /api/videos/jobs/{id}:
 *   delete:
 *     summary: Cancela um job de geração de vídeo
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job cancelado com sucesso
 *       404:
 *         description: Job não encontrado
 */
router.delete('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await cancelVideoGeneration(id);
    res.json({
      success: true,
      message: 'Job cancelado com sucesso',
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Erro ao cancelar job');
  }
});

/**
 * @swagger
 * /api/videos/{id}/download:
 *   get:
 *     summary: Baixa um vídeo gerado
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Arquivo de vídeo
 *         content:
 *           video/webm:
 *             schema:
 *               type: string
 *               format: binary
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Vídeo não encontrado
 */
router.get('/:id/download', async (req, res) => {
  const { id } = req.params;
  const job = JobManager.getJob(id);

  if (!job) {
    throw new AppError(404, 'Job não encontrado');
  }

  if (job.status !== 'completed' || !job.videoPath) {
    throw new AppError(404, 'Vídeo ainda não foi gerado ou job falhou');
  }

  const videoPath = await getVideoPath(id, job.config.videoFormat);
  if (!videoPath) {
    throw new AppError(404, 'Arquivo de vídeo não encontrado');
  }

  const videoBuffer = await readFile(videoPath);
  const mimeType = job.config.videoFormat === 'mp4' ? 'video/mp4' : 'video/webm';
  const fileName = `quiz-video-${id}.${job.config.videoFormat}`;

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(videoBuffer);
});

export default router;

