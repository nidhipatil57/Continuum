// ChatGPT Content Script
// Detects ChatGPT page and provides conversation extraction

const PROVIDER_ID = 'chatgpt';

function detectPage(): boolean {
  return window.location.hostname === 'chatgpt.com' || window.location.hostname === 'chat.openai.com';
}

function extractConversation(): { messages: Array<{ role: string; content: string }>; title: string } | null {
  try {
    const messages: Array<{ role: string; content: string }> = [];

    // Strategy 1: Look for articles (ChatGPT standard DOM structure)
    const articles = document.querySelectorAll('article');
    if (articles.length > 0) {
      articles.forEach(article => {
        const isUser = article.querySelector('[data-message-author-role="user"]') !== null ||
                       article.querySelector('img[alt*="User"]') !== null ||
                       article.innerText.startsWith('You said:');
        const role = isUser ? 'user' : 'assistant';
        const content = article.textContent?.trim() ?? '';
        if (content && content.length > 2) {
          messages.push({ role, content });
        }
      });
    }

    // Strategy 2: Look for data-message-author-role
    if (messages.length === 0) {
      const turns = document.querySelectorAll('[data-message-author-role]');
      turns.forEach(turn => {
        const role = turn.getAttribute('data-message-author-role') === 'user' ? 'user' : 'assistant';
        const content = turn.textContent?.trim() ?? '';
        if (content) {
          messages.push({ role, content });
        }
      });
    }

    // Strategy 3: Fallback — grab main chat text content
    if (messages.length === 0) {
      const main = document.querySelector('main');
      if (main) {
        const text = main.textContent?.trim() ?? '';
        if (text) {
          messages.push({ role: 'assistant', content: text });
        }
      }
    }

    // Get conversation title
    const title = document.title?.replace(' | ChatGPT', '')?.trim() ?? 'ChatGPT Conversation';

    return messages.length > 0 ? { messages, title } : null;
  } catch (e) {
    console.error('[Continuum] ChatGPT extraction failed:', e);
    return null;
  }
}

import { checkAndInjectContext } from '../../shared/auto-injector';

// Notify background that we're on a ChatGPT page
if (detectPage()) {
  chrome.runtime.sendMessage({
    type: 'PROVIDER_DETECTED',
    payload: { providerId: PROVIDER_ID, url: window.location.href },
  }).catch(() => {});

  checkAndInjectContext(PROVIDER_ID);
}

// Listen for capture requests
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
