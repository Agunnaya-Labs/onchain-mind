# 🧠 OnchainMind × AGL

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Base](https://img.shields.io/badge/Base-Mainnet-0052FF?logo=coinbase&logoColor=white)](https://base.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai&logoColor=white)](https://openai.com/)
[![Deployed on Replit](https://img.shields.io/badge/Deployed%20on-Replit-F26207?logo=replit&logoColor=white)](https://onchain-mind--aglabs.replit.app/)

**A production-grade Web3 AI SaaS platform for deploying AI-powered NPCs with persistent memory and tokenized compute — powered by the AGL token on Base.**

[Live Demo](https://onchain-mind--aglabs.replit.app/) · [API Docs](#api-reference) · [Quick Start](#quick-start) · [Report Bug](https://github.com/Agunnaya-Labs/onchain-mind/issues)

</div>

-----

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [AGL Token Billing](#agl-token-billing)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

-----

## Overview

**OnchainMind × AGL** is a developer platform that lets you spin up AI-powered Non-Player Characters (NPCs) with persistent cross-session memory, all billed in the **AGL token** on Base mainnet. Think of it as *OpenAI meets Unity meets Web3* — a fully observable, auditable AI runtime where every inference is an on-chain transaction.

Developers interact via a clean dashboard or directly through the REST API to:

- Create projects and manage multiple NPC agents
- Configure NPC personalities and system prompts
- Chat with NPCs that recall past conversations
- Monitor usage, spending, and analytics in real time
- Generate scoped API keys for programmatic access

-----

## Features

### 🤖 AI NPC Engine

- Create NPCs with custom personalities and system prompts
- Real AI responses via OpenAI GPT models
- NPCs naturally reference past memories mid-conversation (`"I remember you asked about..."`)
- Per-NPC chat history with full message log

### 🧩 Persistent Memory System

- Every meaningful conversation is stored as a memory entry
- NPC memories are scoped per-project for multi-tenant isolation
- Memory entries include `category`, `importance` score, and optional `wallet` attribution
- Designed for future upgrade to vector/semantic search (pgvector-ready schema)

### 💰 AGL Token Billing Engine

- Pay-per-use pricing denominated in AGL tokens
  - `2 AGL` per NPC chat
  - `1 AGL` per memory write
  - `1 AGL` per memory search
- Real-time balance tracking with transaction history
- Deposit and balance management endpoints

### 🔑 API Key Authentication

- Generate and revoke scoped API keys per project
- Multi-tenant isolation — each project’s data is fully separated
- Zod-validated inputs on every endpoint

### 📊 Analytics & Dashboard

- 7-day API usage timeline (area chart)
- Real-time activity feed with AGL cost per action
- Dashboard summary: projects, active NPCs, total API calls, memories stored, AGL spent

### ⛓️ Blockchain Indexer (Simulated)

- Simulates on-chain events: `Transfer`, `Mint`, `Stake`, `GovernanceVote`
- Indexes events to NPC memory for context-aware agent behavior
- Extensible to real RPC event polling

-----

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     OnchainMind × AGL                       │
│                                                             │
│  ┌──────────────────┐        ┌──────────────────────────┐  │
│  │  React Frontend  │◄──────►│    Express 5 API Server  │  │
│  │  (Vite + shadcn) │        │    (Node.js 24 / ESM)    │  │
│  └──────────────────┘        └──────────┬───────────────┘  │
│                                         │                   │
│                              ┌──────────▼───────────────┐  │
│                              │   PostgreSQL 16 Database  │  │
│                              │   (Drizzle ORM + Zod)     │  │
│                              └──────────┬───────────────┘  │
│                                         │                   │
│                    ┌────────────────────┼──────────────┐   │
│                    │                    │              │   │
│             ┌──────▼──────┐  ┌──────────▼───┐  ┌──────▼──┐│
│             │  OpenAI API │  │  AGL Token   │  │ Indexer ││
│             │  (GPT-4o)   │  │  (Base L2)   │  │ Engine  ││
│             └─────────────┘  └──────────────┘  └─────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Request flow for NPC chat:**

1. Client sends `POST /api/v1/npc/chat` with `{ npcId, message, wallet }`
1. API server loads NPC config + top-5 recent memories
1. OpenAI completion runs with memory context injected into system prompt
1. Response + new memory entry written to PostgreSQL
1. `3 AGL` deducted from balance; activity + transaction rows created
1. Response returned with `memoryRecalled[]` and `aglCharged`

-----

## Tech Stack

|Layer             |Technology                   |
|------------------|-----------------------------|
|Runtime           |Node.js 24 (ESM)             |
|Language          |TypeScript 5.9               |
|Package Manager   |pnpm workspaces              |
|API Framework     |Express 5                    |
|Database          |PostgreSQL 16                |
|ORM               |Drizzle ORM + drizzle-zod    |
|Validation        |Zod v4                       |
|API Spec          |OpenAPI 3.1 → Orval codegen  |
|AI Provider       |OpenAI (GPT-4o)              |
|Frontend Framework|React 19 + Vite 6            |
|UI Components     |shadcn/ui + Radix UI         |
|Styling           |Tailwind CSS v4              |
|Data Fetching     |TanStack Query v5            |
|Charts            |Recharts                     |
|Router            |Wouter                       |
|Build Tool        |esbuild (CJS bundle)         |
|Logger            |Pino + pino-http             |
|Blockchain        |Base Mainnet (Chain ID: 8453)|
|Hosting           |Replit Autoscale             |

-----

## Monorepo Structure

```
onchain-mind/
├── artifacts/
│   ├── api-server/                 # Express 5 backend
│   │   └── src/
│   │       ├── app.ts              # Express app setup
│   │       ├── index.ts            # Server entrypoint
│   │       └── routes/
│   │           ├── analytics.ts    # Usage + dashboard routes
│   │           ├── api-keys.ts     # API key CRUD
│   │           ├── billing.ts      # AGL balance + transactions
│   │           ├── indexer.ts      # Blockchain event simulation
│   │           ├── memory.ts       # NPC memory CRUD + search
│   │           ├── npc-chat.ts     # POST /v1/npc/chat
│   │           ├── npcs.ts         # NPC CRUD
│   │           └── projects.ts     # Project CRUD
│   └── onchainmind/                # React frontend (Vite)
│       └── src/
│           ├── pages/
│           │   ├── landing.tsx
│           │   ├── dashboard.tsx
│           │   ├── projects.tsx
│           │   ├── project-detail.tsx
│           │   ├── npcs.tsx
│           │   ├── npc-detail.tsx  # NPC chat UI + memory log
│           │   ├── api-keys.tsx
│           │   ├── billing.tsx
│           │   └── analytics.tsx
│           └── components/
│               └── layout/
│                   └── sidebar-layout.tsx
├── lib/
│   ├── api-spec/                   # OpenAPI 3.1 spec (source of truth)
│   │   └── openapi.yaml
│   ├── api-client-react/           # Orval-generated typed React hooks
│   │   └── src/generated/api.ts
│   ├── api-zod/                    # Orval-generated Zod schemas
│   │   └── src/generated/
│   ├── db/                         # Drizzle schema + client
│   │   └── src/schema/
│   │       ├── npcs.ts
│   │       ├── memories.ts
│   │       ├── billing.ts
│   │       ├── chat-messages.ts
│   │       ├── activity.ts
│   │       ├── api-keys.ts
│   │       └── projects.ts
│   └── integrations-openai-ai-server/  # OpenAI client wrapper
├── scripts/                        # Workspace utility scripts
├── package.json                    # Workspace root
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

-----

## Quick Start

### Prerequisites

- Node.js `>= 24`
- pnpm `>= 9`
- PostgreSQL 16 instance
- OpenAI API key

### 1. Clone & Install

```bash
git clone https://github.com/Agunnaya-Labs/onchain-mind.git
cd onchain-mind
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Fill in DATABASE_URL, OPENAI_API_KEY, PORT, BASE_PATH
```

### 3. Push Database Schema

```bash
pnpm --filter @workspace/db run push
```

### 4. Run the API Server

```bash
pnpm --filter @workspace/api-server run dev
```

### 5. Run the Frontend

```bash
pnpm --filter @workspace/onchainmind run dev
```

The dashboard will be available at `http://localhost:8080`.

-----

## Environment Variables

|Variable        |Required|Description                          |
|----------------|--------|-------------------------------------|
|`DATABASE_URL`  |✅       |PostgreSQL connection string         |
|`OPENAI_API_KEY`|✅       |OpenAI API key for NPC completions   |
|`PORT`          |✅       |Port for the API server (e.g. `8080`)|
|`BASE_PATH`     |✅       |Vite base path (e.g. `/`)            |
|`NODE_ENV`      |✅       |`development` or `production`        |

-----

## API Reference

Base path: `/api`

### Health

|Method|Endpoint  |Description        |
|------|----------|-------------------|
|`GET` |`/healthz`|Server health check|

### Projects

|Method  |Endpoint       |Description      |
|--------|---------------|-----------------|
|`GET`   |`/projects`    |List all projects|
|`POST`  |`/projects`    |Create a project |
|`GET`   |`/projects/:id`|Get project by ID|
|`PATCH` |`/projects/:id`|Update project   |
|`DELETE`|`/projects/:id`|Delete project   |

### NPCs

|Method  |Endpoint                   |Description           |
|--------|---------------------------|----------------------|
|`GET`   |`/projects/:projectId/npcs`|List NPCs in a project|
|`POST`  |`/projects/:projectId/npcs`|Create an NPC         |
|`GET`   |`/npcs/:id`                |Get NPC by ID         |
|`PATCH` |`/npcs/:id`                |Update NPC            |
|`DELETE`|`/npcs/:id`                |Delete NPC            |

### NPC Chat ⭐

|Method|Endpoint                   |Description            |
|------|---------------------------|-----------------------|
|`POST`|`/v1/npc/chat`             |Chat with an NPC       |
|`GET` |`/npcs/:npcId/chat-history`|Get NPC message history|

**Request body for `/v1/npc/chat`:**

```json
{
  "npcId": 1,
  "message": "Hello, who are you?",
  "wallet": "0x742d35Cc6634C0532925a3b8D4C9bD73"
}
```

**Response:**

```json
{
  "response": "I'm Arena Guide! I remember you asked about game mechanics last time...",
  "npcId": 1,
  "memoryRecalled": ["User asked about game mechanics"],
  "aglCharged": 3,
  "timestamp": "2026-04-15T00:00:00.000Z"
}
```

### Memory

|Method|Endpoint                    |Description           |
|------|----------------------------|----------------------|
|`GET` |`/npcs/:npcId/memory`       |Get NPC memories      |
|`POST`|`/npcs/:npcId/memory/search`|Semantic memory search|

### API Keys

|Method  |Endpoint       |Description         |
|--------|---------------|--------------------|
|`GET`   |`/api-keys`    |List API keys       |
|`POST`  |`/api-keys`    |Generate new API key|
|`DELETE`|`/api-keys/:id`|Revoke API key      |

### Billing

|Method|Endpoint               |Description        |
|------|-----------------------|-------------------|
|`GET` |`/billing/balance`     |Get AGL balance    |
|`GET` |`/billing/transactions`|Transaction history|
|`POST`|`/billing/deposit`     |Deposit AGL        |

### Analytics

|Method|Endpoint                    |Description                      |
|------|----------------------------|---------------------------------|
|`GET` |`/v1/usage`                 |Usage statistics                 |
|`GET` |`/analytics/timeline`       |Daily usage timeline (7d default)|
|`GET` |`/dashboard/summary`        |Dashboard KPI summary            |
|`GET` |`/dashboard/recent-activity`|Recent activity feed             |

### Indexer

|Method|Endpoint           |Description                   |
|------|-------------------|------------------------------|
|`GET` |`/indexer/events`  |List indexed blockchain events|
|`POST`|`/indexer/simulate`|Simulate a blockchain event   |

-----

## Database Schema

```
projects ──┬── npcs ──┬── chat_messages
           │          └── memories
           ├── api_keys
           └── activity

balances
transactions
```

**Key tables:**

- **`npcs`** — NPC config: name, personality, system_prompt, model, status
- **`memories`** — Per-NPC memory entries with importance scoring and wallet attribution
- **`chat_messages`** — Full conversation history with role (`user` / `assistant`)
- **`balances`** — AGL token balance (wallet-scoped)
- **`transactions`** — Immutable ledger of all AGL charges and deposits
- **`activity`** — Human-readable activity log for the dashboard feed
- **`api_keys`** — Hashed API keys with project scope

### Codegen

API types are generated from the OpenAPI spec. After modifying `lib/api-spec/openapi.yaml`, regenerate hooks and Zod schemas:

```bash
pnpm --filter @workspace/api-spec run codegen
```

-----

## AGL Token Billing

|Action       |AGL Cost|
|-------------|--------|
|NPC Chat     |2 AGL   |
|Memory Write |1 AGL   |
|Memory Search|1 AGL   |
|Deposit      |—       |

**AGL Token Contract (Base Mainnet):**

```
0xea1221b4d80a89bd8c75248fae7c176bd1854698
```

Chain ID: `8453` · Network: Base Mainnet · Standard: ERC-20

-----

## Deployment

### Replit (Current)

This project is configured for **Replit Autoscale** deployment via `.replit`:

```toml
[deployment]
router = "application"
deploymentTarget = "autoscale"
```

Ports: `8080` (API + Frontend), `8081` (dev)

### Manual / VPS

```bash
# Build all packages
pnpm run build

# Start API server
pnpm --filter @workspace/api-server run start
```

### Docker (Coming Soon)

Docker configuration is planned. The monorepo structure is Docker-ready — each artifact can be independently containerized.

-----

## Roadmap

- [x] NPC AI engine with OpenAI integration
- [x] Persistent memory system (recency-based)
- [x] AGL token billing engine
- [x] API key management
- [x] Blockchain event indexer (simulated)
- [x] React dashboard with analytics
- [x] OpenAPI spec + Orval codegen pipeline
- [ ] API key authentication middleware
- [ ] Per-wallet balance isolation
- [ ] `pgvector` semantic memory search
- [ ] SIWE (Sign-In with Ethereum) wallet auth
- [ ] Real AGL token balance reads via Base RPC
- [ ] WebSocket streaming for NPC chat
- [ ] Docker + Kubernetes configs
- [ ] Redis queue for indexer events
- [ ] Rate limiting + Helmet.js hardening

-----

## Contributing

Contributions are welcome! Please open an issue first to discuss what you’d like to change.

```bash
# Fork → clone → branch
git checkout -b feature/your-feature

# Make changes, then
pnpm run typecheck
pnpm run build

# Submit a PR
```

-----

## License

[MIT](https://opensource.org/licenses/MIT) © [Agunnaya Labs](https://github.com/Agunnaya-Labs)

-----

<div align="center">

Built with 🧠 by [Agunnaya Labs](https://github.com/Agunnaya-Labs) · [@Agunnaya001](https://x.com/Agunnaya001) on X

**AGL Token · Base Mainnet · `0xea1221b4d80a89bd8c75248fae7c176bd1854698`**

</div>
