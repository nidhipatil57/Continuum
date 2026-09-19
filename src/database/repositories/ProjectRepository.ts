import { db } from '../db';
import type { Project } from '@/shared/types';

export const ProjectRepository = {
  async getAll(): Promise<Project[]> {
    return db.projects.orderBy('updatedAt').reverse().toArray();
  },

  async getById(id: string): Promise<Project | undefined> {
    return db.projects.get(id);
  },

  async create(project: Project): Promise<string> {
    return db.projects.add(project);
  },

  async update(id: string, changes: Partial<Project>): Promise<void> {
    await db.projects.update(id, { ...changes, updatedAt: new Date().toISOString() });
  },

  async remove(id: string): Promise<void> {
    await db.transaction('rw', [db.projects, db.decisions, db.requirements, db.constraints, db.questions, db.researchFindings, db.conversations, db.files, db.timelineEvents, db.memoryCommits, db.contextRules], async () => {
      await db.decisions.where('projectId').equals(id).delete();
      await db.requirements.where('projectId').equals(id).delete();
      await db.constraints.where('projectId').equals(id).delete();
      await db.questions.where('projectId').equals(id).delete();
      await db.researchFindings.where('projectId').equals(id).delete();
      await db.conversations.where('projectId').equals(id).delete();
      await db.files.where('projectId').equals(id).delete();
      await db.timelineEvents.where('projectId').equals(id).delete();
      await db.memoryCommits.where('projectId').equals(id).delete();
      await db.contextRules.where('projectId').equals(id).delete();
      await db.projects.delete(id);
    });
  },

  async getActive(): Promise<Project[]> {
    return db.projects.where('status').equals('active').toArray();
  },
};
