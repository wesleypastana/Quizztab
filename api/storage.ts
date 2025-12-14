// Armazenamento em memória (será perdido entre deployments)
// Para produção, considere usar Vercel KV ou outro serviço

const quizzes = new Map<string, any>();
const jobs = new Map<string, any>();
const webhooks = new Map<string, any[]>();

export const storage = {
  quizzes: {
    set: (id: string, data: any) => quizzes.set(id, data),
    get: (id: string) => quizzes.get(id),
    getAll: () => Array.from(quizzes.values()),
    delete: (id: string) => quizzes.delete(id),
    clear: () => quizzes.clear(),
  },
  jobs: {
    set: (id: string, data: any) => jobs.set(id, data),
    get: (id: string) => jobs.get(id),
    getAll: () => Array.from(jobs.values()),
    delete: (id: string) => jobs.delete(id),
    clear: () => jobs.clear(),
  },
  webhooks: {
    set: (id: string, data: any[]) => webhooks.set(id, data),
    get: (id: string) => webhooks.get(id) || [],
    delete: (id: string) => webhooks.delete(id),
    clear: () => webhooks.clear(),
  },
};

