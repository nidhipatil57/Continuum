import type { MemoryProposal, ConversationMessage, MemoryProposalType } from '@/shared/types';
import { v4 as uuid } from 'uuid';

// Pattern-based extraction rules
interface ExtractionRule {
  type: MemoryProposalType;
  patterns: RegExp[];
  confidence: number;
}

const EXTRACTION_RULES: ExtractionRule[] = [
  {
    type: 'DECISION',
    patterns: [
      /(?:we(?:'ve| have)?\s+)?decided\s+(?:to\s+)?(?:use|go with|choose|pick|select|adopt|implement|switch to)\s+(.+?)(?:\.|$)/gi,
      /(?:let's|I(?:'d| would)?\s+(?:recommend|suggest))\s+(?:use|go with|choose|pick|select|adopt)\s+(.+?)(?:\.|$)/gi,
      /(?:the best (?:choice|option|approach) (?:is|would be))\s+(.+?)(?:\.|$)/gi,
      /(?:I recommend|my recommendation is)\s+(.+?)(?:\.|$)/gi,
      /(?:we should (?:use|go with|switch to|adopt|implement))\s+(.+?)(?:\.|$)/gi,
      /(?:instead of .+?, (?:use|let's use|we should use))\s+(.+?)(?:\.|$)/gi,
      /(?:after (?:considering|evaluating|comparing).+?, (?:I'd|I would|we should))\s+(?:go with|use|choose|recommend)\s+(.+?)(?:\.|$)/gi,
    ],
    confidence: 0.7,
  },
  {
    type: 'REQUIREMENT',
    patterns: [
      /(?:the (?:app|system|platform|product) (?:must|should|needs to|has to))\s+(.+?)(?:\.|$)/gi,
      /(?:requirement[s]?:?\s*)(.+?)(?:\.|$)/gi,
      /(?:it(?:'s| is) (?:essential|critical|important|necessary) (?:that|to))\s+(.+?)(?:\.|$)/gi,
      /(?:we need (?:to )?(?:ensure|make sure|guarantee))\s+(.+?)(?:\.|$)/gi,
      /(?:(?:must|should) (?:be able to|support|handle|include))\s+(.+?)(?:\.|$)/gi,
    ],
    confidence: 0.6,
  },
  {
    type: 'CONSTRAINT',
    patterns: [
      /(?:we (?:must not|should not|cannot|can't|shouldn't))\s+(.+?)(?:\.|$)/gi,
      /(?:constraint:?\s*)(.+?)(?:\.|$)/gi,
      /(?:limitation:?\s*)(.+?)(?:\.|$)/gi,
      /(?:(?:do not|don't|never|avoid))\s+(.+?)(?:\.|$)/gi,
      /(?:(?:this|it) (?:is|would be) (?:not allowed|forbidden|restricted|prohibited))\s+(.+?)(?:\.|$)/gi,
    ],
    confidence: 0.6,
  },
  {
    type: 'QUESTION',
    patterns: [
      /(?:how (?:should|would|can|do) we)\s+(.+?\?)/gi,
      /(?:what (?:is|are|should|would) (?:the|be))\s+(.+?\?)/gi,
      /(?:(?:open|unresolved|remaining) question[s]?:?\s*)(.+?)(?:\.|$)/gi,
      /(?:we (?:still )?need to (?:figure out|decide|determine))\s+(.+?)(?:\.|$)/gi,
      /(?:(?:should|would|could) we)\s+(.+?\?)/gi,
    ],
    confidence: 0.6,
  },
  {
    type: 'REJECTED_IDEA',
    patterns: [
      /(?:(?:I|we) (?:rejected|decided against|ruled out|won't use|wouldn't recommend))\s+(.+?)(?:\.|$)/gi,
      /(?:(?:don't|do not) (?:use|recommend|suggest))\s+(.+?)(?:because|due to|since|as|—|,|\.|$)/gi,
      /(?:(?:this|that) (?:approach|solution|option) (?:was|is) (?:rejected|not viable|not recommended))\s+(.+?)(?:\.|$)/gi,
      /(?:(?:instead of|rather than))\s+(.+?)(?:,\s*(?:use|go with|choose))/gi,
    ],
    confidence: 0.5,
  },
  {
    type: 'ARCHITECTURE',
    patterns: [
      /(?:the architecture (?:should|will|would) (?:use|include|consist of|be based on))\s+(.+?)(?:\.|$)/gi,
      /(?:(?:system|application|app) architecture:?\s*)(.+?)(?:\.|$)/gi,
      /(?:(?:tech|technology) stack:?\s*)(.+?)(?:\.|$)/gi,
      /(?:(?:for the|our) (?:frontend|backend|database|api|infrastructure)(?:,)?\s+(?:we(?:'ll| will)?\s+)?(?:use|go with))\s+(.+?)(?:\.|$)/gi,
    ],
    confidence: 0.6,
  },
  {
    type: 'RESEARCH',
    patterns: [
      /(?:(?:according to|based on|research shows|studies show|evidence suggests))\s+(.+?)(?:\.|$)/gi,
      /(?:(?:I found|it turns out|apparently))\s+(.+?)(?:\.|$)/gi,
      /(?:(?:benchmark|comparison|analysis) (?:shows|indicates|suggests|reveals))\s+(.+?)(?:\.|$)/gi,
    ],
    confidence: 0.5,
  },
  {
    type: 'FILE',
    patterns: [
      /(?:(?:create|add|modify|update|edit|implement) (?:a |the )?(?:file |)(?:called |named |))`?([a-zA-Z0-9_.-]+\.[a-zA-Z]{1,10})`?/gi,
      /`([a-zA-Z0-9_/.-]+\.[a-zA-Z]{1,10})`/g,
    ],
    confidence: 0.4,
  },
];

function extractTitle(match: string, _type: MemoryProposalType): string {
  // Clean up the match for use as a title
  let title = match.trim();
  title = title.replace(/^(to |that |we |the )/i, '');
  title = title.charAt(0).toUpperCase() + title.slice(1);
  if (title.length > 80) {
    title = title.slice(0, 77) + '...';
  }
  return title;
}

function getAssistantContent(messages: ConversationMessage[]): string {
  return messages
    .filter(m => m.role === 'assistant')
    .map(m => m.content)
    .join('\n\n');
}

function getAllContent(messages: ConversationMessage[]): string {
  return messages.map(m => `[${m.role}]: ${m.content}`).join('\n\n');
}

export const MemoryExtractor = {
  extract(
    messages: ConversationMessage[],
    model: string,
    conversationId: string
  ): MemoryProposal[] {
    const proposals: MemoryProposal[] = [];
    const seen = new Set<string>();
    const assistantContent = getAssistantContent(messages);
    const allContent = getAllContent(messages);
    const timestamp = new Date().toISOString();

    for (const rule of EXTRACTION_RULES) {
      for (const pattern of rule.patterns) {
        pattern.lastIndex = 0;
        const content = rule.type === 'QUESTION' ? allContent : assistantContent;
        let match;

        while ((match = pattern.exec(content)) !== null) {
          const captured = match[1]?.trim();
          if (!captured || captured.length < 5) continue;

          // Deduplicate similar extractions
          const key = `${rule.type}:${captured.toLowerCase().slice(0, 40)}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const title = extractTitle(captured, rule.type);

          proposals.push({
            id: uuid(),
            type: rule.type,
            title,
            description: captured,
            source: `${model} conversation`,
            model,
            confidence: rule.confidence,
            relatedEntities: [],
            proposedChanges: [{
              field: rule.type.toLowerCase(),
              proposedValue: captured,
            }],
            status: 'pending',
            conversationId,
            timestamp,
          });
        }
      }
    }

    // Sort by confidence descending
    proposals.sort((a, b) => b.confidence - a.confidence);

    // Limit to prevent overwhelming the user
    return proposals.slice(0, 15);
  },

  /**
   * Generate a summary of a conversation
   */
  summarize(messages: ConversationMessage[]): string {
    const topics = new Set<string>();
    const allText = messages.map(m => m.content).join(' ');

    // Extract key topics using simple heuristics
    const topicPatterns = [
      /(?:discuss|talk about|focus on|cover|explore)\s+(.+?)(?:\.|,|$)/gi,
      /(?:implement|build|create|design|develop)\s+(.+?)(?:\.|,|$)/gi,
    ];

    for (const pattern of topicPatterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(allText)) !== null) {
        const topic = match[1]?.trim();
        if (topic && topic.length > 3 && topic.length < 60) {
          topics.add(topic);
        }
        if (topics.size >= 5) break;
      }
    }

    if (topics.size === 0) {
      // Fallback: use first assistant message as summary
      const first = messages.find(m => m.role === 'assistant');
      if (first) {
        return first.content.slice(0, 200) + (first.content.length > 200 ? '...' : '');
      }
      return 'Conversation captured';
    }

    return `Discussed: ${Array.from(topics).join(', ')}`;
  },
};
