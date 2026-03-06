const logger = require('../utils/logger');

function parseBool(val, defaultVal) {
  if (val === undefined || val === null || val === '') return defaultVal;
  return val === 'true';
}

function parseIntSafe(val, defaultVal) {
  if (val === undefined || val === null || val === '') return defaultVal;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultVal : parsed;
}

function parseJsonArray(val) {
  if (val === undefined || val === null || val === '') return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildIdlerSettings() {
  return {
    enabled: true,
    parallelGameIdle: parseIntSafe(process.env.IDLE_PARALLEL_GAMES, 32),
    idleTime: parseIntSafe(process.env.IDLE_TIME, 0),
    alwaysIdleList: parseJsonArray(process.env.IDLE_ALWAYS_LIST),
    skipBannedGames: false,
    skipFreeGames: parseBool(process.env.IDLE_SKIP_FREE, false),
    blacklistGames: parseJsonArray(process.env.IDLE_BLACKLIST)
  };
}

function buildAccountObj(username, pass, secret) {
  return {
    username: username || '',
    password: pass || '',
    shared_secret: secret || null,
    statusInvisible: parseBool(process.env.IDLE_STATUS_INVISIBLE, false)
  };
}

module.exports = function loadEnvConfig() {
  try {
    const username = process.env.STEAM_USERNAME;
    const steamAccounts = process.env.STEAM_ACCOUNTS;
    const webhook = process.env.DISCORD_WEBHOOK || '';

    if (username) {
      logger.info('Loading config from environment variables');
      return [{
        account: buildAccountObj(username, process.env.STEAM_PASSWORD, process.env.STEAM_SHARED_SECRET),
        idlerSettings: buildIdlerSettings(),
        discordWebhook: webhook
      }];
    }

    if (steamAccounts) {
      logger.info('Loading config from environment variables');
      const accounts = JSON.parse(steamAccounts);
      if (!Array.isArray(accounts) || accounts.length === 0) return [];
      const idlerSettings = buildIdlerSettings();
      return accounts.map((acc) => ({
        account: buildAccountObj(acc.username, acc.password, acc.sharedSecret),
        idlerSettings: { ...idlerSettings },
        discordWebhook: webhook
      }));
    }

    return [];
  } catch {
    return [];
  }
};
