import Dexie, { type Table } from 'dexie';
import type {
  Project,
  Requirement,
  Decision,
  Constraint,
  Question,
  ResearchFinding,
  Conversation,
  ProjectFile,
  TimelineEvent,
  MemoryCommit,
  ContextRule,
  AppSettings,
} from '@/shared/types';

export class ContinuumDB extends Dexie {
  projects!: Table<Project, string>;
  requirements!: Table<Requirement, string>;
  decisions!: Table<Decision, string>;
  constraints!: Table<Constraint, string>;
  questions!: Table<Question, string>;
  researchFindings!: Table<ResearchFinding, string>;
  conversations!: Table<Conversation, string>;
  files!: Table<ProjectFile, string>;
  timelineEvents!: Table<TimelineEvent, string>;
  memoryCommits!: Table<MemoryCommit, string>;
  contextRules!: Table<ContextRule, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('ContinuumDB');

    this.version(1).stores({
      projects: 'id, name, status, createdAt, updatedAt',
      requirements: 'id, projectId, status, priority, createdAt',
      decisions: 'id, projectId, status, proposedBy, createdAt, updatedAt',
      constraints: 'id, projectId, severity, status',
      questions: 'id, projectId, status, createdAt',
      researchFindings: 'id, projectId, verificationStatus, model, date',
      conversations: 'id, projectId, model, startedAt, lastUpdatedAt',
      files: 'id, projectId, name, type',
      timelineEvents: 'id, projectId, type, timestamp, model',
      memoryCommits: 'id, projectId, version, timestamp',
      contextRules: 'id, projectId, type',
      settings: 'id',
    });
  }
}

export const db = new ContinuumDB();

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  activeProjectId: null,
  onboardingCompleted: false,
  providers: [
    { providerId: 'chatgpt', enabled: true, role: 'Engineer', autoCapture: false, autoUpdateMemory: false, requireConfirmation: true },
    { providerId: 'claude', enabled: true, role: 'Architect', autoCapture: false, autoUpdateMemory: false, requireConfirmation: true },
    { providerId: 'gemini', enabled: true, role: 'Explorer', autoCapture: false, autoUpdateMemory: false, requireConfirmation: true },
    { providerId: 'perplexity', enabled: true, role: 'Researcher', autoCapture: false, autoUpdateMemory: false, requireConfirmation: true },
  ],
  memoryPermissions: {
    whoCanCreate: 'both',
    whoCanModify: 'ai_proposes_user_approves',
    whoCanDelete: 'user_only',
  },
  privacy: {
    localStorageEnabled: true,
    cloudSyncEnabled: false,
    secretRedactionEnabled: true,
    memoryEncryptionEnabled: false,
  },
};

export async function getSettings(): Promise<AppSettings> {
  const settings = await db.settings.get('app');
  return settings ?? DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  await db.settings.put({ ...current, ...settings, id: 'app' } as AppSettings & { id: string });
}
