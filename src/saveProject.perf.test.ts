import { vi, test, expect } from 'vitest'
import { harbor } from './harborBridge'

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(async (cmd, args) => {
    // Simulate IPC latency
    await new Promise(r => setTimeout(r, 5)) // 5ms per IPC call
    return undefined
  })
}))

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn()
} as any

test('saveProject performance baseline', async () => {
  const project = {
    name: 'perf-project',
    version: 2,
    environments: Array.from({ length: 5 }).map((_, i) => ({
      name: `env-${i}`,
      variables: Array.from({ length: 20 }).map((_, j) => ({
        key: `var-${j}`,
        value: 'secret-value',
        secret: true
      }))
    })),
    requests: [],
    history: []
  }

  const start = performance.now()
  await harbor.saveProject(project)
  const end = performance.now()
  const duration = end - start
  console.log(`saveProject took ${duration.toFixed(2)}ms`)
  expect(duration).toBeLessThan(100)
})
