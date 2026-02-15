
const canvas = document.getElementById('snapshot');
const ctx = canvas.getContext('2d');
const selectionBox = document.getElementById('selection-box');
const btnProcess = document.getElementById('btnProcess');
const resultOverlay = document.getElementById('result-overlay');
const textOutput = document.getElementById('text-output');
const btnCopy = document.getElementById('btnCopy');
const btnCloseResult = document.getElementById('btnCloseResult');
const btnSpinner = document.getElementById('btnSpinner');

let isSelecting = false;
let startX, startY;
let rect = { x: 0, y: 0, w: 0, h: 0 };
let imgLoaded = false;

// Helper to safely update button
function updateButtonState(state, progress = 0) {
    if (!btnProcess) return;

    if (state === 'disabled') {
        btnProcess.disabled = true;
        selectionBox.style.display = 'none';
        btnProcess.innerHTML = '<span class="spinner" id="btnSpinner"></span> Extract Text';
    } else if (state === 'ready') {
        btnProcess.disabled = false;
        btnProcess.innerHTML = '<span class="spinner" id="btnSpinner"></span> Extract Text';
    } else if (state === 'processing') {
        btnProcess.disabled = true;
        btnProcess.innerHTML = '<span class="spinner" style="display:inline-block"></span> Processing...';
    } else if (state === 'progress') {
        btnProcess.innerHTML = `<span class="spinner" style="display:inline-block"></span> Processing... ${progress}%`;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('capturedImage', (data) => {
        if (data.capturedImage) {
            const img = new Image();
            img.src = data.capturedImage;
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                imgLoaded = true;
            };
        }
    });

    // Event Listeners for Selection

    // Mouse Down: Start Selection (Keep on canvas to ensure we start effectively)
    canvas.parentElement.addEventListener('mousedown', (e) => {
        if (!imgLoaded) return;
        e.preventDefault();

        isSelecting = true;
        const rect = canvas.getBoundingClientRect();

        // Calculate scale (CSS pixels vs Canvas internal pixels)
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Start position relative to the canvas element
        startX = (e.clientX - rect.left);
        startY = (e.clientY - rect.top);

        selectionBox.style.left = startX + 'px';
        selectionBox.style.top = startY + 'px';
        selectionBox.style.width = '0px';
        selectionBox.style.height = '0px';
        selectionBox.style.display = 'block';
    });

    // Mouse Move: Global to catch fast drags
    window.addEventListener('mousemove', (e) => {
        if (!isSelecting) return;

        const rect = canvas.getBoundingClientRect();

        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;

        // Constrain to canvas bounds (in CSS pixels)
        mouseX = Math.max(0, Math.min(rect.width, mouseX));
        mouseY = Math.max(0, Math.min(rect.height, mouseY));

        let currentW = mouseX - startX;
        let currentH = mouseY - startY;

        let left = currentW > 0 ? startX : mouseX;
        let top = currentH > 0 ? startY : mouseY;
        let width = Math.abs(currentW);
        let height = Math.abs(currentH);

        selectionBox.style.left = left + 'px';
        selectionBox.style.top = top + 'px';
        selectionBox.style.width = width + 'px';
        selectionBox.style.height = height + 'px';
    });

    // Mouse Up: Global
    window.addEventListener('mouseup', () => {
        if (!isSelecting) return;
        isSelecting = false;

        let w = parseFloat(selectionBox.style.width || 0);
        let h = parseFloat(selectionBox.style.height || 0);

        if (w > 10 && h > 10) {
            updateButtonState('ready');
        } else {
            updateButtonState('disabled');
        }
    });

    // OCR Process (via Sandbox)
    btnProcess.addEventListener('click', async () => {
        const currentCssWidth = parseFloat(selectionBox.style.width || '0');
        const currentCssHeight = parseFloat(selectionBox.style.height || '0');
        if (currentCssWidth <= 0 || currentCssHeight <= 0) return;

        updateButtonState('processing');

        try {
            // Cut specific part of image
            const cropCanvas = document.createElement('canvas');
            const cssLeft = parseFloat(selectionBox.style.left);
            const cssTop = parseFloat(selectionBox.style.top);
            const cssWidth = parseFloat(selectionBox.style.width);
            const cssHeight = parseFloat(selectionBox.style.height);

            const canvasRect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / canvasRect.width;
            const scaleY = canvas.height / canvasRect.height;
            const finalX = cssLeft * scaleX;
            const finalY = cssTop * scaleY;
            const finalW = cssWidth * scaleX;
            const finalH = cssHeight * scaleY;

            cropCanvas.width = finalW;
            cropCanvas.height = finalH;
            const cropCtx = cropCanvas.getContext('2d');

            // OPTIMIZATION: Grayscale
            cropCtx.filter = 'grayscale(100%) contrast(1.2)';

            cropCtx.drawImage(canvas, finalX, finalY, finalW, finalH, 0, 0, finalW, finalH);

            // OPTIMIZATION: Resize if too large (e.g. > 1500px width)
            // Tesseract is slow on huge images.
            let exportData;
            const MAX_DIM = 1500;
            if (finalW > MAX_DIM || finalH > MAX_DIM) {
                const scaleCanvas = document.createElement('canvas');
                const scale = Math.min(MAX_DIM / finalW, MAX_DIM / finalH);
                scaleCanvas.width = finalW * scale;
                scaleCanvas.height = finalH * scale;
                const scaleCtx = scaleCanvas.getContext('2d');
                scaleCtx.drawImage(cropCanvas, 0, 0, scaleCanvas.width, scaleCanvas.height);
                exportData = scaleCanvas.toDataURL('image/jpeg', 0.8); // JPEG is faster/smaller than PNG
            } else {
                exportData = cropCanvas.toDataURL('image/jpeg', 0.9);
            }

            const imageData = exportData;

            if (imageData === 'data:,') {
                throw new Error("Cropped image is empty. Please re-select the area.");
            }

            // SANDBOX COMMMUNICATION
            const iframe = document.getElementById('ocr-sandbox');
            if (!iframe) throw new Error("Sandbox environment not loaded.");

            // Post message to sandbox (This will use the pre-warmed worker)
            iframe.contentWindow.postMessage({
                action: 'ocr',
                imageData: imageData
            }, '*');

            // Add failure timeout (60 seconds)
            if (window.ocrTimeout) clearTimeout(window.ocrTimeout);
            window.ocrTimeout = setTimeout(() => {
                if (btnProcess.disabled) {
                    alert('OCR is taking too long (60s). resetting engine...');
                    // Reset Sandbox to clear stuck worker
                    iframe.src = iframe.src;
                    updateButtonState('ready');
                }
            }, 60000);

        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
            updateButtonState('ready');
        }
    });

    // Listen for Sandbox Responses
    window.addEventListener('message', (event) => {
        // Ensure security check if needed, though we are local
        const { action, data, text, error } = event.data;

        if (action === 'progress') {
            console.log("Sandbox Progress:", data);

            // Re-arm timeout for long processing steps so we don't timeout mid-work
            if (window.ocrTimeout) clearTimeout(window.ocrTimeout);
            window.ocrTimeout = setTimeout(() => {
                if (btnProcess.disabled) {
                    alert('OCR Timed Out during processing. Resetting...');
                    const iframe = document.getElementById('ocr-sandbox');
                    if (iframe) iframe.src = iframe.src;
                    updateButtonState('ready');
                }
            }, 60000);

            if (data.status === 'recognizing text') {
                updateButtonState('progress', Math.round((data.progress || 0) * 100));
            } else {
                // Show other status messages (downloading, initializing)
                btnProcess.innerHTML = `<span class="spinner" style="display:inline-block"></span> ${data.status}...`;
            }
        } else if (action === 'result') {
            console.log("Sandbox Result:", text);
            if (window.ocrTimeout) clearTimeout(window.ocrTimeout);

            if (textOutput) textOutput.innerText = text || "No text detected.";
            resultOverlay.style.display = 'block';
            updateButtonState('ready');
        } else if (action === 'error') {
            if (window.ocrTimeout) clearTimeout(window.ocrTimeout);
            console.error("Sandbox Error:", error);
            alert('OCR Failed: ' + error);
            updateButtonState('ready');
        }
    });

    // UI helpers
    btnCloseResult.addEventListener('click', () => {
        resultOverlay.style.display = 'none';
    });

    btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(textOutput.innerText).then(() => {
            const originalText = btnCopy.innerText;
            btnCopy.innerText = 'Copied!';
            setTimeout(() => btnCopy.innerText = originalText, 2000);
        });
    });

    // AUTO-INIT: Pre-warm the worker as soon as load finishes
    setTimeout(async () => {
        const iframe = document.getElementById('ocr-sandbox');
        if (iframe && iframe.contentWindow) {
            console.log("Pre-warming OCR worker...");

            // Manually fetch lang data to bypass sandbox restrictions
            try {
                const langUrl = chrome.runtime.getURL('lib/eng.traineddata.gz');
                const response = await fetch(langUrl);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                console.log("Created Blob URL for lang data:", blobUrl);

                // Pass this blob URL to the sandbox
                iframe.contentWindow.postMessage({
                    action: 'init',
                    langBlobUrl: blobUrl
                }, '*');

            } catch (e) {
                console.error("Failed to load lang data:", e);
                // Fallback to normal init
                iframe.contentWindow.postMessage({ action: 'init' }, '*');
            }
        }
    }, 500);
});
