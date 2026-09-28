export type ContentType =
  | 'tech_news'
  | 'explainer'
  | 'listicle'
  | 'quick_facts'
  | 'how_it_works'
  | 'trend_breakdown';

export type Tone = 'energetic' | 'educational' | 'serious' | 'conversational' | 'dramatic';

export type Audience = 'general' | 'students' | 'developers' | 'creators' | 'tech_enthusiasts';

export type ProjectStatus = 'draft' | 'generating' | 'ready' | 'failed';
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export type SceneVisualType = 'abstract' | 'image' | 'diagram' | 'chart' | 'typography' | 'mixed';
export type AccentColor = 'violet' | 'cyan' | 'lime' | 'orange' | 'pink';

export interface Scene {
  id: string;
  order: number;
  durationTarget: number;
  headline: string;
  subheadline: string;
  narration: string;
  onScreenText: string[];
  visualPrompt: string;
  visualType: SceneVisualType;
  accent: AccentColor;
}

export interface ScriptPlan {
  title: string;
  hook: string;
  description: string;
  totalTargetSeconds: number;
  scenes: Scene[];
}

export interface QCReport {
  pass: boolean;
  duration: number;
  width: number;
  height: number;
  hasAudio: boolean;
  errors: string[];
  warnings: string[];
}

export interface Project {
  id: string;
  title: string;
  topic: string;
  contentType: ContentType;
  tone: Tone;
  durationTarget: number;
  audience: Audience;
  notes?: string;
  status: ProjectStatus;
  script?: ScriptPlan;
  outputVideo?: string;
  outputJson?: string;
  qc?: QCReport;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationJob {
  id: string;
  projectId: string;
  status: JobStatus;
  progress: number;
  stage: string;
  message: string;
  logs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  topic: string;
  contentType: ContentType;
  tone: Tone;
  duration: 30 | 45 | 60;
  audience: Audience;
  notes?: string;
}
