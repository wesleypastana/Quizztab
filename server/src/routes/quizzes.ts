import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { QuizManager } from '../services/quizManager.js';
import { parseCSV, validateQuiz } from '../utils/csvParser.js';
import { validate } from '../middleware/validator.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Schema de validação para importar CSV via texto
const importTextSchema = z.object({
  body: z.object({
    csvText: z.string().min(1, 'Texto CSV não pode estar vazio'),
    fileName: z.string().optional(),
  }),
});

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Lista todos os quizzes importados
 *     tags: [Quizzes]
 *     responses:
 *       200:
 *         description: Lista de quizzes
 */
router.get('/', (req, res) => {
  const quizzes = QuizManager.getAllQuizzes();
  res.json({
    success: true,
    data: quizzes,
    count: quizzes.length,
  });
});

/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Obtém um quiz específico
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz encontrado
 *       404:
 *         description: Quiz não encontrado
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const quiz = QuizManager.getQuiz(id);

  if (!quiz) {
    throw new AppError(404, 'Quiz não encontrado');
  }

  res.json({
    success: true,
    data: quiz,
  });
});

/**
 * @swagger
 * /api/quizzes/import/text:
 *   post:
 *     summary: Importa um quiz a partir de texto CSV
 *     tags: [Quizzes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - csvText
 *             properties:
 *               csvText:
 *                 type: string
 *               fileName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Quiz importado com sucesso
 *       400:
 *         description: Erro na validação ou parsing do CSV
 */
router.post('/import/text', validate(importTextSchema), (req, res) => {
  const { csvText, fileName } = req.body;

  const result = parseCSV(csvText);

  if (!result.success || !result.quiz) {
    throw new AppError(400, result.error || 'Erro ao processar CSV');
  }

  const validation = validateQuiz(result.quiz);
  if (!validation.valid) {
    throw new AppError(400, `Erro de validação: ${validation.errors.join(', ')}`);
  }

  const quizImport = QuizManager.createQuiz(result.quiz, fileName);

  res.status(201).json({
    success: true,
    data: quizImport,
    message: 'Quiz importado com sucesso',
  });
});

/**
 * @swagger
 * /api/quizzes/import/file:
 *   post:
 *     summary: Importa um quiz a partir de arquivo CSV
 *     tags: [Quizzes]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *     responses:
 *       201:
 *         description: Quiz importado com sucesso
 *       400:
 *         description: Erro na validação ou parsing do CSV
 */
router.post('/import/file', upload.single('file'), (req, res) => {
  if (!req.file) {
    throw new AppError(400, 'Arquivo não fornecido');
  }

  const csvText = req.file.buffer.toString('utf-8');
  const fileName = req.file.originalname;

  const result = parseCSV(csvText);

  if (!result.success || !result.quiz) {
    throw new AppError(400, result.error || 'Erro ao processar CSV');
  }

  const validation = validateQuiz(result.quiz);
  if (!validation.valid) {
    throw new AppError(400, `Erro de validação: ${validation.errors.join(', ')}`);
  }

  const quizImport = QuizManager.createQuiz(result.quiz, fileName);

  res.status(201).json({
    success: true,
    data: quizImport,
    message: 'Quiz importado com sucesso',
  });
});

/**
 * @swagger
 * /api/quizzes/{id}:
 *   delete:
 *     summary: Remove um quiz
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz removido com sucesso
 *       404:
 *         description: Quiz não encontrado
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = QuizManager.deleteQuiz(id);

  if (!deleted) {
    throw new AppError(404, 'Quiz não encontrado');
  }

  res.json({
    success: true,
    message: 'Quiz removido com sucesso',
  });
});

export default router;

