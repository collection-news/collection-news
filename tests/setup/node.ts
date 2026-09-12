import { afterEach, vi } from 'vitest'
import '../support/offline-network.mjs'

// All ordinary tests are offline, even when the developer has valid AWS credentials.
vi.stubEnv('APP_AWS_ACCESS_KEY_ID', 'test-only')
vi.stubEnv('APP_AWS_SECRET_ACCESS_KEY', 'test-only')
vi.stubEnv('APP_AWS_SESSION_TOKEN', '')
vi.stubEnv('APP_AWS_REGION', 'ap-east-1')
vi.stubEnv('APP_APPLE_DAILY_DYNAMODB_TABLE_NAME', 'test-apple')
vi.stubEnv('APP_THE_STAND_NEWS_DYNAMODB_TABLE_NAME', 'test-stand')
vi.stubEnv('APP_IDX_PROGRESS_TABLE_NAME', 'test-index')
vi.stubEnv('APP_DOMAIN', 'http://localhost:3100')
vi.stubEnv('APP_ASSET_CDN_HOST', 'assets.test')
vi.stubEnv('APP_ENABLE_CUSTOM_ISR_CACHE_HANDLER', '')
vi.stubEnv('VERCEL_ENV', 'test')

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})
