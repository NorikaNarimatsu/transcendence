# #!/bin/sh
# set -e

# # Defaults (can be overridden by env)
# : "${PORT:=8443}"
# : "${TLS_CERT_PATH:=/app/certs/dev.crt}"
# : "${TLS_KEY_PATH:=/app/certs/dev.key}"

# export PORT TLS_CERT_PATH TLS_KEY_PATH  

# # Generate self-signed TLS cert if missing
# mkdir -p "$(dirname "$TLS_CERT_PATH")"
# if [ ! -f "$TLS_CERT_PATH" ] || [ ! -f "$TLS_KEY_PATH" ]; then
#   echo "Generating self-signed TLS cert..."
#   openssl req -x509 -nodes -newkey rsa:2048 \
#     -keyout "$TLS_KEY_PATH" -out "$TLS_CERT_PATH" \
#     -subj "/CN=localhost" -days 365 >/dev/null 2>&1
# fi

# # Start the server
# exec node src/server.js