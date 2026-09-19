import React, { useState } from 'react';
import { useMemoryStore } from '../store';
import { Card, StatusBadge, Badge, Tabs, EmptyState } from '@/shared/components';

export const RequirementsPage: React.FC = () => {
  const { requirements } = useMemoryStore();
  const [filter, setFilter] = useState('all');

  const tabs = [
    { id: 'all', label: 'All', count: requirements.length },
    { id: 'CONFIRMED', label: 'Confirmed', count: requirements.filter(r => r.status === 'CONFIRMED').length },
    { id: 'IN_PROGRESS', label: 'In Progress', count: requirements.filter(r => r.status === 'IN_PROGRESS').length },
    { id: 'PROPOSED', label: 'Proposed', count: requirements.filter(r => r.status === 'PROPOSED').length },
  ];

  const filtered = requirements.filter(r => filter === 'all' || r.status === filter);

  const priorityColors: Record<string, string> = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'default',
  };

  return (
    <div className="p-5 max-w-2xl animate-fade-in">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Requirements</h1>
      <Tabs tabs={tabs} activeTab={filter} onChange={setFilter} />
      <div className="mt-3 space-y-2">
        {filtered.length === 0 ? (
          <EmptyState title="No requirements" description="Project requirements will appear here as they're captured from AI conversations." />
        ) : filtered.map(r => (
          <Card key={r.id} padding="sm">
            <div className="flex items-start gap-2">
              <StatusBadge status={r.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{r.title}</span>
                  <Badge variant={priorityColors[r.priority] as any} size="sm">{r.priority}</Badge>
                </div>
                <p className="text-2xs text-gray-500 dark:text-gray-400 mt-1">{r.description}</p>
                <span className="text-2xs text-gray-400 mt-1 block">Source: {r.source}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
