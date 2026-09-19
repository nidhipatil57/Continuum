import { create } from 'zustand';
import type { Project, Decision, Requirement, Question, ResearchFinding, ProjectFile, TimelineEvent, Constraint, MemoryProposal, Conflict, AppSettings } from '@/shared/types';
import { ProjectRepository } from '@/database/repositories/ProjectRepository';
import { DecisionRepository } from '@/database/repositories/DecisionRepository';
import { RequirementRepository } from '@/database/repositories/RequirementRepository';
import { QuestionRepository, ResearchRepository, FileRepository, TimelineRepository, ConstraintRepository, ConversationRepository } from '@/database/repositories/index';
import { getSettings, saveSettings } from '@/database/db';

// ============================================================
// PROJECT STORE
// ============================================================

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  loading: boolean;
  loadProjects: () => Promise<void>;
  setActiveProject: (id: string) => Promise<void>;
  createProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  loading: false,

  loadProjects: async () => {
    set({ loading: true });
    const projects = await ProjectRepository.getAll();
    const settings = await getSettings();
    const active = settings.activeProjectId
      ? projects.find(p => p.id === settings.activeProjectId) ?? projects[0] ?? null
      : projects[0] ?? null;
    set({ projects, activeProject: active, loading: false });
  },

  setActiveProject: async (id: string) => {
    const projects = get().projects;
    const project = projects.find(p => p.id === id);
    if (project) {
      set({ activeProject: project });
      await saveSettings({ activeProjectId: id });
    }
  },

  createProject: async (project: Project) => {
    await ProjectRepository.create(project);
    const projects = await ProjectRepository.getAll();
    set({ projects, activeProject: project });
    await saveSettings({ activeProjectId: project.id });
  },

  deleteProject: async (id: string) => {
    await ProjectRepository.remove(id);
    const projects = await ProjectRepository.getAll();
    const active = projects[0] ?? null;
    set({ projects, activeProject: active });
    await saveSettings({ activeProjectId: active?.id ?? null });
  },
}));

// ============================================================
// MEMORY STORE
// ============================================================

interface MemoryState {
  decisions: Decision[];
  requirements: Requirement[];
  constraints: Constraint[];
  questions: Question[];
  research: ResearchFinding[];
  files: ProjectFile[];
  timeline: TimelineEvent[];
  conversations: { id: string; model: string; title: string; startedAt: string }[];
  loading: boolean;
  stats: {
    decisions: number;
    requirements: number;
    questions: number;
    openQuestions: number;
    research: number;
    files: number;
    conversations: number;
    conflicting: number;
  };
  proposals: MemoryProposal[];
  conflicts: Conflict[];
  loadProjectData: (projectId: string) => Promise<void>;
  setProposals: (proposals: MemoryProposal[]) => void;
  setConflicts: (conflicts: Conflict[]) => void;
  acceptDecision: (id: string) => Promise<void>;
  rejectDecision: (id: string) => Promise<void>;
  computeHealth: () => number;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  decisions: [],
  requirements: [],
  constraints: [],
  questions: [],
  research: [],
  files: [],
  timeline: [],
  conversations: [],
  loading: false,
  stats: { decisions: 0, requirements: 0, questions: 0, openQuestions: 0, research: 0, files: 0, conversations: 0, conflicting: 0 },
  proposals: [],
  conflicts: [],

  loadProjectData: async (projectId: string) => {
    set({ loading: true });
    const [decisions, requirements, constraints, questions, research, files, timeline, convs] = await Promise.all([
      DecisionRepository.getByProject(projectId),
      RequirementRepository.getByProject(projectId),
      ConstraintRepository.getByProject(projectId),
      QuestionRepository.getByProject(projectId),
      ResearchRepository.getByProject(projectId),
      FileRepository.getByProject(projectId),
      TimelineRepository.getByProject(projectId),
      ConversationRepository.getByProject(projectId),
    ]);

    const openQuestions = questions.filter(q => q.status === 'OPEN').length;
    const conflicting = decisions.filter(d => d.status === 'CONFLICTING').length;

    set({
      decisions,
      requirements,
      constraints,
      questions,
      research,
      files,
      timeline,
      conversations: convs.map(c => ({ id: c.id, model: c.model, title: c.title, startedAt: c.startedAt })),
      loading: false,
      stats: {
        decisions: decisions.length,
        requirements: requirements.length,
        questions: questions.length,
        openQuestions,
        research: research.length,
        files: files.length,
        conversations: convs.length,
        conflicting,
      },
    });
  },

  setProposals: (proposals) => set({ proposals }),
  setConflicts: (conflicts) => set({ conflicts }),

  acceptDecision: async (id: string) => {
    await DecisionRepository.accept(id, 'User');
    const state = get();
    if (state.decisions.length > 0) {
      const projectId = state.decisions[0]?.projectId;
      if (projectId) await get().loadProjectData(projectId);
    }
  },

  rejectDecision: async (id: string) => {
    await DecisionRepository.reject(id);
    const state = get();
    if (state.decisions.length > 0) {
      const projectId = state.decisions[0]?.projectId;
      if (projectId) await get().loadProjectData(projectId);
    }
  },

  computeHealth: () => {
    const { decisions, requirements, questions, research, files, constraints } = get();
    let score = 100;

    // Deductions
    const openQuestions = questions.filter(q => q.status === 'OPEN').length;
    const conflicting = decisions.filter(d => d.status === 'CONFLICTING').length;
    const proposed = decisions.filter(d => d.status === 'PROPOSED').length;
    const unverified = research.filter(r => r.verificationStatus === 'UNVERIFIED').length;

    score -= openQuestions * 3;
    score -= conflicting * 8;
    score -= proposed * 2;
    score -= unverified * 1;

    // Bonuses
    if (requirements.length > 0) score += 2;
    if (decisions.filter(d => d.status === 'ACCEPTED').length > 0) score += 3;
    if (files.length > 0) score += 2;
    if (constraints.length > 0) score += 1;
    if (research.filter(r => r.verificationStatus === 'VERIFIED').length > 0) score += 2;

    return Math.min(100, Math.max(0, score));
  },
}));

// ============================================================
// UI STORE
// ============================================================

type Page = 'dashboard' | 'timeline' | 'decisions' | 'decision-detail' | 'requirements' | 'files' | 'questions' | 'research' | 'search' | 'settings' | 'capture-review' | 'onboarding';

interface UIState {
  page: Page;
  selectedEntityId: string | null;
  commandPaletteOpen: boolean;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>;
  theme: 'light' | 'dark' | 'system';
  settings: AppSettings | null;
  setPage: (page: Page, entityId?: string) => void;
  toggleCommandPalette: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

let toastCounter = 0;

export const useUIStore = create<UIState>((set, get) => ({
  page: 'onboarding',
  selectedEntityId: null,
  commandPaletteOpen: false,
  toasts: [],
  theme: 'light',
  settings: null,

  setPage: (page, entityId) => set({ page, selectedEntityId: entityId ?? null }),

  toggleCommandPalette: () => set(s => ({ commandPaletteOpen: !s.commandPaletteOpen })),

  addToast: (message, type = 'info') => {
    const id = `toast-${++toastCounter}`;
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
  },

  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  setTheme: async (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    await saveSettings({ theme });
  },

  loadSettings: async () => {
    const settings = await getSettings();
    set({ settings, theme: settings.theme, page: settings.onboardingCompleted ? 'dashboard' : 'onboarding' });
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  },

  updateSettings: async (partial) => {
    const current = get().settings;
    if (!current) return;
    const updated = { ...current, ...partial };
    await saveSettings(updated);
    set({ settings: updated });
  },
}));
