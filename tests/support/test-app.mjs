import { cp, mkdir, rm, symlink, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
export const testAppDirectory = path.join(root, '.test-app')
export const testPort = 3100

export function offlineEnvironment() {
  // Do not inherit credentials, service endpoints, NODE_OPTIONS, or .env.local.
  const environment = Object.fromEntries(
    ['PATH', 'HOME', 'TMPDIR', 'TEMP', 'SYSTEMROOT', 'CI'].flatMap(key =>
      process.env[key] ? [[key, process.env[key]]] : []
    )
  )
  return {
    ...environment,
    NODE_ENV: 'production',
    NODE_OPTIONS: `--import=${pathToFileURL(path.join(root, 'tests/support/offline-network.mjs')).href}`,
    NEXT_TELEMETRY_DISABLED: '1',
    APP_DOMAIN: `http://localhost:${testPort}`,
    NEXT_PUBLIC_FEAT_FLAG_SHOW_SEARCH_BTN: 'true',
    APP_ENABLE_MEILISEARCH: 'true',
    APP_MEILI_HOST: 'http://127.0.0.1:1',
    APP_MEILI_SEARCH_KEY: 'test-only',
    TZ: 'Asia/Hong_Kong',
  }
}

export async function prepareTestApp() {
  await rm(testAppDirectory, { recursive: true, force: true })
  await mkdir(testAppDirectory, { recursive: true })
  for (const entry of [
    'src',
    'public',
    'tests/fixtures',
    'next.config.js',
    'tsconfig.json',
    'package.json',
    'pnpm-lock.yaml',
  ]) {
    await cp(path.join(root, entry), path.join(testAppDirectory, entry), { recursive: true })
  }
  await symlink(path.join(root, 'node_modules'), path.join(testAppDirectory, 'node_modules'), 'dir')
  // Replace only this copy. The deployable source and production Next config are never edited.
  await writeFile(
    path.join(testAppDirectory, 'src/services/dynamo.ts'),
    "export { getArticle, getArticlesByDateAndCat, getArticleIds, getLatestGoogleIndexCount } from '../../tests/fixtures/dynamo'\n"
  )
  await writeFile(
    path.join(testAppDirectory, 'public/test-image.svg'),
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="320" height="200" fill="#31556c"/></svg>'
  )
}

export function runNode(args, stdio = 'inherit') {
  return spawn(process.execPath, args, {
    cwd: testAppDirectory,
    env: offlineEnvironment(),
    stdio,
  })
}

export function runNext(args, stdio = 'inherit') {
  return runNode([path.join(root, 'node_modules/next/dist/bin/next'), ...args], stdio)
}

export function generateSitemaps() {
  return runNode(['--import', 'tsx', 'src/scripts/genSitemap.ts'])
}

export function completion(child) {
  return new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) resolve()
      else reject(new Error(`Test app process failed: ${signal || code}`))
    })
  })
}
