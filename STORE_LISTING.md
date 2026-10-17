# Chrome Web Store listing draft

## Listing details

- **Name:** Redirect Stopper
- **Category:** Productivity
- **Short description:** Blocks unsolicited pop-ups and click-hijacking overlays.
- **Detailed description:**

  Redirect Stopper helps reduce intrusive click-triggered redirects. It blocks script-opened pop-ups unless they are directly associated with a trusted click on a control. When a clicked link opens a pop-up, the destination must match that link. It also suppresses clicks intercepted by large, nearly invisible overlays.

  Regular link navigation is left alone, including links that intentionally open in a new tab. The extension does not use ad blocklists or send browsing activity to a server.

  **Limitations:** Chrome extensions cannot reliably cancel every script-initiated current-tab navigation or server-side redirect. Overlay detection is heuristic, so some redirects may not be blocked.

- **Single purpose:** Reduce unsolicited pop-ups and click hijacks on web pages.
- **Permission justification:** The `<all_urls>` content-script match is needed to inspect trusted clicks and `window.open()` calls on the sites where redirects happen. The extension processes these events locally and does not collect or transmit browsing history or page content.
- **Data use disclosure:** No user data is collected, sold, or shared. No analytics or remote code.
- **Privacy policy URL:** Not provided. This extension does not collect or transmit user data; verify the current dashboard's privacy-policy requirements before submission.
- **Support URL:** `https://github.com/fizhar8/Chrome_redirect_stopper`
- **Screenshots:** Capture the installed extension and a representative redirect-blocking test in Chrome. Do not imply that all current-tab redirects can be blocked.

## Submit

1. Zip only `manifest.json`, `redirect-guard.js`, and `icon-128.png`, with the manifest at the ZIP root.
2. Sign in to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole), upload the ZIP, and fill in the Store Listing, Privacy, and Distribution tabs.
3. Review all permission and data-use declarations for accuracy, then select **Submit for review**.

Publishing requires a verified publisher account. Google performs the review and controls when the listing becomes available.
