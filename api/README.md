# Quizztab API - Vercel Serverless

API serverless para Quizztab, funcionando no Vercel sem necessidade de banco de dados ou servidor.

## 🚀 Deploy no Vercel

### Opção 1: Via CLI

```bash
npm i -g vercel
vercel
```

### Opção 2: Via GitHub

1. Faça push do código para GitHub
2. Conecte o repositório no Vercel
3. Deploy automático!

## 📁 Estrutura

```
api/
├── quizzes/
│   ├── index.ts           # GET /api/quizzes
│   ├── [id].ts            # GET/DELETE /api/quizzes/:id
│   └── import/
│       ├── text.ts        # POST /api/quizzes/import/text
│       └── file.ts        # POST /api/quizzes/import/file
├── videos/
│   ├── jobs/
│   │   ├── index.ts       # GET/POST /api/videos/jobs
│   │   └── [id].ts       # GET/DELETE /api/videos/jobs/:id
│   └── [id]/
│       └── download.ts    # GET /api/videos/:id/download
├── webhooks/
│   └── index.ts           # POST/DELETE /api/webhooks
├── storage.ts             # Armazenamento em memória
├── types.ts               # Tipos TypeScript
└── utils/
    └── csvParser.ts       # Parser de CSV
```

## ⚠️ Limitações do Armazenamento em Memória

- **Dados são perdidos** entre deployments
- **Dados são perdidos** quando a função "esfria" (cold start)
- **Não é persistente** entre requisições de diferentes instâncias

## 💡 Soluções Recomendadas

### Opção 1: Vercel KV (Recomendado - Simples)

Vercel KV é um Redis gerenciado, muito simples de usar:

```bash
# Instalar
npm install @vercel/kv

# Configurar no Vercel Dashboard
# Adicionar variável KV_REST_API_URL
```

### Opção 2: Vercel Blob (Para vídeos)

Para armazenar vídeos gerados:

```bash
npm install @vercel/blob
```

### Opção 3: Outros Serviços

- Upstash Redis
- PlanetScale (MySQL)
- Supabase
- MongoDB Atlas

## 🔧 Configuração

### Variáveis de Ambiente

No Vercel Dashboard, adicione:

```
NODE_ENV=production
```

### Para usar Vercel KV (Opcional)

```
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

## 📝 Endpoints

Todos os endpoints funcionam igual à versão Express:

- `GET /api/quizzes` - Lista quizzes
- `GET /api/quizzes/:id` - Obtém quiz
- `POST /api/quizzes/import/text` - Importa via texto
- `POST /api/quizzes/import/file` - Importa via arquivo
- `DELETE /api/quizzes/:id` - Remove quiz
- `POST /api/videos/jobs` - Cria job
- `GET /api/videos/jobs` - Lista jobs
- `GET /api/videos/jobs/:id` - Status do job
- `DELETE /api/videos/jobs/:id` - Cancela job
- `GET /api/videos/:id/download` - Download vídeo
- `POST /api/webhooks` - Registra webhook
- `DELETE /api/webhooks` - Remove webhook

## 🧪 Teste Local

```bash
npm install -g vercel
vercel dev
```

Acesse: `http://localhost:3000`

## 📦 Dependências

Apenas:
- `@vercel/node` - Runtime do Vercel
- `zod` - Validação
- `uuid` - Geração de IDs

## 🎯 Próximos Passos

1. **Adicionar Vercel KV** para persistência
2. **Implementar geração real de vídeo** (Puppeteer + FFmpeg)
3. **Usar Vercel Blob** para armazenar vídeos
4. **Adicionar autenticação** (opcional)

## 💰 Custos

- **Vercel Hobby**: Grátis (100GB bandwidth/mês)
- **Vercel KV**: ~$0.20/GB
- **Vercel Blob**: ~$0.15/GB

Muito mais barato que manter um servidor!

