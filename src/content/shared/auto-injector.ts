// Auto-Injector for AI Chat Apps
// Injects compiled context automatically into the chat input field without copy-paste

export function checkAndInjectContext(providerId: string) {
  chrome.storage.local.get(['pendingAutoInject'], (result) => {
    const pending = result.pendingAutoInject;
    if (!pending) return;

    // Only inject if matching provider and timestamp is within last 2 minutes
    if (pending.providerId === providerId && Date.now() - pending.timestamp < 120000) {
      // Clear pending state immediately to prevent duplicate injection
      chrome.storage.local.remove('pendingAutoInject');

      // Attempt injection with retries as the page loads
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const injected = tryInjectText(pending.text, providerId);
        if (injected || attempts > 20) {
          clearInterval(interval);
          if (injected) {
            showNotification(`✨ Continuum auto-injected project context into ${providerId}!`);
          }
        }
      }, 500);
    }
  });
}

function tryInjectText(text: string, providerId: string): boolean {
  let inputElement: HTMLTextAreaElement | HTMLDivElement | null = null;

  if (providerId === 'claude') {
    // Claude uses ProseMirror / contenteditable div
    inputElement = document.querySelector('div[contenteditable="true"]') as HTMLDivElement ||
                   document.querySelector('.ProseMirror') as HTMLDivElement ||
                   document.querySelector('textarea') as HTMLTextAreaElement;
  } else if (providerId === 'chatgpt') {
    // ChatGPT uses #prompt-textarea or contenteditable div
    inputElement = document.querySelector('#prompt-textarea') as HTMLTextAreaElement ||
                   document.querySelector('textarea') as HTMLTextAreaElement ||
                   document.querySelector('div[contenteditable="true"]') as HTMLDivElement;
  } else if (providerId === 'gemini') {
    // Gemini uses rich-textarea or contenteditable
    inputElement = document.querySelector('rich-textarea div[contenteditable="true"]') as HTMLDivElement ||
                   document.querySelector('textarea') as HTMLTextAreaElement;
  } else if (providerId === 'perplexity') {
    // Perplexity uses textarea
    inputElement = document.querySelector('textarea') as HTMLTextAreaElement;
  }

  if (!inputElement) return false;

  try {
    inputElement.focus();

    if (inputElement instanceof HTMLTextAreaElement) {
      inputElement.value = text;
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (inputElement.isContentEditable) {
      // For contenteditable divs (Claude / ChatGPT ProseMirror)
      inputElement.innerText = text;
      inputElement.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
    }

    return true;
  } catch (e) {
    console.error('[Continuum] Auto-inject failed:', e);
    return false;
  }
}

function showNotification(message: string) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: linear-gradient(135deg, #2d6bfa 0%, #8b5cf6 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(45, 107, 250, 0.35);
    z-index: 999999;
    transition: all 0.3s ease;
    animation: continuum-slide-up 0.4s ease-out;
  `;
  toast.innerText = message;

  const style = document.createElement('style');
  style.innerText = `
    @keyframes continuum-slide-up {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
