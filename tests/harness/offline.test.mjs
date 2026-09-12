import { connect } from 'node:net'
import { readFile } from 'node:fs/promises'
import { expect, it, vi } from 'vitest'
import { offlineEnvironment } from '../support/test-app.mjs'

it('strips inherited infrastructure credentials and endpoints from the test server environment', () => {
  vi.stubEnv('APP_AWS_ACCESS_KEY_ID', 'must-not-propagate')
  vi.stubEnv('AWS_PROFILE', 'must-not-propagate')
  vi.stubEnv('APP_R2_ACCESS_KEY_ID', 'must-not-propagate')
  vi.stubEnv('APP_MEILI_HOST', 'https://must-not-propagate.test')
  const environment = offlineEnvironment()
  expect(environment.APP_AWS_ACCESS_KEY_ID).toBeUndefined()
  expect(environment.AWS_PROFILE).toBeUndefined()
  expect(environment.APP_R2_ACCESS_KEY_ID).toBeUndefined()
  expect(environment.APP_MEILI_HOST).toBe('http://127.0.0.1:1')
  expect(environment.NODE_OPTIONS).toContain('offline-network.mjs')
})

it('blocks an external socket before a network connection can be made', () => {
  expect(() => connect({ host: 'dynamodb.ap-east-1.amazonaws.com', port: 443 })).toThrow(
    'Offline tests blocked outbound connection'
  )
})

it('keeps the production data service independent of the fixture provider', async () => {
  const source = await readFile(new URL('../../src/services/dynamo.ts', import.meta.url), 'utf8')
  expect(source).toContain("from '@aws-sdk/client-dynamodb'")
  expect(source).not.toContain('fixtures')
})
