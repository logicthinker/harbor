import { defaultProject, type Project, type Request } from './harborBridge'

type Obj = Record<string, unknown>
const obj = (value: unknown): Obj => (value && typeof value === 'object' ? value as Obj : {})
const text = (value: unknown) => typeof value === 'string' ? value : ''
const authMode = (auth: unknown): Request['auth'] => { const type = text(obj(auth).type); return type === 'bearer' ? 'bearer' : type === 'basic' ? 'basic' : type === 'apikey' ? 'api-key' : 'none' }
const scriptsToTests = (event: unknown): Request['tests'] => { const lines = Array.isArray(event) ? event.flatMap((item) => { const script = obj(obj(item).script); return Array.isArray(script.exec) ? script.exec : [] }) : []; const tests: Request['tests'] = []; for (const line of lines) { const code = text(line); const match = code.match(/response\.code\s*===?\s*(\d{3})|response\.to\.have\.status\((\d{3})\)/); if (match) tests.push({ id: crypto.randomUUID(), expression: 'status', expected: match[1] ?? match[2], enabled: true }) } return tests }

export function postmanToProject(input: unknown): Project {
  const root = obj(input); const project = defaultProject(); project.name = text(obj(root.info).name) || 'Imported collection';
  const variables = Array.isArray(root.variable) ? root.variable.map((item) => ({ key: text(obj(item).key), value: text(obj(item).value), secret: /token|key|secret|password/i.test(text(obj(item).key)) })) : [];
  if (variables.length) project.environments = [{ name: 'development', variables }]
  const events = Array.isArray(root.event) ? root.event : [];
  const requests: Request[] = [];
  const walk = (items: unknown[]) => items.forEach((raw) => { const item = obj(raw); if (Array.isArray(item.item)) walk(item.item); else if (item.request) { const request = obj(item.request); const rawUrl = typeof request.url === 'string' ? request.url : text(obj(request.url).raw); const headers = Array.isArray(request.header) ? request.header.map((header) => ({ key: text(obj(header).key), value: text(obj(header).value), enabled: obj(header).disabled !== true })) : []; const body = obj(request.body); requests.push({ id: crypto.randomUUID(), name: text(item.name) || 'Imported request', method: text(request.method) || 'GET', url: rawUrl || '{{base_url}}/', path: rawUrl.split('/').pop() || '/', headers, params: [], body: text(body.raw), auth: authMode(request.auth), tests: scriptsToTests(events), tone: requests.length % 3 === 0 ? 'cyan' : requests.length % 3 === 1 ? 'amber' : 'violet' }) } });
  if (Array.isArray(root.item)) walk(root.item); if (requests.length) project.requests = requests; return project
}

export function openApiToProject(input: unknown): Project {
  const root = obj(input); const project = defaultProject(); project.name = text(obj(root.info).title) || 'Imported OpenAPI'; const paths = obj(root.paths); const requests: Request[] = [];
  for (const [path, pathItem] of Object.entries(paths)) for (const [method, operation] of Object.entries(obj(pathItem))) if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) { const op = obj(operation); const responses = obj(op.responses); const firstStatus = Object.keys(responses)[0]; requests.push({ id: crypto.randomUUID(), name: text(op.summary) || text(op.operationId) || `${method.toUpperCase()} ${path}`, method: method.toUpperCase(), url: `{{base_url}}${path}`, path, headers: [], params: [], body: '', auth: 'none', tests: [], contract: firstStatus && /^\d{3}$/.test(firstStatus) ? { status: Number(firstStatus) } : undefined, tone: requests.length % 2 ? 'amber' : 'cyan' }) }
  if (requests.length) project.requests = requests; return project
}

export function importCompatibleProject(input: unknown): Project { const root = obj(input); if (root.openapi || root.swagger) return openApiToProject(input); if (root.item) return postmanToProject(input); if (root.requests && root.environments) return input as Project; throw new Error('Unsupported project format') }
