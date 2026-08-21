export type ResponseContract = { status?: number; required?: string[] }

export function validateResponseContract(status: number, body: string, contract?: ResponseContract): { valid: boolean; errors: string[] } {
  if (!contract) return { valid: true, errors: [] }
  const errors: string[] = []
  if (contract.status !== undefined && contract.status !== status) errors.push(`Expected status ${contract.status}, received ${status}`)
  if (contract.required?.length) { try { const parsed = JSON.parse(body) as Record<string, unknown>; for (const key of contract.required) if (!(key in parsed)) errors.push(`Missing required field: ${key}`) } catch { errors.push('Response is not valid JSON') } }
  return { valid: errors.length === 0, errors }
}
