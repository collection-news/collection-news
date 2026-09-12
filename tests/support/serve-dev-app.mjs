import { spawn } from 'node:child_process'
import path from 'node:path'
import {
  completion,
  generateSitemaps,
  offlineEnvironment,
  prepareTestApp,
  testAppDirectory,
  testPort,
} from './test-app.mjs'

await prepareTestApp()
await completion(generateSitemaps())
const server = spawn(
  process.execPath,
  [path.resolve('node_modules/next/dist/bin/next'), 'dev', '--port', String(testPort), '--hostname', '127.0.0.1'],
  {
    cwd: testAppDirectory,
    env: { ...offlineEnvironment(), NODE_ENV: 'development' },
    stdio: 'inherit',
  }
)
await completion(server)
