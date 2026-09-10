## 2024-05-18 - [Tauri Command URL Scheme Validation]
**Vulnerability:** The application takes user-provided URLs in `execute_request` without checking the URL scheme. It relies on the HTTP client library (`reqwest`) to reject bad schemes.
**Learning:** `reqwest` does block schemes like `file://` by default (returning `BadScheme` error), but relying solely on the library's defaults is not robust defense-in-depth. If future changes modify `reqwest` configuration or swap clients, it could open a critical SSRF or local file read vulnerability. It's better to explicitly validate schemes at the application level.
**Prevention:** Always parse and explicitly whitelist allowed URL schemes (`http`, `https`) before passing user-controlled URLs to any HTTP client or network library.
