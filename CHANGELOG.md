# Changelog

## 0.1.0 — 2026-08-21

- Initial local-first Harbor desktop release.
- Added editable REST collections, environments, request history, response inspection, and assertions.
- Added Basic Auth, Bearer, and API-key request injection.
- Added Harbor, Postman, and JSON OpenAPI import paths.
- Added native OS credential storage for secrets.
- Added MSI and NSIS Windows installers.

## Upgrade notes

Harbor migrates version 1 project files to version 2 on load. Secret values are removed from persisted project JSON and stored in the native credential store when running as a desktop app. Browser fallback storage is intentionally session-limited for secrets.
