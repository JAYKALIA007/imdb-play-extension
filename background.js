/**
 * background.js — service worker
 *
 * Watches for new tabs opened from streamimdb.ru.
 * If a new tab is created that way, it's almost certainly an ad popup —
 * close it immediately regardless of what URL it's trying to load.
 */

const STREAMING_HOST = 'streamimdb.ru';

// Track which tabs are our streaming tabs
const streamingTabs = new Set();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes(STREAMING_HOST)) {
    streamingTabs.add(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  streamingTabs.delete(tabId);
});

// The nuclear option: any new tab whose opener is a streaming tab gets closed.
chrome.tabs.onCreated.addListener((tab) => {
  if (!tab.openerTabId) return;

  // Check if opener is a streaming tab
  if (streamingTabs.has(tab.openerTabId)) {
    // Close it immediately — it's an ad popup
    chrome.tabs.remove(tab.id, () => {
      // Ignore errors (tab may have already closed)
      void chrome.runtime.lastError;
    });
    return;
  }

  // Also handle the case where the opener tab URL contains the streaming host
  // (covers tabs not yet tracked in streamingTabs)
  chrome.tabs.get(tab.openerTabId, (openerTab) => {
    if (chrome.runtime.lastError) return;
    if (!openerTab?.url) return;

    if (openerTab.url.includes(STREAMING_HOST)) {
      streamingTabs.add(tab.openerTabId);
      chrome.tabs.remove(tab.id, () => {
        void chrome.runtime.lastError;
      });
    }
  });
});
