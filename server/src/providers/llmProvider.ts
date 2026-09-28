import { scriptPlanSchema, type CreateProjectInput, type ScriptPlan } from '@qoneqt/shared';
import { config } from '../config.js';

export interface LLMRequest {
  topic: string;
  contentType: CreateProjectInput['contentType'];
  tone: CreateProjectInput['tone'];
  duration: number;
  audience: CreateProjectInput['audience'];
  notes?: string;
}

export interface LLMProvider {
  name: string;
  generateScript(request: LLMRequest): Promise<ScriptPlan>;
}

const accents = ['violet', 'cyan', 'lime', 'orange', 'pink'] as const;

function sceneCount(duration: number): number {
  if (duration <= 30) return 5;
  if (duration <= 45) return 6;
  return 8;
}

function splitKeywords(topic: string): string[] {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 8);
}

function contentTypeHook(contentType: string, topic: string): string {
  const hooks: Record<string, string> = {
    tech_news: `Breaking update: ${topic} is shifting faster than most people realize.`,
    explainer: `In under a minute, here's how ${topic} actually works.`,
    listicle: `Here are the most practical picks on ${topic} you can use today.`,
    quick_facts: `Rapid facts: what matters most about ${topic} right now.`,
    how_it_works: `Let's unpack the mechanics behind ${topic} step by step.`,
    trend_breakdown: `Why ${topic} is trending, and what it means next.`
  };
  return hooks[contentType] || `Why ${topic} matters right now.`;
}

function makeScenes(request: LLMRequest): ScriptPlan['scenes'] {
  const count = sceneCount(request.duration);
  const keywords = splitKeywords(request.topic);
  const eachDuration = Math.max(5, Math.round(request.duration / count));

  const coreIdeas = [
    'Hook and promise',
    'Core context',
    'Practical angle',
    'Top insight',
    'Common mistake',
    'Actionable step',
    'Future outlook',
    'CTA'
  ];

  return Array.from({ length: count }).map((_, index) => {
    const keyword = keywords[index % Math.max(1, keywords.length)] ?? request.topic.split(' ')[0] ?? 'AI';
    const idea = coreIdeas[index] ?? `Insight ${index + 1}`;
    const accent = accents[index % accents.length];
    return {
      id: `scene-${index + 1}`,
      order: index + 1,
      durationTarget: eachDuration,
      headline: index === 0 ? `Start with ${keyword}` : `${idea}: ${keyword}`,
      subheadline:
        index === 0
          ? `What ${request.audience} should know in seconds`
          : `Clear takeaway for ${request.audience}`,
      narration:
        index === 0
          ? `${contentTypeHook(request.contentType, request.topic)} Stay with me for the fastest breakdown.`
          : `Scene ${index + 1}. ${idea} for ${request.topic}. Keep this concise, practical, and aligned with a ${request.tone} tone.`,
      onScreenText:
        index === 0
          ? ['QONEQT / GLOBAL FEED', request.topic.slice(0, 58)]
          : [`${index + 1}. ${idea}`, `Use: ${keyword}`],
      visualPrompt: `Dark motion graphics, ${accent} accent, kinetic typography, keyword: ${keyword}`,
      visualType: 'typography' as const,
      accent
    };
  });
}

function normalizeScript(script: ScriptPlan, durationTarget: number): ScriptPlan {
  const total = script.scenes.reduce((sum, s) => sum + s.durationTarget, 0);
  if (total <= 0) return script;
  const ratio = durationTarget / total;
  const adjusted = script.scenes.map((scene) => ({
    ...scene,
    durationTarget: Math.max(3, Math.round(scene.durationTarget * ratio))
  }));
  const normalized = { ...script, totalTargetSeconds: durationTarget, scenes: adjusted };
  return normalized;
}

export function stripMarkdownFences(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('```')) return trimmed;
  return trimmed
    .replace(/^```[a-zA-Z]*\n?/, '')
    .replace(/```$/, '')
    .trim();
}

export function parseAndValidateLLMOutput(raw: string, duration: number): ScriptPlan {
  const cleaned = stripMarkdownFences(raw);
  const parsed = JSON.parse(cleaned);
  const validated = scriptPlanSchema.parse(parsed);
  return normalizeScript(validated, duration);
}

export class FallbackLLMProvider implements LLMProvider {
  name = 'fallback';

  async generateScript(request: LLMRequest): Promise<ScriptPlan> {
    const scenes = makeScenes(request);
    const output: ScriptPlan = {
      title: request.topic,
      hook: contentTypeHook(request.contentType, request.topic),
      description: `${request.contentType} script for ${request.audience}`,
      totalTargetSeconds: request.duration,
      scenes
    };
    return normalizeScript(output, request.duration);
  }
}

export class GeminiLLMProvider implements LLMProvider {
  name = 'gemini';

  async generateScript(request: LLMRequest): Promise<ScriptPlan> {
    if (!config.llmApiKey) {
      throw new Error('LLM provider unavailable; switched to fallback');
    }
    // Optional adapter placeholder: keeping fallback behavior for offline-first MVP.
    const fallback = new FallbackLLMProvider();
    return fallback.generateScript(request);
  }
}

export function createLLMProvider(): LLMProvider {
  if (config.llmProvider === 'gemini') {
    return new GeminiLLMProvider();
  }
  return new FallbackLLMProvider();
}
