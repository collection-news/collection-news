import { createHash } from 'node:crypto'
import { cp, lstat, mkdir, readFile, readdir, realpath, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import * as tar from 'tar'

const root = fileURLToPath(new URL('../../', import.meta.url))
const sources = [
  'src',
  'public',
  'next.config.js',
  'cache-handler.mjs',
  'runtime-cache-handler.mjs',
  'package.json',
  'pnpm-lock.yaml',
  'tsconfig.json',
]
const forbidden = new Set([
  '.git',
  '.aws',
  '.ssh',
  '.npmrc',
  '.netrc',
  '.test-app',
  'tests',
  'test-results',
  'playwright-report',
  'coverage',
])
const runtimeRoots = new Set([
  '.next',
  'node_modules',
  'public',
  'server.js',
  'package.json',
  'cache-handler.mjs',
  'runtime-cache-handler.mjs',
])
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /gh[pousr]_[A-Za-z0-9]{36,}/,
  /github_pat_[A-Za-z0-9_]{40,}/,
  /(?:AKIA|ASIA)[A-Z0-9]{16}/,
]

export function checkName(name) {
  if (path.posix.isAbsolute(name) || name.includes('\\') || name.split('/').includes('..'))
    throw new Error('Unsafe archive path')
  if (name.split('/').some(part => forbidden.has(part) || part.startsWith('.env') || /\.(pem|key|log)$/.test(part)))
    throw new Error('Forbidden runtime file')
  if (name.startsWith('.next/cache/')) throw new Error('Build cache cannot be published')
}

export function checkContent(content, secrets) {
  if (patterns.some(pattern => pattern.test(content.toString('utf8'))))
    throw new Error('Credential pattern detected; content redacted')
  for (const secret of secrets.filter(value => value.length >= 8)) {
    const variants = [
      secret,
      Buffer.from(secret).toString('base64'),
      Buffer.from(secret).toString('hex'),
      JSON.stringify(secret).slice(1, -1),
    ]
    if (variants.some(value => content.includes(Buffer.from(value))))
      throw new Error('Forbidden secret detected; content redacted')
  }
}

export async function auditArchive(archive, secrets = []) {
  const seen = new Set()
  const errors = []
  let unpackedSize = 0
  await tar.t({
    file: archive,
    strict: true,
    onReadEntry(entry) {
      try {
        checkName(entry.path)
        if (!runtimeRoots.has(entry.path.split('/')[0])) throw new Error('Unapproved runtime root')
        if (seen.has(entry.path) || !['File', 'SymbolicLink'].includes(entry.type))
          throw new Error('Duplicate or non-regular archive entry')
        if (entry.size > 256 * 1024 * 1024) throw new Error('Oversized runtime file')
        if (entry.type === 'SymbolicLink') {
          if (path.posix.isAbsolute(entry.linkpath)) throw new Error('Absolute dependency link')
          checkName(path.posix.normalize(path.posix.join(path.posix.dirname(entry.path), entry.linkpath)))
        }
        seen.add(entry.path)
        unpackedSize += entry.size
      } catch (error) {
        errors.push(error)
      }
      const chunks = []
      entry.on('data', chunk => {
        if (entry.size <= 256 * 1024 * 1024) chunks.push(chunk)
      })
      entry.on('end', () => {
        try {
          checkContent(Buffer.concat(chunks), secrets)
        } catch (error) {
          errors.push(error)
        }
      })
    },
  })
  if (errors.length) throw errors[0]
  return { files: seen, unpackedSize }
}

async function runtimeFiles(rootDirectory) {
  const rootReal = await realpath(rootDirectory)
  const files = []
  async function walk(directory, ancestors) {
    const resolved = await realpath(directory)
    if (!resolved.startsWith(rootReal + path.sep) && resolved !== rootReal) throw new Error('External runtime symlink')
    if (ancestors.has(resolved)) throw new Error('Cyclic runtime symlink')
    for (const name of (await readdir(directory)).sort()) {
      const file = path.join(directory, name)
      const relative = path.relative(rootDirectory, file).split(path.sep).join('/')
      checkName(relative)
      const target = await realpath(file)
      if (!target.startsWith(rootReal + path.sep)) throw new Error('External runtime symlink')
      const info = await lstat(file)
      if (info.isSymbolicLink()) files.push(relative)
      else if (info.isDirectory()) await walk(file, new Set([...ancestors, resolved]))
      else if (info.isFile()) files.push(relative)
      else throw new Error('Non-regular runtime file')
    }
  }
  await walk(rootDirectory, new Set())
  return files
}

export async function createArchive(directory, archive, secrets = []) {
  const files = await runtimeFiles(directory)
  const temporary = archive + '.partial'
  try {
    await tar.c(
      { cwd: directory, file: temporary, gzip: true, portable: true, noMtime: true, follow: false, noDirRecurse: true },
      files
    )
    await auditArchive(temporary, secrets)
    await rename(temporary, archive)
  } finally {
    await rm(temporary, { force: true })
  }
}

export function buildEnvironment(work, sha, search = true) {
  return {
    PATH: process.env.PATH,
    HOME: path.join(work, 'home'),
    TMPDIR: path.join(work, 'tmp'),
    NODE_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1',
    CI: '1',
    TZ: 'Asia/Hong_Kong',
    APP_RELEASE_BUILD: '1',
    APP_RELEASE_SHA: sha,
    APP_DOMAIN: 'https://collection.news',
    NEXT_PUBLIC_FEAT_FLAG_SHOW_SEARCH_BTN: String(search),
    NODE_OPTIONS: '--import=' + pathToFileURL(path.join(work, 'offline-network.mjs')).href,
  }
}
function inheritedSecrets() {
  return Object.entries(process.env)
    .filter(([key]) => /SECRET|TOKEN|PASSWORD|CREDENTIAL|ACCESS_KEY|SEARCH_KEY|PRIVATE_KEY/.test(key))
    .map(([, value]) => value)
}
export function run(command, args, cwd, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', code => (code === 0 ? resolve() : reject(new Error('Release subprocess failed'))))
  })
}
async function copySource(source, destination) {
  const info = await lstat(source)
  if (info.isSymbolicLink()) throw new Error('Source symlinks are not allowed')
  checkName(path.basename(source))
  if (info.isDirectory()) {
    await mkdir(destination, { recursive: true })
    for (const name of await readdir(source)) await copySource(path.join(source, name), path.join(destination, name))
  } else await cp(source, destination)
}
async function build(options) {
  if (!/^[a-f0-9]{40}$/.test(options.sha || '')) throw new Error('A full commit SHA is required')
  if (process.platform !== 'linux' && !options['local-validation'])
    throw new Error('Published releases must be built on Linux')
  const work = path.join(root, '.release-work')
  const output = path.join(root, 'release-out')
  await rm(work, { recursive: true, force: true })
  await rm(output, { recursive: true, force: true })
  const project = path.join(work, 'project')
  for (const directory of [project, path.join(work, 'home'), path.join(work, 'tmp'), output])
    await mkdir(directory, { recursive: true })
  for (const name of sources) await copySource(path.join(root, name), path.join(project, name))
  await cp(path.join(root, 'node_modules'), path.join(project, 'node_modules'), {
    recursive: true,
    verbatimSymlinks: true,
  })
  await cp(path.join(root, 'scripts/release/offline-network.mjs'), path.join(work, 'offline-network.mjs'))
  const env = buildEnvironment(work, options.sha, !options['disable-search'])
  await run(process.execPath, ['--import', 'tsx', 'src/scripts/genSitemap.ts'], project, env)
  await run(process.execPath, ['node_modules/next/dist/bin/next', 'build'], project, env)
  const runtime = path.join(project, '.next/standalone')
  await cp(path.join(project, 'public'), path.join(runtime, 'public'), { recursive: true })
  await cp(path.join(project, '.next/static'), path.join(runtime, '.next/static'), { recursive: true })
  await rm(path.join(runtime, '.next/cache'), { recursive: true, force: true })
  const arch = { x64: 'amd64', arm64: 'arm64' }[process.arch]
  const asset = `collection-news-${process.platform}-${arch}.tar.gz`
  const archive = path.join(output, asset)
  await createArchive(runtime, archive, inheritedSecrets())
  const audited = await auditArchive(archive, inheritedSecrets())
  for (const file of ['server.js', '.next/BUILD_ID', 'runtime-cache-handler.mjs', 'cache-handler.mjs']) {
    if (!audited.files.has(file)) throw new Error(`Required runtime file missing: ${file}`)
  }
  const manifest = {
    schema: 1,
    repository: 'collection-news/collection-news',
    sha: options.sha,
    tag: 'app-' + options.sha,
    asset,
    os: process.platform,
    arch,
    node_major: 24,
    node_minimum: '24.15.0',
    build_os:
      process.platform === 'linux'
        ? (await readFile('/etc/os-release', 'utf8')).match(/^PRETTY_NAME=(.*)$/m)?.[1]
        : 'local validation',
    size: (await stat(archive)).size,
    unpacked_size: audited.unpackedSize,
    sha256: createHash('sha256')
      .update(await readFile(archive))
      .digest('hex'),
  }
  await writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  await writeFile(path.join(output, 'SHA256SUMS'), `${manifest.sha256}  ${asset}\n`)
  console.log(`Validated runtime: ${asset} (${manifest.size} bytes)`)
}
async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      sha: { type: 'string' },
      'local-validation': { type: 'boolean' },
      'disable-search': { type: 'boolean' },
    },
  })
  if (positionals[0] === 'build') await build(values)
  else if (positionals[0] === 'audit' && positionals[1]) {
    await auditArchive(positionals[1], inheritedSecrets())
    console.log('Archive audit passed')
  } else throw new Error('Usage: package.mjs build --sha <sha> | audit <archive>')
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()
