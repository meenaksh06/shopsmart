module.exports = {
  apps: [
    {
      name: 'shopsmart-api',
      script: './server/src/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
      }
    },
    {
      name: 'shopsmart-web',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './client/dist',
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    }
  ]
};
