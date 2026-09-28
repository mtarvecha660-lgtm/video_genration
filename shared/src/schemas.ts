import { z } from 'zod';

const contentTypeSchema = z.enum([
  'tech_news',
  'explainer',
  'listicle',
  'quick_facts',
  'how_it_works',
  'trend_breakdown'
]);

const toneSchema = z.enum(['energetic', 'educational', 'serious', 'conversational', 'dramatic']);
const audienceSchema = z.enum(['general', 'students', 'developers', 'creators', 'tech_enthusiasts']);
const accentSchema = z.enum(['violet', 'cyan', 'lime', 'orange', 'pink']);
const visualTypeSchema = z.enum(['abstract', 'image', 'diagram', 'chart', 'typography', 'mixed']);

export const createProjectSchema = z.object({
  topic: z.string().trim().min(5).max(180),
  contentType: contentTypeSchema,
  tone: toneSchema,
  duration: z.union([z.literal(30), z.literal(45), z.literal(60)]),
  audience: audienceSchema,
  notes: z.string().max(1000).optional().default('')
});

export const sceneSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(),
  durationTarget: z.number().min(2).max(20),
  headline: z.string().min(2).max(120),
  subheadline: z.string().min(2).max(180),
  narration: z.string().min(8).max(420),
  onScreenText: z.array(z.string().min(1).max(80)).min(1).max(5),
  visualPrompt: z.string().min(3).max(240),
  visualType: visualTypeSchema,
  accent: accentSchema
});

export const scriptPlanSchema = z.object({
  title: z.string().min(3).max(120),
  hook: z.string().min(6).max(180),
  description: z.string().min(3).max(280),
  totalTargetSeconds: z.number().min(8).max(60),
  scenes: z.array(sceneSchema).min(3).max(12)
});

export const qcReportSchema = z.object({
  pass: z.boolean(),
  duration: z.number().min(0),
  width: z.number().int().min(0),
  height: z.number().int().min(0),
  hasAudio: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string())
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
