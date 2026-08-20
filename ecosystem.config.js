module.exports = {
  apps: [
    {
      name: 'nextjs',
      script: 'node_modules/next/dist/bin/next',
      cwd: '/var/www/collection-news/',
      args: 'start',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'cluster',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
      autorestart: true,
      exp_backoff_restart_delay: 100,
      max_memory_restart: '900M',
      env: {
        TZ: 'Asia/Hong_Kong',
      },
    },
  ],
}
