#!/bin/bash
cat > README.md << 'ENDOFFILE'
# Eternal API Core

A full-stack demo: Node.js + Express + SQLite backend with JWT-authenticated REST API and a dark-themed browser dashboard.

## Features

- 815 Vault Registry (SQLite, category-grouped)
- JWT Authentication (login + protected routes)
- Live Ticker Rail (Luno BTC/ZAR price)
- Eternal Hub Dashboard (dark cosmic UI)

## Endpoints

- GET /health (public)
- POST /auth/login (public)
- GET /vaults (JWT required)
- GET /vaults/:no (JWT required)
- GET /vaults/search/:term (JWT required)
- GET /vaults/stats (JWT required)
- GET /ticker (public)

## Quick Start

    npm install
    node --experimental-sqlite src/vaults/loader.js
    npm start

Then open http://localhost:8080 in your browser.
Login with username: don  password: eternal

## Tech Stack

- Node.js (node:sqlite)
- Express 4
- jsonwebtoken
- SQLite 3

## Status

Portfolio project. Symbolic worldbuilding dashboard with real backend infrastructure.
ENDOFFILE
echo "README.md created:"
wc -l README.md

