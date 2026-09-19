import { db } from '../db';
import type { Decision, DecisionStatus } from '@/shared/types';

export const DecisionRepository = {
  async getByProject(projectId: string): Promise<Decision[]> {
    return db.decisions.where('projectId').equals(projectId).reverse().sortBy('createdAt');
  },

  async getById(id: string): Promise<Decision | undefined> {
    return db.decisions.get(id);
  },

  async getByStatus(projectId: string, status: DecisionStatus): Promise<Decision[]> {
    return db.decisions.where({ projectId, status }).toArray();
  },

  async create(decision: Decision): Promise<string> {
    return db.decisions.add(decision);
  },

  async update(id: string, changes: Partial<Decision>): Promise<void> {
    await db.decisions.update(id, { ...changes, updatedAt: new Date().toISOString() });
  },

  async remove(id: string): Promise<void> {
    await db.decisions.delete(id);
  },

  async accept(id: string, acceptedBy: string): Promise<void> {
    await db.decisions.update(id, {
      status: 'ACCEPTED',
      acceptedBy,
      updatedAt: new Date().toISOString(),
    });
  },

  async reject(id: string): Promise<void> {
    await db.decisions.update(id, {
      status: 'REJECTED',
      updatedAt: new Date().toISOString(),
    });
  },

  async supersede(id: string, newDecisionId: string): Promise<void> {
    await db.decisions.update(id, {
      status: 'SUPERSEDED',
      updatedAt: new Date().toISOString(),
    });
    await db.decisions.update(newDecisionId, {
      supersedes: id,
      updatedAt: new Date().toISOString(),
    });
  },

  async getConflicting(projectId: string): Promise<Decision[]> {
    return db.decisions.where({ projectId, status: 'CONFLICTING' }).toArray();
  },

  async countByProject(projectId: string): Promise<number> {
    return db.decisions.where('projectId').equals(projectId).count();
  },
};
