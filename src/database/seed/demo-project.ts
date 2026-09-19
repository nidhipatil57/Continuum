import { v4 as uuid } from 'uuid';
import type { Project, Decision, Requirement, Question, ResearchFinding, ProjectFile, TimelineEvent, Constraint } from '@/shared/types';
import { db } from '../db';

const PROJECT_ID = 'demo-snapstudy-001';

const demoProject: Project = {
  id: PROJECT_ID,
  name: 'SnapStudy',
  description: 'A spatially-grounded AI study platform that converts handwritten notes into structured flashcards while preserving original page coordinates.',
  goal: 'Build a spatially-grounded AI study platform that links flashcards to their source regions on handwritten pages.',
  createdAt: '2026-09-11T10:00:00Z',
  updatedAt: '2026-09-17T15:30:00Z',
  status: 'active',
  currentVersion: 'v0.5',
};

const demoDecisions: Decision[] = [
  {
    id: uuid(), projectId: PROJECT_ID,
    title: 'Use React + TypeScript for frontend',
    description: 'The frontend will be built with React and TypeScript for type safety and component reusability.',
    reason: 'Strong ecosystem, excellent TypeScript support, and team familiarity with React patterns.',
    status: 'ACCEPTED', proposedBy: 'Claude', acceptedBy: 'User',
    createdAt: '2026-09-11T11:00:00Z', updatedAt: '2026-09-11T11:00:00Z',
    alternatives: ['Vue + TypeScript', 'Svelte', 'Next.js'],
    relatedFiles: ['App.tsx', 'tsconfig.json'], relatedRequirements: [],
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    title: 'Use PostgreSQL as primary database',
    description: 'PostgreSQL will serve as the primary persistence layer for all structured data.',
    reason: 'Relational data model better fits the project requirements. Spatial queries possible with PostGIS extension.',
    status: 'ACCEPTED', proposedBy: 'Claude', acceptedBy: 'User',
    createdAt: '2026-09-13T14:00:00Z', updatedAt: '2026-09-15T10:00:00Z',
    alternatives: ['Firebase Firestore', 'MongoDB', 'Supabase'],
    relatedFiles: ['schema.sql', 'db.ts'], relatedRequirements: [],
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    title: 'Use Gemini Vision for image understanding',
    description: 'Gemini Vision API will be used for OCR and spatial understanding of handwritten pages.',
    reason: 'Superior multimodal capabilities for understanding handwritten content with spatial awareness.',
    status: 'ACCEPTED', proposedBy: 'GPT', acceptedBy: 'User',
    createdAt: '2026-09-13T16:00:00Z', updatedAt: '2026-09-13T16:00:00Z',
    alternatives: ['Google Cloud Vision', 'Azure Computer Vision', 'Tesseract OCR'],
    relatedFiles: ['OCRPipeline.ts'], relatedRequirements: [],
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    title: 'Coordinate-based page mapping',
    description: 'Every extracted concept maintains its x,y coordinates from the original handwritten page.',
    reason: 'Spatial grounding is the core differentiator. Users must see where on the page each concept originated.',
    status: 'ACCEPTED', proposedBy: 'Claude', acceptedBy: 'User',
    createdAt: '2026-09-11T12:00:00Z', updatedAt: '2026-09-11T12:00:00Z',
    alternatives: ['OCR-only extraction', 'Page-level tagging without coordinates'],
    relatedFiles: ['OCRPipeline.ts', 'flashcards.ts', 'schema.sql'], relatedRequirements: [],
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    title: 'Local-first architecture',
    description: 'The application should work offline with local data storage as the primary mode.',
    reason: 'Students need to study without reliable internet. Data privacy for academic content.',
    status: 'ACCEPTED', proposedBy: 'Claude', acceptedBy: 'User',
    createdAt: '2026-09-11T13:00:00Z', updatedAt: '2026-09-11T13:00:00Z',
    alternatives: ['Cloud-first with offline cache', 'Hybrid sync'],
    relatedFiles: ['storage.ts'], relatedRequirements: [],
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    title: 'Use Clerk for authentication',
    description: 'Switch from Firebase Auth to Clerk for simpler session management.',
    reason: 'Claude recommended Clerk due to simpler session management and better developer experience.',
    status: 'PROPOSED', proposedBy: 'Claude',
    createdAt: '2026-09-17T14:00:00Z', updatedAt: '2026-09-17T14:00:00Z',
    alternatives: ['Firebase Auth', 'Auth0', 'Supabase Auth'],
    relatedFiles: ['auth.ts', 'middleware.ts'], relatedRequirements: [],
    conversationId: 'conv-006',
  },
];

const demoRequirements: Requirement[] = [
  {
    id: uuid(), projectId: PROJECT_ID,
    title: 'Preserve original handwriting references',
    description: 'Every generated flashcard must remain linked to its original region on the handwritten page.',
    priority: 'critical', status: 'CONFIRMED', source: 'Claude — Architecture Discussion',
    createdAt: '2026-09-11T11:30:00Z', updatedAt: '2026-09-11T11:30:00Z',
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    title: 'Support offline study mode',
    description: 'Students must be able to review flashcards without internet connectivity.',
    priority: 'high', status: 'CONFIRMED', source: 'User',
    createdAt: '2026-09-11T12:00:00Z', updatedAt: '2026-09-11T12:00:00Z',
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    title: 'Minimal UI for student focus',
    description: 'The interface must be distraction-free and optimized for study sessions.',
    priority: 'medium', status: 'CONFIRMED', source: 'User',
    createdAt: '2026-09-12T09:00:00Z', updatedAt: '2026-09-12T09:00:00Z',
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    title: 'Support multi-page document scanning',
    description: 'Users should be able to scan and process notebooks with multiple pages in sequence.',
    priority: 'high', status: 'IN_PROGRESS', source: 'GPT — Implementation',
    createdAt: '2026-09-16T10:00:00Z', updatedAt: '2026-09-16T10:00:00Z',
  },
];

const demoQuestions: Question[] = [
  {
    id: uuid(), projectId: PROJECT_ID,
    question: 'How should rotated pages be handled during OCR?',
    context: 'Users may photograph pages at different angles. The OCR pipeline needs to account for rotation.',
    status: 'OPEN', source: 'GPT — Implementation',
    createdAt: '2026-09-16T11:00:00Z',
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    question: 'How should conflicting OCR results be resolved?',
    context: 'When Gemini Vision produces different interpretations of the same region across multiple scans.',
    status: 'OPEN', source: 'Perplexity — Research',
    createdAt: '2026-09-17T10:00:00Z',
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    question: 'What is the best flashcard ranking algorithm?',
    context: 'Need to implement spaced repetition. SM-2 vs SM-5 vs FSRS algorithm comparison.',
    status: 'IN_PROGRESS', source: 'Perplexity — Research',
    createdAt: '2026-09-17T11:00:00Z',
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    question: 'Should the app support collaborative study sessions?',
    context: 'Multiple students sharing flashcard decks from the same notebook scan.',
    status: 'OPEN', source: 'User',
    createdAt: '2026-09-15T09:00:00Z',
  },
];

const demoResearch: ResearchFinding[] = [
  {
    id: uuid(), projectId: PROJECT_ID,
    claim: 'FSRS algorithm outperforms SM-2 for long-term retention by 15-20%',
    source: 'Academic paper', url: 'https://arxiv.org/example',
    date: '2026-09-17T10:30:00Z', model: 'perplexity',
    verificationStatus: 'VERIFIED',
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    claim: 'Gemini Vision supports coordinate extraction from handwritten text with 94% accuracy',
    source: 'Google AI documentation', url: 'https://ai.google.dev',
    date: '2026-09-13T15:00:00Z', model: 'perplexity',
    verificationStatus: 'VERIFIED',
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    claim: 'PostGIS spatial queries can efficiently handle page coordinate lookups',
    source: 'PostGIS documentation', url: 'https://postgis.net',
    date: '2026-09-14T12:00:00Z', model: 'perplexity',
    verificationStatus: 'VERIFIED',
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    claim: 'React Native may offer better mobile performance than a PWA for image processing',
    source: 'Benchmark comparison',
    date: '2026-09-15T14:00:00Z', model: 'chatgpt',
    verificationStatus: 'UNVERIFIED',
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    claim: 'Tesseract OCR v5 has significantly improved handwriting recognition',
    source: 'GitHub release notes', url: 'https://github.com/tesseract-ocr',
    date: '2026-09-17T09:00:00Z', model: 'perplexity',
    verificationStatus: 'UNVERIFIED',
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    claim: 'WebAssembly-based OCR can run client-side for privacy',
    source: 'Technical blog',
    date: '2026-09-16T16:00:00Z', model: 'gemini',
    verificationStatus: 'VERIFIED',
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    claim: 'Spaced repetition combined with spatial cues improves recall by 30%',
    source: 'Educational psychology research',
    date: '2026-09-17T11:30:00Z', model: 'perplexity',
    verificationStatus: 'VERIFIED',
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    claim: 'IndexedDB can store up to 50% of available disk space in Chrome',
    source: 'MDN Web Docs', url: 'https://developer.mozilla.org',
    date: '2026-09-14T10:00:00Z', model: 'chatgpt',
    verificationStatus: 'VERIFIED',
  },
];

const demoFiles: ProjectFile[] = [
  {
    id: uuid(), projectId: PROJECT_ID,
    name: 'schema.sql', type: 'sql',
    description: 'PostgreSQL database schema with tables for pages, regions, concepts, and flashcards.',
    lastModified: '2026-09-15T10:00:00Z', relatedDecisions: [], relatedRequirements: [],
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    name: 'OCRPipeline.ts', type: 'typescript',
    description: 'Main OCR processing pipeline using Gemini Vision for handwriting extraction.',
    lastModified: '2026-09-16T14:00:00Z', relatedDecisions: [], relatedRequirements: [],
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    name: 'flashcards.ts', type: 'typescript',
    description: 'Flashcard generation and spaced repetition logic.',
    lastModified: '2026-09-16T15:00:00Z', relatedDecisions: [], relatedRequirements: [],
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    name: 'architecture.md', type: 'markdown',
    description: 'System architecture documentation including data flow and component diagram.',
    lastModified: '2026-09-13T16:00:00Z', relatedDecisions: [], relatedRequirements: [],
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    name: 'README.md', type: 'markdown',
    description: 'Project readme with setup instructions and development guide.',
    lastModified: '2026-09-11T10:00:00Z', relatedDecisions: [], relatedRequirements: [],
  },
];

const demoConstraints: Constraint[] = [
  {
    id: uuid(), projectId: PROJECT_ID,
    title: 'Student-focused design',
    description: 'All UI decisions must prioritize the student experience over advanced features.',
    severity: 'HIGH', status: 'CONFIRMED', source: 'User',
    createdAt: '2026-09-11T10:30:00Z',
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    title: 'No unnecessary cloud storage',
    description: 'User data should remain local unless explicitly synced. Privacy is critical for student notes.',
    severity: 'CRITICAL', status: 'CONFIRMED', source: 'User',
    createdAt: '2026-09-11T10:30:00Z',
  },
  {
    id: uuid(), projectId: PROJECT_ID,
    title: 'Preserve original handwriting',
    description: 'The system must never discard the original image — flashcards always link back to source.',
    severity: 'CRITICAL', status: 'CONFIRMED', source: 'Claude — Architecture',
    createdAt: '2026-09-11T12:00:00Z',
  },
];

const demoTimeline: TimelineEvent[] = [
  {
    id: uuid(), projectId: PROJECT_ID, type: 'PROJECT_CREATED',
    title: 'Project created', description: 'SnapStudy project initialized with core goals.',
    timestamp: '2026-09-11T10:00:00Z',
  },
  {
    id: uuid(), projectId: PROJECT_ID, type: 'DECISION_ACCEPTED',
    title: 'Architecture proposed', description: 'React + TypeScript frontend with coordinate-based page mapping.',
    timestamp: '2026-09-11T11:00:00Z', model: 'claude',
  },
  {
    id: uuid(), projectId: PROJECT_ID, type: 'REQUIREMENT_ADDED',
    title: 'Core requirements defined', description: 'Spatial grounding, offline mode, minimal UI established.',
    timestamp: '2026-09-11T12:00:00Z', model: 'claude',
  },
  {
    id: uuid(), projectId: PROJECT_ID, type: 'DECISION_ACCEPTED',
    title: 'Database selected', description: 'PostgreSQL chosen over Firebase for relational data model.',
    timestamp: '2026-09-13T14:00:00Z', model: 'claude',
  },
  {
    id: uuid(), projectId: PROJECT_ID, type: 'DECISION_ACCEPTED',
    title: 'OCR provider selected', description: 'Gemini Vision selected for image understanding capabilities.',
    timestamp: '2026-09-13T16:00:00Z', model: 'chatgpt',
  },
  {
    id: uuid(), projectId: PROJECT_ID, type: 'RESEARCH_ADDED',
    title: 'PostGIS research', description: 'Verified PostGIS spatial query capabilities for page coordinates.',
    timestamp: '2026-09-14T12:00:00Z', model: 'perplexity',
  },
  {
    id: uuid(), projectId: PROJECT_ID, type: 'DECISION_ACCEPTED',
    title: 'Schema updated', description: 'PostgreSQL schema updated with spatial coordinate columns.',
    timestamp: '2026-09-15T10:00:00Z', model: 'chatgpt',
  },
  {
    id: uuid(), projectId: PROJECT_ID, type: 'CONVERSATION_CAPTURED',
    title: 'OCR implementation discussion', description: 'Discussed OCR pipeline implementation details with GPT.',
    timestamp: '2026-09-16T10:00:00Z', model: 'chatgpt',
  },
  {
    id: uuid(), projectId: PROJECT_ID, type: 'FILE_CHANGED',
    title: 'OCR pipeline implemented', description: 'OCRPipeline.ts created with Gemini Vision integration.',
    timestamp: '2026-09-16T14:00:00Z', model: 'chatgpt',
  },
  {
    id: uuid(), projectId: PROJECT_ID, type: 'FILE_CHANGED',
    title: 'Flashcard logic implemented', description: 'flashcards.ts created with generation and spatial linking.',
    timestamp: '2026-09-16T15:00:00Z', model: 'chatgpt',
  },
  {
    id: uuid(), projectId: PROJECT_ID, type: 'RESEARCH_ADDED',
    title: 'Spaced repetition research', description: 'FSRS algorithm research completed. Outperforms SM-2 by 15-20%.',
    timestamp: '2026-09-17T10:30:00Z', model: 'perplexity',
  },
  {
    id: uuid(), projectId: PROJECT_ID, type: 'QUESTION_RAISED',
    title: 'OCR conflict resolution', description: 'How should conflicting OCR results be resolved?',
    timestamp: '2026-09-17T10:00:00Z', model: 'perplexity',
  },
  {
    id: uuid(), projectId: PROJECT_ID, type: 'DECISION_PROPOSED',
    title: 'Authentication change proposed', description: 'Claude suggested switching from Firebase Auth to Clerk.',
    timestamp: '2026-09-17T14:00:00Z', model: 'claude',
  },
  {
    id: uuid(), projectId: PROJECT_ID, type: 'CONFLICT_DETECTED',
    title: 'Auth provider conflict', description: 'New Clerk suggestion conflicts with existing Firebase Auth assumption.',
    timestamp: '2026-09-17T14:05:00Z', model: 'claude',
  },
];

export async function seedDemoProject(): Promise<void> {
  const existing = await db.projects.get(PROJECT_ID);
  if (existing) return; // Don't re-seed

  await db.transaction('rw', [
    db.projects, db.decisions, db.requirements, db.questions,
    db.researchFindings, db.files, db.constraints, db.timelineEvents,
  ], async () => {
    await db.projects.add(demoProject);
    await db.decisions.bulkAdd(demoDecisions);
    await db.requirements.bulkAdd(demoRequirements);
    await db.questions.bulkAdd(demoQuestions);
    await db.researchFindings.bulkAdd(demoResearch);
    await db.files.bulkAdd(demoFiles);
    await db.constraints.bulkAdd(demoConstraints);
    await db.timelineEvents.bulkAdd(demoTimeline);
  });
}
