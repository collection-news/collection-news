import net from 'node:net'

const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])
const originalConnect = net.Socket.prototype.connect

// Applied only by test setup / the isolated Next.js child process, never by the app.
net.Socket.prototype.connect = function (...args) {
  const first = Array.isArray(args[0]) ? args[0][0] : args[0]
  const options = typeof first === 'object' ? first : { host: typeof args[1] === 'string' ? args[1] : undefined }
  const host = options?.host ?? options?.hostname ?? 'localhost'
  if (!loopbackHosts.has(host)) {
    throw new Error(`Offline tests blocked outbound connection to ${host}`)
  }
  return originalConnect.apply(this, args)
}
