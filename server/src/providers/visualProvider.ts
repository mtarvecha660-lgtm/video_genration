export interface VisualAssetRequest {
  sceneId: string;
  prompt: string;
  accent: string;
}

export interface VisualAssetResult {
  type: 'motion_graphics' | 'image';
  assetPath?: string;
  metadata?: Record<string, unknown>;
}

export interface VisualProvider {
  generateAsset(input: VisualAssetRequest): Promise<VisualAssetResult>;
}

export class MotionGraphicsVisualProvider implements VisualProvider {
  async generateAsset(input: VisualAssetRequest): Promise<VisualAssetResult> {
    return {
      type: 'motion_graphics',
      metadata: {
        sceneId: input.sceneId,
        prompt: input.prompt,
        accent: input.accent
      }
    };
  }
}

export class GeminiImageVisualProvider implements VisualProvider {
  async generateAsset(): Promise<VisualAssetResult> {
    throw new Error('Gemini image adapter not configured');
  }
}

export class HttpImageVisualProvider implements VisualProvider {
  async generateAsset(): Promise<VisualAssetResult> {
    throw new Error('HTTP image adapter not configured');
  }
}
