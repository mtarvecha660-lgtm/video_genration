import { EventEmitter } from 'node:events';
import type { GenerationJob, JobStatus } from '@qoneqt/shared';
import { ProjectRepository } from '../db/projectRepository.js';

interface JobUpdate {
  status?: JobStatus;
  progress?: number;
  stage?: string;
  message?: string;
  log?: string;
}

export class JobManager {
  private readonly emitter = new EventEmitter();

  constructor(private readonly repository: ProjectRepository) {}

  async create(projectId: string): Promise<GenerationJob> {
    const now = new Date().toISOString();
    const job: GenerationJob = {
      id: crypto.randomUUID(),
      projectId,
      status: 'queued',
      progress: 0,
      stage: 'Queued',
      message: 'Waiting for worker',
      logs: ['Job queued'],
      createdAt: now,
      updatedAt: now
    };
    await this.repository.saveJob(job);
    this.emitter.emit(job.id, job);
    return job;
  }

  async update(jobId: string, update: JobUpdate): Promise<GenerationJob | undefined> {
    const job = await this.repository.getJob(jobId);
    if (!job) return undefined;
    if (update.status) job.status = update.status;
    if (update.progress !== undefined) job.progress = Math.min(100, Math.max(0, update.progress));
    if (update.stage) job.stage = update.stage;
    if (update.message) job.message = update.message;
    if (update.log) job.logs.push(update.log);
    job.updatedAt = new Date().toISOString();
    await this.repository.saveJob(job);
    this.emitter.emit(job.id, job);
    return job;
  }

  async get(jobId: string): Promise<GenerationJob | undefined> {
    return this.repository.getJob(jobId);
  }

  subscribe(jobId: string, listener: (job: GenerationJob) => void): () => void {
    this.emitter.on(jobId, listener);
    return () => this.emitter.off(jobId, listener);
  }
}
