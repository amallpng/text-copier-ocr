
// Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
    console.log("Text Copier Extension Installed");
});

// Listener for keyboard commands, if set up in future
// Currently disabled to avoid registration issues if commands are missing in manifest
/*
chrome.commands.onCommand.addListener((command) => {
    if (command === "capture-text") {
        captureAndOpen();
    }
});
*/

// Handle messages from Popup
// Handle messages from Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'broadcast') {
        broadcastMessage(request.data);
        sendResponse({ status: 'ok' });
    } else if (request.action === 'capture') {
        captureAndOpen().then(() => {
            sendResponse({ success: true });
        }).catch((err) => {
            console.error("Capture error in background:", err);
            sendResponse({ success: false, error: err.message });
        });
        return true; // Keep channel open for async response
    }
});

async function broadcastMessage(message) {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
            // Send to the tab itself (top frame)
            chrome.tabs.sendMessage(tabs[0].id, message).catch(() => { });

            // Also try capturing frames and sending specifically if needed, 
            // but usually sending to tab ID is sufficient if content scripts are everywhere.
            // However, to be thorough:
            chrome.webNavigation.getAllFrames({ tabId: tabs[0].id }, (frames) => {
                frames.forEach((frame) => {
                    if (frame.frameId > 0) { // Top frame (0) already handled
                        chrome.tabs.sendMessage(tabs[0].id, message, { frameId: frame.frameId }).catch(() => { });
                    }
                });
            });
        }
    } catch (err) {
        console.error("Broadcast failed:", err);
    }
}

async function captureAndOpen() {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
            const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
            await chrome.storage.local.set({ capturedImage: dataUrl });
            chrome.tabs.create({ url: 'capture.html' });
        }
    } catch (err) {
        console.error("Capture failed via shortcut:", err);
    }
}
