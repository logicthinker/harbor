import { vi, test, expect } from 'vitest'
import { harbor } from '../src/harborBridge'

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(async (cmd, args) => {
    // Simulate IPC latency
    await new Promise(r => setTimeout(r, 5)) // 5ms per IPC call
    if (cmd === 'load_project') {
      return {
        name: 'perf-project',
        version: 2,
        environments: Array.from({ length: 5 }).map((_, i) => ({
          name: `env-${i}`,
          variables: Array.from({ length: 20 }).map((_, j) => ({
            key: `var-${j}`,
            value: '',
            secret: true
          }))
        })),
        requests: []
      }
    }
    if (cmd === 'get_secret') {
      return 'secret-value'
    }
    return undefined
  })
}))

test('loadProject performance baseline', async () => {
  const start = performance.now()
  const project = await harbor.loadProject()
  const end = performance.now()
  const duration = end - start
  console.log(`loadProject took ${duration.toFixed(2)}ms`)
  expect(project.environments[0].variables[0].value).toBe('secret-value')
})
