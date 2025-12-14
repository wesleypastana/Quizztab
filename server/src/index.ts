import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import quizzesRouter from './routes/quizzes.js';
import videosRouter from './routes/videos.js';
import webhooksRouter from './routes/webhooks.js';
import { ensureDirectories } from './services/storage.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quizztab API',
      version: '1.0.0',
      description: 'API REST para geração de vídeos de quiz a partir de arquivos CSV',
      contact: {
        name: 'Quizztab',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desenvolvimento',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
});
app.use('/api/', limiter);

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Rotas
app.use('/api/quizzes', quizzesRouter);
app.use('/api/videos', videosRouter);
app.use('/api/webhooks', webhooksRouter);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Inicialização
async function start() {
  try {
    // Garante que os diretórios de upload existem
    await ensureDirectories();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📚 Documentação disponível em http://localhost:${PORT}/api-docs`);
      console.log(`❤️  Health check em http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

start();

