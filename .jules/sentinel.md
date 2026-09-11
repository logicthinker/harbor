
## 2026-09-11 - SSRF and Local File Disclosure via Unvalidated Tauri HTTP Client
**Vulnerability:** The Rust backend accepted arbitrary user-provided URLs in `execute_request` without checking the scheme. This allowed attackers to use `file:///` protocols to read local files via Harbor's internal HTTP client wrapper.
**Learning:** Even though Harbor is a local-first API tool that *must* allow requests to localhost (preventing standard SSRF protections), it is critical to explicitly restrict the allowed URL schemes to HTTP and HTTPS at the application boundary to prevent local file disclosure and access to unexpected protocols.
**Prevention:** Always validate URL schemes before passing them to the underlying HTTP client, and ensure explicit deny-lists or allow-lists are implemented for schemes.
