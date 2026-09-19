import React, { useState } from 'react';
import { useMemoryStore, useUIStore } from '../store';
import { Card, StatusBadge, Badge, Tabs, SearchInput, ProviderIcon, EmptyState } from '@/shared/components';
import { format } from 'date-fns';

export const DecisionsPage: React.FC = () => {
  const { decisions } = useMemoryStore();
  const { setPage } = useUIStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const tabs = [
    { id: 'all', label: 'All', count: decisions.length },
    { id: 'ACCEPTED', label: 'Accepted', count: decisions.filter(d => d.status === 'ACCEPTED').length },
    { id: 'PROPOSED', label: 'Proposed', count: decisions.filter(d => d.status === 'PROPOSED').length },
    { id: 'CONFLICTING', label: 'Conflicting', count: decisions.filter(d => d.status === 'CONFLICTING').length },
    { id: 'REJECTED', label: 'Rejected', count: decisions.filter(d => d.status === 'REJECTED').length },
  ];

  const filtered = decisions
    .filter(d => filter === 'all' || d.status === filter)
    .filter(d => !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-5 max-w-2xl animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Decision Ledger</h1>
        <Badge variant="default" size="md">{decisions.length} decisions</Badge>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search decisions..."
        className="mb-3"
      />

      <Tabs tabs={tabs} activeTab={filter} onChange={setFilter} />

      <div className="mt-3 space-y-2">
        {filtered.length === 0 ? (
          <EmptyState
            title="No decisions found"
            description={search ? `No decisions match "${search}"` : "As you work with AI, project decisions will be tracked here."}
          />
        ) : (
          filtered.map(d => (
            <Card key={d.id} hoverable padding="sm" onClick={() => setPage('decision-detail', d.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={d.status} />
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate">{d.title}</span>
                  </div>
                  <p className="text-2xs text-gray-500 dark:text-gray-400 line-clamp-2">{d.reason}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <ProviderIcon providerId={d.proposedBy.toLowerCase()} size={12} />
                      <span className="text-2xs text-gray-400">{d.proposedBy}</span>
                    </div>
                    <span className="text-2xs text-gray-400">{format(new Date(d.createdAt), 'MMM d')}</span>
                    {d.relatedFiles.length > 0 && (
                      <span className="text-2xs text-gray-400">📄 {d.relatedFiles.length}</span>
                    )}
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-400 shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
