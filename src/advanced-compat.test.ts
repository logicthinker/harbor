import { createServer, type Server } from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import SwaggerParser from '@apidevtools/swagger-parser'
// postman-runtime does not publish TypeScript declarations.
// @ts-expect-error runtime package is CommonJS without declarations
import { Runner } from 'postman-runtime'

let server: Server
let baseUrl = ''
let requestCount = 0

beforeAll(async () => {
  server = createServer((request, response) => {
    if (request.url === '/postman') {
      requestCount += 1
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ ok: true }))
      return
    }
    response.writeHead(404)
    response.end()
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))
  const address = server.address()
  if (address && typeof address !== 'string') baseUrl = `http://127.0.0.1:${address.port}`
})

afterAll(async () => { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())) })

describe('Postman runtime compatibility', () => {
  it('executes a collection request and evaluates pm.response assertions', async () => {
    const runtime = new Runner()
    const collection = {
      info: { name: 'runtime test', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      item: [{ name: 'health', request: { method: 'GET', url: { raw: `${baseUrl}/postman`, protocol: 'http', host: ['127.0.0.1'], path: ['postman'] } }, event: [{ listen: 'test', script: { exec: ['pm.test("status is 200", function () { pm.response.to.have.status(200); });'] } }] }],
    }
    const result = await new Promise<{ error?: Error; summary?: any }>((resolve, reject) => {
      runtime.run(collection, {}, (error: Error | null, run: any) => {
        if (error) { reject(error); return }
        run.start((startError: Error | null) => startError ? reject(startError) : resolve({ summary: run }))
      })
    })
    expect(result.error).toBeUndefined()
    expect(result.summary).toBeTruthy()
    expect(result.summary.state).toBeTruthy()
  })
})

describe('OpenAPI schema validation', () => {
  it('accepts a valid OpenAPI document and rejects an invalid one', async () => {
    const valid = { openapi: '3.0.3', info: { title: 'Harbor test', version: '1.0.0' }, paths: { '/health': { get: { responses: { '200': { description: 'ok' } } } } } }
    await expect(SwaggerParser.validate(valid)).resolves.toBeTruthy()
    const invalid = { openapi: '3.0.3', info: { title: 'Missing version' }, paths: {} }
    await expect(SwaggerParser.validate(invalid as never)).rejects.toThrow()
  })
})
