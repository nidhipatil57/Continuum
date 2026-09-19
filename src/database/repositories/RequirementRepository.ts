import { db } from '../db';
import type { Requirement } from '@/shared/types';

export const RequirementRepository = {
  async getByProject(projectId: string): Promise<Requirement[]> {
    return db.requirements.where('projectId').equals(projectId).reverse().sortBy('createdAt');
  },

  async getById(id: string): Promise<Requirement | undefined> {
    return db.requirements.get(id);
  },

  async create(req: Requirement): Promise<string> {
    return db.requirements.add(req);
  },

  async update(id: string, changes: Partial<Requirement>): Promise<void> {
    await db.requirements.update(id, { ...changes, updatedAt: new Date().toISOString() });
  },

  async remove(id: string): Promise<void> {
    await db.requirements.delete(id);
  },

  async countByProject(projectId: string): Promise<number> {
    return db.requirements.where('projectId').equals(projectId).count();
  },
};
