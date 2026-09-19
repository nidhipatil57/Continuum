import type { SecretDetection } from '@/shared/types';

const SECRET_PATTERNS: Array<{ type: SecretDetection['type']; pattern: RegExp; label: string }> = [
  // API Keys
  { type: 'API_KEY', pattern: /sk-[a-zA-Z0-9]{20,}/g, label: 'OPENAI_API_KEY' },
  { type: 'API_KEY', pattern: /sk-proj-[a-zA-Z0-9_-]{40,}/g, label: 'OPENAI_PROJECT_KEY' },
  { type: 'API_KEY', pattern: /sk-ant-[a-zA-Z0-9_-]{40,}/g, label: 'ANTHROPIC_API_KEY' },
  { type: 'API_KEY', pattern: /AIza[a-zA-Z0-9_-]{35}/g, label: 'GOOGLE_API_KEY' },
  { type: 'API_KEY', pattern: /AKIA[A-Z0-9]{16}/g, label: 'AWS_ACCESS_KEY' },
  { type: 'API_KEY', pattern: /sk_live_[a-zA-Z0-9]{24,}/g, label: 'STRIPE_SECRET_KEY' },
  { type: 'API_KEY', pattern: /sk_test_[a-zA-Z0-9]{24,}/g, label: 'STRIPE_TEST_KEY' },
  { type: 'API_KEY', pattern: /pk_live_[a-zA-Z0-9]{24,}/g, label: 'STRIPE_PUBLISHABLE_KEY' },
  { type: 'API_KEY', pattern: /pk_test_[a-zA-Z0-9]{24,}/g, label: 'STRIPE_TEST_PUBLISHABLE_KEY' },
  { type: 'API_KEY', pattern: /ghp_[a-zA-Z0-9]{36}/g, label: 'GITHUB_PAT' },
  { type: 'API_KEY', pattern: /gho_[a-zA-Z0-9]{36}/g, label: 'GITHUB_OAUTH_TOKEN' },
  { type: 'API_KEY', pattern: /glpat-[a-zA-Z0-9_-]{20}/g, label: 'GITLAB_PAT' },
  { type: 'API_KEY', pattern: /xoxb-[a-zA-Z0-9-]+/g, label: 'SLACK_BOT_TOKEN' },
  { type: 'API_KEY', pattern: /xoxp-[a-zA-Z0-9-]+/g, label: 'SLACK_USER_TOKEN' },
  { type: 'API_KEY', pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g, label: 'SENDGRID_API_KEY' },
  { type: 'API_KEY', pattern: /key-[a-zA-Z0-9]{32}/g, label: 'MAILGUN_API_KEY' },

  // Tokens
  { type: 'TOKEN', pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, label: 'JWT_TOKEN' },
  { type: 'TOKEN', pattern: /bearer\s+[a-zA-Z0-9_-]{20,}/gi, label: 'BEARER_TOKEN' },

  // Passwords in connection strings
  { type: 'PASSWORD', pattern: /(?:password|passwd|pwd)\s*[=:]\s*['"][^'"]{4,}['"]/gi, label: 'PASSWORD' },
  { type: 'PASSWORD', pattern: /(?:mysql|postgres|postgresql|mongodb|redis):\/\/[^:]+:([^@]+)@/g, label: 'DATABASE_PASSWORD' },

  // .env values
  { type: 'CREDENTIAL', pattern: /(?:API_KEY|SECRET_KEY|ACCESS_TOKEN|AUTH_TOKEN|PRIVATE_KEY)\s*=\s*[^\s]{8,}/gi, label: 'ENV_SECRET' },

  // Private URLs
  { type: 'PRIVATE_URL', pattern: /https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(?::\d+)?[^\s]*/g, label: 'PRIVATE_URL' },

  // Personal data
  { type: 'PERSONAL_DATA', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi, label: 'EMAIL' },
  { type: 'PERSONAL_DATA', pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, label: 'PHONE_NUMBER' },
  { type: 'PERSONAL_DATA', pattern: /\b\d{3}-\d{2}-\d{4}\b/g, label: 'SSN' },
];

export const RedactionEngine = {
  scan(content: string): SecretDetection[] {
    const detections: SecretDetection[] = [];

    for (const { type, pattern, label } of SECRET_PATTERNS) {
      // Reset regex lastIndex
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(content)) !== null) {
        detections.push({
          type,
          match: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          replacement: `[${label}_REDACTED]`,
        });
      }
    }

    // Deduplicate overlapping detections - keep the longer one
    detections.sort((a, b) => a.startIndex - b.startIndex);
    const deduped: SecretDetection[] = [];
    for (const d of detections) {
      const last = deduped[deduped.length - 1];
      if (last && d.startIndex < last.endIndex) {
        if (d.match.length > last.match.length) {
          deduped[deduped.length - 1] = d;
        }
      } else {
        deduped.push(d);
      }
    }

    return deduped;
  },

  redact(content: string, detections?: SecretDetection[]): { redacted: string; count: number } {
    const found = detections ?? this.scan(content);
    if (found.length === 0) return { redacted: content, count: 0 };

    let result = content;
    // Process from end to start to maintain correct indices
    const sorted = [...found].sort((a, b) => b.startIndex - a.startIndex);
    for (const detection of sorted) {
      result = result.slice(0, detection.startIndex) + detection.replacement + result.slice(detection.endIndex);
    }

    return { redacted: result, count: found.length };
  },

  hasSecrets(content: string): boolean {
    return this.scan(content).length > 0;
  },
};
