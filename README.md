# Harbor

Harbor is a local-first REST API development studio: a calm, focused alternative to hosted API clients for teams working behind organization restrictions.

## Development

```bash
pnpm install
pnpm dev
```

## Verification

```bash
pnpm test
pnpm build
pnpm desktop:build
```

The desktop shell lives in `src-tauri/`. The Rust command layer provides real HTTP execution and versioned local project persistence; the browser fallback uses `fetch` and `localStorage` for development.

## v0.1 capabilities

- Editable collections and requests with GET, POST, PUT, PATCH, and DELETE methods
- Query parameters, headers, JSON body, authorization mode, and environment variables
- Local development, staging, and production environments with secret-aware export behavior
- Request history, response JSON/raw/header/timeline views, and status assertions
- Harbor project export plus basic Postman collection import

## Product principles

- No account or hosted workspace required
- Secrets stay local and are never included in project files by default
- Projects remain readable and friendly to Git
- The interface makes risky actions and production environments obvious
