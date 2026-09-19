import React, { useState, useMemo } from 'react';
import { useMemoryStore, useUIStore } from '../store';
import { SearchInput, Card, StatusBadge, Badge, ProviderIcon, EmptyState } from '@/shared/components';

type ResultType = 'decision' | 'requirement' | 'question' | 'research' | 'file';

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  description: string;
  status?: string;
  model?: string;
  action: () => void;
}

export const SearchPage: React.FC = () => {
  const { decisions, requirements, questions, research, files } = useMemoryStore();
  const { setPage } = useUIStore();
  const [query, setQuery] = useState('');

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matches: SearchResult[] = [];

    for (const d of decisions) {
      if (d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.reason.toLowerCase().includes(q)) {
        matches.push({
          id: d.id, type: 'decision', title: d.title, description: d.reason,
          status: d.status, model: d.proposedBy.toLowerCase(),
          action: () => setPage('decision-detail', d.id),
        });
      }
    }
    for (const r of requirements) {
      if (r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)) {
        matches.push({
          id: r.id, type: 'requirement', title: r.title, description: r.description,
          status: r.status,
          action: () => setPage('requirements'),
        });
      }
    }
    for (const q2 of questions) {
      if (q2.question.toLowerCase().includes(q) || q2.context.toLowerCase().includes(q)) {
        matches.push({
          id: q2.id, type: 'question', title: q2.question, description: q2.context,
          status: q2.status,
          action: () => setPage('questions'),
        });
      }
    }
    for (const r of research) {
      if (r.claim.toLowerCase().includes(q) || r.source.toLowerCase().includes(q)) {
        matches.push({
          id: r.id, type: 'research', title: r.claim, description: r.source,
          status: r.verificationStatus, model: r.model,
          action: () => setPage('research'),
        });
      }
    }
    for (const f of files) {
      if (f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)) {
        matches.push({
          id: f.id, type: 'file', title: f.name, description: f.description,
          action: () => setPage('files'),
        });
      }
    }

    return matches;
  }, [query, decisions, requirements, questions, research, files]);

  const typeLabels: Record<ResultType, string> = {
    decision: 'Decision',
    requirement: 'Requirement',
    question: 'Question',
    research: 'Research',
    file: 'File',
  };

  const typeVariants: Record<ResultType, 'info' | 'success' | 'warning' | 'default' | 'muted'> = {
    decision: 'info',
    requirement: 'success',
    question: 'warning',
    research: 'default',
    file: 'muted',
  };

  return (
    <div className="p-5 max-w-2xl animate-fade-in">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Search</h1>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search decisions, requirements, questions, research, files..."
        autoFocus
        className="mb-4"
      />

      {query && (
        <div className="text-xs text-gray-500 mb-3">
          {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </div>
      )}

      <div className="space-y-2">
        {query && results.length === 0 ? (
          <EmptyState title="No results" description={`Nothing matches "${query}" in your project memory.`} />
        ) : (
          results.map(r => (
            <Card key={r.id} hoverable padding="sm" onClick={r.action}>
              <div className="flex items-start gap-2">
                <Badge variant={typeVariants[r.type]} size="sm">{typeLabels[r.type]}</Badge>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{r.title}</span>
                  <p className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{r.description}</p>
                </div>
                {r.status && <StatusBadge status={r.status} />}
                {r.model && <ProviderIcon providerId={r.model} size={12} />}
              </div>
            </Card>
          ))
        )}
        {!query && (
          <div className="text-center py-12">
            <div className="text-3xl mb-3 opacity-30">⌕</div>
            <p className="text-xs text-gray-400">Search across all project memory</p>
            <p className="text-2xs text-gray-400 mt-1">Try: "postgresql", "authentication", "OCR"</p>
          </div>
        )}
      </div>
    </div>
  );
};
