#!/bin/bash

mkdir -p nginx/ssl

if [ -f "nginx/ssl/cert.pem" ] && [ -f "nginx/ssl/key.pem" ]; then
  echo "Certificate and key already exist. Skipping generation."
  exit 0
fi

openssl req -x509 -newkey rsa:4096 -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -nodes -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,DNS:127.0.0.1,IP:127.0.0.1,IP:::1"

chmod 600 nginx/ssl/key.pem
chmod 644 nginx/ssl/cert.pem

echo "self-signed certificate and key successfully generated"