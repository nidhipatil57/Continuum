import React from 'react';
import { useMemoryStore } from '../store';
import { Card, Badge, EmptyState } from '@/shared/components';

export const FilesPage: React.FC = () => {
  const { files, decisions } = useMemoryStore();

  const typeIcons: Record<string, string> = {
    typescript: '🟦',
    javascript: '🟨',
    sql: '🗃️',
    markdown: '📝',
    json: '📋',
    css: '🎨',
    html: '🌐',
  };

  return (
    <div className="p-5 max-w-2xl animate-fade-in">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Files</h1>
      <div className="space-y-2">
        {files.length === 0 ? (
          <EmptyState title="No files connected" description="Connect project files to track relationships between code and decisions." />
        ) : files.map(f => {
          const relatedDecs = decisions.filter(d => d.relatedFiles.includes(f.name));
          return (
            <Card key={f.id} padding="sm">
              <div className="flex items-start gap-2">
                <span className="text-sm mt-0.5">{typeIcons[f.type] ?? '📄'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-900 dark:text-white font-mono">{f.name}</span>
                    <Badge variant="default" size="sm">{f.type}</Badge>
                  </div>
                  <p className="text-2xs text-gray-500 dark:text-gray-400 mt-1">{f.description}</p>
                  {relatedDecs.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-2xs text-gray-400">Related decisions:</span>
                      {relatedDecs.slice(0, 3).map(d => (
                        <Badge key={d.id} variant="info" size="sm">{d.title.slice(0, 30)}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
