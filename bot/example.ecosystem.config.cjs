module.exports = {
  apps: [{
    name: 'plume_prod',
    script: './dist_prod/src/app.js',
    ignore_watch: ['node_modules', 'db-dev.json', 'db-prod.json'],
    watch: ['dist_prod'],
    watch_delay: 1000,
    source_map_support: true,
    env: {
      NODE_ENV: 'production',
      DISCORD_TOKEN: '',
      LOGS_WEBHOOK: '',
      PREVIEW_PREFIX_URL: 'https://plume.red/viewer/v1?logfile=',
    }
  }]
}
