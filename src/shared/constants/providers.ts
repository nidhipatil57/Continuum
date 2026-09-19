import type { AIProviderId } from '@/shared/types';

// ============================================================
// AI PROVIDER METADATA
// ============================================================

export interface AIProviderMeta {
  id: AIProviderId;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  textColor: string;
  urlPatterns: RegExp[];
  baseUrl: string;
  newChatUrl: string;
  capabilities: {
    architecture: boolean;
    implementation: boolean;
    research: boolean;
    multimodal: boolean;
    longContext: boolean;
    codeReview: boolean;
  };
  contextEmphasis: string[];
  icon: string; // Lucide icon name
}

export const AI_PROVIDERS: Record<string, AIProviderMeta> = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    shortName: 'GPT',
    color: '#10a37f',
    bgColor: 'rgba(16, 163, 127, 0.1)',
    textColor: '#10a37f',
    urlPatterns: [/chat\.openai\.com/, /chatgpt\.com/],
    baseUrl: 'https://chatgpt.com',
    newChatUrl: 'https://chatgpt.com/',
    capabilities: {
      architecture: true,
      implementation: true,
      research: false,
      multimodal: true,
      longContext: true,
      codeReview: true,
    },
    contextEmphasis: ['requirements', 'implementation', 'files', 'constraints', 'tasks'],
    icon: 'MessageSquare',
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    shortName: 'Claude',
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.1)',
    textColor: '#d97706',
    urlPatterns: [/claude\.ai/],
    baseUrl: 'https://claude.ai',
    newChatUrl: 'https://claude.ai/new',
    capabilities: {
      architecture: true,
      implementation: true,
      research: true,
      multimodal: true,
      longContext: true,
      codeReview: true,
    },
    contextEmphasis: ['architecture', 'reasoning', 'approaches', 'context', 'understanding'],
    icon: 'Sparkles',
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    shortName: 'Gemini',
    color: '#4285f4',
    bgColor: 'rgba(66, 133, 244, 0.1)',
    textColor: '#4285f4',
    urlPatterns: [/gemini\.google\.com/],
    baseUrl: 'https://gemini.google.com',
    newChatUrl: 'https://gemini.google.com/app',
    capabilities: {
      architecture: true,
      implementation: true,
      research: true,
      multimodal: true,
      longContext: true,
      codeReview: true,
    },
    contextEmphasis: ['multimodal', 'documents', 'structured', 'visual', 'tasks'],
    icon: 'Hexagon',
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    shortName: 'Perplexity',
    color: '#20b2aa',
    bgColor: 'rgba(32, 178, 170, 0.1)',
    textColor: '#20b2aa',
    urlPatterns: [/perplexity\.ai/],
    baseUrl: 'https://www.perplexity.ai',
    newChatUrl: 'https://www.perplexity.ai/',
    capabilities: {
      architecture: false,
      implementation: false,
      research: true,
      multimodal: false,
      longContext: false,
      codeReview: false,
    },
    contextEmphasis: ['research', 'questions', 'unknowns', 'sources', 'verification'],
    icon: 'Search',
  },
  kimi: {
    id: 'kimi',
    name: 'Kimi',
    shortName: 'Kimi',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    textColor: '#6366f1',
    urlPatterns: [/kimi\.moonshot\.cn/],
    baseUrl: 'https://kimi.moonshot.cn',
    newChatUrl: 'https://kimi.moonshot.cn/',
    capabilities: {
      architecture: true,
      implementation: true,
      research: true,
      multimodal: false,
      longContext: true,
      codeReview: true,
    },
    contextEmphasis: ['compressed', 'longContext', 'review', 'critique'],
    icon: 'Eye',
  },
  grok: {
    id: 'grok',
    name: 'Grok',
    shortName: 'Grok',
    color: '#1d9bf0',
    bgColor: 'rgba(29, 155, 240, 0.1)',
    textColor: '#1d9bf0',
    urlPatterns: [/grok\.x\.ai/, /x\.com\/i\/grok/],
    baseUrl: 'https://grok.x.ai',
    newChatUrl: 'https://grok.x.ai/',
    capabilities: {
      architecture: true,
      implementation: true,
      research: true,
      multimodal: false,
      longContext: false,
      codeReview: true,
    },
    contextEmphasis: ['implementation', 'reasoning', 'tasks'],
    icon: 'Zap',
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    shortName: 'DeepSeek',
    color: '#0066ff',
    bgColor: 'rgba(0, 102, 255, 0.1)',
    textColor: '#0066ff',
    urlPatterns: [/chat\.deepseek\.com/],
    baseUrl: 'https://chat.deepseek.com',
    newChatUrl: 'https://chat.deepseek.com/',
    capabilities: {
      architecture: true,
      implementation: true,
      research: false,
      multimodal: false,
      longContext: true,
      codeReview: true,
    },
    contextEmphasis: ['implementation', 'reasoning', 'tasks', 'code'],
    icon: 'Code',
  },
};

export const SUPPORTED_PROVIDERS = ['chatgpt', 'claude', 'gemini', 'perplexity'] as const;

export function getProviderMeta(providerId: string): AIProviderMeta | undefined {
  return AI_PROVIDERS[providerId];
}

export function detectProvider(url: string): AIProviderMeta | undefined {
  for (const provider of Object.values(AI_PROVIDERS)) {
    if (provider.urlPatterns.some(p => p.test(url))) {
      return provider;
    }
  }
  return undefined;
}

// ============================================================
// STATUS DISPLAY
// ============================================================

export const STATUS_CONFIG = {
  CONFIRMED: { label: 'Confirmed', icon: '✓', color: 'text-status-confirmed', bg: 'bg-emerald-50 dark:bg-emerald-950' },
  ACCEPTED: { label: 'Accepted', icon: '✓', color: 'text-status-confirmed', bg: 'bg-emerald-50 dark:bg-emerald-950' },
  PROPOSED: { label: 'Proposed', icon: '●', color: 'text-status-proposed', bg: 'bg-amber-50 dark:bg-amber-950' },
  UNVERIFIED: { label: 'Unverified', icon: '⚠', color: 'text-status-unverified', bg: 'bg-orange-50 dark:bg-orange-950' },
  CONFLICTING: { label: 'Conflicting', icon: '●', color: 'text-status-conflicting', bg: 'bg-red-50 dark:bg-red-950' },
  REJECTED: { label: 'Rejected', icon: '✕', color: 'text-status-rejected', bg: 'bg-gray-50 dark:bg-gray-800' },
  OUTDATED: { label: 'Outdated', icon: '○', color: 'text-status-outdated', bg: 'bg-gray-50 dark:bg-gray-800' },
  SUPERSEDED: { label: 'Superseded', icon: '→', color: 'text-status-outdated', bg: 'bg-gray-50 dark:bg-gray-800' },
  IN_PROGRESS: { label: 'In Progress', icon: '◐', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-950' },
  COMPLETED: { label: 'Completed', icon: '✓', color: 'text-status-confirmed', bg: 'bg-emerald-50 dark:bg-emerald-950' },
  OPEN: { label: 'Open', icon: '○', color: 'text-status-proposed', bg: 'bg-amber-50 dark:bg-amber-950' },
  RESOLVED: { label: 'Resolved', icon: '✓', color: 'text-status-confirmed', bg: 'bg-emerald-50 dark:bg-emerald-950' },
  BLOCKED: { label: 'Blocked', icon: '■', color: 'text-status-conflicting', bg: 'bg-red-50 dark:bg-red-950' },
  VERIFIED: { label: 'Verified', icon: '✓', color: 'text-status-confirmed', bg: 'bg-emerald-50 dark:bg-emerald-950' },
  DISPUTED: { label: 'Disputed', icon: '⚠', color: 'text-status-conflicting', bg: 'bg-red-50 dark:bg-red-950' },
} as const;

export type StatusKey = keyof typeof STATUS_CONFIG;
