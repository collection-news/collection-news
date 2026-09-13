import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import * as tar from 'tar'
import { auditArchive, buildEnvironment, checkName, createArchive } from './package.mjs'

async function fixture(t, name, content) {
  const root = await mkdtemp(path.join(tmpdir(), 'release-test-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(path.dirname(path.join(root, name)), { recursive: true })
  await writeFile(path.join(root, name), content)
  const archive = path.join(root, 'test.tar.gz')
  await tar.c({ cwd: root, file: archive, gzip: true }, [name])
  return { root, archive }
}
test('rejects all environment files and unsafe paths', () => {
  for (const name of [
    '.env',
    '.env.production',
    'node_modules/x/.env.local',
    '.aws/credentials',
    '../escape',
    '/absolute',
  ])
    assert.throws(() => checkName(name))
})
test('final archive audit rejects embedded secrets and encoded variants', async t => {
  const secret = 'planted-secret-value-123456789'
  for (const value of [secret, Buffer.from(secret).toString('base64'), Buffer.from(secret).toString('hex')]) {
    const { archive } = await fixture(t, '.next/server/page.js', value)
    await assert.rejects(auditArchive(archive, [secret]), error => !error.message.includes(secret))
  }
})
test('final archive audit rejects credential files and private keys', async t => {
  const env = await fixture(t, '.env.production', 'not-a-real-secret')
  await assert.rejects(auditArchive(env.archive))
  const key = await fixture(t, 'page.js', '-----BEGIN OPENSSH PRIVATE KEY-----')
  await assert.rejects(auditArchive(key.archive))
})
test('build environment excludes secrets and inherited Node options', () => {
  process.env.APP_AWS_SECRET_ACCESS_KEY = 'test-only-inherited-secret'
  const env = buildEnvironment('/tmp/release-work', 'a'.repeat(40))
  assert.equal(env.APP_AWS_SECRET_ACCESS_KEY, undefined)
  assert.equal(env.HOME, '/tmp/release-work/home')
  assert.equal(env.APP_RELEASE_SHA, 'a'.repeat(40))
  delete process.env.APP_AWS_SECRET_ACCESS_KEY
})
test('preserves internal dependency links and refuses external links', async t => {
  const { root } = await fixture(t, 'unused', 'ok')
  const runtime = path.join(root, 'runtime')
  await mkdir(runtime)
  await writeFile(path.join(runtime, 'server.js'), 'ok')
  await mkdir(path.join(runtime, 'node_modules'))
  await symlink('../server.js', path.join(runtime, 'node_modules/alias.js'))
  const archive = path.join(root, 'runtime.tar.gz')
  await createArchive(runtime, archive)
  assert.equal((await auditArchive(archive)).files.size, 2)
  await symlink('/etc/passwd', path.join(runtime, 'external'))
  await assert.rejects(createArchive(runtime, archive))
})
