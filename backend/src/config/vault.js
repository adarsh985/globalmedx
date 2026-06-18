const http = require('http');

/**
 * Robust Vault Client helper.
 * Fetches secrets from HashiCorp Vault KV v2 engine, falls back to environment variables.
 */
const getSecrets = async () => {
  const vaultAddr = process.env.VAULT_ADDR || 'http://localhost:8200';
  const vaultToken = process.env.VAULT_TOKEN; // Set during deployment
  const secretPath = process.env.VAULT_SECRET_PATH || '/v1/secret/data/globalmedx';

  const defaultSecrets = {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/globalmedx',
    JWT_SECRET: process.env.JWT_SECRET || 'globalmedx_super_secret_jwt_key_2026',
    API_KEY: process.env.API_KEY || 'globalmedx_api_key_xyz123'
  };

  if (!vaultToken) {
    console.log('Vault configuration (VAULT_TOKEN) not found. Falling back to environment variables.');
    return defaultSecrets;
  }

  return new Promise((resolve) => {
    const url = `${vaultAddr}${secretPath}`;
    console.log(`Attempting to fetch secrets from Vault: ${url}`);
    
    const req = http.get(url, {
      headers: {
        'X-Vault-Token': vaultToken,
        'Content-Type': 'application/json'
      },
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            const secrets = parsed.data && parsed.data.data ? parsed.data.data : parsed.data;
            console.log('Successfully fetched secrets from HashiCorp Vault.');
            resolve({
              MONGODB_URI: secrets.MONGODB_URI || defaultSecrets.MONGODB_URI,
              JWT_SECRET: secrets.JWT_SECRET || defaultSecrets.JWT_SECRET,
              API_KEY: secrets.API_KEY || defaultSecrets.API_KEY
            });
          } else {
            console.warn(`Vault returned status: ${res.statusCode}. Falling back to default env variables.`);
            resolve(defaultSecrets);
          }
        } catch (err) {
          console.error(`Error parsing secrets from Vault: ${err.message}. Falling back.`);
          resolve(defaultSecrets);
        }
      });
    });

    req.on('error', (err) => {
      console.warn(`Could not connect to HashiCorp Vault (${err.message}). Falling back to local env variables.`);
      resolve(defaultSecrets);
    });

    req.on('timeout', () => {
      req.destroy();
      console.warn('Vault connection timeout. Falling back to local env variables.');
      resolve(defaultSecrets);
    });
  });
};

module.exports = { getSecrets };
