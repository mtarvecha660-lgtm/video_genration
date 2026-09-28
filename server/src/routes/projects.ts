import { Router } from 'express';
import { createProjectSchema, scriptPlanSchema } from '@qoneqt/shared';
import type { Project } from '@qoneqt/shared';
import { ProjectRepository } from '../db/projectRepository.js';

function makeTitle(topic: string): string {
  return topic.split(' ').slice(0, 8).join(' ');
}

export function createProjectRouter(repository: ProjectRepository): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const now = new Date().toISOString();
    const input = parsed.data;
    const project: Project = {
      id: crypto.randomUUID(),
      title: makeTitle(input.topic),
      topic: input.topic,
      contentType: input.contentType,
      tone: input.tone,
      durationTarget: input.duration,
      audience: input.audience,
      notes: input.notes,
      status: 'draft',
      createdAt: now,
      updatedAt: now
    };

    await repository.saveProject(project);
    return res.status(201).json(project);
  });

  router.get('/', async (_req, res) => {
    const projects = await repository.listProjects();
    res.json(projects);
  });

  router.get('/:id', async (req, res) => {
    const project = await repository.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  });

  router.delete('/:id', async (req, res) => {
    await repository.deleteProject(req.params.id);
    res.status(204).send();
  });

  router.post('/:id/duplicate', async (req, res) => {
    const project = await repository.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const now = new Date().toISOString();
    const copy: Project = {
      ...project,
      id: crypto.randomUUID(),
      title: `${project.title} (Copy)`,
      status: 'draft',
      outputVideo: undefined,
      outputJson: undefined,
      qc: undefined,
      createdAt: now,
      updatedAt: now
    };
    await repository.saveProject(copy);
    res.status(201).json(copy);
  });

  router.get('/:id/script', async (req, res) => {
    const project = await repository.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project.script ?? null);
  });

  router.put('/:id/script', async (req, res) => {
    const project = await repository.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const parsed = scriptPlanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid script', details: parsed.error.flatten() });
    }
    project.script = parsed.data;
    project.updatedAt = new Date().toISOString();
    await repository.saveProject(project);
    res.json(project.script);
  });

  router.get('/:id/storyboard', async (req, res) => {
    const project = await repository.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project.script?.scenes ?? []);
  });

  router.put('/:id/storyboard', async (req, res) => {
    const project = await repository.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const parsed = scriptPlanSchema.pick({ scenes: true }).safeParse({ scenes: req.body });
    if (!parsed.success || !project.script) {
      return res.status(400).json({ error: 'Invalid storyboard or missing script' });
    }
    project.script.scenes = parsed.data.scenes;
    project.updatedAt = new Date().toISOString();
    await repository.saveProject(project);
    res.json(project.script.scenes);
  });

  return router;
}
