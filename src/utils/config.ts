export const isDev = process.env.VERCEL_ENV === 'development'
export const featureFlags = {
  showSearchBtn: process.env.NEXT_PUBLIC_FEAT_FLAG_SHOW_SEARCH_BTN === 'true',
}
