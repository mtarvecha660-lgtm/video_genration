import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs/promises';
import { config } from './config.js';
import { createProjectRouter } from './routes/projects.js';
import { createJobsRouter } from './routes/jobs.js';
import { ProjectRepository } from './db/projectRepository.js';
import { JobManager } from './jobs/jobManager.js';
import { ensureDir } from './utils/fs.js';
import { getSystemChecks } from './services/systemService.js';
import { runGenerationPipeline } from './services/generationPipeline.js';

const app = express();
const repository = new ProjectRepository();
const jobs = new JobManager(repository);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  const services = await getSystemChecks();
  res.json({ ok: true, services });
});

app.get('/api/system/checks', async (_req, res) => {
  res.json(await getSystemChecks());
});

app.use('/api/projects', createProjectRouter(repository));
app.use('/api/jobs', createJobsRouter(jobs));

app.post('/api/projects/:id/generate', async (req, res) => {
  const project = await repository.getProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  project.status = 'generating';
  project.updatedAt = new Date().toISOString();
  await repository.saveProject(project);

  const job = await jobs.create(project.id);
  await jobs.update(job.id, {
    status: 'running',
    stage: 'Understanding topic',
    progress: 5,
    message: 'Pipeline started',
    log: 'Project queued'
  });

  void runGenerationPipeline(project.id, job.id, repository, jobs);
  res.status(202).json({ jobId: job.id, projectId: project.id });
});

app.post('/api/projects/:id/rerender', async (req, res) => {
  const project = await repository.getProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (!project.script) return res.status(400).json({ error: 'Script is required before rerender' });
  project.status = 'generating';
  project.updatedAt = new Date().toISOString();
  await repository.saveProject(project);
  const job = await jobs.create(project.id);
  void runGenerationPipeline(project.id, job.id, repository, jobs);
  res.status(202).json({ jobId: job.id, projectId: project.id });
});

app.get('/api/projects/:id/download', async (req, res) => {
  const project = await repository.getProject(req.params.id);
  if (!project?.outputVideo) return res.status(404).json({ error: 'Video not found' });
  if (!project.outputVideo.startsWith(config.outputDir)) {
    return res.status(400).json({ error: 'Invalid output path' });
  }
  res.download(project.outputVideo, path.basename(project.outputVideo));
});

app.get('/api/projects/:id/package', async (req, res) => {
  const project = await repository.getProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const packagePath = project.outputJson ?? path.join(config.outputDir, project.id, 'project-package.json');
  if (!packagePath.startsWith(config.outputDir)) return res.status(400).json({ error: 'Invalid package path' });
  await ensureDir(path.dirname(packagePath));
  await fs.writeFile(packagePath, JSON.stringify(project, null, 2), 'utf8');
  res.download(packagePath, path.basename(packagePath));
});

const server = app.listen(config.port, async () => {
  await Promise.all([ensureDir(config.outputDir), ensureDir(config.tempDir), ensureDir(config.dataDir)]);
  console.log(`Qoneqt server running at http://localhost:${config.port}`);
});

server.on('error', (error) => {
  console.error('Server error', error);
});
