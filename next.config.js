const config = {
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  headers: () => [
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
  ],
  webpack: config => {
    config.module.rules.push({
      test: /\.mdx?$/,
      use: [
        {
          loader: '@mdx-js/loader',
          options: { providerImportSource: '@mdx-js/react' },
        },
      ],
    })

    return config
  },
  rewrites: () => [
    {
      source: '/sitemap/:media/:date.xml',
      destination: '/api/sitemap/:media/:date',
    },
    {
      source: '/robots.txt',
      destination: '/api/robots',
    },
  ],
}

export default config
