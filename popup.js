document.addEventListener('DOMContentLoaded', () => {
    const copyToggle = document.getElementById('copyToggle');
    const btnCapture = document.getElementById('btnCapture');

    // Load saved state
    chrome.storage.sync.get('copyMode', (data) => {
        copyToggle.checked = !!data.copyMode;
    });

    copyToggle.addEventListener('change', () => {
        const enabled = copyToggle.checked;
        chrome.storage.sync.set({ copyMode: enabled });

        // Send to background to broadcast to all frames
        chrome.runtime.sendMessage({ action: 'broadcast', data: { action: 'toggleCopy', enabled: enabled } });
    });



    btnCapture.addEventListener('click', () => {
        // Send message to background to handle capture
        // This prevents the popup closing from interrupting the async process
        chrome.runtime.sendMessage({ action: 'capture' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Capture error:", chrome.runtime.lastError);
                alert("Error: " + chrome.runtime.lastError.message);
                return;
            }

            if (response && !response.success) {
                console.error("Capture failed:", response.error);
                alert("Failed to capture: " + (response.error || "Unknown error"));
            }
        });
    });
});
