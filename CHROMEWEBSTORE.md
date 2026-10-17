# Chrome Web Store

This file is the source of truth for preparing and maintaining the Chrome Web Store release. Update it whenever the extension's purpose, permissions, data handling, listing, or release package changes.

## Current release

- **Product:** Redirect Stopper
- **Manifest version:** `1.0.0`
- **Listing status:** Not submitted; publisher sign-in and dashboard submission are still required.
- **Dashboard:** <https://chrome.google.com/webstore/devconsole>
- **Support URL:** <https://github.com/fizhar8/Chrome_redirect_stopper>

## Store listing

- **Category:** Productivity
- **Short description:** Blocks unsolicited pop-ups and click-hijacking overlays.
- **Single purpose:** Reduce unsolicited pop-ups and click hijacks on web pages.
- **Detailed description:**

  Redirect Stopper helps reduce intrusive click-triggered redirects. It blocks script-opened pop-ups unless they are directly associated with a trusted click on a control. When a clicked link opens a pop-up, the destination must match that link. It also suppresses clicks intercepted by large, nearly invisible overlays.

  Regular link navigation is left alone, including links that intentionally open in a new tab. The extension does not use ad blocklists or send browsing activity to a server.

  **Limitations:** Chrome extensions cannot reliably cancel every script-initiated current-tab navigation or server-side redirect. Overlay detection is heuristic, so some redirects may not be blocked.

## Permissions and privacy disclosures

- The manifest uses a `<all_urls>` content-script match so the guard can run on sites where redirects occur. The script runs in the page's `MAIN` world and in eligible frames to inspect clicks and guard `window.open()`. Explain this broad access plainly in the dashboard.
- Clicks and popup attempts are processed locally. The extension does not collect, transmit, sell, or share browsing history, page content, or personal information. It has no analytics, remote code, or ad-blocking lists.
- Declare the data practices accurately in the dashboard's Privacy tab. Confirm whether the current submission flow requires a privacy-policy URL; none is configured in this repository.

## Assets and package

- Required extension icon: `icon-128.png` (128 × 128).
- Create the upload archive with:

  ```powershell
  node tools\generate-icon.js
  powershell -ExecutionPolicy Bypass -File tools\package.ps1
  ```

- The script writes `dist\redirect-stopper-<version>.zip`. The ZIP root must contain only `manifest.json`, `redirect-guard.js`, and `icon-128.png`; do not upload repository metadata, tests, or tooling.
- Provide current screenshots of the installed extension and representative behavior in Chrome. Do not claim it blocks every current-tab redirect.

## Submission checklist

- [ ] Confirm the manifest name, description, version, and icon before packaging. Every update submitted after the first release must use a higher manifest version.
- [ ] Run the tests: `node --test test\redirect-guard.test.js`.
- [ ] Generate the icon and release ZIP, then verify the archive contains the expected three root files.
- [ ] Sign in to the Chrome Web Store Developer Dashboard and upload the ZIP.
- [ ] Complete the Store Listing, Privacy, and Distribution sections. Verify every permission and data-use disclosure against the current code.
- [ ] Add screenshots and any dashboard-required support or privacy-policy URLs.
- [ ] Submit for Google's review. Google decides approval and publication timing.
- [ ] After submission, update the release version, package location, and listing status in this file.

## Technical limitations to disclose

Manifest V3 does not expose a reliable extension API for canceling arbitrary page-script current-tab navigations, frame navigations, or server redirects once navigation begins. Overlay detection is heuristic. The page may also replace `window.open` after the content script runs. Do not market the extension as a comprehensive redirect or ad blocker.
