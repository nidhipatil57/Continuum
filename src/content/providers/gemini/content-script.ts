// Gemini Content Script
const PROVIDER_ID = 'gemini';

function detectPage(): boolean {
  return window.location.hostname === 'gemini.google.com';
}

function extractConversation(): { messages: Array<{ role: string; content: string }>; title: string } | null {
  try {
    const messages: Array<{ role: string; content: string }> = [];

    // Look for conversation turns
    const turns = document.querySelectorAll('message-content, [class*="query-content"], [class*="response-content"], [class*="model-response"], [class*="user-query"]');
    if (turns.length > 0) {
      turns.forEach(turn => {
        const content = turn.textContent?.trim() ?? '';
        if (content.length > 5) {
          const isUser = turn.classList.toString().includes('query') ||
                        turn.classList.toString().includes('user') ||
                        turn.closest('[class*="query"]') !== null;
          messages.push({ role: isUser ? 'user' : 'assistant', content });
        }
      });
    }

    // Fallback
    if (messages.length === 0) {
      const containers = document.querySelectorAll('.conversation-container > div');
      containers.forEach(container => {
        const text = container.textContent?.trim() ?? '';
        if (text.length > 10) {
          messages.push({ role: 'assistant', content: text });
        }
      });
    }

    const title = document.title?.replace(' - Google Gemini', '')?.trim() ?? 'Gemini Conversation';
    return messages.length > 0 ? { messages, title } : null;
  } catch (e) {
    console.error('[Continuum] Gemini extraction failed:', e);
    return null;
  }
}

import { checkAndInjectContext } from '../../shared/auto-injector';

if (detectPage()) {
  chrome.runtime.sendMessage({
    type: 'PROVIDER_DETECTED',
    payload: { providerId: PROVIDER_ID, url: window.location.href },
  }).catch(() => {});

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
