#!/bin/sh

# Set vault address context
export VAULT_ADDR="http://localhost:8200"
export VAULT_TOKEN="globalmedx-dev-token"

echo "====================================================="
echo "Initializing and Seeding HashiCorp Vault Secret Stores"
echo "====================================================="

# Wait for Vault port to become available
echo "Waiting for Vault container to start..."
until docker exec globalmedx-vault vault status > /dev/null 2>&1; do
  sleep 2
done

echo "Vault server found online."

# Authenticate inside container
echo "Authenticating using Developer Root Token..."
docker exec globalmedx-vault vault login $VAULT_TOKEN > /dev/null

# Verify if secret/ kv-v2 mount is enabled. Enable if it does not exist.
echo "Verifying KV Secret Engine V2..."
docker exec globalmedx-vault vault secrets list | grep -q "secret/"
if [ $? -ne 0 ]; then
  docker exec globalmedx-vault vault secrets enable -path=secret kv-v2
  echo "KV Secret Engine enabled."
else
  echo "KV Secret Engine already configured."
fi

# Write secrets data
echo "Writing security credentials to secret/globalmedx..."
docker exec globalmedx-vault vault kv put secret/globalmedx \
  MONGODB_URI="mongodb://mongodb:27017/globalmedx" \
  JWT_SECRET="globalmedx_super_secret_jwt_key_2026" \
  API_KEY="globalmedx_api_key_xyz123"

# Read back for verification
echo "Validating written keys from Vault..."
docker exec globalmedx-vault vault kv get secret/globalmedx

echo "====================================================="
echo "HashiCorp Vault Seeding Completed Successfully."
echo "====================================================="
