import { completion, generateSitemaps, prepareTestApp, runNext } from './test-app.mjs'

await prepareTestApp()
await completion(generateSitemaps())
await completion(runNext(['build']))
