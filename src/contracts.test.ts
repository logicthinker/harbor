import { describe, expect, it } from 'vitest'
import { validateResponseContract } from './contracts'

describe('OpenAPI response contract validation', () => {
  it('validates status and required JSON fields', () => { expect(validateResponseContract(200, '{"id":1}', { status: 200, required: ['id'] }).valid).toBe(true); expect(validateResponseContract(201, '{}', { status: 200, required: ['id'] }).errors).toHaveLength(2) })
})
