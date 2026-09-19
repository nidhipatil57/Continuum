import React from 'react';
import { useProjectStore, useMemoryStore, useUIStore } from '../store';
import { Card, HealthIndicator, SectionHeader, ProviderIcon, StatusBadge } from '@/shared/components';
import { AI_PROVIDERS, SUPPORTED_PROVIDERS } from '@/shared/constants/providers';
import { format } from 'date-fns';
import { ContextCompiler } from '@/ai/compiler/ContextCompiler';

export const DashboardPage: React.FC = () => {
  const { activeProject } = useProjectStore();
  const { decisions, requirements, timeline, stats, computeHealth } = useMemoryStore();
  const { setPage, addToast } = useUIStore();

  if (!activeProject) return null;

  const health = computeHealth();
  const recentTimeline = timeline.slice(0, 6);
  const proposedDecisions = decisions.filter(d => d.status === 'PROPOSED');
  const conflictingDecisions = decisions.filter(d => d.status === 'CONFLICTING');

  const handleContinueWith = async (providerId: string) => {
    const provider = AI_PROVIDERS[providerId];
    if (!provider || !activeProject) return;

    try {
      const ctx = await ContextCompiler.compile({
        project: activeProject,
        targetModel: providerId as any,
      });
      // Set pending auto inject for zero-effort auto-fill
      await chrome.storage?.local?.set({
        pendingAutoInject: {
          providerId,
          text: ctx.fullHandoff,
          timestamp: Date.now(),
        },
      });
      // Copy to clipboard as fallback
      await navigator.clipboard.writeText(ctx.fullHandoff);
      addToast(`Handoff compiled (${ctx.tokenEstimate} tokens). Auto-filling ${provider.shortName}...`, 'success');
      window.open(provider.newChatUrl, '_blank');
    } catch {
      addToast('Failed to compile context.', 'error');
    }
  };

  return (
    <div className="p-5 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{activeProject.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activeProject.description}</p>
      </div>

      {/* Health + Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Card>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Project Memory</div>
          <HealthIndicator score={health} size="md" />
          <div className="mt-3 space-y-1">
            {decisions.filter(d => d.status === 'ACCEPTED').length > 0 && (
              <div className="text-2xs text-emerald-600 dark:text-emerald-400">✓ Decisions documented</div>
            )}
            {requirements.filter(r => r.status === 'CONFIRMED').length > 0 && (
              <div className="text-2xs text-emerald-600 dark:text-emerald-400">✓ Requirements clear</div>
            )}
            {stats.openQuestions > 0 && (
              <div className="text-2xs text-amber-600 dark:text-amber-400">⚠ {stats.openQuestions} unresolved question{stats.openQuestions !== 1 ? 's' : ''}</div>
            )}
            {stats.conflicting > 0 && (
              <div className="text-2xs text-red-600 dark:text-red-400">● {stats.conflicting} conflicting decision{stats.conflicting !== 1 ? 's' : ''}</div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Card padding="sm" hoverable onClick={() => setPage('decisions')}>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.decisions}</div>
            <div className="text-2xs text-gray-500">Decisions</div>
          </Card>
          <Card padding="sm" hoverable onClick={() => setPage('questions')}>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.openQuestions}</div>
            <div className="text-2xs text-gray-500">Open Questions</div>
          </Card>
          <Card padding="sm" hoverable onClick={() => setPage('research')}>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.research}</div>
            <div className="text-2xs text-gray-500">Research</div>
          </Card>
          <Card padding="sm">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.conversations}</div>
            <div className="text-2xs text-gray-500">Conversations</div>
          </Card>
        </div>
      </div>

      {/* Pending Approvals */}
      {proposedDecisions.length > 0 && (
        <div className="mb-5">
          <SectionHeader title="Pending Approval" />
          <div className="space-y-2">
            {proposedDecisions.slice(0, 3).map(d => (
              <Card key={d.id} padding="sm" hoverable onClick={() => setPage('decision-detail', d.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={d.status} />
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{d.title}</span>
                  </div>
                  <span className="text-2xs text-gray-400">{d.proposedBy}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Conflicts */}
      {conflictingDecisions.length > 0 && (
        <div className="mb-5">
          <SectionHeader title="Context Conflicts" />
          <div className="space-y-2">
            {conflictingDecisions.map(d => (
              <Card key={d.id} padding="sm" className="border-red-200 dark:border-red-900" hoverable onClick={() => setPage('decision-detail', d.id)}>
                <div className="flex items-center gap-2">
                  <span className="text-red-500">●</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{d.title}</span>
                </div>
                <div className="text-2xs text-gray-500 mt-1">{d.reason}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-5">
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 gap-2">
          {SUPPORTED_PROVIDERS.map(pid => {
            const provider = AI_PROVIDERS[pid];
            if (!provider) return null;
            return (
              <button
                key={pid}
                onClick={() => handleContinueWith(pid)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all dark:border-surface-dark-border dark:text-gray-300 dark:hover:bg-surface-dark-tertiary"
              >
                <ProviderIcon providerId={pid} size={16} />
                Continue with {provider.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Timeline */}
      <div>
        <SectionHeader
          title="Recent Activity"
          action={
            <button onClick={() => setPage('timeline')} className="text-2xs text-brand-600 hover:text-brand-700 dark:text-brand-400">
              View all →
            </button>
          }
        />
        <div className="space-y-0">
          {recentTimeline.map((event, i) => (
            <div key={event.id} className="flex gap-3 py-2">
              <div className="flex flex-col items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-1.5" />
                {i < recentTimeline.length - 1 && <div className="w-px flex-1 bg-gray-200 dark:bg-surface-dark-border" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-900 dark:text-white font-medium">{event.title}</span>
                  {event.model && <ProviderIcon providerId={event.model} size={12} />}
                </div>
                <div className="text-2xs text-gray-400 mt-0.5">
                  {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
