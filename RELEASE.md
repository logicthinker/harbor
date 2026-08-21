# Harbor release checklist

## Local verification

```powershell
pnpm install --frozen-lockfile
pnpm test:type
pnpm test
pnpm test:browser
pnpm desktop:build
```

## Signed publishing

Push a tag such as `v0.1.0` after updating `CHANGELOG.md`. The GitHub release workflow requires these repository secrets:

- `WINDOWS_CERTIFICATE_BASE64`: base64-encoded Authenticode `.pfx`
- `WINDOWS_CERTIFICATE_PASSWORD`: password for the certificate
- `TAURI_SIGNING_PRIVATE_KEY`: Tauri updater signing key
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: updater key password

The workflow signs the MSI and NSIS installer with SHA-256, then publishes both artifacts and the changelog to a GitHub Release.
