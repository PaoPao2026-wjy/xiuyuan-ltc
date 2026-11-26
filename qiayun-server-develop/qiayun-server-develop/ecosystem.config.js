module.exports = {
  apps: [
    {
      name: 'qiayun-server',
      script: './dist/src/main.js',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/qiayun-server-error.log',
      out_file: './logs/qiayun-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};

