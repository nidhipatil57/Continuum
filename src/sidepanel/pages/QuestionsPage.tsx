import React, { useState } from 'react';
import { useMemoryStore } from '../store';
import { Card, StatusBadge, Tabs, EmptyState } from '@/shared/components';

export const QuestionsPage: React.FC = () => {
  const { questions } = useMemoryStore();
  const [filter, setFilter] = useState('all');

  const tabs = [
    { id: 'all', label: 'All', count: questions.length },
    { id: 'OPEN', label: 'Open', count: questions.filter(q => q.status === 'OPEN').length },
    { id: 'IN_PROGRESS', label: 'In Progress', count: questions.filter(q => q.status === 'IN_PROGRESS').length },
    { id: 'RESOLVED', label: 'Resolved', count: questions.filter(q => q.status === 'RESOLVED').length },
  ];

  const filtered = questions.filter(q => filter === 'all' || q.status === filter);

  return (
    <div className="p-5 max-w-2xl animate-fade-in">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Questions</h1>
      <Tabs tabs={tabs} activeTab={filter} onChange={setFilter} />
      <div className="mt-3 space-y-2">
        {filtered.length === 0 ? (
          <EmptyState title="No questions" description="Unresolved questions from AI conversations will be tracked here." />
        ) : filtered.map(q => (
          <Card key={q.id} padding="sm">
            <div className="flex items-start gap-2">
              <StatusBadge status={q.status} />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-gray-900 dark:text-white">{q.question}</span>
                {q.context && <p className="text-2xs text-gray-500 dark:text-gray-400 mt-1">{q.context}</p>}
                {q.resolution && (
                  <div className="mt-2 px-2 py-1.5 bg-emerald-50 dark:bg-emerald-950 rounded text-2xs text-emerald-700 dark:text-emerald-400">
                    Resolution: {q.resolution}
                  </div>
                )}
                <span className="text-2xs text-gray-400 mt-1 block">Source: {q.source}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
