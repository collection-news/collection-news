import { openSync } from 'node:fs'
import path from 'node:path'
import { completion, runNext, testAppDirectory, testPort } from './test-app.mjs'

const logPath = path.join(testAppDirectory, 'server.log')
const log = openSync(logPath, 'w')
const server = runNext(['start', '--hostname', '127.0.0.1', '--port', String(testPort)], ['ignore', log, log])
console.log(`Test server log: ${logPath}`)
process.on('SIGINT', () => server.kill('SIGINT'))
process.on('SIGTERM', () => server.kill('SIGTERM'))
await completion(server)
