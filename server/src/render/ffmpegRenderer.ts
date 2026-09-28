import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { Project, Scene } from '@qoneqt/shared';
import { config } from '../config.js';
import { ensureDir, safeFileName } from '../utils/fs.js';

const execFileAsync = promisify(execFile);

function escapeText(value: string): string {
  return value.replace(/[\\:'\[\]]/g, '\\$&').replace(/\n/g, ' ');
}

function accentColor(accent: Scene['accent']): string {
  const map: Record<Scene['accent'], string> = {
    violet: '#8b5cf6',
    cyan: '#22d3ee',
    lime: '#84cc16',
    orange: '#fb923c',
    pink: '#f472b6'
  };
  return map[accent];
}

export async function renderScene(
  scene: Scene,
  projectDir: string,
  sceneAudioPath: string,
  sceneCount: number
): Promise<string> {
  const sceneFile = path.join(projectDir, `${safeFileName(scene.id)}.mp4`);
  const counter = `${String(scene.order).padStart(2, '0')} / ${String(sceneCount).padStart(2, '0')}`;
  const caption = scene.onScreenText.join(' • ').slice(0, 90);
  const accent = accentColor(scene.accent);

  const vf = [
    `drawbox=x=0:y=0:w=iw:h=ih:color=#08080f:t=fill`,
    `drawtext=text='QONEQT / GLOBAL FEED':fontcolor=white:fontsize=32:x=70:y=80`,
    `drawtext=text='${escapeText(counter)}':fontcolor=${accent}:fontsize=34:x=w-250:y=80`,
    `drawtext=text='${escapeText(scene.headline.slice(0, 70))}':fontcolor=white:fontsize=68:x=70:y=380`,
    `drawtext=text='${escapeText(scene.subheadline.slice(0, 90))}':fontcolor=#b3b3c6:fontsize=38:x=70:y=500`,
    `drawtext=text='${escapeText(caption)}':fontcolor=${accent}:fontsize=40:x=70:y=1420`,
    `drawbox=x=70:y=1660:w=${Math.max(120, Math.floor((scene.order / sceneCount) * 940))}:h=14:color=${accent}:t=fill`
  ].join(',');

  await execFileAsync(
    config.ffmpegPath,
    [
      '-y',
      '-f',
      'lavfi',
      '-i',
      `color=c=#09090f:s=1080x1920:d=${scene.durationTarget}`,
      '-i',
      sceneAudioPath,
      '-vf',
      vf,
      '-r',
      '30',
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-shortest',
      sceneFile
    ],
    { timeout: 120000 }
  );

  return sceneFile;
}

export async function renderProject(project: Project, sceneVideos: string[]): Promise<string> {
  if (!project.script) throw new Error('Script missing for render');
  const projectDir = path.join(config.outputDir, project.id);
  await ensureDir(projectDir);
  const concatFile = path.join(projectDir, 'concat.txt');
  const finalVideo = path.join(projectDir, `${safeFileName(project.title)}.mp4`);

  const concatContent = sceneVideos.map((file) => `file '${file.replace(/'/g, "'\\''")}'`).join('\n');
  await fs.writeFile(concatFile, concatContent, 'utf8');

  await execFileAsync(
    config.ffmpegPath,
    [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      concatFile,
      '-c:v',
      'libx264',
      '-c:a',
      'aac',
      '-pix_fmt',
      'yuv420p',
      finalVideo
    ],
    { timeout: 180000 }
  );

  return finalVideo;
}
