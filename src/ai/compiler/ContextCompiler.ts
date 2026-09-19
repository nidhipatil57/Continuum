import type { CompiledContext, Project, Decision, Requirement, Constraint, Question, ResearchFinding, ProjectFile, AIProviderId } from '@/shared/types';
import { AI_PROVIDERS } from '@/shared/constants/providers';
import { RedactionEngine } from '@/security/redaction/RedactionEngine';
import { DecisionRepository } from '@/database/repositories/DecisionRepository';
import { RequirementRepository } from '@/database/repositories/RequirementRepository';
import { QuestionRepository } from '@/database/repositories/index';
import { FileRepository, ConstraintRepository, ResearchRepository, ConversationRepository } from '@/database/repositories/index';

function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 1.3);
}

interface ContextCompileOptions {
  project: Project;
  targetModel: AIProviderId;
  task?: string;
  maxTokens?: number;
  redactSecrets?: boolean;
}

export const ContextCompiler = {
  async compile(options: ContextCompileOptions): Promise<CompiledContext> {
    const { project, targetModel, task, maxTokens = 8000, redactSecrets = true } = options;

    // Load all project entities
    const [decisions, requirements, constraints, questions, research, files, conversations] = await Promise.all([
      DecisionRepository.getByProject(project.id),
      RequirementRepository.getByProject(project.id),
      ConstraintRepository.getByProject(project.id),
      QuestionRepository.getByProject(project.id),
      ResearchRepository.getByProject(project.id),
      FileRepository.getByProject(project.id),
      ConversationRepository.getByProject(project.id),
    ]);

    // Filter by status — only include relevant items
    const activeDecisions = decisions.filter(d => d.status === 'ACCEPTED' || d.status === 'PROPOSED');
    const activeRequirements = requirements.filter(r => r.status !== 'REJECTED' && r.status !== 'OUTDATED');
    const activeConstraints = constraints.filter(c => c.status !== 'REJECTED');
    const openQuestions = questions.filter(q => q.status === 'OPEN' || q.status === 'IN_PROGRESS');
    const verifiedResearch = research.filter(r => r.verificationStatus !== 'DISPUTED');

    // Get model-specific emphasis
    const provider = AI_PROVIDERS[targetModel];
    const emphasis = provider?.contextEmphasis ?? [];

    // Build sections with model-aware prioritization
    const sections = this.buildSections({
      project,
      decisions: activeDecisions,
      requirements: activeRequirements,
      constraints: activeConstraints,
      questions: openQuestions,
      research: verifiedResearch,
      files,
      targetModel,
      emphasis,
      task,
      conversationCount: conversations.length,
    });

    // Apply token budget
    const fullHandoff = this.formatHandoff(sections, project, targetModel, task);

    // Redact secrets
    let finalHandoff = fullHandoff;
    let redactions = 0;
    if (redactSecrets) {
      const result = RedactionEngine.redact(fullHandoff);
      finalHandoff = result.redacted;
      redactions = result.count;
    }

    // Trim if over budget
    const tokens = estimateTokens(finalHandoff);
    if (tokens > maxTokens) {
      finalHandoff = this.trimToTokenBudget(finalHandoff, maxTokens);
    }

    return {
      projectSummary: `${project.name}: ${project.description}`,
      currentObjective: task ?? project.goal,
      relevantDecisions: activeDecisions.map(d => d.title),
      constraints: activeConstraints.map(c => c.title),
      relevantFiles: files.map(f => f.name),
      openQuestions: openQuestions.map(q => q.question),
      recentChanges: [],
      warnings: this.generateWarnings(activeDecisions, openQuestions, activeConstraints),
      redactions,
      tokenEstimate: estimateTokens(finalHandoff),
      fullHandoff: finalHandoff,
    };
  },

  buildSections(data: {
    project: Project;
    decisions: Decision[];
    requirements: Requirement[];
    constraints: Constraint[];
    questions: Question[];
    research: ResearchFinding[];
    files: ProjectFile[];
    targetModel: AIProviderId;
    emphasis: string[];
    task?: string;
    conversationCount: number;
  }) {
    const { project, decisions, requirements, constraints, questions, research, files, targetModel, task } = data;

    const sections: Record<string, string> = {};

    // Always include project identity
    sections['PROJECT'] = `${project.name}\n${project.description}`;
    sections['GOAL'] = project.goal;

    if (task) {
      sections['CURRENT OBJECTIVE'] = task;
    }

    // Model-specific role assignment
    const roleMap: Record<string, string> = {
      chatgpt: 'Senior implementation engineer',
      claude: 'Senior architect and systems designer',
      gemini: 'Multimodal analyst and structured thinker',
      perplexity: 'Research analyst and fact-checker',
      kimi: 'Code reviewer and quality analyst',
      grok: 'Problem solver and debugger',
      deepseek: 'Deep implementation engineer',
    };
    sections['ROLE'] = roleMap[targetModel] ?? 'AI assistant';

    // Decisions — model-aware formatting
    if (decisions.length > 0) {
      if (targetModel === 'claude') {
        // Claude gets reasoning
        sections['RELEVANT DECISIONS'] = decisions.map(d =>
          `• ${d.title} [${d.status}]\n  Reason: ${d.reason}${d.alternatives.length > 0 ? `\n  Alternatives considered: ${d.alternatives.join(', ')}` : ''}`
        ).join('\n');
      } else {
        // Others get concise list
        sections['RELEVANT DECISIONS'] = decisions.map(d => `• ${d.title} [${d.status}]`).join('\n');
      }
    }

    // Requirements
    if (requirements.length > 0) {
      sections['REQUIREMENTS'] = requirements.map(r => `• [${r.priority.toUpperCase()}] ${r.title}: ${r.description}`).join('\n');
    }

    // Constraints — always include as DO NOT list
    if (constraints.length > 0) {
      sections['CONSTRAINTS'] = constraints.map(c => `• ${c.title}: ${c.description}`).join('\n');
      sections['DO NOT'] = constraints
        .filter(c => c.severity === 'CRITICAL' || c.severity === 'HIGH')
        .map(c => `• ${c.description}`)
        .join('\n');
    }

    // Open Questions
    if (questions.length > 0) {
      sections['OPEN QUESTIONS'] = questions.map(q => `• ${q.question}`).join('\n');
    }

    // Files
    if (files.length > 0) {
      if (targetModel === 'chatgpt' || targetModel === 'deepseek') {
        // GPT/DeepSeek gets detailed file info
        sections['RELEVANT FILES'] = files.map(f => `• ${f.name} — ${f.description}`).join('\n');
      } else {
        sections['RELEVANT FILES'] = files.map(f => `• ${f.name}`).join('\n');
      }
    }

    // Research — only for Perplexity and Claude
    if (research.length > 0 && (targetModel === 'perplexity' || targetModel === 'claude')) {
      sections['RESEARCH FINDINGS'] = research.map(r =>
        `• ${r.claim} [${r.verificationStatus}] — Source: ${r.source}`
      ).join('\n');
    }

    // Continuum note
    sections['CONTINUUM NOTE'] = 'This context was compiled from the current canonical project memory by Continuum. It represents the verified state of the project. Do not redesign the existing architecture or replace confirmed decisions without explicit user approval.';

    return sections;
  },

  formatHandoff(sections: Record<string, string>, _project: Project, _targetModel: string, task?: string): string {
    const lines: string[] = [];
    lines.push('═══════════════════════════════════════');
    lines.push('CONTINUUM HANDOFF');
    lines.push('═══════════════════════════════════════');
    lines.push('');

    for (const [key, value] of Object.entries(sections)) {
      if (!value.trim()) continue;
      lines.push(key);
      lines.push(value);
      lines.push('');
    }

    if (task) {
      lines.push('TASK');
      lines.push(task);
      lines.push('');
    }

    lines.push('═══════════════════════════════════════');
    return lines.join('\n');
  },

  trimToTokenBudget(text: string, maxTokens: number): string {
    const words = text.split(/\s+/);
    const targetWords = Math.floor(maxTokens / 1.3);
    if (words.length <= targetWords) return text;
    return words.slice(0, targetWords).join(' ') + '\n\n[Context trimmed to fit token budget]';
  },

  generateWarnings(decisions: Decision[], questions: Question[], _constraints: Constraint[]): string[] {
    const warnings: string[] = [];
    const conflicting = decisions.filter(d => d.status === 'CONFLICTING');
    if (conflicting.length > 0) {
      warnings.push(`${conflicting.length} conflicting decision(s) detected`);
    }
    const proposed = decisions.filter(d => d.status === 'PROPOSED');
    if (proposed.length > 0) {
      warnings.push(`${proposed.length} decision(s) pending approval`);
    }
    if (questions.length > 0) {
      warnings.push(`${questions.length} unresolved question(s)`);
    }
    return warnings;
  },
};
