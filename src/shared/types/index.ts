import { z } from 'zod';

// ============================================================
// ENUMS
// ============================================================

export const EntityStatus = {
  PROPOSED: 'PROPOSED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  OUTDATED: 'OUTDATED',
  REJECTED: 'REJECTED',
} as const;
export type EntityStatus = typeof EntityStatus[keyof typeof EntityStatus];

export const DecisionStatus = {
  PROPOSED: 'PROPOSED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  SUPERSEDED: 'SUPERSEDED',
  CONFLICTING: 'CONFLICTING',
  OUTDATED: 'OUTDATED',
} as const;
export type DecisionStatus = typeof DecisionStatus[keyof typeof DecisionStatus];

export const QuestionStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  BLOCKED: 'BLOCKED',
} as const;
export type QuestionStatus = typeof QuestionStatus[keyof typeof QuestionStatus];

export const VerificationStatus = {
  VERIFIED: 'VERIFIED',
  UNVERIFIED: 'UNVERIFIED',
  DISPUTED: 'DISPUTED',
} as const;
export type VerificationStatus = typeof VerificationStatus[keyof typeof VerificationStatus];

export const ConstraintSeverity = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;
export type ConstraintSeverity = typeof ConstraintSeverity[keyof typeof ConstraintSeverity];

export const MemoryProposalType = {
  GOAL: 'GOAL',
  REQUIREMENT: 'REQUIREMENT',
  DECISION: 'DECISION',
  CONSTRAINT: 'CONSTRAINT',
  ASSUMPTION: 'ASSUMPTION',
  QUESTION: 'QUESTION',
  RESEARCH: 'RESEARCH',
  EVIDENCE: 'EVIDENCE',
  REJECTED_IDEA: 'REJECTED_IDEA',
  CONCLUSION: 'CONCLUSION',
  FILE: 'FILE',
  ARCHITECTURE: 'ARCHITECTURE',
  CHANGE: 'CHANGE',
  CONFLICT: 'CONFLICT',
} as const;
export type MemoryProposalType = typeof MemoryProposalType[keyof typeof MemoryProposalType];

export const ConflictSeverity = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;
export type ConflictSeverity = typeof ConflictSeverity[keyof typeof ConflictSeverity];

export const AIProviderId = {
  CHATGPT: 'chatgpt',
  CLAUDE: 'claude',
  GEMINI: 'gemini',
  PERPLEXITY: 'perplexity',
  KIMI: 'kimi',
  GROK: 'grok',
  DEEPSEEK: 'deepseek',
  COPILOT: 'copilot',
} as const;
export type AIProviderId = typeof AIProviderId[keyof typeof AIProviderId];

export const TimelineEventType = {
  PROJECT_CREATED: 'PROJECT_CREATED',
  CONVERSATION_CAPTURED: 'CONVERSATION_CAPTURED',
  DECISION_PROPOSED: 'DECISION_PROPOSED',
  DECISION_ACCEPTED: 'DECISION_ACCEPTED',
  DECISION_REJECTED: 'DECISION_REJECTED',
  DECISION_SUPERSEDED: 'DECISION_SUPERSEDED',
  REQUIREMENT_ADDED: 'REQUIREMENT_ADDED',
  REQUIREMENT_CHANGED: 'REQUIREMENT_CHANGED',
  CONSTRAINT_ADDED: 'CONSTRAINT_ADDED',
  QUESTION_RAISED: 'QUESTION_RAISED',
  QUESTION_RESOLVED: 'QUESTION_RESOLVED',
  RESEARCH_ADDED: 'RESEARCH_ADDED',
  FILE_ADDED: 'FILE_ADDED',
  FILE_CHANGED: 'FILE_CHANGED',
  CONFLICT_DETECTED: 'CONFLICT_DETECTED',
  CONFLICT_RESOLVED: 'CONFLICT_RESOLVED',
  MEMORY_COMMIT: 'MEMORY_COMMIT',
  HANDOFF_CREATED: 'HANDOFF_CREATED',
  PROJECT_IMPORTED: 'PROJECT_IMPORTED',
  PROJECT_EXPORTED: 'PROJECT_EXPORTED',
} as const;
export type TimelineEventType = typeof TimelineEventType[keyof typeof TimelineEventType];

// ============================================================
// ENTITY INTERFACES
// ============================================================

export interface Project {
  id: string;
  name: string;
  description: string;
  goal: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'paused';
  currentVersion: string;
}

export interface Requirement {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: EntityStatus;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  projectId: string;
  title: string;
  description: string;
  reason: string;
  status: DecisionStatus;
  proposedBy: string;
  acceptedBy?: string;
  createdAt: string;
  updatedAt: string;
  supersedes?: string;
  alternatives: string[];
  relatedFiles: string[];
  relatedRequirements: string[];
  conversationId?: string;
}

export interface Constraint {
  id: string;
  projectId: string;
  title: string;
  description: string;
  severity: ConstraintSeverity;
  status: EntityStatus;
  source: string;
  createdAt: string;
}

export interface Question {
  id: string;
  projectId: string;
  question: string;
  context: string;
  status: QuestionStatus;
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  source: string;
}

export interface ResearchFinding {
  id: string;
  projectId: string;
  claim: string;
  source: string;
  url?: string;
  date: string;
  model: string;
  verificationStatus: VerificationStatus;
  relatedDecisionId?: string;
}

export interface Conversation {
  id: string;
  projectId: string;
  model: AIProviderId;
  platform: string;
  title: string;
  url?: string;
  startedAt: string;
  lastUpdatedAt: string;
  summary: string;
  messageCount: number;
  rawContent?: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  path?: string;
  type: string;
  description: string;
  lastModified: string;
  relatedDecisions: string[];
  relatedRequirements: string[];
}

export interface TimelineEvent {
  id: string;
  projectId: string;
  type: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  model?: string;
  conversationId?: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
}

export interface MemoryCommit {
  id: string;
  projectId: string;
  version: string;
  message: string;
  timestamp: string;
  changes: MemoryChange[];
  conversationIds: string[];
}

export interface MemoryChange {
  entityType: string;
  entityId: string;
  action: 'added' | 'modified' | 'removed';
  field?: string;
  oldValue?: string;
  newValue?: string;
}

export interface ContextRule {
  id: string;
  projectId: string;
  type: 'always_include' | 'never_include' | 'ask_before';
  category: string;
  description: string;
}

export interface ProviderSettings {
  providerId: AIProviderId;
  enabled: boolean;
  role: string;
  autoCapture: boolean;
  autoUpdateMemory: boolean;
  requireConfirmation: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  activeProjectId: string | null;
  onboardingCompleted: boolean;
  providers: ProviderSettings[];
  memoryPermissions: {
    whoCanCreate: 'ai' | 'user' | 'both';
    whoCanModify: 'user_only' | 'ai_proposes_user_approves';
    whoCanDelete: 'user_only';
  };
  privacy: {
    localStorageEnabled: boolean;
    cloudSyncEnabled: boolean;
    secretRedactionEnabled: boolean;
    memoryEncryptionEnabled: boolean;
  };
}

// ============================================================
// CONTEXT INTELLIGENCE TYPES
// ============================================================

export interface MemoryProposal {
  id: string;
  type: MemoryProposalType;
  title: string;
  description: string;
  source: string;
  model: string;
  confidence: number;
  relatedEntities: string[];
  proposedChanges: ProposedChange[];
  status: 'pending' | 'accepted' | 'rejected' | 'edited';
  conversationId: string;
  timestamp: string;
}

export interface ProposedChange {
  field: string;
  currentValue?: string;
  proposedValue: string;
  reason?: string;
}

export interface Conflict {
  id: string;
  projectId: string;
  existingEntityId: string;
  existingEntityType: string;
  existingValue: string;
  newProposal: string;
  source: string;
  severity: ConflictSeverity;
  relatedDecisionId?: string;
  possibleActions: ConflictAction[];
  status: 'detected' | 'resolved' | 'ignored';
  createdAt: string;
}

export interface ConflictAction {
  label: string;
  action: 'keep_existing' | 'accept_new' | 'compare' | 'ignore';
}

export interface CompiledContext {
  projectSummary: string;
  currentObjective: string;
  relevantDecisions: string[];
  constraints: string[];
  relevantFiles: string[];
  openQuestions: string[];
  recentChanges: string[];
  warnings: string[];
  redactions: number;
  tokenEstimate: number;
  fullHandoff: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ConversationContent {
  messages: ConversationMessage[];
  title?: string;
  url?: string;
  model: AIProviderId;
}

export interface SecretDetection {
  type: 'API_KEY' | 'PASSWORD' | 'TOKEN' | 'PRIVATE_URL' | 'CREDENTIAL' | 'PERSONAL_DATA';
  match: string;
  startIndex: number;
  endIndex: number;
  replacement: string;
}

// ============================================================
// PROJECT PASSPORT
// ============================================================

export interface ProjectPassport {
  format: 'continuum-project';
  version: string;
  exportedAt: string;
  project: Project;
  requirements: Requirement[];
  decisions: Decision[];
  constraints: Constraint[];
  questions: Question[];
  research: ResearchFinding[];
  files: ProjectFile[];
  timeline: TimelineEvent[];
  memoryCommits: MemoryCommit[];
  contextRules: ContextRule[];
}

// ============================================================
// EXTENSION MESSAGING
// ============================================================

export type MessageType =
  | 'PING'
  | 'PROVIDER_DETECTED'
  | 'CAPTURE_CONVERSATION'
  | 'CONVERSATION_CAPTURED'
  | 'COMPILE_CONTEXT'
  | 'CONTEXT_COMPILED'
  | 'OPEN_PROVIDER'
  | 'INSERT_CONTEXT'
  | 'CONTEXT_INSERTED'
  | 'OPEN_SIDE_PANEL'
  | 'GET_ACTIVE_PROJECT'
  | 'GET_PROJECT_STATE'
  | 'COMMAND_PALETTE'
  | 'CAPTURE_FAILED';

export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
  tabId?: number;
}

// ============================================================
// ZOD SCHEMAS (for validation)
// ============================================================

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  goal: z.string().max(1000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  status: z.enum(['active', 'archived', 'paused']),
  currentVersion: z.string(),
});

export const ProjectPassportSchema = z.object({
  format: z.literal('continuum-project'),
  version: z.string(),
  exportedAt: z.string().datetime(),
  project: ProjectSchema,
  requirements: z.array(z.any()),
  decisions: z.array(z.any()),
  constraints: z.array(z.any()),
  questions: z.array(z.any()),
  research: z.array(z.any()),
  files: z.array(z.any()),
  timeline: z.array(z.any()),
  memoryCommits: z.array(z.any()),
  contextRules: z.array(z.any()),
});
