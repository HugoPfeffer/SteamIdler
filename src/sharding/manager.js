const logger = require('../utils/logger');
const cluster = require('node:cluster');
const { readdirSync } = require('node:fs');
const { join, resolve } = require('node:path');
const basePath = resolve(join(__dirname, '../'));
const Worker = require('../structures/Worker');
const loadEnvConfig = require('../utils/envConfig');
const workers = new Map();

const reservedConfigFiles = ['global.js', 'envConfig.js'];
const configPath = join(basePath, '/config');

module.exports = new Promise((resolve, reject) => {
  // Check environment variable config first
  const envConfigs = loadEnvConfig();

  let configList;

  if (envConfigs.length > 0) {
    configList = envConfigs;
  } else {
    // Fall through to file-based config loading
    const configFiles = readdirSync(configPath).filter(
      (file) => !reservedConfigFiles.includes(file) && file.endsWith('.js')
    );

    // Load our global config if it exists
    let globalConfig = {};
    try {
      globalConfig = require(join(configPath, 'global.js'));
    } catch (error) {
      logger.warn('Global config not found, consider creating one to apply global settings');
    }

    configList = configFiles.map((configFile) => ({
      ...globalConfig,
      ...require(join(configPath, configFile))
    }));
  }

  for (const config of configList) {
    const worker = cluster.fork();

    worker.once('online', async () => {
      logger.info(`Worker ${worker.id} for ${config.account.username} has been started`);
      workers.set(worker.id, new Worker(worker.id, config, cluster));
    });

    worker.on('disconnect', () => {
      logger.error(`Worker ${worker.id} for ${config.account.username} has died, stopped idling`);
    });
  }

  const upChecker = setInterval(() => {
    if (configList.length === workers.size) {
      clearInterval(upChecker);
      resolve(workers);
    }
  }, 2500);
});
