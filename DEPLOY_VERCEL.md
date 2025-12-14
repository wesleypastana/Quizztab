# 🚀 Deploy no Vercel - Guia Rápido

## Opção 1: Deploy via CLI (Mais Rápido)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Na raiz do projeto
vercel

# 3. Seguir as instruções
# - Link to existing project? No
# - Project name? quizztab-api
# - Directory? ./api
# - Override settings? No
```

## Opção 2: Deploy via GitHub (Recomendado)

1. **Faça push do código para GitHub**
   ```bash
   git add .
   git commit -m "Add Vercel API"
   git push
   ```

2. **No Vercel Dashboard:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Add New Project"
   - Conecte seu repositório GitHub
   - Configure:
     - **Root Directory**: `./` (raiz do projeto)
     - **Framework Preset**: Other
     - **Build Command**: (deixe vazio)
     - **Output Directory**: (deixe vazio)

3. **Deploy automático!** 🎉

## 📝 Estrutura de Pastas

O Vercel detecta automaticamente a pasta `api/` e cria as rotas:

```
api/
├── quizzes/
│   ├── index.ts          → /api/quizzes
│   ├── [id].ts          → /api/quizzes/:id
│   └── import/
│       ├── text.ts      → /api/quizzes/import/text
│       └── file.ts      → /api/quizzes/import/file
└── videos/
    └── jobs/
        └── index.ts      → /api/videos/jobs
```

## ⚙️ Configuração

### Variáveis de Ambiente (Opcional)

No Vercel Dashboard → Settings → Environment Variables:

```
NODE_ENV=production
```

## 🧪 Testar Localmente

```bash
# Instalar Vercel CLI
npm i -g vercel

# Rodar localmente
vercel dev

# Acesse: http://localhost:3000
```

## 📡 Endpoints Disponíveis

Após o deploy, seus endpoints estarão em:
- `https://seu-projeto.vercel.app/api/quizzes`
- `https://seu-projeto.vercel.app/api/videos/jobs`
- etc.

## ⚠️ Limitações Importantes

### Armazenamento em Memória

- **Dados são perdidos** quando a função "esfria" (cold start)
- **Dados são perdidos** entre deployments
- **Não é persistente** entre instâncias diferentes

### Solução: Vercel KV (Opcional)

Para persistência real, adicione Vercel KV:

```bash
# No Vercel Dashboard
# Storage → Create → KV Database

# Instalar no projeto
npm install @vercel/kv
```

## 💰 Custos

- **Hobby Plan**: Grátis
  - 100GB bandwidth/mês
  - 100 horas de execução/mês
  - Perfeito para começar!

- **Pro Plan**: $20/mês
  - Sem limites de bandwidth
  - Mais horas de execução

## 🎯 Próximos Passos

1. ✅ Deploy no Vercel
2. ⏭️ Adicionar Vercel KV (se precisar de persistência)
3. ⏭️ Implementar geração real de vídeo
4. ⏭️ Usar Vercel Blob para armazenar vídeos

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
cd api
npm install
```

### Erro: "Function timeout"
- Aumente o timeout no `vercel.json`:
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Dados sendo perdidos
- Use Vercel KV para persistência
- Ou use um banco de dados externo

## 📚 Documentação

- [Vercel Docs](https://vercel.com/docs)
- [Serverless Functions](https://vercel.com/docs/functions)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)

