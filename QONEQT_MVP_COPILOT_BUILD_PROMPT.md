# Qoneqt AI Content Engine — MVP / GitHub Copilot Build Specification

## 0. Role and objective

You are GitHub Copilot working as a senior full-stack engineer, AI engineer, and motion-graphics/video-pipeline engineer.

Build a complete, runnable MVP called **Qoneqt AI Content Engine** for the CTRL FREAK 2026 Qoneqt AI challenge.

The challenge asks for technology that can take a topic/prompt/idea/trend and turn it into engaging, ready-to-publish video content for the Qoneqt Global Feed. The solution must be a repeatable pipeline, not a one-off AI-generated video.

The chosen MVP style is deliberately **faceless motion-graphics video**:
- No talking avatar is required.
- No human on screen is required.
- Voice-over + kinetic typography + animated cards/shapes + icons/abstract visuals are the default.
- Premium text-to-video generation must NOT be required for the app to work.
- The complete pipeline must run with local/free components first.
- AI providers must be optional adapters that can be plugged in later.

The app must be polished enough for a hackathon demo and structured cleanly enough to extend into a production prototype.

---

# 1. Core product idea

The product is an AI content factory.

Input:
- Topic
- Angle
- Tone
- Duration
- Target audience
- Optional reference notes

Pipeline:

INPUT
  -> RESEARCH / CONTEXT
  -> SCRIPT GENERATION
  -> STORYBOARD GENERATION
  -> SCENE NORMALIZATION
  -> VISUAL ASSET GENERATION / MOTION-GRAPHICS PLAN
  -> TTS VOICEOVER
  -> VIDEO RENDER
  -> SUBTITLES
  -> QUALITY CONTROL
  -> FINAL VIDEO PACKAGE

Output:
- 9:16 vertical MP4, 1080x1920
- narration audio
- synchronized on-screen text
- scene metadata JSON
- QC report
- optional publish package

The app must show the user what is happening at every stage.

---

# 2. Non-negotiable MVP behavior

The following must work end-to-end without any paid video-generation service:

1. User enters a topic.
2. User chooses duration: 30, 45, or 60 seconds.
3. User chooses tone: educational, energetic, serious, conversational, or dramatic.
4. User chooses content style: Tech News, Explainer, Listicle, Quick Facts, How It Works, Trend Breakdown.
5. User clicks Generate.
6. Backend creates a structured script and storyboard.
7. App generates local TTS voiceover.
8. Renderer creates a faceless motion-graphics video using FFmpeg.
9. Video contains:
   - Qoneqt-style dark visual language
   - strong hook
   - animated headline
   - supporting copy
   - progress indicator
   - accent graphics
   - narration
   - subtitles / highlighted keywords
   - scene transitions
10. QC validates:
   - video stream exists
   - audio stream exists
   - resolution is 1080x1920
   - duration is 8–60 seconds
   - file is readable by ffprobe
11. App displays the finished video in a player.
12. User can download MP4 and the JSON project package.
13. Generated projects are stored in local persistence and visible in History.

No feature may make the basic generation flow depend on an external paid API.

---

# 3. Recommended tech stack

Use TypeScript throughout.

## Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- Lucide React icons
- React Router

Do not overcomplicate the frontend with a large component library. Build a custom dark interface.

## Backend
- Node.js
- TypeScript
- Express
- REST API

## Video
- FFmpeg
- ffprobe

Use `child_process.execFile()` or an equivalent safe process API. Never interpolate untrusted user input into a shell command.

## TTS
Provide provider abstraction:
1. Local TTS provider (default)
   - Linux: `espeak-ng` or `espeak`
   - Windows fallback: PowerShell System.Speech if available
   - macOS fallback: `say`
2. Optional ElevenLabs adapter through environment variables.

The local provider is the default so the application still works without an API key.

## LLM
Create an LLM provider interface:
1. Local deterministic fallback provider (always available)
2. Optional Gemini provider through env vars
3. Keep the provider/model configurable

Do not hard-code a volatile model name. Read model name from environment variables.

## Persistence
Use SQLite for MVP if easy to keep portable. If native SQLite dependency causes setup problems, use a JSON-file repository abstraction while preserving the same repository interface.

Store:
- projects
- generation jobs
- scripts
- scenes
- output file path
- QC result
- created time
- status

---

# 4. Product name and UI language

Product name:
**Qoneqt AI Content Engine**

Subtitle:
**From idea to publish-ready video.**

Do not pretend this is an official Qoneqt product. Clearly label it in the UI as a hackathon project / challenge build where useful.

Visual direction:
- near-black background
- deep purple/violet accents
- white typography
- subtle glow
- thin borders
- strong spacing
- editorial / developer-tool aesthetic
- no generic SaaS gradient overload
- no stock photos in the app UI

Video design direction:
- dark background
- violet/cyan/lime/pink accent variants
- kinetic typography
- abstract geometric motion
- progress bars
- cards
- subtle particles/grids
- no talking person
- no avatar required

---

# 5. Main screens

Build these screens.

## A. Dashboard / Create

Route: `/`

Header:
- Qoneqt AI Content Engine
- Dashboard
- Projects
- Templates
- Settings

Main content:

A large creation card with:

Topic textarea
Example placeholder:
"Why AI agents are changing software development"

Content type select:
- Tech News
- Explainer
- Listicle
- Quick Facts
- How It Works
- Trend Breakdown

Tone select:
- Energetic
- Educational
- Serious
- Conversational
- Dramatic

Duration:
- 30 sec
- 45 sec
- 60 sec

Audience:
- General
- Students
- Developers
- Creators
- Tech enthusiasts

Optional context/reference notes textarea.

Button:
**Generate Video**

Below it, show a small pipeline visualization:

Idea -> Script -> Storyboard -> Voice -> Render -> QC

## B. Generation workspace

Route example: `/projects/:id/generate`

Show:
- current project title
- generation status
- progress percentage
- current stage
- stage list
- live log area
- cancel button

Stages:
1. Understanding topic
2. Writing hook
3. Writing script
4. Creating storyboard
5. Preparing visuals
6. Generating voiceover
7. Rendering video
8. Running quality check
9. Packaging output

Progress must be real based on backend job events; do not fake a continuously moving percentage.

## C. Result / Studio

Route: `/projects/:id`

Left side:
- 9:16 video preview
- play/pause
- current duration
- download MP4

Right side tabs:

Script
- hook
- scene narration
- scene headline
- subheadline

Storyboard
- one card per scene
- duration
- visual idea
- accent

QC
- pass/fail
- resolution
- audio
- duration
- errors/warnings

Export
- MP4
- JSON project package

Buttons:
- Re-render
- Duplicate project
- Download video

## D. Projects / History

Route: `/projects`

Grid/list of previous projects:
- title
- created date
- duration
- status
- thumbnail frame if available
- Open
- Duplicate
- Delete

## E. Templates

Route: `/templates`

Create built-in templates:
1. Breaking Tech News
2. 5 Things You Should Know
3. How It Works
4. One-Minute Explainer
5. AI Trend Breakdown

Each template defines:
- default tone
- scene count guidance
- hook formula
- typography density
- accent color behavior

## F. Settings

Route: `/settings`

Sections:

LLM:
- provider
- API key presence, never display full key
- model

TTS:
- provider
- voice settings
- speed

Rendering:
- output directory
- render quality
- FPS

Publish integration:
- placeholder / adapter status
- explain that actual Qoneqt publishing requires an official supported API or approved integration

System checks:
- Node version
- FFmpeg availability
- ffprobe availability
- TTS availability
- provider status

---

# 6. Backend API

Implement these REST endpoints.

GET `/api/health`

Returns:
```json
{
  "ok": true,
  "services": {
    "ffmpeg": true,
    "ffprobe": true,
    "tts": true,
    "llm": "fallback"
  }
}
```

POST `/api/projects`

Create a project.

Request:
```json
{
  "topic": "5 AI tools every college student should know",
  "contentType": "listicle",
  "tone": "energetic",
  "duration": 45,
  "audience": "students",
  "notes": "Make it practical and fast-paced."
}
```

POST `/api/projects/:id/generate`

Starts pipeline execution.

Return:
```json
{
  "jobId": "...",
  "projectId": "..."
}
```

GET `/api/jobs/:jobId`

Returns actual job state:
```json
{
  "status": "rendering",
  "progress": 72,
  "stage": "Rendering video",
  "message": "Rendering scene 5 of 7"
}
```

GET `/api/projects`

GET `/api/projects/:id`

DELETE `/api/projects/:id`

POST `/api/projects/:id/duplicate`

GET `/api/projects/:id/script`

PUT `/api/projects/:id/script`

GET `/api/projects/:id/storyboard`

PUT `/api/projects/:id/storyboard`

POST `/api/projects/:id/rerender`

GET `/api/projects/:id/download`

GET `/api/projects/:id/package`

GET `/api/system/checks`

---

# 7. Data model

A project should roughly contain:

```ts
interface Project {
  id: string;
  title: string;
  topic: string;
  contentType: string;
  tone: string;
  durationTarget: number;
  audience: string;
  notes?: string;
  status: 'draft' | 'generating' | 'ready' | 'failed';
  script?: ScriptPlan;
  outputVideo?: string;
  outputJson?: string;
  qc?: QCReport;
  createdAt: string;
  updatedAt: string;
}
```

Script schema:

```ts
interface ScriptPlan {
  title: string;
  hook: string;
  description: string;
  totalTargetSeconds: number;
  scenes: Scene[];
}

interface Scene {
  id: string;
  order: number;
  durationTarget: number;
  headline: string;
  subheadline: string;
  narration: string;
  onScreenText: string[];
  visualPrompt: string;
  visualType: 'abstract' | 'image' | 'diagram' | 'chart' | 'typography' | 'mixed';
  accent: 'violet' | 'cyan' | 'lime' | 'orange' | 'pink';
}
```

QC schema:

```ts
interface QCReport {
  pass: boolean;
  duration: number;
  width: number;
  height: number;
  hasAudio: boolean;
  errors: string[];
  warnings: string[];
}
```

---

# 8. LLM behavior

The LLM must return structured JSON, not free-form prose.

Do not trust raw model output.

Implement:
1. JSON parsing
2. markdown-fence stripping
3. schema validation
4. normalization
5. deterministic fallback if invalid

LLM prompt goals:

- Produce a strong first 2–3 second hook.
- Avoid vague introductions.
- Make every scene communicate one idea.
- Keep narration concise enough to fit target duration.
- Use short headlines.
- Use captions that can be read quickly on mobile.
- Produce visual prompts that are easy for a renderer or optional image model to understand.
- End with a concise takeaway or CTA when appropriate.
- Never invent hard facts when the user has provided none; for news/current information, make the app's research layer optional and clearly separate from the creative generation layer.

Fallback content generator:
- deterministic templates
- topic keyword extraction
- listicle/explainer hooks
- 5–8 scenes depending on duration

---

# 9. Motion graphics renderer

The default renderer must be local and deterministic.

Output:
- 1080x1920
- 30fps
- H.264
- AAC audio
- MP4

Each scene should visually contain:

Header:
QONEQT / GLOBAL FEED

Scene counter:
01 / 07

Headline:
Large bold typography.

Supporting text:
Short explanation.

Narration area / kinetic captions:
The current phrase should appear as readable text.

Animated elements:
- progress bar
- accent line
- subtle scale/opacity animation
- cards sliding/fading
- circles/squares/lines
- grid/pulse effects

Use FFmpeg filters, generated SVG/PNG assets, or an equivalent local method.

Do not generate the same static frame for every scene. Every scene should have at least one visual change or animation characteristic.

Implement a clean reusable scene renderer, for example:

`renderScene(scene, context)`

and a full renderer:

`renderProject(project)`

Keep these separate so visual styles can later be swapped.

---

# 10. Subtitles

Implement automatic on-screen captions.

For MVP:
- Use narration text as the source.
- Split into short caption chunks.
- Display 1–2 lines at a time.
- Highlight important words using the scene accent color.

The captions must be large enough for a mobile feed.

---

# 11. Optional AI visual provider architecture

The MVP must work without it.

Create:

```ts
interface VisualProvider {
  generateAsset(input: VisualAssetRequest): Promise<VisualAssetResult>;
}
```

Implement at least a `MotionGraphicsVisualProvider` as the default local provider.

Create placeholders/interfaces for:
- Gemini image generation adapter
- generic HTTP image generation adapter

Do not require any one commercial video provider.

The app should be capable of using generated still images in a later version with a Ken Burns / parallax effect, without changing the pipeline API.

---

# 12. TTS architecture

Create:

```ts
interface TTSProvider {
  synthesize(text: string, options?: TTSOptions): Promise<string>;
}
```

Default implementation:
- local system TTS

Optional implementations:
- ElevenLabs
- another HTTP TTS provider

Store output audio per scene so re-rendering can skip synthesis when unchanged.

---

# 13. Job system

For MVP, do not require Redis.

Implement a simple in-process job manager with persistence:

- queued
- running
- completed
- failed
- cancelled

Publish progress events through polling first.

If easy, also implement Server-Sent Events:
`GET /api/jobs/:jobId/events`

but polling must remain the fallback.

---

# 14. File organization

Use a clean structure similar to:

```text
qoneqt-ai-content-engine/
├─ client/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ hooks/
│  │  ├─ lib/
│  │  ├─ types/
│  │  └─ App.tsx
│  └─ ...
├─ server/
│  ├─ src/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ providers/
│  │  ├─ render/
│  │  ├─ jobs/
│  │  ├─ db/
│  │  └─ index.ts
│  └─ ...
├─ shared/
│  ├─ schemas/
│  └─ types/
├─ assets/
├─ data/
├─ output/
├─ temp/
├─ .env.example
├─ README.md
└─ package.json
```

If you decide a single-package structure is simpler, keep clear separation between frontend/backend modules.

---

# 15. Environment variables

Create `.env.example`:

```env
PORT=8787
NODE_ENV=development

LLM_PROVIDER=fallback
LLM_API_KEY=
LLM_MODEL=

TTS_PROVIDER=local
TTS_API_KEY=
TTS_VOICE=

OUTPUT_DIR=./output
TEMP_DIR=./temp

FFMPEG_PATH=
FFPROBE_PATH=

ENABLE_IMAGE_AI=false
IMAGE_PROVIDER=
IMAGE_API_KEY=

ENABLE_PUBLISH_ADAPTER=false
QONEQT_PUBLISH_URL=
QONEQT_PUBLISH_TOKEN=
```

Never commit real secrets.

---

# 16. Publish architecture

Do NOT invent an undocumented Qoneqt private API.

Create a `PublishProvider` interface:

```ts
interface PublishProvider {
  validate(): Promise<PublishStatus>;
  publish(input: PublishInput): Promise<PublishResult>;
}
```

Implement:

1. `DisabledPublishProvider`
   - default
   - clearly says manual publishing is required

2. `HttpPublishProvider`
   - only activates when the user explicitly supplies an approved endpoint and token through environment variables

The UI should support a future Publish button but must never imply that a working official Qoneqt API exists unless credentials/configuration are provided.

---

# 17. Security

Implement these basics:

- validate all request bodies
- limit topic length
- sanitize filesystem paths
- use `path.basename()` where appropriate
- never place user input directly into a shell command
- do not return API keys
- do not expose `.env`
- do not allow arbitrary file reads through HTTP routes
- restrict downloadable files to generated project files

---

# 18. Error handling

Every stage must return clear errors.

Examples:

`FFmpeg not found`
`TTS provider unavailable`
`LLM provider unavailable; switched to fallback`
`Invalid LLM JSON; fallback applied`
`Render failed`
`QC failed`

Show user-friendly error messages in the frontend and retain technical details in server logs.

---

# 19. Demo mode

Add a one-click:

**Run Demo**

button.

Demo topic:
`5 AI tools every college student should know`

It should immediately run the full pipeline using fallback/local providers.

This is important for a hackathon demo laptop where an internet connection or API key might fail.

---

# 20. README requirements

Write a serious README containing:

1. What the project is
2. Why it solves the challenge
3. Architecture diagram in Mermaid
4. Features
5. Prerequisites
6. FFmpeg installation instructions for Windows/macOS/Linux
7. TTS installation instructions
8. Optional Gemini configuration
9. Run instructions
10. CLI generation instructions
11. API documentation
12. Screenshots placeholders
13. Demo flow
14. Known limitations
15. Future roadmap
16. License

Do not claim Qoneqt API access unless configured.

---

# 21. Tests

Add at least:

Unit tests for:
- LLM JSON parsing
- scene normalization
- duration calculation
- file/path sanitization
- QC logic

Integration test for:
- create project -> generate -> output exists -> QC passes

The integration test should skip gracefully when FFmpeg/TTS are unavailable, but the README must explain how to run it fully.

---

# 22. Quality requirements

Do not make the UI look like a generic generated dashboard.

Prioritize:
- spacing
- typography
- contrast
- responsive layout
- clear state transitions
- polished empty states
- meaningful loading states
- keyboard accessibility
- mobile usability

For video output, ensure:
- readable text
- adequate safe margins
- no text clipping
- no overflow
- no extremely long captions
- visual variety between scenes
- audio synchronized enough for MVP

---

# 23. Acceptance criteria

The implementation is considered complete only when all of these are true:

[ ] `npm install` works.
[ ] `npm run dev` starts the app.
[ ] Dashboard loads.
[ ] Health/system checks work.
[ ] User can create a project.
[ ] User can generate a project without any API key.
[ ] Local fallback script generation works.
[ ] Local TTS works where the required system tool is installed.
[ ] FFmpeg render works.
[ ] Video is 1080x1920.
[ ] Video contains audio.
[ ] Video duration is within 8–60 sec.
[ ] QC passes valid outputs.
[ ] Result page previews the MP4.
[ ] User can download MP4.
[ ] User can download JSON project package.
[ ] Projects persist and appear in History.
[ ] User can open a prior project.
[ ] User can edit the script/storyboard and re-render.
[ ] Demo mode works.
[ ] Optional LLM provider can be configured through env vars.
[ ] Optional TTS provider can be configured through env vars.
[ ] No API key is committed.
[ ] README is complete.

---

# 24. Build order — follow this sequence

Do not try to build everything randomly.

Phase 1: Foundation
- Create monorepo/package structure.
- TypeScript configuration.
- Environment handling.
- Shared types/schemas.

Phase 2: Backend core
- Express server.
- Health route.
- Project repository.
- Project CRUD.
- Job manager.

Phase 3: AI pipeline
- LLM provider interface.
- fallback generator.
- optional Gemini adapter.
- schema validation.

Phase 4: Video pipeline
- TTS provider.
- scene renderer.
- subtitle renderer.
- FFmpeg compositor.
- QC.

Phase 5: Frontend
- Dashboard.
- generation workspace.
- result studio.
- project history.
- templates.
- settings.

Phase 6: Integration
- connect UI to API.
- real job progress.
- download routes.
- error states.

Phase 7: Polish
- responsive design.
- demo mode.
- empty states.
- loading states.
- accessibility.

Phase 8: Testing/documentation
- tests.
- README.
- sample project.
- screenshot placeholders.

After each phase, run the app/tests and fix errors before proceeding.

---

# 25. Important engineering instruction

Do NOT stop at scaffolding.

Actually implement the code for:
- frontend
- backend
- persistence
- pipeline
- TTS
- renderer
- QC
- project history
- editing
- downloads
- configuration

Do not return pseudocode for core functionality.

When a third-party service is unavailable, build a working local fallback instead of leaving a TODO.

Do not use paid AI video generation as a hard dependency.

The final result must be runnable on a normal developer laptop with Node.js and FFmpeg installed.

---

# 26. First demo scenario

Use this exact initial demo scenario:

Topic:
`5 AI tools every college student should know`

Content type:
`Listicle`

Tone:
`Energetic`

Duration:
`45`

Audience:
`Students`

Notes:
`Fast-paced, useful, no avatar, faceless motion graphics, strong hook in the first 2 seconds, readable captions.`

The final demo should look like a polished social video rather than a plain text slideshow.

---

# 27. Final expected result

When finished, the repository should behave like this:

```text
Open app
  -> Enter topic
  -> Select format/tone/duration
  -> Generate
  -> Watch real pipeline progress
  -> Open Studio
  -> Preview generated video
  -> Inspect script/storyboard/QC
  -> Edit if needed
  -> Re-render
  -> Download MP4 + JSON
```

The architecture must make it straightforward to add real AI image generation, premium TTS, stronger research, and an approved Qoneqt publishing integration later without rewriting the core pipeline.

Build this now.
