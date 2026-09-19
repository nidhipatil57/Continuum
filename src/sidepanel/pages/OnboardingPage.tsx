import React, { useState } from 'react';
import { useUIStore, useProjectStore } from '../store';
import { Button, TextInput, TextArea } from '@/shared/components';
import { saveSettings } from '@/database/db';
import { v4 as uuid } from 'uuid';
import type { Project } from '@/shared/types';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectGoal, setProjectGoal] = useState('');
  const { setPage, updateSettings } = useUIStore();
  const { createProject } = useProjectStore();

  const handleComplete = async () => {
    if (!projectName.trim()) return;

    const project: Project = {
      id: uuid(),
      name: projectName.trim(),
      description: projectDesc.trim(),
      goal: projectGoal.trim() || projectDesc.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      currentVersion: 'v0.1',
    };

    await createProject(project);
    await updateSettings({ onboardingCompleted: true });
    setPage('dashboard');
  };

  const handleSkipToDemo = async () => {
    await saveSettings({ onboardingCompleted: true, activeProjectId: 'demo-snapstudy-001' });
    await updateSettings({ onboardingCompleted: true });
    setPage('dashboard');
    window.location.reload();
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0a0c14]">
      <div className="w-full max-w-md mx-auto px-8">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center animate-fade-in">
            {/* Logo */}
            <div className="mb-8">
              <div className="w-16 h-16 mx-auto rounded-2xl brand-gradient-bg flex items-center justify-center mb-6 shadow-lg shadow-brand-500/20">
                <span className="text-white text-2xl font-bold">C</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Continuum</h1>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-8">
                One Project. Every AI. Zero Context Loss.
              </p>
            </div>
            <p className="text-sm text-gray-400 mb-10 leading-relaxed max-w-xs mx-auto">
              Your project should have one source of truth — not one AI.
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="brand" size="lg" onClick={() => setStep(1)} className="w-full justify-center">
                Get Started
              </Button>
              <button
                onClick={handleSkipToDemo}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Explore with demo project →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: AI Providers */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-semibold text-white mb-1">Connect Your AI Workspace</h2>
            <p className="text-xs text-gray-400 mb-6">Continuum works with these AI platforms.</p>

            <div className="space-y-2 mb-8">
              {[
                { name: 'ChatGPT', color: '#10a37f', enabled: true },
                { name: 'Claude', color: '#d97706', enabled: true },
                { name: 'Gemini', color: '#4285f4', enabled: true },
                { name: 'Perplexity', color: '#20b2aa', enabled: true },
              ].map(p => (
                <div key={p.name} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: p.color }}>
                    {p.name[0]}
                  </div>
                  <span className="text-sm text-white flex-1">{p.name}</span>
                  <span className="text-xs text-emerald-400">✓ Ready</span>
                </div>
              ))}
            </div>

            <p className="text-2xs text-gray-500 mb-6">You can add more AI providers later in Settings.</p>

            <div className="flex gap-3">
              <Button variant="secondary" size="md" onClick={() => setStep(0)} className="dark:bg-white/5 dark:border-white/10 dark:text-white">
                Back
              </Button>
              <Button variant="brand" size="md" onClick={() => setStep(2)} className="flex-1 justify-center">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Storage */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-semibold text-white mb-1">Your Data, Your Control</h2>
            <p className="text-xs text-gray-400 mb-6">How should Continuum store your project memory?</p>

            <div className="space-y-2 mb-8">
              <div className="px-4 py-3 rounded-lg bg-brand-500/10 border border-brand-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded-full border-2 border-brand-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                  </div>
                  <span className="text-sm text-white font-medium">Local-first</span>
                </div>
                <p className="text-xs text-gray-400 ml-6">All data stored locally in your browser. Nothing leaves your machine.</p>
              </div>
              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 opacity-60">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded-full border-2 border-white/20" />
                  <span className="text-sm text-gray-400">Local + Encrypted Sync</span>
                  <span className="text-2xs text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">Coming Soon</span>
                </div>
                <p className="text-xs text-gray-500 ml-6">Local storage with optional encrypted cloud backup.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" size="md" onClick={() => setStep(1)} className="dark:bg-white/5 dark:border-white/10 dark:text-white">
                Back
              </Button>
              <Button variant="brand" size="md" onClick={() => setStep(3)} className="flex-1 justify-center">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Create Project */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-semibold text-white mb-1">Create Your First Project</h2>
            <p className="text-xs text-gray-400 mb-6">What are you building?</p>

            <div className="space-y-4 mb-8">
              <TextInput
                label="Project Name"
                placeholder="e.g., SnapStudy"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="[&_label]:text-gray-300 [&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder:text-gray-500"
              />
              <TextArea
                label="Description"
                placeholder="Brief description of what you're building..."
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                rows={2}
                className="[&_label]:text-gray-300 [&_textarea]:bg-white/5 [&_textarea]:border-white/10 [&_textarea]:text-white [&_textarea]:placeholder:text-gray-500"
              />
              <TextArea
                label="Goal (optional)"
                placeholder="What's the main goal or objective?"
                value={projectGoal}
                onChange={(e) => setProjectGoal(e.target.value)}
                rows={2}
                className="[&_label]:text-gray-300 [&_textarea]:bg-white/5 [&_textarea]:border-white/10 [&_textarea]:text-white [&_textarea]:placeholder:text-gray-500"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" size="md" onClick={() => setStep(2)} className="dark:bg-white/5 dark:border-white/10 dark:text-white">
                Back
              </Button>
              <Button
                variant="brand"
                size="md"
                onClick={handleComplete}
                disabled={!projectName.trim()}
                className="flex-1 justify-center"
              >
                Create Project
              </Button>
            </div>

            <button
              onClick={handleSkipToDemo}
              className="w-full mt-4 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Or explore the demo project →
            </button>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex justify-center gap-1.5 mt-8">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === step ? 'w-6 bg-brand-500' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
