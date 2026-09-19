import React from 'react';
import { useMemoryStore } from '../store';
import { Card, StatusBadge, EmptyState, ProviderIcon } from '@/shared/components';

export const ResearchPage: React.FC = () => {
  const { research } = useMemoryStore();

  return (
    <div className="p-5 max-w-2xl animate-fade-in">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Research Findings</h1>
      <div className="space-y-2">
        {research.length === 0 ? (
          <EmptyState title="No research findings" description="Research findings from Perplexity and other sources will appear here." />
        ) : research.map(r => (
          <Card key={r.id} padding="sm">
            <div className="flex items-start gap-2">
              <StatusBadge status={r.verificationStatus} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-900 dark:text-white font-medium">{r.claim}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <ProviderIcon providerId={r.model} size={12} />
                    <span className="text-2xs text-gray-400 capitalize">{r.model}</span>
                  </div>
                  <span className="text-2xs text-gray-400">{r.source}</span>
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-2xs text-brand-600 hover:underline">
                      Source →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
