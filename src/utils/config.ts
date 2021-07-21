console.log(`process.env.VERCEL_ENV=${process.env.VERCEL_ENV}`)
export const isDev = process.env.VERCEL_ENV === 'development'
