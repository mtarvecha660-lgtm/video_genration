export interface PublishStatus {
  enabled: boolean;
  message: string;
}

export interface PublishInput {
  projectId: string;
  videoPath: string;
  packagePath: string;
}

export interface PublishResult {
  ok: boolean;
  message: string;
}

export interface PublishProvider {
  validate(): Promise<PublishStatus>;
  publish(input: PublishInput): Promise<PublishResult>;
}

export class DisabledPublishProvider implements PublishProvider {
  async validate(): Promise<PublishStatus> {
    return { enabled: false, message: 'Publishing disabled. Manual publishing required.' };
  }

  async publish(): Promise<PublishResult> {
    return { ok: false, message: 'Publishing disabled. Configure approved endpoint and token.' };
  }
}

export class HttpPublishProvider implements PublishProvider {
  constructor(private readonly endpoint: string, private readonly token: string) {}

  async validate(): Promise<PublishStatus> {
    if (!this.endpoint || !this.token) {
      return { enabled: false, message: 'Missing publish endpoint or token.' };
    }
    return { enabled: true, message: 'HTTP publish adapter enabled.' };
  }

  async publish(): Promise<PublishResult> {
    return { ok: false, message: 'Publish integration placeholder. Endpoint configured.' };
  }
}
