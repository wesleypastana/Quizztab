# Integração com n8n

Esta API foi projetada para ser facilmente integrada com o n8n. Você pode usar tanto **API REST** quanto **Webhooks**.

## 🎯 Recomendação: API REST + Webhooks

A melhor abordagem é usar **API REST** para todas as operações e **Webhooks** opcionais para receber notificações quando os vídeos estiverem prontos (evita polling).

## 📋 Fluxo Recomendado no n8n

### Opção 1: Com Webhook (Recomendado)

```
1. HTTP Request → Importar CSV
2. HTTP Request → Criar Job de Vídeo
3. Webhook (n8n) → Receber notificação quando vídeo estiver pronto
4. HTTP Request → Baixar vídeo
```

### Opção 2: Sem Webhook (Polling)

```
1. HTTP Request → Importar CSV
2. HTTP Request → Criar Job de Vídeo
3. Loop → Verificar status do job a cada X segundos
4. HTTP Request → Baixar vídeo quando status = "completed"
```

## 🔧 Configuração no n8n

### 1. Importar Quiz via Texto CSV

**Node:** HTTP Request  
**Method:** POST  
**URL:** `http://localhost:3000/api/quizzes/import/text`  
**Body:**
```json
{
  "csvText": "{{ $json.csvText }}",
  "fileName": "quiz.csv"
}
```

**Headers:**
```
Content-Type: application/json
```

### 2. Importar Quiz via Arquivo CSV

**Node:** HTTP Request  
**Method:** POST  
**URL:** `http://localhost:3000/api/quizzes/import/file`  
**Body Type:** Form-Data  
**Body:**
- `file`: (File) - Seu arquivo CSV

### 3. Criar Job de Geração de Vídeo

**Node:** HTTP Request  
**Method:** POST  
**URL:** `http://localhost:3000/api/videos/jobs`  
**Body:**
```json
{
  "quizId": "{{ $json.data.id }}",
  "config": {
    "questionsPerRound": 10,
    "videoFormat": "mp4",
    "videoResolution": "1080x1920"
  }
}
```

### 4. Registrar Webhook (Opcional)

**Node:** HTTP Request  
**Method:** POST  
**URL:** `http://localhost:3000/api/webhooks`  
**Body:**
```json
{
  "url": "https://seu-n8n.com/webhook/video-ready",
  "events": ["video.completed", "video.failed"],
  "jobId": "{{ $json.data.id }}"
}
```

### 5. Verificar Status do Job (Polling)

**Node:** HTTP Request  
**Method:** GET  
**URL:** `http://localhost:3000/api/videos/jobs/{{ $json.data.id }}`

**Node:** IF (para verificar se está completo)
- Condition: `{{ $json.data.status }}` equals `completed`

### 6. Baixar Vídeo

**Node:** HTTP Request  
**Method:** GET  
**URL:** `http://localhost:3000/api/videos/{{ $json.data.id }}/download`  
**Response Format:** File

## 🎣 Webhook no n8n

### Configurar Webhook Trigger no n8n

1. Adicione um node **Webhook**
2. Configure o método: **POST**
3. Configure o path: `/video-ready` (ou o que preferir)
4. Copie a URL do webhook (ex: `https://seu-n8n.com/webhook/video-ready`)

### Registrar o Webhook na API

Depois de criar o job de vídeo, registre o webhook:

```json
POST http://localhost:3000/api/webhooks
{
  "url": "https://seu-n8n.com/webhook/video-ready",
  "events": ["video.completed"],
  "jobId": "job-id-aqui"
}
```

### Payload do Webhook

Quando o vídeo estiver pronto, o n8n receberá:

```json
{
  "event": "video.completed",
  "data": {
    "jobId": "uuid-do-job",
    "quizId": "uuid-do-quiz",
    "videoPath": "/path/to/video.mp4",
    "config": { ... }
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "secret": "seu-secret-se-fornecido"
}
```

## 📝 Exemplo Completo de Workflow n8n

### Workflow 1: Importar e Gerar Vídeo (com Webhook)

```json
{
  "nodes": [
    {
      "name": "Importar CSV",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/api/quizzes/import/text",
        "body": {
          "csvText": "{{ $json.csvText }}"
        }
      }
    },
    {
      "name": "Criar Job",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/api/videos/jobs",
        "body": {
          "quizId": "{{ $json.data.id }}"
        }
      }
    },
    {
      "name": "Registrar Webhook",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/api/webhooks",
        "body": {
          "url": "https://seu-n8n.com/webhook/video-ready",
          "events": ["video.completed"],
          "jobId": "{{ $json.data.id }}"
        }
      }
    }
  ]
}
```

### Workflow 2: Receber Notificação e Baixar Vídeo

```json
{
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "video-ready",
        "method": "POST"
      }
    },
    {
      "name": "Baixar Vídeo",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "http://localhost:3000/api/videos/{{ $json.data.jobId }}/download",
        "responseFormat": "file"
      }
    },
    {
      "name": "Salvar Arquivo",
      "type": "n8n-nodes-base.writeBinaryFile",
      "parameters": {
        "fileName": "video-{{ $json.data.jobId }}.mp4",
        "data": "={{ $binary.data }}"
      }
    }
  ]
}
```

## 🔄 Eventos Disponíveis

- `video.completed` - Vídeo gerado com sucesso
- `video.failed` - Falha na geração do vídeo
- `video.processing` - Vídeo em processamento (opcional)
- `*` - Todos os eventos

## 💡 Dicas

1. **Use Webhooks**: Evita polling desnecessário e é mais eficiente
2. **Validação**: Sempre valide o `secret` no webhook se fornecido
3. **Timeout**: Configure timeout adequado no n8n (geração de vídeo pode levar tempo)
4. **Error Handling**: Adicione tratamento de erros no workflow
5. **Rate Limiting**: A API tem rate limiting (100 req/15min), considere isso

## 🚀 Exemplo Prático

### Cenário: Gerar vídeo a partir de CSV recebido por email

1. **Trigger**: Email recebido com anexo CSV
2. **Extract**: Extrair CSV do email
3. **HTTP Request**: Importar CSV na API
4. **HTTP Request**: Criar job de vídeo
5. **HTTP Request**: Registrar webhook
6. **Webhook**: Receber notificação quando pronto
7. **HTTP Request**: Baixar vídeo
8. **Send Email**: Enviar vídeo por email

Este fluxo pode ser totalmente automatizado no n8n!

