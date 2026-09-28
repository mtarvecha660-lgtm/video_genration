import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { config } from '../config.js';

const execFileAsync = promisify(execFile);

async function commandExists(command: string, args: string[] = ['-version']): Promise<boolean> {
  try {
    await execFileAsync(command, args, { timeout: 4000 });
    return true;
  } catch {
    return false;
  }
}

export async function getSystemChecks(): Promise<Record<string, boolean | string>> {
  const [ffmpeg, ffprobe] = await Promise.all([
    commandExists(config.ffmpegPath),
    commandExists(config.ffprobePath)
  ]);

  const tts = await Promise.any([
    commandExists('espeak-ng', ['--version']),
    commandExists('espeak', ['--version']),
    commandExists('say', ['-v', '?'])
  ]).then(
    () => true,
    () => false
  );

  return {
    node: true,
    ffmpeg,
    ffprobe,
    tts,
    llm: config.llmProvider
  };
}
