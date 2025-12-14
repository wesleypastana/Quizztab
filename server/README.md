# Quizztab API

API REST para geração de vídeos de quiz a partir de arquivos CSV.

## 🚀 Instalação

```bash
npm install
```

## 📝 Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
NODE_ENV=development
```

## 🏃 Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📚 Documentação

A documentação Swagger está disponível em:
- http://localhost:3000/api-docs

## 🔌 Endpoints

### Quizzes

- `GET /api/quizzes` - Lista todos os quizzes
- `GET /api/quizzes/:id` - Obtém um quiz específico
- `POST /api/quizzes/import/text` - Importa quiz via texto CSV
- `POST /api/quizzes/import/file` - Importa quiz via arquivo CSV
- `DELETE /api/quizzes/:id` - Remove um quiz

### Vídeos

- `POST /api/videos/jobs` - Cria job para gerar vídeo
- `GET /api/videos/jobs` - Lista todos os jobs
- `GET /api/videos/jobs/:id` - Obtém status de um job
- `DELETE /api/videos/jobs/:id` - Cancela um job
- `GET /api/videos/:id/download` - Baixa vídeo gerado

### Webhooks

- `POST /api/webhooks` - Registra um webhook
- `DELETE /api/webhooks` - Remove um webhook
- `DELETE /api/webhooks/:jobId` - Remove todos os webhooks de um job

## 🤖 Integração com n8n

Esta API foi projetada para fácil integração com n8n. Veja o guia completo em [N8N_INTEGRATION.md](./N8N_INTEGRATION.md).

**Resumo:**
- Use **API REST** para todas as operações (importar, criar job, baixar)
- Use **Webhooks** opcionais para receber notificações quando vídeos estiverem prontos
- Evita polling desnecessário

## 📦 Exemplos de Uso

### Importar CSV via texto

```bash
curl -X POST http://localhost:3000/api/quizzes/import/text \
  -H "Content-Type: application/json" \
  -d '{
    "csvText": "pergunta,resposta_correta,opção1,opção2\nQual é a capital do Brasil?,Brasília,São Paulo,Rio de Janeiro",
    "fileName": "quiz.csv"
  }'
```

### Importar CSV via arquivo

```bash
curl -X POST http://localhost:3000/api/quizzes/import/file \
  -F "file=@quiz.csv"
```

### Criar job de geração de vídeo

```bash
curl -X POST http://localhost:3000/api/videos/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": "quiz-id-aqui",
    "config": {
      "questionsPerRound": 10,
      "videoFormat": "mp4",
      "videoResolution": "1080x1920"
    }
  }'
```

### Verificar status do job

```bash
curl http://localhost:3000/api/videos/jobs/job-id-aqui
```

### Baixar vídeo

```bash
curl http://localhost:3000/api/videos/job-id-aqui/download --output video.mp4
```

## ⚠️ Notas Importantes

1. **Geração de Vídeo**: A geração de vídeo atual é um placeholder. Para produção, você precisará implementar:
   - Renderização de canvas no servidor (Puppeteer)
   - Conversão para vídeo (FFmpeg)
   - Ou usar uma biblioteca de renderização de vídeo

2. **Armazenamento**: Atualmente usa armazenamento em memória/arquivo. Para produção, considere:
   - Banco de dados (PostgreSQL, MongoDB)
   - Armazenamento de objetos (S3, Azure Blob)
   - Sistema de filas (Redis, RabbitMQ)

3. **Segurança**: Adicione autenticação e autorização antes de usar em produção.

## 🛠️ Tecnologias

- Express.js
- TypeScript
- Zod (validação)
- Multer (upload de arquivos)
- Swagger (documentação)

