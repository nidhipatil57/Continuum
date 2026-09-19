import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '@/shared/styles/globals.css';
import { useProjectStore, useMemoryStore, useUIStore } from './store';
import { seedDemoProject } from '@/database/seed/demo-project';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { TimelinePage } from './pages/TimelinePage';
import { DecisionsPage } from './pages/DecisionsPage';
import { DecisionDetailPage } from './pages/DecisionDetailPage';
import { RequirementsPage } from './pages/RequirementsPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { ResearchPage } from './pages/ResearchPage';
import { FilesPage } from './pages/FilesPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { CaptureReviewPage } from './pages/CaptureReviewPage';
import { CommandPalette } from './components/CommandPalette';
import { Toast } from '@/shared/components';

function App() {
  const { page, toasts, removeToast, loadSettings } = useUIStore();
  const { loadProjects, activeProject } = useProjectStore();
  const { loadProjectData } = useMemoryStore();

  useEffect(() => {
    const init = async () => {
      await seedDemoProject();
      await loadSettings();
      await loadProjects();
    };
    init();
  }, []);

  useEffect(() => {
    if (activeProject) {
      loadProjectData(activeProject.id);
    }
  }, [activeProject?.id]);

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        useUIStore.getState().toggleCommandPalette();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const renderPage = () => {
    if (page === 'onboarding') return <OnboardingPage />;

    return (
      <div className="flex h-screen bg-surface dark:bg-surface-dark">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {page === 'dashboard' && <DashboardPage />}
          {page === 'timeline' && <TimelinePage />}
          {page === 'decisions' && <DecisionsPage />}
          {page === 'decision-detail' && <DecisionDetailPage />}
          {page === 'requirements' && <RequirementsPage />}
          {page === 'questions' && <QuestionsPage />}
          {page === 'research' && <ResearchPage />}
          {page === 'files' && <FilesPage />}
          {page === 'search' && <SearchPage />}
          {page === 'settings' && <SettingsPage />}
          {page === 'capture-review' && <CaptureReviewPage />}
        </main>
      </div>
    );
  };

  return (
    <>
      {renderPage()}
      <CommandPalette />
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
