import React from 'react';
import { useMemoryStore } from '../store';
import { ProviderIcon } from '@/shared/components';
import { format, isToday, isYesterday } from 'date-fns';

export const TimelinePage: React.FC = () => {
  const { timeline } = useMemoryStore();

  // Group by date
  const grouped: Record<string, typeof timeline> = {};
  for (const event of timeline) {
    const date = format(new Date(event.timestamp), 'yyyy-MM-dd');
    if (!grouped[date]) grouped[date] = [];
    grouped[date]!.push(event);
  }

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const eventIcons: Record<string, string> = {
    PROJECT_CREATED: '🎯',
    CONVERSATION_CAPTURED: '💬',
    DECISION_PROPOSED: '🟡',
    DECISION_ACCEPTED: '✓',
    DECISION_REJECTED: '✕',
    DECISION_SUPERSEDED: '→',
    REQUIREMENT_ADDED: '📋',
    REQUIREMENT_CHANGED: '📝',
    CONSTRAINT_ADDED: '🔒',
    QUESTION_RAISED: '❓',
    QUESTION_RESOLVED: '✅',
    RESEARCH_ADDED: '🔍',
    FILE_ADDED: '📄',
    FILE_CHANGED: '📄',
    CONFLICT_DETECTED: '⚠️',
    CONFLICT_RESOLVED: '✅',
    MEMORY_COMMIT: '📦',
    HANDOFF_CREATED: '🔄',
    PROJECT_IMPORTED: '📥',
    PROJECT_EXPORTED: '📤',
  };

  return (
    <div className="p-5 max-w-2xl animate-fade-in">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Timeline</h1>

      {Object.entries(grouped).length === 0 ? (
        <div className="text-center py-16">
          <div className="text-3xl mb-3">◷</div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No events yet</h3>
          <p className="text-xs text-gray-500">As you work with AI, project events will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateKey, events]) => (
            <div key={dateKey}>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 sticky top-0 bg-surface dark:bg-surface-dark py-1 z-10">
                {formatDateLabel(dateKey)}
              </div>
              <div className="space-y-0 ml-2">
                {events.map((event, i) => (
                  <div key={event.id} className="flex gap-3 group">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-surface-dark-tertiary flex items-center justify-center text-xs shrink-0">
                        {eventIcons[event.type] ?? '•'}
                      </div>
                      {i < events.length - 1 && (
                        <div className="w-px flex-1 bg-gray-200 dark:bg-surface-dark-border min-h-[16px]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{event.title}</span>
                        {event.model && <ProviderIcon providerId={event.model} size={12} />}
                      </div>
                      {event.description && (
                        <p className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{event.description}</p>
                      )}
                      <span className="text-2xs text-gray-400 dark:text-gray-600">
                        {format(new Date(event.timestamp), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
