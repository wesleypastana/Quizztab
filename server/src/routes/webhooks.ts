import { Router } from 'express';
import { z } from 'zod';
import { registerWebhook, unregisterWebhook, clearWebhooks } from '../services/webhookManager.js';
import { validate } from '../middleware/validator.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Schema de validação para registrar webhook
const registerWebhookSchema = z.object({
  body: z.object({
    url: z.string().url('URL inválida'),
    secret: z.string().optional(),
    events: z.array(z.string()).default(['*']),
    jobId: z.string().uuid('ID do job inválido').optional(),
  }),
});

/**
 * @swagger
 * /api/webhooks:
 *   post:
 *     summary: Registra um webhook para receber notificações
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *               secret:
 *                 type: string
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *               jobId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Webhook registrado com sucesso
 */
router.post('/', validate(registerWebhookSchema), (req, res) => {
  const { url, secret, events = ['*'], jobId } = req.body;
  
  const webhookId = jobId || 'global';
  registerWebhook(webhookId, { url, secret, events });

  res.status(201).json({
    success: true,
    message: 'Webhook registrado com sucesso',
    data: {
      id: webhookId,
      url,
      events,
    },
  });
});

/**
 * @swagger
 * /api/webhooks:
 *   delete:
 *     summary: Remove um webhook
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *               jobId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook removido com sucesso
 */
router.delete('/', (req, res) => {
  const { url, jobId } = req.body;

  if (!url) {
    throw new AppError(400, 'URL é obrigatória');
  }

  const webhookId = jobId || 'global';
  unregisterWebhook(webhookId, url);

  res.json({
    success: true,
    message: 'Webhook removido com sucesso',
  });
});

/**
 * @swagger
 * /api/webhooks/{jobId}:
 *   delete:
 *     summary: Remove todos os webhooks de um job
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhooks removidos com sucesso
 */
router.delete('/:jobId', (req, res) => {
  const { jobId } = req.params;
  clearWebhooks(jobId);

  res.json({
    success: true,
    message: 'Webhooks removidos com sucesso',
  });
});

export default router;

