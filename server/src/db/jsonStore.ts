import fs from 'node:fs/promises';
import path from 'node:path';
import { ensureDir } from '../utils/fs.js';

export class JsonStore<T> {
  constructor(private readonly filePath: string, private readonly seed: T) {}

  async read(): Promise<T> {
    await ensureDir(path.dirname(this.filePath));
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(raw) as T;
    } catch {
      await this.write(this.seed);
      return this.seed;
    }
  }

  async write(value: T): Promise<void> {
    await ensureDir(path.dirname(this.filePath));
    await fs.writeFile(this.filePath, JSON.stringify(value, null, 2), 'utf8');
  }
}
