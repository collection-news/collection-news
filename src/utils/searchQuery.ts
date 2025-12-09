// This run on browser. Need to handle CJK
export function base64Encode(str: string) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let b of bytes) binary += String.fromCharCode(b)
  // Encode for safe transport in query params (avoids `+` turning into space server-side)
  return encodeURIComponent(btoa(binary))
}

// This run on server
// The client URI-encodes Base64 to keep it query-safe. Normalize before decoding.
export function base64Decode(q: string) {
  const base64Payload = decodeURIComponent(q).replace(/ /g, '+')
  const decoded = Buffer.from(base64Payload, 'base64').toString('utf-8')
  return JSON.parse(decoded)
}
