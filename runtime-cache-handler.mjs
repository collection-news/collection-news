import FileSystemCache from 'next/dist/server/lib/incremental-cache/file-system-cache.js'
import RemoteCache from './cache-handler.mjs'

// Standalone config is serialized at build time; choose the optional cache at startup.
export default class RuntimeCache {
  constructor(options) {
    const Handler = process.env.APP_ENABLE_CUSTOM_ISR_CACHE_HANDLER
      ? RemoteCache
      : (FileSystemCache.default ?? FileSystemCache)
    return new Handler(options)
  }
}
