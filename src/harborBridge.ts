import { invoke as tauriInvoke } from '@tauri-apps/api/core'
import type { ResponseContract } from './contracts'

export type Header = { key: string; value: string; enabled?: boolean }
export type Param = { key: string; value: string; enabled: boolean }
export type Assertion = { id: string; expression: string; expected: string; enabled: boolean }
export type Request = { id: string; name: string; method: string; url: string; path: string; headers: Header[]; params: Param[]; body: string; auth: 'none' | 'bearer' | 'basic' | 'api-key'; tests: Assertion[]; tone: 'cyan' | 'amber' | 'violet'; contract?: ResponseContract }
export type Environment = { name: string; variables: Array<{ key: string; value: string; secret: boolean }> }
export type Project = { version: number; name: string; environments: Environment[]; requests: Request[]; history: Array<{ requestId: string; status: number; durationMs: number; timestamp: string }> }
export type RequestInput = { method: string; url: string; headers?: Header[]; body?: string }
export type ResponseOutput = { status: number; status_text: string; headers: Header[]; body: string; duration_ms: number }

const invoke = async <T>(command: string, args?: Record<string, unknown>): Promise<T | undefined> => {
  try { return await tauriInvoke<T>(command, args) } catch { return undefined }
}
const sessionSecrets = new Map<string, string>()
const secretScope = (project: string, environment: string, key: string) => `${project}/${environment}/${key}`
const migrateProject = (input: Project): Project => {
  const defaults = defaultProject()
  const migrated = { ...defaults, ...input, version: Math.max(input.version ?? 1, 2), requests: Array.isArray(input.requests) && input.requests.length ? input.requests : defaults.requests, history: input.history ?? [] }
  migrated.environments = (input.environments?.length ? input.environments : defaults.environments).map((environment) => ({ ...environment, variables: (environment.variables ?? []).map((variable) => ({ ...variable, secret: variable.secret ?? /token|key|secret|password/i.test(variable.key) })) }))
  return migrated
}

export const harbor = {
  async executeRequest(input: RequestInput): Promise<ResponseOutput> {
    const native = await invoke<ResponseOutput>('execute_request', { input })
    if (native) return native
    const started = performance.now()
    const response = await fetch(input.url, { method: input.method, headers: Object.fromEntries((input.headers ?? []).filter((h) => h.enabled !== false).map(({ key, value }) => [key, value])), body: input.body || undefined })
    return { status: response.status, status_text: response.statusText, headers: [...response.headers].map(([key, value]) => ({ key, value })), body: await response.text(), duration_ms: Math.round(performance.now() - started) }
  },
  async loadProject(): Promise<Project> {
    const native = await invoke<Project>('load_project')
    if (native?.requests) {
      for (const environment of native.environments) for (const variable of environment.variables) if (variable.secret) { const value = await invoke<string | null>('get_secret', { scope: secretScope(native.name, environment.name, variable.key) }); if (value) variable.value = value }
      return migrateProject(native)
    }
    const saved = localStorage.getItem('harbor.project')
    return saved ? migrateProject(JSON.parse(saved) as Project) : defaultProject()
  },
  async saveProject(project: Project): Promise<void> {
    const diskProject = JSON.parse(JSON.stringify(project)) as Project
    for (const environment of project.environments) for (const variable of environment.variables) if (variable.secret) { sessionSecrets.set(secretScope(project.name, environment.name, variable.key), variable.value); await invoke('set_secret', { scope: secretScope(project.name, environment.name, variable.key), value: variable.value }); const diskEnvironment = diskProject.environments.find((item) => item.name === environment.name); const diskVariable = diskEnvironment?.variables.find((item) => item.key === variable.key); if (diskVariable) diskVariable.value = '' }
    localStorage.setItem('harbor.project', JSON.stringify(diskProject))
    await invoke('save_project', { project: diskProject })
  },
  exportProject(project: Project) {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}.harbor.json`; link.click(); URL.revokeObjectURL(link.href)
  },
  exportPostman(project: Project) {
    const collection = { info: { name: project.name, schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' }, variable: (project.environments[0]?.variables ?? []).map((variable) => ({ key: variable.key, value: variable.secret ? '' : variable.value, type: 'string' })), item: project.requests.map((request) => ({ name: request.name, request: { method: request.method, header: request.headers.filter((header) => header.enabled !== false).map((header) => ({ key: header.key, value: header.value })), body: request.body ? { mode: 'raw', raw: request.body } : undefined, url: { raw: request.url } }, event: request.tests.length ? [{ listen: 'test', script: { type: 'text/javascript', exec: request.tests.filter((test) => test.expression === 'status').map((test) => `pm.response.to.have.status(${test.expected});`) } }] : undefined })) }
    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}.postman_collection.json`; link.click(); URL.revokeObjectURL(link.href)
  },
}

export const defaultProject = (): Project => ({
  version: 2,
  name: 'Acme API',
  environments: [
    { name: 'development', variables: [{ key: 'base_url', value: 'https://api.acme.dev', secret: false }, { key: 'token', value: '', secret: true }, { key: 'basic_username', value: '', secret: true }, { key: 'basic_password', value: '', secret: true }, { key: 'api_key', value: '', secret: true }] },
    { name: 'staging', variables: [{ key: 'base_url', value: 'https://staging.api.acme.dev', secret: false }, { key: 'token', value: '', secret: true }] },
    { name: 'production', variables: [{ key: 'base_url', value: 'https://api.acme.dev', secret: false }, { key: 'token', value: '', secret: true }] },
  ],
  requests: [
    { id: 'health', name: 'Health check', method: 'GET', url: '{{base_url}}/v1/health', path: '/v1/health', headers: [], params: [], body: '', auth: 'bearer', tone: 'cyan', tests: [{ id: 'health-status', expression: 'status', expected: '200', enabled: true }] },
    { id: 'projects', name: 'List projects', method: 'GET', url: '{{base_url}}/v1/projects', path: '/v1/projects', headers: [], params: [], body: '', auth: 'bearer', tone: 'cyan', tests: [] },
    { id: 'create-project', name: 'Create project', method: 'POST', url: '{{base_url}}/v1/projects', path: '/v1/projects', headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }], params: [], body: '{\n  "name": "Harbor demo"\n}', auth: 'bearer', tone: 'amber', tests: [] },
    { id: 'rotate-key', name: 'Rotate API key', method: 'POST', url: '{{base_url}}/v1/keys/rotate', path: '/v1/keys/rotate', headers: [], params: [], body: '', auth: 'bearer', tone: 'violet', tests: [] },
  ],
  history: [],
})
