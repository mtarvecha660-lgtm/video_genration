import fs from 'node:fs/promises';
import path from 'node:path';

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export function safeFileName(input: string): string {
  const base = path.basename(input).replace(/[^a-zA-Z0-9._-]/g, '_');
  return base.slice(0, 120);
}

export function safeProjectPath(baseDir: string, projectId: string, fileName: string): string {
  const safeId = safeFileName(projectId);
  const safeFile = safeFileName(fileName);
  return path.join(baseDir, safeId, safeFile);
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
