module.exports = {
  apps : [{
    script: 'index.js',
    watch: '.'
  }, {
    script: './service-worker/',
    watch: ['./service-worker']
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    staging: {
      user: 'deploy',
      host: 'xx.yy.zz.vv',
      ref: 'origin/develop',
      repo: 'git@github.com:repo/repo.git',
      path: '/path/to/project',
      ssh_options: ['PasswordAuthentication=no', 'StrictHostKeyChecking=no'],
      'post-deploy': 'cd /path/to/project && yarn --production=false;yarn build;pm2 startOrReload ecosystem.config.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  }
};
