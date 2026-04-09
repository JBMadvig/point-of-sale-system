# Hundebassinet – POS & Inventory Management

A full-stack Point of Sale and inventory management system built on the MFAN stack (MongoDB, Fastify, Angular, Node.js), containerized with Docker.

## Current Features

- **Point of Sale** – Basket management, real-time updates via WebSocket
- **Inventory management** – Track stock, pricing, categories, and total stock value for products (beer, wine, spirits, soda, etc.)
- **Authentication** – Email/password login with JWT, QR code-based login for POS devices, device activation flow
- **User management** – Role-based access control (User, Admin, Sudo Admin), user avatars, balance tracking
- **Multi-currency support** – Per-user currency selection with live exchange rates (default: DKK)

- **And more to come**

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Angular 21, TypeScript, Tailwind CSS |
| Backend   | Fastify 5, Node.js 22, TypeScript   |
| Database  | MongoDB 7 (Replica Set)             |
| ORM       | Typegoose                           |
| Auth      | JWT, bcrypt                         |
| Runtime   | Docker, Docker Compose              |

## Getting Started

### Requirements

- [Docker Desktop](https://docs.docker.com/desktop/) (recommended) — includes Docker and Docker Compose
  Or: [Docker Engine](https://docs.docker.com/engine/install/) + [Compose plugin](https://docs.docker.com/compose/install/) (Linux)

### Run the app

```bash
git clone https://github.com/jbmadvig/hundebassinet.git
cd hundebassinet
docker compose up --build
```

Once running, the services are available at:

| Service          | URL                                           |
|------------------|-----------------------------------------------|
| Angular frontend | http://localhost:4200                         |
| Fastify API      | http://localhost:9001                         |
| MongoDB          | `mongodb://localhost:27017?directConnection=true` |

## Environment

A `.env` file is included with default values for local development:

```env
SERVER_PORT=9001
MONGODB_URL=mongodb://mongodb:27017/mfan?replicaSet=rs0
JWT_SECRET=change-this-in-production
```

Change `JWT_SECRET` before deploying to any non-local environment.

## Connecting to MongoDB with a UI tool

If you use [MongoDB Compass](https://www.mongodb.com/products/tools/compass) or a similar tool, connect with:

```
mongodb://localhost:27017?directConnection=true
```

> **Note:** The connection string in `.env` uses `mongodb://mongodb:27017` — that hostname only resolves inside the Docker network and will not work from your host machine.

The database runs as a single-node Replica Set to support Change Streams and Transactions. `directConnection=true` bypasses cluster discovery and connects directly.

## Project Structure

```
hundebassinet/
├── client/               # Angular frontend
│   └── src/
│       ├── app/
│       │   ├── pages/    # Route components (POS, inventory, users, login, ...)
│       │   └── shared/   # Services, guards, interceptors, UI components
│       └── environments/
├── server/               # Fastify API
│   └── src/
│       ├── routes/       # API endpoints (auth, users, items, currency, health)
│       ├── lib/          # MongoDB models, schemas, JWT/cookie helpers
│       └── services/     # WebSocket, currency exchange
├── docker-compose.yml
├── docker-entrypoint.sh  # MongoDB replica set initialization
└── .env
```

## Cleanup

Stop containers (data is preserved):

```bash
docker compose down
```

Stop containers and delete all data (volumes):

> **Warning: this permanently deletes the database.**

```bash
docker compose down -v
```