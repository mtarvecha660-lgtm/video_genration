import path from 'node:path';
import type { GenerationJob, Project } from '@qoneqt/shared';
import { JsonStore } from './jsonStore.js';
import { config } from '../config.js';

interface DBShape {
  projects: Project[];
  jobs: GenerationJob[];
}

export class ProjectRepository {
  private readonly store = new JsonStore<DBShape>(path.join(config.dataDir, 'db.json'), {
    projects: [],
    jobs: []
  });

  async listProjects(): Promise<Project[]> {
    const db = await this.store.read();
    return [...db.projects].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const db = await this.store.read();
    return db.projects.find((p) => p.id === id);
  }

  async saveProject(project: Project): Promise<void> {
    const db = await this.store.read();
    const index = db.projects.findIndex((p) => p.id === project.id);
    if (index === -1) {
      db.projects.push(project);
    } else {
      db.projects[index] = project;
    }
    await this.store.write(db);
  }

  async deleteProject(id: string): Promise<void> {
    const db = await this.store.read();
    db.projects = db.projects.filter((p) => p.id !== id);
    db.jobs = db.jobs.filter((j) => j.projectId !== id);
    await this.store.write(db);
  }

  async listJobs(): Promise<GenerationJob[]> {
    const db = await this.store.read();
    return db.jobs;
  }

  async getJob(id: string): Promise<GenerationJob | undefined> {
    const db = await this.store.read();
    return db.jobs.find((j) => j.id === id);
  }

  async saveJob(job: GenerationJob): Promise<void> {
    const db = await this.store.read();
    const index = db.jobs.findIndex((j) => j.id === job.id);
    if (index === -1) {
      db.jobs.push(job);
    } else {
      db.jobs[index] = job;
    }
    await this.store.write(db);
  }
}
