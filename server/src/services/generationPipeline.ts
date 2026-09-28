import fs from 'node:fs/promises';
import path from 'node:path';
import type { Project } from '@qoneqt/shared';
import { ProjectRepository } from '../db/projectRepository.js';
import { JobManager } from '../jobs/jobManager.js';
import { generateProjectScript } from './scriptService.js';
import { createTTSProvider } from '../providers/ttsProvider.js';
import { ensureDir } from '../utils/fs.js';
import { config } from '../config.js';
import { renderProject, renderScene } from '../render/ffmpegRenderer.js';
import { runQC } from './qcService.js';
import { MotionGraphicsVisualProvider } from '../providers/visualProvider.js';

async function update(jobManager: JobManager, jobId: string, progress: number, stage: string, message: string): Promise<void> {
  await jobManager.update(jobId, { status: 'running', progress, stage, message, log: `${stage}: ${message}` });
}

async function synthesizeSceneAudio(project: Project, sceneId: string, text: string): Promise<string> {
  const provider = createTTSProvider();
  const projectDir = path.join(config.outputDir, project.id);
  const audioDir = path.join(projectDir, 'audio');
  await ensureDir(audioDir);
  const outFile = path.join(audioDir, `${sceneId}.wav`);
  return provider.synthesize(text, outFile, { voice: config.ttsVoice, speed: 165 });
}

export async function runGenerationPipeline(
  projectId: string,
  jobId: string,
  repository: ProjectRepository,
  jobManager: JobManager
): Promise<void> {
  const project = await repository.getProject(projectId);
  if (!project) throw new Error('Project not found');

  try {
    await update(jobManager, jobId, 8, 'Understanding topic', 'Preparing project context');

    await update(jobManager, jobId, 18, 'Writing hook', 'Generating script and hook');
    const scriptResult = await generateProjectScript(project);
    project.script = scriptResult.script;
    if (scriptResult.warning) {
      await jobManager.update(jobId, { log: scriptResult.warning, message: scriptResult.warning });
    }

    project.status = 'generating';
    project.updatedAt = new Date().toISOString();
    await repository.saveProject(project);

    await update(jobManager, jobId, 32, 'Creating storyboard', 'Normalizing scenes and timing');

    await update(jobManager, jobId, 42, 'Preparing visuals', 'Building motion graphics plan');
    const visualProvider = new MotionGraphicsVisualProvider();
    if (project.script) {
      for (const scene of project.script.scenes) {
        await visualProvider.generateAsset({ sceneId: scene.id, prompt: scene.visualPrompt, accent: scene.accent });
      }
    }

    await update(jobManager, jobId, 56, 'Generating voiceover', 'Synthesizing local scene narration audio');
    if (!project.script) throw new Error('Script generation failed');
    const projectDir = path.join(config.outputDir, project.id);
    await ensureDir(projectDir);

    const sceneVideos: string[] = [];
    for (const scene of project.script.scenes) {
      const audio = await synthesizeSceneAudio(project, scene.id, scene.narration);
      await update(
        jobManager,
        jobId,
        Math.min(72, 56 + Math.floor((scene.order / project.script.scenes.length) * 16)),
        'Rendering video',
        `Rendering scene ${scene.order} of ${project.script.scenes.length}`
      );
      const sceneVideo = await renderScene(scene, projectDir, audio, project.script.scenes.length);
      sceneVideos.push(sceneVideo);
    }

    await update(jobManager, jobId, 82, 'Rendering video', 'Compositing final MP4');
    const finalVideo = await renderProject(project, sceneVideos);

    await update(jobManager, jobId, 90, 'Running quality check', 'Validating output media');
    const qc = await runQC(finalVideo);
    project.qc = qc;

    if (!qc.pass) {
      project.status = 'failed';
      project.updatedAt = new Date().toISOString();
      await repository.saveProject(project);
      await jobManager.update(jobId, {
        status: 'failed',
        progress: 100,
        stage: 'Quality check',
        message: 'QC failed',
        log: qc.errors.join('; ')
      });
      return;
    }

    await update(jobManager, jobId, 96, 'Packaging output', 'Writing project package');
    const packagePath = path.join(projectDir, 'project-package.json');
    project.outputVideo = finalVideo;
    project.outputJson = packagePath;
    project.status = 'ready';
    project.updatedAt = new Date().toISOString();

    await fs.writeFile(packagePath, JSON.stringify(project, null, 2), 'utf8');
    await repository.saveProject(project);

    await jobManager.update(jobId, {
      status: 'completed',
      progress: 100,
      stage: 'Completed',
      message: 'Video generated successfully',
      log: 'Pipeline completed'
    });
  } catch (error) {
    project.status = 'failed';
    project.updatedAt = new Date().toISOString();
    await repository.saveProject(project);
    await jobManager.update(jobId, {
      status: 'failed',
      progress: 100,
      stage: 'Failed',
      message: (error as Error).message,
      log: (error as Error).stack ?? String(error)
    });
  }
}
