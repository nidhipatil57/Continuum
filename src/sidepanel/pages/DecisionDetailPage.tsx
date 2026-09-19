import React from 'react';
import { useMemoryStore, useUIStore } from '../store';
import { Card, StatusBadge, Badge, ApprovalPanel, ProviderIcon } from '@/shared/components';
import { format } from 'date-fns';

export const DecisionDetailPage: React.FC = () => {
  const { decisions, acceptDecision, rejectDecision } = useMemoryStore();
  const { selectedEntityId, setPage, addToast } = useUIStore();

  const decision = decisions.find(d => d.id === selectedEntityId);
  if (!decision) {
    return (
      <div className="p-5">
        <button onClick={() => setPage('decisions')} className="text-xs text-brand-600 hover:text-brand-700 mb-4">← Back to Decisions</button>
        <p className="text-sm text-gray-500">Decision not found.</p>
      </div>
    );
  }

  const handleAccept = async () => {
    await acceptDecision(decision.id);
    addToast('Decision accepted.', 'success');
  };

  const handleReject = async () => {
    await rejectDecision(decision.id);
    addToast('Decision rejected.', 'info');
  };

  return (
    <div className="p-5 max-w-2xl animate-fade-in">
      <button onClick={() => setPage('decisions')} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 flex items-center gap-1">
        <span>←</span> Back to Decisions
      </button>

      {/* Title */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={decision.status} size="md" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{decision.title}</h1>
        </div>
      </div>

      {/* Approval Controls */}
      {decision.status === 'PROPOSED' && (
        <Card className="mb-4 border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-0.5">Pending Approval</div>
              <div className="text-2xs text-amber-600 dark:text-amber-400">This decision was proposed by {decision.proposedBy} and requires your review.</div>
            </div>
            <ApprovalPanel onAccept={handleAccept} onReject={handleReject} />
          </div>
        </Card>
      )}

      {/* Details */}
      <div className="space-y-4">
        <Card>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Description</div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{decision.description}</p>
        </Card>

        <Card>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Reason</div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{decision.reason}</p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card padding="sm">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Proposed By</div>
            <div className="flex items-center gap-2">
              <ProviderIcon providerId={decision.proposedBy.toLowerCase()} size={16} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{decision.proposedBy}</span>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Date</div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {format(new Date(decision.createdAt), 'MMM d, yyyy')}
            </span>
          </Card>
        </div>

        {decision.alternatives.length > 0 && (
          <Card>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Alternatives Considered</div>
            <div className="flex flex-wrap gap-1.5">
              {decision.alternatives.map((alt, i) => (
                <Badge key={i} variant="default" size="md">{alt}</Badge>
              ))}
            </div>
          </Card>
        )}

        {decision.relatedFiles.length > 0 && (
          <Card>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Related Files</div>
            <div className="space-y-1">
              {decision.relatedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                  <span className="text-gray-400">📄</span>
                  {file}
                </div>
              ))}
            </div>
          </Card>
        )}

        {decision.supersedes && (
          <Card>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Supersedes</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">This decision supersedes a previous decision.</p>
          </Card>
        )}

        {decision.acceptedBy && (
          <Card padding="sm">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Accepted By</div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{decision.acceptedBy}</span>
          </Card>
        )}
      </div>
    </div>
  );
};
