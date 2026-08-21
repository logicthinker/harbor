# Harbor project continuity

Repository: https://github.com/logicthinker/harbor

## Current state

Harbor is a local-first REST API development studio built with React/Vite and Tauri. The public `main` branch contains the application, desktop packaging configuration, release workflow, import/export support, OS credential-store integration, and test suites.

The latest published UI fix is commit `f80695e` (`Fix light theme New request visibility`). The repository history was scrubbed before publication; demo credential values are not present in Git history.

## Verification completed

- TypeScript and production builds passed.
- Vitest unit/compatibility tests passed.
- Chromium, Firefox, and WebKit journey tests passed.
- axe accessibility audits passed in all three browsers.
- Live HTTPS, timeout, proxy, invalid-TLS, and cancellation probes passed.
- OpenAPI validation passed for valid and invalid documents.
- Postman Runtime lifecycle coverage passed.
- Autocannon local load smoke test passed with zero errors and zero timeouts.
- MSI and NSIS bundles were built locally before cleanup.

## Reopen locally

```powershell
pnpm install
pnpm dev
```

Useful checks:

```powershell
pnpm test:type
pnpm test
pnpm test:browser
pnpm test:load http://127.0.0.1:5173/
pnpm build
pnpm desktop:build
```

Playwright browser binaries may need to be installed once with `pnpm exec playwright install`.

## Release prerequisites

The GitHub Actions release workflow requires these repository secrets:

- `WINDOWS_CERTIFICATE_BASE64`
- `WINDOWS_CERTIFICATE_PASSWORD`
- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

Signed installer install/upgrade/uninstall/rollback testing and credential-store verification on macOS/Linux still require the corresponding external environments and signed artifacts.

## Cleanup performed

Generated dependencies, build outputs, Rust targets, test artifacts, caches, and the workspace-local GitHub CLI were removed. Source files, lockfiles, documentation, workflows, and Git history were preserved.
