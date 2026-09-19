import React, { useState } from 'react';
import { useMemoryStore, useUIStore, useProjectStore } from '../store';
import { Card, Badge, Button, TextArea } from '@/shared/components';
import { MemoryExtractor } from '@/ai/extraction/MemoryExtractor';
import { DecisionRepository } from '@/database/repositories/DecisionRepository';
import { RequirementRepository } from '@/database/repositories/RequirementRepository';
import { QuestionRepository, TimelineRepository } from '@/database/repositories/index';
import type { MemoryProposal, ConversationMessage } from '@/shared/types';
import { v4 as uuid } from 'uuid';

export const CaptureReviewPage: React.FC = () => {
  const { activeProject } = useProjectStore();
  const { setProposals, proposals, loadProjectData } = useMemoryStore();
  const { setPage, addToast } = useUIStore();
  const [pastedContent, setPastedContent] = useState('');
  const [model, setModel] = useState('chatgpt');
  const [extracted, setExtracted] = useState(false);

  React.useEffect(() => {
    const handleMessage = (msg: any) => {
      if (msg.type === 'CONVERSATION_CAPTURED' && msg.payload?.messages) {
        const conversationId = uuid();
        const extracted = MemoryExtractor.extract(msg.payload.messages, msg.payload.model || model, conversationId);
        setProposals(extracted);
        setExtracted(true);
        addToast(`Extracted ${extracted.length} proposals from ${msg.payload.model || 'active tab'}!`, 'success');
      }
    };
    chrome.runtime?.onMessage.addListener(handleMessage);
    return () => chrome.runtime?.onMessage.removeListener(handleMessage);
  }, [model, setProposals, addToast]);

  const handleAutoCapture = () => {
    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { type: 'CAPTURE_CONVERSATION' }, (response) => {
          if (chrome.runtime.lastError || !response?.success) {
            addToast('Could not auto-extract from current tab. Try pasting the conversation text below.', 'info');
          }
        });
      } else {
        addToast('No active tab found. Try pasting conversation text below.', 'info');
      }
    });
  };

  const handleExtract = () => {
    if (!pastedContent.trim()) return;

    // Parse pasted content into messages (simple heuristic)
    const messages: ConversationMessage[] = [];
    const lines = pastedContent.split('\n');
    let currentRole: 'user' | 'assistant' = 'assistant';
    let currentContent = '';

    for (const line of lines) {
      const userMatch = line.match(/^(User|Human|Me|You):\s*/i);
      const assistantMatch = line.match(/^(Assistant|AI|Claude|GPT|ChatGPT|Gemini|Perplexity|Bot):\s*/i);

      if (userMatch) {
        if (currentContent.trim()) {
          messages.push({ role: currentRole, content: currentContent.trim() });
        }
        currentRole = 'user';
        currentContent = line.slice(userMatch[0].length);
      } else if (assistantMatch) {
        if (currentContent.trim()) {
          messages.push({ role: currentRole, content: currentContent.trim() });
        }
        currentRole = 'assistant';
        currentContent = line.slice(assistantMatch[0].length);
      } else {
        currentContent += '\n' + line;
      }
    }
    if (currentContent.trim()) {
      messages.push({ role: currentRole, content: currentContent.trim() });
    }

    // If no clear role markers, treat entire paste as assistant content
    if (messages.length === 0) {
      messages.push({ role: 'assistant', content: pastedContent });
    }

    const conversationId = uuid();
    const extracted = MemoryExtractor.extract(messages, model, conversationId);
    setProposals(extracted);
    setExtracted(true);
  };

  const handleAcceptProposal = async (proposal: MemoryProposal) => {
    if (!activeProject) return;
    const now = new Date().toISOString();

    try {
      if (proposal.type === 'DECISION' || proposal.type === 'ARCHITECTURE') {
        await DecisionRepository.create({
          id: uuid(),
          projectId: activeProject.id,
          title: proposal.title,
          description: proposal.description,
          reason: `Extracted from ${proposal.model} conversation`,
          status: 'PROPOSED',
          proposedBy: proposal.model,
          createdAt: now,
          updatedAt: now,
          alternatives: [],
          relatedFiles: [],
          relatedRequirements: [],
          conversationId: proposal.conversationId,
        });
      } else if (proposal.type === 'REQUIREMENT') {
        await RequirementRepository.create({
          id: uuid(),
          projectId: activeProject.id,
          title: proposal.title,
          description: proposal.description,
          priority: 'medium',
          status: 'PROPOSED',
          source: `${proposal.model} conversation`,
          createdAt: now,
          updatedAt: now,
        });
      } else if (proposal.type === 'QUESTION') {
        await QuestionRepository.create({
          id: uuid(),
          projectId: activeProject.id,
          question: proposal.title,
          context: proposal.description,
          status: 'OPEN',
          source: `${proposal.model} conversation`,
          createdAt: now,
        });
      }

      await TimelineRepository.create({
        id: uuid(),
        projectId: activeProject.id,
        type: proposal.type === 'DECISION' ? 'DECISION_PROPOSED' : proposal.type === 'REQUIREMENT' ? 'REQUIREMENT_ADDED' : 'QUESTION_RAISED',
        title: proposal.title,
        description: `Extracted from ${proposal.model} conversation`,
        timestamp: now,
        model: proposal.model,
      });

      // Update proposal status in local state
      setProposals(proposals.map(p =>
        p.id === proposal.id ? { ...p, status: 'accepted' as const } : p
      ));

      addToast(`${proposal.type} added to project memory.`, 'success');
      await loadProjectData(activeProject.id);
    } catch {
      addToast('Failed to save to memory.', 'error');
    }
  };

  const handleRejectProposal = (proposal: MemoryProposal) => {
    setProposals(proposals.map(p =>
      p.id === proposal.id ? { ...p, status: 'rejected' as const } : p
    ));
    addToast('Proposal rejected.', 'info');
  };

  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const acceptedProposals = proposals.filter(p => p.status === 'accepted');
  const rejectedProposals = proposals.filter(p => p.status === 'rejected');

  const typeLabels: Record<string, string> = {
    DECISION: '💡 Decision',
    REQUIREMENT: '📋 Requirement',
    CONSTRAINT: '🔒 Constraint',
    QUESTION: '❓ Question',
    REJECTED_IDEA: '✕ Rejected Idea',
    ARCHITECTURE: '🏗 Architecture',
    RESEARCH: '🔍 Research',
    FILE: '📄 File',
    GOAL: '🎯 Goal',
    ASSUMPTION: '💭 Assumption',
    EVIDENCE: '📊 Evidence',
    CONCLUSION: '✓ Conclusion',
    CHANGE: '🔄 Change',
    CONFLICT: '⚠ Conflict',
  };

  return (
    <div className="p-5 max-w-2xl animate-fade-in">
      <button onClick={() => setPage('dashboard')} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 flex items-center gap-1">
        ← Back to Dashboard
      </button>

      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Capture Conversation</h1>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Paste an AI conversation below. Continuum will extract decisions, requirements, and questions.
      </p>

      {!extracted ? (
        <>
          {/* Auto-Capture active tab button */}
          <div className="mb-4 p-3 bg-brand-50 border border-brand-200 dark:bg-brand-950/40 dark:border-brand-900 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-brand-900 dark:text-brand-200">Auto-Capture from Open Tab</div>
              <div className="text-2xs text-brand-700 dark:text-brand-400">Extracts directly from your active ChatGPT / Claude tab</div>
            </div>
            <Button variant="brand" size="sm" onClick={handleAutoCapture}>
              ⚡ Capture Active Tab
            </Button>
          </div>

          <div className="text-2xs uppercase tracking-widest text-gray-400 mb-2 font-semibold">Or Paste Manually</div>

          {/* Model selector */}
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Source AI</label>
            <div className="flex gap-1.5">
              {['claude', 'chatgpt', 'gemini', 'perplexity'].map(m => (
                <button
                  key={m}
                  onClick={() => setModel(m)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors capitalize ${
                    model === m
                      ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-surface-dark-tertiary dark:text-gray-300 dark:border-surface-dark-border'
                  }`}
                >
                  {m === 'chatgpt' ? 'GPT' : m}
                </button>
              ))}
            </div>
          </div>

          <TextArea
            placeholder="Paste the AI conversation here...&#10;&#10;Tip: Include both your messages and the AI's responses for best extraction results."
            value={pastedContent}
            onChange={(e) => setPastedContent(e.target.value)}
            rows={12}
            className="mb-4"
          />

          <Button variant="primary" onClick={handleExtract} disabled={!pastedContent.trim()}>
            Extract Project Memory
          </Button>
        </>
      ) : (
        <>
          {/* Results */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Continuum found {proposals.length} potential change{proposals.length !== 1 ? 's' : ''}
              </h2>
            </div>

            {pendingProposals.length > 0 && (
              <div className="space-y-2 mb-4">
                {pendingProposals.map(p => (
                  <Card key={p.id} padding="sm" className="border-amber-200 dark:border-amber-900">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xs text-gray-400">{typeLabels[p.type] ?? p.type}</span>
                          <Badge variant="warning" size="sm">Pending</Badge>
                        </div>
                        <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">{p.title}</p>
                        <p className="text-2xs text-gray-500 dark:text-gray-400">{p.description}</p>
                        <div className="text-2xs text-gray-400 mt-1">
                          Confidence: {Math.round(p.confidence * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="primary" size="sm" onClick={() => handleAcceptProposal(p)}>Accept</Button>
                      <Button variant="secondary" size="sm" onClick={() => handleRejectProposal(p)}>Reject</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {acceptedProposals.length > 0 && (
              <div className="mb-4">
                <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Accepted</div>
                <div className="space-y-1">
                  {acceptedProposals.map(p => (
                    <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 rounded-md">
                      <span className="text-emerald-600 text-xs">✓</span>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">{p.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rejectedProposals.length > 0 && (
              <div className="mb-4">
                <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Rejected</div>
                <div className="space-y-1">
                  {rejectedProposals.map(p => (
                    <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <span className="text-gray-400 text-xs">✕</span>
                      <span className="text-xs text-gray-500">{p.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setExtracted(false); setProposals([]); setPastedContent(''); }}>
              Capture Another
            </Button>
            <Button variant="primary" onClick={() => setPage('dashboard')}>
              Done
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
