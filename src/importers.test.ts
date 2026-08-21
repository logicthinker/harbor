import { describe, expect, it } from 'vitest'
import { importCompatibleProject, openApiToProject, postmanToProject } from './importers'

describe('project importers', () => {
  it('flattens nested Postman folders and carries auth/scripts', () => {
    const project = postmanToProject({ info: { name: 'Nested' }, variable: [{ key: 'base_url', value: 'https://example.test' }], event: [{ listen: 'test', script: { exec: ['pm.response.to.have.status(201)'] } }], item: [{ name: 'Folder', item: [{ name: 'Create', request: { method: 'POST', url: '{{base_url}}/items', auth: { type: 'bearer' } } }] }] })
    expect(project.name).toBe('Nested'); expect(project.requests).toHaveLength(1); expect(project.requests[0].auth).toBe('bearer'); expect(project.requests[0].tests[0].expected).toBe('201')
  })
  it('creates requests from OpenAPI paths', () => {
    const project = openApiToProject({ openapi: '3.0.0', info: { title: 'Catalog' }, paths: { '/pets': { get: { operationId: 'listPets' }, post: { summary: 'Create pet' } } } })
    expect(project.name).toBe('Catalog'); expect(project.requests.map((request) => request.method)).toEqual(['GET', 'POST'])
  })
  it('detects compatible document formats', () => { expect(importCompatibleProject({ swagger: '2.0', paths: {} }).name).toBe('Imported OpenAPI'); expect(importCompatibleProject({ item: [] }).name).toBe('Imported collection') })
})
