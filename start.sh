#!/bin/bash

if [ ! -f server/.env ]; then
  cp server/.env.example server/.env
  echo "Created server/.env — update JWT_SECRET for production"
fi

echo "Installing dependencies..."
npm install --prefix server
npm install --prefix client
npm install

echo "Starting server and client..."
npm run dev
