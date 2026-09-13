import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import * as tar from 'tar'
import { auditArchive, checkContent } from './package.mjs'

const archive = process.argv[2]
const sha = process.argv[3]
if (!archive || !/^[a-f0-9]{40}$/.test(sha || '')) throw new Error('Usage: smoke.mjs <archive> <sha>')
await auditArchive(archive)
const directory = await mkdtemp(path.join(tmpdir(), 'collection-runtime-'))
const port = 3197
let child
let output = ''
try {
  await tar.x({ file: archive, cwd: directory, strict: true })
  await writeFile(path.join(directory, '.env.local'), `APP_RELEASE_SHA=${sha}\n`)
  child = spawn(process.execPath, [path.join(directory, 'server.js')], {
    cwd: directory,
    env: {
      PATH: process.env.PATH,
      HOME: directory,
      NODE_ENV: 'production',
      PORT: String(port),
      HOSTNAME: '127.0.0.1',
      NEXT_TELEMETRY_DISABLED: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  child.stdout.on('data', chunk => {
    output += chunk
  })
  child.stderr.on('data', chunk => {
    output += chunk
  })
  const deadline = Date.now() + 45000
  for (;;) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(2000) })
      const health = await response.json()
      if (response.status !== 200 || health.status !== 'ok' || health.release !== sha)
        throw new Error('Health identity mismatch')
      break
    } catch (error) {
      if (child.exitCode !== null || Date.now() > deadline) throw error
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }
  const response = await fetch(`http://127.0.0.1:${port}/`)
  if (response.status !== 200) throw new Error('Homepage failed')
  const html = await response.text()
  const assets = [...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"?]+)/g)].map(match => match[1])
  if (!assets.length) throw new Error('No static assets in homepage')
  for (const asset of assets) {
    const response = await fetch(`http://127.0.0.1:${port}${asset}`)
    if (response.status !== 200 || !(await response.arrayBuffer()).byteLength) throw new Error('Static asset failed')
  }
  console.log('Extracted runtime, environment loading, homepage, and static assets passed')
} catch (error) {
  checkContent(Buffer.from(output), [])
  console.error(output)
  throw error
} finally {
  if (child && child.exitCode === null) {
    child.kill('SIGTERM')
    const timer = setTimeout(() => child.kill('SIGKILL'), 10000)
    await once(child, 'exit')
    clearTimeout(timer)
  }
  await rm(directory, { recursive: true, force: true })
}
