module.exports = {
  apps: [
    {
      name: 'nextjs',
      script: 'npm',
      cwd: '/var/www/collection-news/',
      args: 'start',
      instances: 1,
      exec_mode: 'cluster',
      error_file: '/dev/null',
      out_file: '/dev/null',
      max_memory_restart: '900M',
      env: {
        TZ: 'Asia/Hong_Kong',
      },
    },
  ],
}
