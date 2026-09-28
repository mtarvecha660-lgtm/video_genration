import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { config } from '../config.js';
import { ensureDir } from '../utils/fs.js';

const execFileAsync = promisify(execFile);

export interface TTSOptions {
  voice?: string;
  speed?: number;
}

export interface TTSProvider {
  name: string;
  synthesize(text: string, outputFile: string, options?: TTSOptions): Promise<string>;
  isAvailable(): Promise<boolean>;
}

async function commandWorks(command: string, args: string[]): Promise<boolean> {
  try {
    await execFileAsync(command, args, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export class LocalTTSProvider implements TTSProvider {
  name = 'local';

  async isAvailable(): Promise<boolean> {
    return (
      (await commandWorks('espeak-ng', ['--version'])) ||
      (await commandWorks('espeak', ['--version'])) ||
      (await commandWorks('say', ['-v', '?']))
    );
  }

  async synthesize(text: string, outputFile: string, options?: TTSOptions): Promise<string> {
    await ensureDir(path.dirname(outputFile));
    const content = text.slice(0, 700);

    if (await commandWorks('espeak-ng', ['--version'])) {
      const speed = String(options?.speed ?? 160);
      await execFileAsync('espeak-ng', ['-s', speed, '-w', outputFile, content], { timeout: 20000 });
      return outputFile;
    }

    if (await commandWorks('espeak', ['--version'])) {
      const speed = String(options?.speed ?? 160);
      await execFileAsync('espeak', ['-s', speed, '-w', outputFile, content], { timeout: 20000 });
      return outputFile;
    }

    if (await commandWorks('say', ['-v', '?'])) {
      await execFileAsync('say', ['-o', outputFile, content], { timeout: 20000 });
      return outputFile;
    }

    throw new Error('TTS provider unavailable');
  }
}

export class ElevenLabsTTSProvider implements TTSProvider {
  name = 'elevenlabs';

  async isAvailable(): Promise<boolean> {
    return Boolean(config.ttsApiKey);
  }

  async synthesize(text: string, outputFile: string): Promise<string> {
    if (!config.ttsApiKey) throw new Error('TTS provider unavailable');
    const fallback = new LocalTTSProvider();
    return fallback.synthesize(text, outputFile);
  }
}

export function createTTSProvider(): TTSProvider {
  if (config.ttsProvider === 'elevenlabs') return new ElevenLabsTTSProvider();
  return new LocalTTSProvider();
}
