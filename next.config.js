const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
})

module.exports = withMDX({
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
      source: '/sitemap_:date.xml',
      destination: '/api/sitemap/:date',
    },
    {
      source: '/robots.txt',
      destination: '/api/robots',
    },
    {
      source: '/',
      destination: '/appledaily/20210623',
    },
  ],
})
