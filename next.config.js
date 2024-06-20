const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
})

module.exports = withMDX({
  cacheHandler:
    process.env.NODE_ENV === 'production' && process.env.APP_ENABLE_CUSTOM_ISR_CACHE_HANDLER
      ? require.resolve('./cache-handler.mjs')
      : undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  headers: async () => {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Link',
            value: '<https://collection.news>; rel="canonical"',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Link',
            value: '<https://collection.news/:path*>; rel="canonical"',
          },
        ],
      },
    ]
  },
  rewrites: async () => [
    {
      source: '/sitemap/:media/:date.xml',
      destination: '/api/sitemap/:media/:date',
    },
    {
      source: '/robots.txt',
      destination: '/api/robots',
    },
  ],
})
