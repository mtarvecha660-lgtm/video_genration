import { Router } from 'express';
import { JobManager } from '../jobs/jobManager.js';

export function createJobsRouter(jobManager: JobManager): Router {
  const router = Router();

  router.get('/:id', async (req, res) => {
    const job = await jobManager.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({
      status: job.status,
      progress: job.progress,
      stage: job.stage,
      message: job.message,
      logs: job.logs,
      projectId: job.projectId,
      updatedAt: job.updatedAt
    });
  });

  router.get('/:id/events', (req, res) => {
    const { id } = req.params;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const unsubscribe = jobManager.subscribe(id, (job) => {
      res.write(`data: ${JSON.stringify(job)}\n\n`);
    });

    req.on('close', () => {
      unsubscribe();
      res.end();
    });
  });

  router.post('/:id/cancel', async (req, res) => {
    const job = await jobManager.cancel(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  });

  return router;
}
