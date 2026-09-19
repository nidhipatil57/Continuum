// Claude Content Script
const PROVIDER_ID = 'claude';

function detectPage(): boolean {
  return window.location.hostname === 'claude.ai';
}

function extractConversation(): { messages: Array<{ role: string; content: string }>; title: string } | null {
  try {
    const messages: Array<{ role: string; content: string }> = [];

    // Interleave by DOM order
    const allMsgs = document.querySelectorAll('[data-testid="human-turn"], [data-testid="assistant-turn"]');
    if (allMsgs.length > 0) {
      allMsgs.forEach(msg => {
        const isHuman = msg.getAttribute('data-testid')?.includes('human') ||
                       msg.classList.toString().includes('human');
        const content = msg.textContent?.trim() ?? '';
        if (content) {
          messages.push({ role: isHuman ? 'user' : 'assistant', content });
        }
      });
    }

    // Strategy 2: Fallback
    if (messages.length === 0) {
      const containers = document.querySelectorAll('[class*="Message"], [class*="message"]');
      containers.forEach(container => {
        const text = container.textContent?.trim() ?? '';
        if (text.length > 5) {
          messages.push({ role: 'assistant', content: text });
        }
      });
    }

    const title = document.title?.replace(' \\ Claude', '')?.trim() ?? 'Claude Conversation';

    return messages.length > 0 ? { messages, title } : null;
  } catch (e) {
    console.error('[Continuum] Claude extraction failed:', e);
    return null;
  }
}

import { checkAndInjectContext } from '../../shared/auto-injector';

if (detectPage()) {
  chrome.runtime.sendMessage({
    type: 'PROVIDER_DETECTED',
    payload: { providerId: PROVIDER_ID, url: window.location.href },
  }).catch(() => {});

  // Check for auto-inject context
  checkAndInjectContext(PROVIDER_ID);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'CAPTURE_CONVERSATION') {
    const result = extractConversation();
    if (result) {
      chrome.runtime.sendMessage({
        type: 'CONVERSATION_CAPTURED',
        payload: { ...result, model: PROVIDER_ID, url: window.location.href },
      }).catch(() => {});
      sendResponse({ success: true, messageCount: result.messages.length });
    } else {
      sendResponse({ success: false, error: 'Could not extract conversation. Try manual capture.' });
    }
    return true;
  }
  return false;
});
