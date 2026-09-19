import { db } from '../db';
import type { Conversation, Question, ResearchFinding, ProjectFile, Constraint, TimelineEvent, MemoryCommit, ContextRule } from '@/shared/types';

// ============================================================
// CONVERSATION REPOSITORY
// ============================================================

export const ConversationRepository = {
  async getByProject(projectId: string): Promise<Conversation[]> {
    return db.conversations.where('projectId').equals(projectId).reverse().sortBy('lastUpdatedAt');
  },
  async getById(id: string): Promise<Conversation | undefined> {
    return db.conversations.get(id);
  },
  async create(conv: Conversation): Promise<string> {
    return db.conversations.add(conv);
  },
  async update(id: string, changes: Partial<Conversation>): Promise<void> {
    await db.conversations.update(id, { ...changes, lastUpdatedAt: new Date().toISOString() });
  },
  async remove(id: string): Promise<void> {
    await db.conversations.delete(id);
  },
  async countByProject(projectId: string): Promise<number> {
    return db.conversations.where('projectId').equals(projectId).count();
  },
  async getByModel(projectId: string, model: string): Promise<Conversation[]> {
    return db.conversations.where({ projectId, model }).toArray();
  },
};

// ============================================================
// QUESTION REPOSITORY
// ============================================================

export const QuestionRepository = {
  async getByProject(projectId: string): Promise<Question[]> {
    return db.questions.where('projectId').equals(projectId).reverse().sortBy('createdAt');
  },
  async getById(id: string): Promise<Question | undefined> {
    return db.questions.get(id);
  },
  async create(q: Question): Promise<string> {
    return db.questions.add(q);
  },
  async update(id: string, changes: Partial<Question>): Promise<void> {
    await db.questions.update(id, changes);
  },
  async remove(id: string): Promise<void> {
    await db.questions.delete(id);
  },
  async resolve(id: string, resolution: string): Promise<void> {
    await db.questions.update(id, {
      status: 'RESOLVED',
      resolution,
      resolvedAt: new Date().toISOString(),
    });
  },
  async getOpen(projectId: string): Promise<Question[]> {
    return db.questions.where({ projectId, status: 'OPEN' }).toArray();
  },
  async countByProject(projectId: string): Promise<number> {
    return db.questions.where('projectId').equals(projectId).count();
  },
  async countOpen(projectId: string): Promise<number> {
    return db.questions.where({ projectId, status: 'OPEN' }).count();
  },
};

// ============================================================
// RESEARCH REPOSITORY
// ============================================================

export const ResearchRepository = {
  async getByProject(projectId: string): Promise<ResearchFinding[]> {
    return db.researchFindings.where('projectId').equals(projectId).reverse().sortBy('date');
  },
  async getById(id: string): Promise<ResearchFinding | undefined> {
    return db.researchFindings.get(id);
  },
  async create(finding: ResearchFinding): Promise<string> {
    return db.researchFindings.add(finding);
  },
  async update(id: string, changes: Partial<ResearchFinding>): Promise<void> {
    await db.researchFindings.update(id, changes);
  },
  async remove(id: string): Promise<void> {
    await db.researchFindings.delete(id);
  },
  async countByProject(projectId: string): Promise<number> {
    return db.researchFindings.where('projectId').equals(projectId).count();
  },
};

// ============================================================
// FILE REPOSITORY
// ============================================================

export const FileRepository = {
  async getByProject(projectId: string): Promise<ProjectFile[]> {
    return db.files.where('projectId').equals(projectId).toArray();
  },
  async getById(id: string): Promise<ProjectFile | undefined> {
    return db.files.get(id);
  },
  async create(file: ProjectFile): Promise<string> {
    return db.files.add(file);
  },
  async update(id: string, changes: Partial<ProjectFile>): Promise<void> {
    await db.files.update(id, changes);
  },
  async remove(id: string): Promise<void> {
    await db.files.delete(id);
  },
  async countByProject(projectId: string): Promise<number> {
    return db.files.where('projectId').equals(projectId).count();
  },
};

// ============================================================
// CONSTRAINT REPOSITORY
// ============================================================

export const ConstraintRepository = {
  async getByProject(projectId: string): Promise<Constraint[]> {
    return db.constraints.where('projectId').equals(projectId).toArray();
  },
  async create(constraint: Constraint): Promise<string> {
    return db.constraints.add(constraint);
  },
  async update(id: string, changes: Partial<Constraint>): Promise<void> {
    await db.constraints.update(id, changes);
  },
  async remove(id: string): Promise<void> {
    await db.constraints.delete(id);
  },
};

// ============================================================
// TIMELINE REPOSITORY
// ============================================================

export const TimelineRepository = {
  async getByProject(projectId: string): Promise<TimelineEvent[]> {
    return db.timelineEvents.where('projectId').equals(projectId).reverse().sortBy('timestamp');
  },
  async getByDateRange(projectId: string, start: string, end: string): Promise<TimelineEvent[]> {
    return db.timelineEvents
      .where('projectId').equals(projectId)
      .filter(e => e.timestamp >= start && e.timestamp <= end)
      .reverse()
      .sortBy('timestamp');
  },
  async create(event: TimelineEvent): Promise<string> {
    return db.timelineEvents.add(event);
  },
  async getRecent(projectId: string, limit: number): Promise<TimelineEvent[]> {
    const all = await db.timelineEvents.where('projectId').equals(projectId).reverse().sortBy('timestamp');
    return all.slice(0, limit);
  },
  async countByProject(projectId: string): Promise<number> {
    return db.timelineEvents.where('projectId').equals(projectId).count();
  },
};

// ============================================================
// MEMORY COMMIT REPOSITORY
// ============================================================

export const MemoryCommitRepository = {
  async getByProject(projectId: string): Promise<MemoryCommit[]> {
    return db.memoryCommits.where('projectId').equals(projectId).reverse().sortBy('timestamp');
  },
  async getById(id: string): Promise<MemoryCommit | undefined> {
    return db.memoryCommits.get(id);
  },
  async create(commit: MemoryCommit): Promise<string> {
    return db.memoryCommits.add(commit);
  },
  async getLatest(projectId: string): Promise<MemoryCommit | undefined> {
    const all = await db.memoryCommits.where('projectId').equals(projectId).reverse().sortBy('timestamp');
    return all[0];
  },
};

// ============================================================
// CONTEXT RULE REPOSITORY
// ============================================================

export const ContextRuleRepository = {
  async getByProject(projectId: string): Promise<ContextRule[]> {
    return db.contextRules.where('projectId').equals(projectId).toArray();
  },
  async create(rule: ContextRule): Promise<string> {
    return db.contextRules.add(rule);
  },
  async update(id: string, changes: Partial<ContextRule>): Promise<void> {
    await db.contextRules.update(id, changes);
  },
  async remove(id: string): Promise<void> {
    await db.contextRules.delete(id);
  },
};
