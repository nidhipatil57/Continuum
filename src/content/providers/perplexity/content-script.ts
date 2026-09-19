// Perplexity Content Script
const PROVIDER_ID = 'perplexity';

function detectPage(): boolean {
  return window.location.hostname === 'www.perplexity.ai';
}

function extractConversation(): { messages: Array<{ role: string; content: string }>; title: string } | null {
  try {
    const messages: Array<{ role: string; content: string }> = [];

    // Look for answer sections
    const answers = document.querySelectorAll('[class*="prose"], [class*="answer"], [class*="result"]');

    // Try to get structured content
    answers.forEach(answer => {
      const content = answer.textContent?.trim() ?? '';
      if (content.length > 20) {
        messages.push({ role: 'assistant', content });
      }
    });

    // Extract sources if available
    const sources = document.querySelectorAll('[class*="source"], [class*="citation"]');
    if (sources.length > 0) {
      const sourceList = Array.from(sources).map(s => s.textContent?.trim()).filter(Boolean).join('\n');
      if (sourceList) {
        messages.push({ role: 'assistant', content: `Sources:\n${sourceList}` });
      }
    }

    const title = document.title?.replace(' - Perplexity', '')?.trim() ?? 'Perplexity Research';
    return messages.length > 0 ? { messages, title } : null;
  } catch (e) {
    console.error('[Continuum] Perplexity extraction failed:', e);
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
      sendResponse({ success: false, error: 'Could not extract. Try manual capture.' });
    }
    return true;
  }
  return false;
});
