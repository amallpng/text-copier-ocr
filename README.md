# Text Copier & Video OCR Tool

An advanced Chrome Extension that unlocks text selection on any website and allows you to extract text directly from videos using OCR (Optical Character Recognition). 100% Offline & Private.

Made by **Amall**.

## Features

- **Unlock Copy/Paste**: Force-enable right-click, text selection, and copy functionality on restricted websites.
- **Video Text Extraction (OCR)**: Pause any video, draw a box over the text, and extract it instantly.
- **Offline Capability**: Uses a bundled Tesseract.js engine with language data included, so it works without an internet connection.
- **Privacy First**: No data leaves your browser. Start processing locally.
- **Dark Mode UI**: Clean, modern interface designed for readability.

## Installation

### From Source (Developer Mode)

1. **Clone or Download** this repository.
   ```bash
   git clone https://github.com/amallpng/text-copier-ocr.git
   ```
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** in the top right.
4. Click **Load unpacked**.
5. Select the folder where you downloaded this repository (e.g., `text-copy-extension`).

## Usage

### 1. Unlocking Text Selection
- Click the extension icon.
- Toggle the **"Unlock Text Selection"** switch.
- The page will automatically reload with restrictions removed. You can now select and copy text freely.

### 2. Extracting Text from Video
- Pause the video at the frame you want to capture.
- Click the extension icon.
- Click **"Extract Video Text"**.
- A new tab will open with a screenshot of your video.
- **Draw a box** around the text you want to extract.
- Click **"Extract Text"**.
- The text will appear in a popup. Click "Copy to Clipboard" to save it.

### 3. Stopping Media
- If a page has annoying autoplay videos or audio, click **"Stop/Pause Page"** to instantly pause all media elements.

## Technical Details

- **Manifest V3**: Built using the latest Chrome Extension standards.
- **Tesseract.js**: Powered by the leading JS OCR library, optimized for browser usage.
- **Content Scripts**: Uses aggressive event interception to bypass copy protection.
- **Sandboxed OCR**: Runs OCR in a secure, isolated sandbox to comply with Chrome's strict security policies (CSP).

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

Free to use, modify, and distribute.

