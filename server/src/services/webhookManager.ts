import https from 'https';
import http from 'http';

export interface WebhookConfig {
  url: string;
  secret?: string;
  events: string[];
}

// Armazena webhooks registrados (em produção, usar banco de dados)
const webhooks = new Map<string, WebhookConfig[]>();

/**
 * Registra um webhook para receber notificações
 */
export function registerWebhook(id: string, config: WebhookConfig): void {
  const existing = webhooks.get(id) || [];
  webhooks.set(id, [...existing, config]);
}

/**
 * Remove um webhook
 */
export function unregisterWebhook(id: string, url: string): void {
  const existing = webhooks.get(id) || [];
  webhooks.set(id, existing.filter(w => w.url !== url));
}

/**
 * Remove todos os webhooks de um ID
 */
export function clearWebhooks(id: string): void {
  webhooks.delete(id);
}

/**
 * Dispara webhooks para um evento específico
 */
export async function triggerWebhook(
  event: string,
  data: any,
  jobId?: string
): Promise<void> {
  const targets: WebhookConfig[] = [];
  
  // Coleta todos os webhooks que escutam este evento
  webhooks.forEach((configs) => {
    configs.forEach((config) => {
      if (config.events.includes(event) || config.events.includes('*')) {
        targets.push(config);
      }
    });
  });

  // Se há um jobId específico, filtra webhooks desse job
  if (jobId) {
    const jobWebhooks = webhooks.get(jobId) || [];
    jobWebhooks.forEach((config) => {
      if (config.events.includes(event) || config.events.includes('*')) {
        targets.push(config);
      }
    });
  }

  // Dispara todos os webhooks
  const promises = targets.map((config) => sendWebhook(config, event, data));
  await Promise.allSettled(promises);
}

/**
 * Envia um webhook HTTP
 */
async function sendWebhook(
  config: WebhookConfig,
  event: string,
  data: any
): Promise<void> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString(),
      secret: config.secret,
    });

    const url = new URL(config.url);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'Quizztab-Webhook/1.0',
        'X-Webhook-Event': event,
      },
      timeout: 10000, // 10 segundos
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          console.warn(`Webhook falhou: ${config.url} - Status: ${res.statusCode}`);
          resolve(); // Não rejeita para não bloquear outros webhooks
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Erro ao enviar webhook para ${config.url}:`, error.message);
      resolve(); // Não rejeita para não bloquear outros webhooks
    });

    req.on('timeout', () => {
      req.destroy();
      console.warn(`Timeout ao enviar webhook para ${config.url}`);
      resolve();
    });

    req.write(payload);
    req.end();
  });
}

