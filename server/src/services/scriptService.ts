import type { Project } from '@qoneqt/shared';
import { createLLMProvider, FallbackLLMProvider } from '../providers/llmProvider.js';

export async function generateProjectScript(project: Project): Promise<{ script: Project['script']; warning?: string }> {
  const provider = createLLMProvider();

  try {
    const script = await provider.generateScript({
      topic: project.topic,
      contentType: project.contentType,
      tone: project.tone,
      duration: project.durationTarget,
      audience: project.audience,
      notes: project.notes
    });
    return { script };
  } catch {
    const fallback = new FallbackLLMProvider();
    const script = await fallback.generateScript({
      topic: project.topic,
      contentType: project.contentType,
      tone: project.tone,
      duration: project.durationTarget,
      audience: project.audience,
      notes: project.notes
    });
    return { script, warning: 'LLM provider unavailable; switched to fallback' };
  }
}
