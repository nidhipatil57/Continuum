import React, { useRef } from 'react';
import { useUIStore, useProjectStore } from '../store';
import { Card, Toggle, Button, SectionHeader } from '@/shared/components';
import { PassportExporter } from '@/core/passport/Passport';
import { PassportImporter } from '@/core/passport/Passport';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, settings, updateSettings, addToast } = useUIStore();
  const { activeProject, loadProjects } = useProjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    if (!activeProject) return;
    try {
      const passport = await PassportExporter.exportProject(activeProject.id);
      PassportExporter.download(passport);
      addToast('Project passport exported.', 'success');
    } catch {
      addToast('Export failed.', 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const passport = await PassportImporter.readFile(file);
      await PassportImporter.importProject(passport);
      await loadProjects();
      addToast(`Project "${passport.project.name}" imported.`, 'success');
    } catch (err) {
      addToast(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-5 max-w-2xl animate-fade-in">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Settings</h1>

      {/* Appearance */}
      <SectionHeader title="Appearance" />
      <Card className="mb-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-gray-700 dark:text-gray-300 flex-1">Theme</span>
          <div className="flex gap-1">
            {(['light', 'dark'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  theme === t
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Privacy & Security */}
      <SectionHeader title="Privacy & Security" />
      <Card className="mb-5 space-y-4">
        <Toggle
          checked={settings?.privacy.localStorageEnabled ?? true}
          onChange={() => {}}
          label="Local Storage"
          description="All data stored locally in your browser"
        />
        <Toggle
          checked={settings?.privacy.secretRedactionEnabled ?? true}
          onChange={(val) => updateSettings({ privacy: { ...settings!.privacy, secretRedactionEnabled: val } })}
          label="Secret Redaction"
          description="Automatically detect and redact API keys, passwords, and tokens"
        />
        <Toggle
          checked={false}
          onChange={() => addToast('Cloud sync coming in a future release.', 'info')}
          label="Cloud Sync"
          description="Encrypted cloud backup (Coming Soon)"
        />
      </Card>

      {/* Memory Permissions */}
      <SectionHeader title="Memory Permissions" />
      <Card className="mb-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-700 dark:text-gray-300">Who can modify memory?</div>
            <div className="text-2xs text-gray-400">AI proposes, user approves</div>
          </div>
          <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">Human Approval</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-700 dark:text-gray-300">Who can delete memory?</div>
            <div className="text-2xs text-gray-400">Only the user can delete confirmed memory</div>
          </div>
          <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">User Only</span>
        </div>
      </Card>

      {/* Export / Import */}
      <SectionHeader title="Export / Import" />
      <Card className="mb-5">
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport} disabled={!activeProject}>
            Export Project Passport
          </Button>
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            Import Passport
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".continuum,.json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
        <p className="text-2xs text-gray-400 mt-2">
          Export your project as a portable .continuum file. Import it on another browser or share with others.
        </p>
      </Card>

      {/* About */}
      <SectionHeader title="About" />
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg brand-gradient-bg flex items-center justify-center">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Continuum</div>
            <div className="text-2xs text-gray-400">v1.0.0 — AI Context OS</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          One Project. Every AI. Zero Context Loss.
        </p>
        <p className="text-2xs text-gray-400 mt-2">
          Continuum maintains the canonical state of your project across every AI you use.
          Local-first. Human-approved. No lock-in.
        </p>
      </Card>
    </div>
  );
};
