
// Basic toggle listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleCopy') {
        toggleCopy(request.enabled);
        sendResponse({ status: 'ok' });
    } else if (request.action === 'stopVideo') {
        stopAllVideos();
        sendResponse({ status: 'ok' });
    }
});

// Run immediately if saved in storage
chrome.storage.sync.get('copyMode', (data) => {
    if (data.copyMode) {
        toggleCopy(true);
    }
});

function toggleCopy(enable) {
    if (enable) {
        enableCopying();
    } else {
        // Reloading is best to disable, but we can try removing listeners
        document.body.classList.remove('text-copier-unlocked');
        window.location.reload(); // Simplest way to restore original restrictive scripts
    }
}

function enableCopying() {
    document.body.classList.add('text-copier-unlocked');

    // 1. Capture Phase Event Stopping
    const events = ['copy', 'cut', 'paste', 'contextmenu', 'selectstart', 'mousedown', 'mouseup', 'dragstart'];
    events.forEach(event => {
        window.addEventListener(event, (e) => {
            e.stopImmediatePropagation();
        }, true);
    });

    // 2. Aggressive CSS injection (handled by content.css)

    // 3. Nullify handlers (Simple attempt)
    document.oncopy = null;
    document.oncontextmenu = null;
    document.onselectstart = null;
}

function stopAllVideos() {
    // 1. Standard HTML5 Video/Audio
    const media = document.querySelectorAll('video, audio');
    media.forEach(m => {
        m.pause();
        m.style.border = '2px solid red';
        setTimeout(() => m.style.border = '', 500);
    });

    // 2. YouTube Specific
    // Sometimes the video element is overlayed or controlled by custom UI
    // Sending 'k' key usually toggles play/pause on YT, but pause() is better if we can catch it.
    // The querySelectorAll above catches the <video> tag in YT.

    console.log(`[Text Copier] Paused ${media.length} media elements in frame.`);
}
