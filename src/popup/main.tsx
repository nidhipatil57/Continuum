import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '@/shared/styles/globals.css';
import { Button, ProviderIcon, HealthIndicator } from '@/shared/components';
import { db, getSettings } from '@/database/db';
import { seedDemoProject } from '@/database/seed/demo-project';
import type { Project } from '@/shared/types';
import { AI_PROVIDERS, SUPPORTED_PROVIDERS, detectProvider } from '@/shared/constants/providers';
import { ContextCompiler } from '@/ai/compiler/ContextCompiler';

function Popup() {
  const [project, setProject] = useState<Project | null>(null);
  const [health] = useState(84);
  const [detectedProvider, setDetectedProvider] = useState<string | null>(null);
  const [stats, setStats] = useState({ decisions: 0, questions: 0 });

  useEffect(() => {
    const init = async () => {
      await seedDemoProject();
      const settings = await getSettings();
      if (settings.activeProjectId) {
        const p = await db.projects.get(settings.activeProjectId);
        setProject(p ?? null);
        if (p) {
          const decisions = await db.decisions.where('projectId').equals(p.id).count();
          const questions = await db.questions.where({ projectId: p.id, status: 'OPEN' }).count();
          setStats({ decisions, questions });
        }
      }

      // Detect current tab provider
      chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url;
        if (url) {
          const provider = detectProvider(url);
          if (provider) setDetectedProvider(provider.id);
        }
      });
    };
    init();
  }, []);

  const openSidePanel = () => {
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
    window.close();
  };

  const handleContinueWith = async (providerId: string) => {
    const provider = AI_PROVIDERS[providerId];
    if (!provider || !project) return;
    try {
      const ctx = await ContextCompiler.compile({
        project,
        targetModel: providerId as any,
      });
      await chrome.storage?.local?.set({
        pendingAutoInject: {
          providerId,
          text: ctx.fullHandoff,
          timestamp: Date.now(),
        },
      });
      await navigator.clipboard.writeText(ctx.fullHandoff);
      window.open(provider.newChatUrl, '_blank');
      window.close();
    } catch { /* fallback */ }
  };

  return (
    <div className="p-4 bg-white dark:bg-surface-dark min-h-[200px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded brand-gradient-bg flex items-center justify-center">
          <span className="text-white text-xs font-bold">C</span>
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Continuum</span>
      </div>

      {project ? (
        <>
          {/* Project Info */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-gray-900 dark:text-white">{project.name}</span>
            </div>
            <HealthIndicator score={health} size="sm" />
            <div className="flex gap-4 mt-2">
              <span className="text-2xs text-gray-500">{stats.decisions} decisions</span>
              <span className="text-2xs text-gray-500">{stats.questions} open questions</span>
            </div>
          </div>

          {/* Detected Provider */}
          {detectedProvider && (
            <div className="mb-3 px-2 py-1.5 bg-brand-50 dark:bg-brand-950 rounded-md">
              <div className="flex items-center gap-2">
                <ProviderIcon providerId={detectedProvider} size={14} />
                <span className="text-2xs text-brand-700 dark:text-brand-300">
                  Detected: {AI_PROVIDERS[detectedProvider]?.name}
                </span>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-1.5 mb-3">
            {SUPPORTED_PROVIDERS.filter(pid => pid !== detectedProvider).slice(0, 3).map(pid => {
              const provider = AI_PROVIDERS[pid];
              if (!provider) return null;
              return (
                <button
                  key={pid}
                  onClick={() => handleContinueWith(pid)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-gray-700 hover:bg-gray-50 transition-colors dark:text-gray-300 dark:hover:bg-surface-dark-tertiary"
                >
                  <ProviderIcon providerId={pid} size={14} />
                  Continue with {provider.shortName}
                </button>
              );
            })}
          </div>

          <Button variant="secondary" size="sm" onClick={openSidePanel} className="w-full justify-center">
            Open Side Panel
          </Button>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-gray-500 mb-3">No active project</p>
          <Button variant="brand" size="sm" onClick={openSidePanel} className="w-full justify-center">
            Get Started
          </Button>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
