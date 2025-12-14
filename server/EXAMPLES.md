# Exemplos de Uso da API

## 1. Importar Quiz via Texto CSV

```bash
curl -X POST http://localhost:3000/api/quizzes/import/text \
  -H "Content-Type: application/json" \
  -d '{
    "csvText": "pergunta,resposta_correta,opção1,opção2,opção3,opção4\nQual é a capital do Brasil?,Brasília,São Paulo,Rio de Janeiro,Brasília,Salvador\nQuem pintou a Mona Lisa?,Leonardo da Vinci,Picasso,Leonardo da Vinci,Van Gogh,Monet",
    "fileName": "quiz-exemplo.csv"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-quiz",
    "quiz": {
      "questions": [...],
      "metadata": {...}
    },
    "fileName": "quiz-exemplo.csv",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Quiz importado com sucesso"
}
```

## 2. Importar Quiz via Arquivo CSV

```bash
curl -X POST http://localhost:3000/api/quizzes/import/file \
  -F "file=@example-quiz.csv"
```

## 3. Listar Todos os Quizzes

```bash
curl http://localhost:3000/api/quizzes
```

## 4. Obter Quiz Específico

```bash
curl http://localhost:3000/api/quizzes/{quiz-id}
```

## 5. Criar Job de Geração de Vídeo

```bash
curl -X POST http://localhost:3000/api/videos/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": "uuid-do-quiz",
    "config": {
      "questionsPerRound": 10,
      "optionsPerQuestion": 4,
      "timerPerQuestion": 10,
      "enableMusic": false,
      "backgroundColor": "#1a1a2e",
      "textColor": "#ffffff",
      "videoFormat": "mp4",
      "videoResolution": "1080x1920"
    }
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-job",
    "quizId": "uuid-do-quiz",
    "config": {...},
    "status": "pending",
    "progress": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Job de geração de vídeo criado"
}
```

## 6. Verificar Status do Job

```bash
curl http://localhost:3000/api/videos/jobs/{job-id}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-job",
    "quizId": "uuid-do-quiz",
    "status": "processing",
    "progress": 50,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 7. Listar Todos os Jobs

```bash
# Todos os jobs
curl http://localhost:3000/api/videos/jobs

# Jobs de um quiz específico
curl http://localhost:3000/api/videos/jobs?quizId={quiz-id}

# Jobs por status
curl http://localhost:3000/api/videos/jobs?status=completed
```

## 8. Baixar Vídeo Gerado

```bash
curl http://localhost:3000/api/videos/{job-id}/download --output video.mp4
```

## 9. Cancelar Job

```bash
curl -X DELETE http://localhost:3000/api/videos/jobs/{job-id}
```

## 10. Remover Quiz

```bash
curl -X DELETE http://localhost:3000/api/quizzes/{quiz-id}
```

## Exemplo Completo (Fluxo Completo)

```bash
# 1. Importar quiz
QUIZ_ID=$(curl -s -X POST http://localhost:3000/api/quizzes/import/text \
  -H "Content-Type: application/json" \
  -d '{"csvText": "pergunta,resposta_correta,opção1,opção2\nQual é a capital do Brasil?,Brasília,São Paulo,Rio de Janeiro"}' \
  | jq -r '.data.id')

echo "Quiz ID: $QUIZ_ID"

# 2. Criar job de vídeo
JOB_ID=$(curl -s -X POST http://localhost:3000/api/videos/jobs \
  -H "Content-Type: application/json" \
  -d "{\"quizId\": \"$QUIZ_ID\"}" \
  | jq -r '.data.id')

echo "Job ID: $JOB_ID"

# 3. Aguardar conclusão (polling)
while true; do
  STATUS=$(curl -s http://localhost:3000/api/videos/jobs/$JOB_ID | jq -r '.data.status')
  PROGRESS=$(curl -s http://localhost:3000/api/videos/jobs/$JOB_ID | jq -r '.data.progress')
  
  echo "Status: $STATUS - Progresso: $PROGRESS%"
  
  if [ "$STATUS" = "completed" ]; then
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "Job falhou!"
    exit 1
  fi
  
  sleep 2
done

# 4. Baixar vídeo
curl http://localhost:3000/api/videos/$JOB_ID/download --output video.mp4
echo "Vídeo baixado: video.mp4"
```

## Usando JavaScript/TypeScript

```typescript
const API_BASE = 'http://localhost:3000/api';

// Importar quiz
async function importQuiz(csvText: string) {
  const response = await fetch(`${API_BASE}/quizzes/import/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csvText }),
  });
  return response.json();
}

// Criar job de vídeo
async function createVideoJob(quizId: string, config?: any) {
  const response = await fetch(`${API_BASE}/videos/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quizId, config }),
  });
  return response.json();
}

// Verificar status
async function getJobStatus(jobId: string) {
  const response = await fetch(`${API_BASE}/videos/jobs/${jobId}`);
  return response.json();
}

// Baixar vídeo
async function downloadVideo(jobId: string) {
  const response = await fetch(`${API_BASE}/videos/${jobId}/download`);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `video-${jobId}.mp4`;
  a.click();
}

// Exemplo de uso
(async () => {
  // 1. Importar quiz
  const quiz = await importQuiz('pergunta,resposta_correta,opção1,opção2\nQual é a capital?,Brasília,São Paulo,Rio');
  console.log('Quiz importado:', quiz.data.id);

  // 2. Criar job
  const job = await createVideoJob(quiz.data.id);
  console.log('Job criado:', job.data.id);

  // 3. Aguardar conclusão
  let status = 'pending';
  while (status !== 'completed' && status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const jobStatus = await getJobStatus(job.data.id);
    status = jobStatus.data.status;
    console.log(`Status: ${status} - Progresso: ${jobStatus.data.progress}%`);
  }

  // 4. Baixar vídeo
  if (status === 'completed') {
    await downloadVideo(job.data.id);
    console.log('Vídeo baixado!');
  }
})();
```

