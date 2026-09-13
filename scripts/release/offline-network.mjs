import net from 'node:net'
import dgram from 'node:dgram'

const connect = net.Socket.prototype.connect
net.Socket.prototype.connect = function (...args) {
  const first = Array.isArray(args[0]) ? args[0][0] : args[0]
  const host = typeof first === 'object' ? first.host : typeof args[1] === 'string' ? args[1] : 'localhost'
  if (host && !['localhost', '127.0.0.1', '::1'].includes(host)) {
    throw new Error('Release build attempted an external connection')
  }
  return connect.apply(this, args)
}
dgram.Socket.prototype.send = function () {
  throw new Error('Release build attempted a UDP connection')
}
