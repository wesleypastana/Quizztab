import { v4 as uuidv4 } from 'uuid';
import { VideoJob, QuizConfig, DEFAULT_QUIZ_CONFIG } from '../types/index.js';

// Em produção, isso seria substituído por um banco de dados
const jobs = new Map<string, VideoJob>();

export class JobManager {
  static createJob(quizId: string, config?: Partial<QuizConfig>): VideoJob {
    const jobId = uuidv4();
    const job: VideoJob = {
      id: jobId,
      quizId,
      config: { ...DEFAULT_QUIZ_CONFIG, ...config },
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jobs.set(jobId, job);
    return job;
  }

  static getJob(jobId: string): VideoJob | undefined {
    return jobs.get(jobId);
  }

  static updateJob(jobId: string, updates: Partial<VideoJob>): VideoJob | null {
    const job = jobs.get(jobId);
    if (!job) {
      return null;
    }

    const updated = {
      ...job,
      ...updates,
      updatedAt: new Date(),
    };

    jobs.set(jobId, updated);
    return updated;
  }

  static getAllJobs(quizId?: string): VideoJob[] {
    const allJobs = Array.from(jobs.values());
    if (quizId) {
      return allJobs.filter(job => job.quizId === quizId);
    }
    return allJobs;
  }

  static deleteJob(jobId: string): boolean {
    return jobs.delete(jobId);
  }

  static getJobsByStatus(status: VideoJob['status']): VideoJob[] {
    return Array.from(jobs.values()).filter(job => job.status === status);
  }
}

