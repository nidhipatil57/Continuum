import type { Decision, MemoryProposal, Conflict, ConflictAction } from '@/shared/types';
import { v4 as uuid } from 'uuid';
import { DecisionRepository } from '@/database/repositories/DecisionRepository';

export const ConflictEngine = {
  async detect(
    projectId: string,
    proposals: MemoryProposal[]
  ): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];
    const existingDecisions = await DecisionRepository.getByProject(projectId);
    const acceptedDecisions = existingDecisions.filter(d => d.status === 'ACCEPTED');

    for (const proposal of proposals) {
      if (proposal.type !== 'DECISION' && proposal.type !== 'ARCHITECTURE') continue;

      // Check for semantic similarity with existing decisions
      for (const existing of acceptedDecisions) {
        const similarity = this.computeSimilarity(
          proposal.title.toLowerCase(),
          existing.title.toLowerCase()
        );

        if (similarity > 0.3) {
          // Check if the proposal actually contradicts
          const isContradiction = this.detectContradiction(
            proposal.description,
            existing.description
          );

          if (isContradiction || similarity > 0.6) {
            conflicts.push({
              id: uuid(),
              projectId,
              existingEntityId: existing.id,
              existingEntityType: 'decision',
              existingValue: existing.title + ': ' + existing.description,
              newProposal: proposal.title + ': ' + proposal.description,
              source: proposal.source,
              severity: existing.status === 'ACCEPTED' ? 'HIGH' : 'MEDIUM',
              relatedDecisionId: existing.id,
              possibleActions: this.generateActions(existing),
              status: 'detected',
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    return conflicts;
  },

  computeSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.split(/\s+/).filter(w => w.length > 2));
    const wordsB = new Set(b.split(/\s+/).filter(w => w.length > 2));
    if (wordsA.size === 0 || wordsB.size === 0) return 0;

    let intersection = 0;
    for (const word of wordsA) {
      if (wordsB.has(word)) intersection++;
    }

    return (2 * intersection) / (wordsA.size + wordsB.size);
  },

  detectContradiction(newText: string, existingText: string): boolean {
    const contradictionPairs = [
      ['use', 'don\'t use'],
      ['instead of', 'use'],
      ['replace', 'keep'],
      ['switch from', 'stay with'],
      ['remove', 'add'],
      ['not', ''],
    ];

    const newLower = newText.toLowerCase();
    const existingLower = existingText.toLowerCase();

    // Check for "instead of X" patterns where X appears in existing
    const insteadOfMatch = newLower.match(/instead of\s+(\w+)/);
    if (insteadOfMatch) {
      const replacedThing = insteadOfMatch[1];
      if (replacedThing && existingLower.includes(replacedThing)) {
        return true;
      }
    }

    // Check for "switch from X to Y" where X is in existing
    const switchMatch = newLower.match(/switch(?:ing)?\s+(?:from\s+)?(\w+)\s+to\s+(\w+)/);
    if (switchMatch) {
      const from = switchMatch[1];
      if (from && existingLower.includes(from)) return true;
    }

    // Check for direct negation
    for (const [positive, negative] of contradictionPairs) {
      if (positive && negative) {
        if (newLower.includes(negative) && existingLower.includes(positive)) return true;
        if (newLower.includes(positive) && existingLower.includes(negative)) return true;
      }
    }

    return false;
  },

  generateActions(_existing: Decision): ConflictAction[] {
    return [
      { label: 'Keep Current', action: 'keep_existing' },
      { label: 'Accept New', action: 'accept_new' },
      { label: 'Compare', action: 'compare' },
      { label: 'Ignore', action: 'ignore' },
    ];
  },
};
