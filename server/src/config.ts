import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const rootDir = path.resolve(process.cwd(), '..');

export const config = {
  port: Number(process.env.PORT || 8787),
  nodeEnv: process.env.NODE_ENV || 'development',
  llmProvider: process.env.LLM_PROVIDER || 'fallback',
  llmApiKey: process.env.LLM_API_KEY || '',
  llmModel: process.env.LLM_MODEL || 'fallback-v1',
  ttsProvider: process.env.TTS_PROVIDER || 'local',
  ttsApiKey: process.env.TTS_API_KEY || '',
  ttsVoice: process.env.TTS_VOICE || 'default',
  outputDir: path.resolve(rootDir, process.env.OUTPUT_DIR || 'output'),
  tempDir: path.resolve(rootDir, process.env.TEMP_DIR || 'temp'),
  ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
  ffprobePath: process.env.FFPROBE_PATH || 'ffprobe',
  dataDir: path.resolve(rootDir, 'data')
};
