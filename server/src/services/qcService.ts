import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { QCReport } from '@qoneqt/shared';
import { config } from '../config.js';

const execFileAsync = promisify(execFile);

interface ProbeStream {
  codec_type?: string;
  width?: number;
  height?: number;
}

interface ProbeOutput {
  streams?: ProbeStream[];
  format?: { duration?: string };
}

export async function runQC(videoPath: string): Promise<QCReport> {
  const errors: string[] = [];
  const warnings: string[] = [];

  let data: ProbeOutput | undefined;
  try {
    const { stdout } = await execFileAsync(config.ffprobePath, [
      '-v',
      'error',
      '-show_streams',
      '-show_format',
      '-print_format',
      'json',
      videoPath
    ]);
    data = JSON.parse(stdout) as ProbeOutput;
  } catch {
    return {
      pass: false,
      duration: 0,
      width: 0,
      height: 0,
      hasAudio: false,
      errors: ['file is unreadable by ffprobe'],
      warnings
    };
  }

  const videoStream = data.streams?.find((stream) => stream.codec_type === 'video');
  const audioStream = data.streams?.find((stream) => stream.codec_type === 'audio');
  const duration = Number(data.format?.duration ?? 0);

  if (!videoStream) errors.push('video stream exists: false');
  if (!audioStream) errors.push('audio stream exists: false');

  const width = videoStream?.width ?? 0;
  const height = videoStream?.height ?? 0;

  if (width !== 1080 || height !== 1920) {
    errors.push(`resolution expected 1080x1920, got ${width}x${height}`);
  }

  if (duration < 8 || duration > 60) {
    errors.push(`duration is outside allowed range 8-60 sec: ${duration.toFixed(2)}`);
  }

  if (duration < 15) {
    warnings.push('very short duration may reduce watch-time');
  }

  return {
    pass: errors.length === 0,
    duration,
    width,
    height,
    hasAudio: Boolean(audioStream),
    errors,
    warnings
  };
}
