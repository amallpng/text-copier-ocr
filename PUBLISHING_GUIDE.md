# How to Publish Your Extension to the Chrome Web Store

Your extension is ready! I have created a zip file for you: `text-copier-release.zip`.

Follow these steps to publish it for free (mostly) to the public:

## 1. Create a Developer Account
To publish on the official Chrome Web Store, Google requires a **one-time $5 fee**. This is to prevent spam.
1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).
2. Sign in with your Google Account.
3. Pay the **$5** fee if you haven't already.

## 2. Upload Your Extension
1. On the dashboard, click **"New Item"** (or "Add new item").
2. Click **"Browse files"** and select the `text-copier-release.zip` file from your project folder.
   - *Location:* `c:\Users\LENOVO\OneDrive\Desktop\robo\text-copy-extension\text-copier-release.zip`

## 3. Fill in Store Listing Details
You will need to provide information for users:
- **Description:** Explain what your tool does.
  - *Example:* "Unlock copy/paste on restricted websites and extract text from videos using OCR. Works 100% offline."
- **Category:** "Productivity" or "Developer Tools".
- **Language:** English.

## 4. Graphics & Screenshots (Required)
You MUST provide these images to publish:
- **Icon:** 128x128 pixels (You can use `icons/icon128.png`).
- **Screenshots:** At least one screenshot (1280x800 or 640x400).
  - *Tip:* Take a screenshot of the popup open on a video page.
- **Promo Tile:** 440x280 pixels (A nice banner image with your extension name).

## 5. Privacy Practices
Go to the **"Privacy"** tab:
- **Single Purpose:** "Allow users to copy text from restricted sites and videos."
- **Permission Justification:**
  - `activeTab`: "To access the current page content for text unlocking."
  - `scripting`: "To inject the unlock CSS and JS."
  - `storage`: "To save user settings (capture mode)."
  - `webNavigation`: "To apply settings across frames."
- **Data Usage:**
  - Does your extension collect user data? **No**. (Since we run OCR locally).
  - Check "No, I do not collect user data."

## 6. Submit for Review
1. Click **"Submit for Review"**.
2. Google typically reviews extensions in **1-3 days**.
3. Once approved, it will be live for everyone to download!

---

### Alternative: GitHub (Completely Free)
If you don't want to pay the $5 fee, you can host the source code on GitHub.
1. Create a repository on [GitHub](https://github.com/).
2. Push your code.
3. Users can download the ZIP and install it manually via "Developer Mode" (Load unpacked).
   - *Downside:* Manual installation is harder for regular users and displays a warning every time Chrome starts.
