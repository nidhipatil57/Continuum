import React, { useState, useEffect, useRef } from 'react';
import { useUIStore, useProjectStore } from '../store';
import { AI_PROVIDERS, SUPPORTED_PROVIDERS } from '@/shared/constants/providers';
import { PassportExporter } from '@/core/passport/Passport';

interface Command {
  id: string;
  label: string;
  description: string;
  category: string;
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, toggleCommandPalette, setPage, addToast } = useUIStore();
  const { activeProject } = useProjectStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // Navigation
    { id: 'dashboard', label: 'Open Dashboard', description: 'Project overview and health', category: 'Navigate', action: () => { setPage('dashboard'); toggleCommandPalette(); } },
    { id: 'timeline', label: 'Open Timeline', description: 'View project history', category: 'Navigate', action: () => { setPage('timeline'); toggleCommandPalette(); } },
    { id: 'decisions', label: 'Open Decisions', description: 'Decision ledger', category: 'Navigate', action: () => { setPage('decisions'); toggleCommandPalette(); } },
    { id: 'requirements', label: 'Open Requirements', description: 'Project requirements', category: 'Navigate', action: () => { setPage('requirements'); toggleCommandPalette(); } },
    { id: 'questions', label: 'Open Questions', description: 'Open and resolved questions', category: 'Navigate', action: () => { setPage('questions'); toggleCommandPalette(); } },
    { id: 'research', label: 'Open Research', description: 'Research findings', category: 'Navigate', action: () => { setPage('research'); toggleCommandPalette(); } },
    { id: 'search', label: 'Search Project', description: 'Search across all entities', category: 'Navigate', action: () => { setPage('search'); toggleCommandPalette(); }, shortcut: 'Ctrl+F' },
    { id: 'settings', label: 'Open Settings', description: 'Extension settings', category: 'Navigate', action: () => { setPage('settings'); toggleCommandPalette(); } },

    // AI Actions
    ...SUPPORTED_PROVIDERS.map(pid => {
      const provider = AI_PROVIDERS[pid];
      return {
        id: `continue-${pid}`,
        label: `Continue with ${provider?.name ?? pid}`,
        description: `Open ${provider?.name} with project context`,
        category: 'AI',
        action: () => {
          if (provider) window.open(provider.newChatUrl, '_blank');
          toggleCommandPalette();
        },
      };
    }),

    // Project Actions
    {
      id: 'export', label: 'Export Project Passport', description: 'Download project as .continuum file',
      category: 'Project',
      action: async () => {
        if (activeProject) {
          try {
            const passport = await PassportExporter.exportProject(activeProject.id);
            PassportExporter.download(passport);
            addToast('Project exported successfully.', 'success');
          } catch (e) {
            addToast('Export failed.', 'error');
          }
        }
        toggleCommandPalette();
      },
    },
    {
      id: 'capture', label: 'Capture Conversation', description: 'Extract memory from current AI conversation',
      category: 'Memory', shortcut: 'Ctrl+Shift+C',
      action: () => {
        setPage('capture-review');
        toggleCommandPalette();
      },
    },
  ];

  const filtered = query
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[selectedIndex]?.action();
    } else if (e.key === 'Escape') {
      toggleCommandPalette();
    }
  };

  if (!commandPaletteOpen) return null;

  // Group by category
  const grouped: Record<string, typeof filtered> = {};
  for (const cmd of filtered) {
    if (!grouped[cmd.category]) grouped[cmd.category] = [];
    grouped[cmd.category]!.push(cmd);
  }

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={toggleCommandPalette} />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-md">
        <div className="bg-white rounded-xl shadow-overlay border border-gray-200 overflow-hidden animate-scale-in dark:bg-surface-dark dark:border-surface-dark-border">
          {/* Search */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-surface-dark-border">
            <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What do you want to do?"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-white dark:placeholder:text-gray-500"
            />
            <kbd className="text-2xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[320px] overflow-y-auto p-1">
            {Object.entries(grouped).map(([category, cmds]) => (
              <div key={category}>
                <div className="px-3 py-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{category}</span>
                </div>
                {cmds.map(cmd => {
                  flatIndex++;
                  const isSelected = flatIndex === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'bg-brand-50 dark:bg-brand-950'
                          : 'hover:bg-gray-50 dark:hover:bg-surface-dark-tertiary'
                      }`}
                    >
                      <div>
                        <div className={`text-xs font-medium ${isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-gray-900 dark:text-white'}`}>
                          {cmd.label}
                        </div>
                        <div className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">{cmd.description}</div>
                      </div>
                      {cmd.shortcut && (
                        <kbd className="text-2xs px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 shrink-0 ml-3">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-gray-400 dark:text-gray-500">
                No commands match "{query}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
