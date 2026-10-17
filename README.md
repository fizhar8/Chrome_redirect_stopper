# Redirect Stopper

A lightweight Chrome Manifest V3 extension that reduces common click-triggered advertising redirects. It blocks `window.open()` unless it is called synchronously after a trusted click on an interactive control. A popup launched from a link is allowed only when it targets the link the user clicked. Large, nearly invisible, high-z-index overlays are prevented from receiving clicks.

Ordinary link navigation remains unchanged, including links intentionally opened in another tab. To inspect click behavior on sites, Chrome grants the content script access to all URLs matched by `<all_urls>`; Chrome therefore shows broad site access in the extension's permission warning. The extension does not send browsing data anywhere.

## Install in Chrome

1. Download or clone this repository.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Select **Load unpacked** and choose the folder containing `manifest.json`.
4. Reload tabs that were already open.

For Chrome Web Store submission, run `node tools\generate-icon.js` and then `powershell -ExecutionPolicy Bypass -File tools\package.ps1`. This creates `dist\redirect-stopper-<version>.zip` with the manifest, script, and icon at the archive root. Do not include the `test` folder or repository metadata. Store listing and privacy disclosures are drafted in [`STORE_LISTING.md`](STORE_LISTING.md).

## Limitations

Manifest V3 does not expose a reliable extension API to cancel arbitrary current-tab navigations initiated by page scripts (for example, assigning to `location`), frame navigations, or server redirects once navigation begins. The extension blocks common popup and transparent-overlay techniques, but cannot guarantee prevention of every unsolicited current-tab redirect. Overlay detection is heuristic: some tricks will evade it, and changing the thresholds could interfere with legitimate page controls.

The content script uses Chrome's `MAIN` execution world to guard `window.open()`. A page can potentially replace that function after the extension runs. Site-specific permissions and all-frame matching also mean the script runs on embedded frames where Chrome allows content scripts.
