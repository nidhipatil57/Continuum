// Continuum Service Worker
// Handles side panel, message routing, and extension commands

// Open side panel on action click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);

// Message handler
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'OPEN_SIDE_PANEL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.sidePanel.open({ tabId }).catch(console.error);
      }
    });
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'PROVIDER_DETECTED') {
    // Store detected provider info for the popup/sidepanel to read
    chrome.storage.local.set({
      detectedProvider: message.payload,
    });
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'CONVERSATION_CAPTURED') {
    // Forward captured conversation to side panel
    chrome.runtime.sendMessage({
      type: 'CONVERSATION_CAPTURED',
      payload: message.payload,
    }).catch(() => {
      // Side panel might not be open — store for later
      chrome.storage.local.set({
        pendingCapture: message.payload,
      });
    });
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'PING') {
    sendResponse({ success: true, pong: true });
    return true;
  }

  return false;
});

// Handle keyboard commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-command-palette') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.sidePanel.open({ tabId }).then(() => {
          // Send command to side panel to open command palette
          setTimeout(() => {
            chrome.runtime.sendMessage({ type: 'COMMAND_PALETTE' }).catch(() => {});
          }, 300);
        }).catch(console.error);
      }
    });
  }

  if (command === 'capture-conversation') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { type: 'CAPTURE_CONVERSATION' }).catch(() => {
          // Content script not available — open side panel with capture page
          chrome.sidePanel.open({ tabId }).catch(console.error);
        });
      }
    });
  }
});

// On install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Continuum installed — AI Context OS ready.');
  }
});
