import type { ProjectPassport, Project } from '@/shared/types';
import { db } from '@/database/db';

export const PassportExporter = {
  async exportProject(projectId: string): Promise<ProjectPassport> {
    const project = await db.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const [requirements, decisions, constraints, questions, research, files, timeline, memoryCommits, contextRules] = await Promise.all([
      db.requirements.where('projectId').equals(projectId).toArray(),
      db.decisions.where('projectId').equals(projectId).toArray(),
      db.constraints.where('projectId').equals(projectId).toArray(),
      db.questions.where('projectId').equals(projectId).toArray(),
      db.researchFindings.where('projectId').equals(projectId).toArray(),
      db.files.where('projectId').equals(projectId).toArray(),
      db.timelineEvents.where('projectId').equals(projectId).toArray(),
      db.memoryCommits.where('projectId').equals(projectId).toArray(),
      db.contextRules.where('projectId').equals(projectId).toArray(),
    ]);

    return {
      format: 'continuum-project',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      project,
      requirements,
      decisions,
      constraints,
      questions,
      research,
      files,
      timeline,
      memoryCommits,
      contextRules,
    };
  },

  download(passport: ProjectPassport): void {
    const json = JSON.stringify(passport, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${passport.project.name.toLowerCase().replace(/\s+/g, '-')}.continuum`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

export const PassportImporter = {
  async importProject(passport: ProjectPassport): Promise<Project> {
    if (passport.format !== 'continuum-project') {
      throw new Error('Invalid passport format');
    }

    // Check if project already exists
    const existing = await db.projects.get(passport.project.id);
    if (existing) {
      throw new Error(`Project "${existing.name}" already exists. Delete it first or change the ID.`);
    }

    await db.transaction('rw', [
      db.projects, db.requirements, db.decisions, db.constraints,
      db.questions, db.researchFindings, db.files, db.timelineEvents,
      db.memoryCommits, db.contextRules,
    ], async () => {
      await db.projects.add(passport.project);
      if (passport.requirements.length) await db.requirements.bulkAdd(passport.requirements);
      if (passport.decisions.length) await db.decisions.bulkAdd(passport.decisions);
      if (passport.constraints.length) await db.constraints.bulkAdd(passport.constraints);
      if (passport.questions.length) await db.questions.bulkAdd(passport.questions);
      if (passport.research.length) await db.researchFindings.bulkAdd(passport.research);
      if (passport.files.length) await db.files.bulkAdd(passport.files);
      if (passport.timeline.length) await db.timelineEvents.bulkAdd(passport.timeline);
      if (passport.memoryCommits.length) await db.memoryCommits.bulkAdd(passport.memoryCommits);
      if (passport.contextRules.length) await db.contextRules.bulkAdd(passport.contextRules);
    });

    return passport.project;
  },

  async readFile(file: File): Promise<ProjectPassport> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const passport = JSON.parse(reader.result as string) as ProjectPassport;
          if (passport.format !== 'continuum-project') {
            reject(new Error('Invalid file format. Expected a .continuum project passport.'));
            return;
          }
          resolve(passport);
        } catch {
          reject(new Error('Failed to parse passport file.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    });
  },
};
