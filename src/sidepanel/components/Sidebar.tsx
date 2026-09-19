import React, { useState } from 'react';
import { useProjectStore, useUIStore } from '../store';
import { ProviderIcon } from '@/shared/components';
import { SUPPORTED_PROVIDERS, AI_PROVIDERS } from '@/shared/constants/providers';

const NAV_ITEMS = [
  { id: 'dashboard' as const, label: 'Overview', icon: '◫' },
  { id: 'capture-review' as const, label: 'Capture Memory', icon: '📥' },
  { id: 'timeline' as const, label: 'Timeline', icon: '◷' },
  { id: 'decisions' as const, label: 'Decisions', icon: '⑂' },
  { id: 'requirements' as const, label: 'Requirements', icon: '☰' },
  { id: 'files' as const, label: 'Files', icon: '◰' },
  { id: 'questions' as const, label: 'Questions', icon: '?' },
  { id: 'research' as const, label: 'Research', icon: '⌕' },
];

export const Sidebar: React.FC = () => {
  const { page, setPage } = useUIStore();
  const { projects, activeProject, setActiveProject } = useProjectStore();
  const [projectSwitcherOpen, setProjectSwitcherOpen] = useState(false);

  return (
    <aside className="w-[220px] h-screen border-r border-gray-200 dark:border-surface-dark-border bg-surface-secondary dark:bg-surface-dark-secondary flex flex-col shrink-0">
      {/* Logo + Project Switcher */}
      <div className="p-3 border-b border-gray-200 dark:border-surface-dark-border">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md brand-gradient-bg flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">Continuum</span>
        </div>

        {/* Project Switcher */}
        <div className="relative">
          <button
            onClick={() => setProjectSwitcherOpen(!projectSwitcherOpen)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-gray-100 dark:hover:bg-surface-dark-tertiary transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-gray-900 dark:text-white truncate flex-1">
              {activeProject?.name ?? 'Select Project'}
            </span>
            <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {projectSwitcherOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-overlay z-20 dark:bg-surface-dark dark:border-surface-dark-border animate-scale-in">
              <div className="p-1">
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProject(p.id);
                      setProjectSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                      p.id === activeProject?.id
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-surface-dark-tertiary'
                    }`}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-2xs text-gray-400 truncate mt-0.5">{p.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {/* Project Section */}
        <div className="mb-4">
          <div className="px-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Project</span>
          </div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-colors mb-0.5 ${
                page === item.id
                  ? 'bg-gray-100 text-gray-900 font-medium dark:bg-surface-dark-tertiary dark:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-dark-tertiary dark:hover:text-white'
              }`}
            >
              <span className="w-4 text-center text-sm opacity-60">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* AI Workspace */}
        <div className="mb-4">
          <div className="px-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">AI Workspace</span>
          </div>
          {SUPPORTED_PROVIDERS.map(pid => {
            const provider = AI_PROVIDERS[pid];
            if (!provider) return null;
            return (
              <button
                key={pid}
                onClick={() => window.open(provider.newChatUrl, '_blank')}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-dark-tertiary dark:hover:text-white transition-colors mb-0.5"
              >
                <ProviderIcon providerId={pid} size={14} />
                {provider.name}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <button
          onClick={() => setPage('search')}
          className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-colors mb-0.5 ${
            page === 'search'
              ? 'bg-gray-100 text-gray-900 font-medium dark:bg-surface-dark-tertiary dark:text-white'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-dark-tertiary dark:hover:text-white'
          }`}
        >
          <span className="w-4 text-center text-sm opacity-60">⌕</span>
          Search
        </button>
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-gray-200 dark:border-surface-dark-border">
        <button
          onClick={() => setPage('settings')}
          className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-colors ${
            page === 'settings'
              ? 'bg-gray-100 text-gray-900 font-medium dark:bg-surface-dark-tertiary dark:text-white'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-dark-tertiary dark:hover:text-white'
          }`}
        >
          <span className="w-4 text-center text-sm opacity-60">⚙</span>
          Settings
        </button>
        <div className="px-2 mt-2">
          <span className="text-2xs text-gray-400 dark:text-gray-600">Ctrl+Shift+Space — Command Palette</span>
        </div>
      </div>
    </aside>
  );
};
