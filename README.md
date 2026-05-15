# Nasabah — Integrated Customer Complaint & Fraud Mitigation System

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Neon-PostgreSQL-green?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel" />
</p>

<p align="center">
  <strong>AI-powered fraud detection and customer complaint management platform for Indonesian banking compliance with POJK 39/2019.</strong>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [Screenshots & Features](#screenshots--features)
- [Regulatory Compliance](#regulatory-compliance)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

**Nasabah** is a comprehensive web application designed for Indonesian financial institutions to handle customer complaints and mitigate financial fraud through AI-driven analytics. The system provides a unified dashboard for fraud analysts, investigators, and administrators to monitor, investigate, and act on suspicious activities in real-time.

### Why Nasabah?

Traditional fraud detection systems rely on static rules that produce high false-positive rates (~40%) and cannot adapt to evolving fraud patterns. Nasabah addresses these limitations by combining:

- **Behavioral profiling** and anomaly detection
- **Interactive money trail visualization** for tracing fund flows
- **Explainable AI (XAI)** to justify every risk score for regulatory audits
- **Automated intervention protocols** aligned with OJK regulations

---

## Key Features

### 1. Executive Dashboard
- Real-time KPI cards (Total Accounts, Frozen Accounts, Open Complaints, High Risk Accounts)
- Complaint trend charts (monthly new vs resolved)
- Fraud distribution by region
- Risk distribution visualization (Low → Critical)
- System status monitoring (AI Engine, Database, Audit Logging)

### 2. Account Management
- Full CRUD for customer bank accounts
- Advanced search, filter by status, sort by risk/balance
- Pagination support
- Account detail pages with transaction history and freeze logs

### 3. Complaint Center
- AI-prioritized ticket inbox (High/Mid/Low priority badges)
- Filter by status, category, and priority score
- Case detail view with:
  - Customer profile and risk score
  - Sentiment analysis (Positive/Neutral/Negative)
  - AI explainability narrative
  - Case history timeline
- Categories: Phishing, Skimming, Social Engineering, Unauthorized Transaction, Account Takeover

### 4. Fraud Investigation
#### Ledger Analysis
- Complete transaction ledger with temporal filtering
- Anomaly detection flags
- Search by sender/recipient

#### Interactive Money Trail (Advanced)
- **Cytoscape.js-powered** interactive graph
- **4-level hierarchical visualization** (Source → Intermediate → Mule → Terminal)
- **Hover tooltips** with:
  - Account holder details
  - Risk score with progress bar
  - **AI Explainability** (XAI narrative)
  - Financial summary (Balance, Inflow, Outflow)
- **Click to expand/collapse** nodes recursively
- **Color-coded risk levels**:
  - Navy (#003366): Low Risk (0-29)
  - Yellow: Medium Risk (30-49)
  - Orange: High Risk (50-69)
  - Red: Critical (70-89)
  - Dark Red: Frozen (90+)
- **Side panel** with detailed node analysis

### 5. AI Rule Builder
- Visual drag-and-drop canvas using React Flow
- Trigger → Condition → Action workflow design
- Node palette for easy rule construction
- Mock model performance metrics (Precision, Recall, F1 Score)
- Save/load rules as JSON

### 6. Security & Account Freezing
- Frozen accounts listing with Sandi 07 reason codes
- **Role-based unfreeze capability** (Investigator/Admin only)
- Intervention protocol reference:
  - 0-30: Normal (auto-approved)
  - 31-70: Flagged (step-up authentication)
  - 71-90: Restricted (manual review, 10 min SLA)
  - 90+: Frozen (Sandi 07, auto-block + notify)

### 7. Audit Trail
- Immutable activity logs
- Filter by action type (LOGIN, CREATE, UPDATE, DELETE, FREEZE, UNFREEZE)
- Search by user, entity, or action
- Pagination support
- IP address tracking

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.2 | React framework with App Router |
| TypeScript | 5.6 | Type safety |
| Tailwind CSS | 3.4 | Utility-first styling |
| shadcn/ui | Latest | UI component library |
| Recharts | 2.13 | Dashboard charts |
| Lucide React | 0.46 | Icon library |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js API Routes | 14.2 | Server-side API |
| Prisma | 5.22 | ORM & database schema |
| Neon PostgreSQL | Serverless | Primary database |
| jose | 5.9 | JWT authentication |
| bcryptjs | 2.4 | Password hashing |

### Visualization
| Technology | Version | Purpose |
|-----------|---------|---------|
| Cytoscape.js | 3.30 | Money trail graph |
| React Flow | 12.3 | AI rule builder canvas |

### Deployment
| Technology | Purpose |
|-----------|---------|
| Vercel | Hosting & edge functions |
| GitHub | Source control |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Dashboard  │  │  Complaints  │  │Investigation │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Rules     │  │   Security   │  │    Audit     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14 (App Router)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Server Components / API Routes           │  │
│  │  • Auth Middleware (JWT + RBAC)                     │  │
│  │  • API Routes (REST)                                │  │
│  │  • Server-Side Rendering                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Prisma ORM                            │
│                    (Type-safe queries)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Neon PostgreSQL                           │
│  • pgvector (future: AI embeddings)                         │
│  • ACID transactions                                        │
│  • Serverless auto-scaling                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Entity Relationship

```
┌──────────┐       ┌──────────┐       ┌──────────────┐
│  users   │       │ accounts │       │ transactions │
├──────────┤       ├──────────┤       ├──────────────┤
│ id (PK)  │◄──────┤ id (PK)  │◄──────┤ id (PK)      │
│ username │       │ userId   │       │ senderId     │
│ password │       │ balance  │       │ recipientId  │
│ role     │       │ riskScore│       │ amount       │
└──────────┘       │ status   │       │ isAnomaly    │
                   └──────────┘       └──────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  complaints  │ │ risk_scores  │ │ freeze_logs  │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ id (PK)      │ │ id (PK)      │ │ id (PK)      │
│ accountId    │ │ accountId    │ │ accountId    │
│ category     │ │ score        │ │ reasonCode   │
│ aiPriority   │ │ explanation  │ │ triggeredBy  │
│ sentiment    │ └──────────────┘ │ unfrozenAt   │
└──────────────┘                  └──────────────┘
        │
        ▼
┌──────────────┐
│  audit_logs  │
├──────────────┤
│ id (PK)      │
│ userId       │
│ action       │
│ entity       │
│ details      │
└──────────────┘
```

### Schema Details

**Account Status Enum:**
- `ACTIVE` — Normal operation
- `FLAGGED` — Under observation
- `RESTRICTED` — Limited transactions
- `FROZEN` — Blocked (Sandi 07)

**Complaint Categories:**
- `PHISHING`
- `SKIMMING`
- `SOCIAL_ENGINEERING`
- `UNAUTHORIZED_TRANSACTION`
- `ACCOUNT_TAKEOVER`
- `OTHER`

**Intervention Protocol (POJK 39/2019):**

| Risk Score | Status | Action | Notification |
|-----------|--------|--------|-------------|
| 0-30 | Normal | Auto-approve | Monthly report |
| 31-70 | Flagged | Step-up auth | Verification request |
| 71-90 | Restricted | Manual review (10 min SLA) | Suspicious activity alert |
| 90+ | Frozen (Sandi 07) | Block all debit | Instant SMS/App notification |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- A Neon PostgreSQL database (or any PostgreSQL instance)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/inovasigpt/nasabah.git
cd nasabah

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your DATABASE_URL and NEXTAUTH_SECRET

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to database
npx prisma db push

# 6. Seed the database with demo data
npx tsx prisma/seed.ts

# 7. Start development server
npm run dev

# 8. Open http://localhost:3000 in your browser
```

### Build for Production

```bash
npm run build
npm start
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Database Connection (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# JWT Secret (generate a strong random string)
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
```

### For Vercel Deployment

Add these environment variables in your Vercel project settings:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon/PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Secret key for JWT signing |

---

## Demo Accounts

Use these credentials to test the application:

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| `admin` | `admin` | Administrator | Full access to all features |
| `analyst` | `analyst` | Fraud Analyst | No access to AI Rules & Security panels |
| `investigator` | `investigator` | Senior Investigator | Full access + can unfreeze accounts |

---

## Screenshots & Features

### Login Page
Clean authentication screen with Bank Indonesia color palette (Navy #003366 + Gold #FFCC00).

### Executive Dashboard
- **Top Bar**: Real-time ticker showing fraud alerts, open complaints, frozen accounts
- **KPI Cards**: Clickable cards navigating to respective modules
- **Charts**: Monthly complaint trends and regional fraud distribution
- **System Status**: Live indicators for AI Engine, Database, and Audit Logging

### Money Trail Visualization
The flagship feature — an interactive graph for tracing fund flows:

1. **Hover** over any node to see:
   - Account holder name and number
   - Risk score with visual progress bar
   - **AI Explainability narrative** (e.g., *"CRITICAL: Suspected mule account linked to fraud ring #FR-2026-0442"*)
   - Financial summary (Balance, Inflow, Outflow)

2. **Click** a node to expand/collapse its connections recursively

3. **Expand All** / **Collapse All** buttons for quick navigation

4. **Side Panel** shows detailed analysis of selected node

### Complaint Case Detail
- Customer profile with risk score
- Sentiment analysis badge
- AI priority scoring
- Case history timeline
- Quick actions (Update Status, View Money Trail, Link Transaction)

---

## Regulatory Compliance

### POJK 39/POJK.03/2019 Compliance

This application is designed to align with OJK's Anti-Fraud Strategy requirements:

| Pilar Strategi | Implementasi Sistem |
|---------------|-------------------|
| **Pencegahan** | Step-up authentication, customer education tracking |
| **Deteksi** | AI risk scoring, anomaly detection, behavioral profiling |
| **Investigasi** | Money Trail visualization, audit logging, case management |
| **Tindak Lanjut** | Automated freezing (Sandi 07), regulatory reporting |

### Sandi 07 — Pemblokiran Rekening
- Automatic freeze triggered when risk score > 90
- Freeze reason code "07" logged in `freeze_logs`
- Instant customer notification via system
- Manual unfreeze restricted to Investigator/Admin roles

---

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with username/password |
| POST | `/api/auth/logout` | Clear session cookie |
| GET | `/api/auth/me` | Get current user info |

### Account Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/accounts/unfreeze` | Unfreeze account (Investigator/Admin only) |

### Audit

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/audit/log` | Create audit log entry |

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub repository
2. Import project in Vercel dashboard
3. Add environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`)
4. Deploy

The build process automatically runs:
```bash
prisma generate && next build
```

### Important Notes for Vercel
- All API routes and server pages export `dynamic = "force-dynamic"` to ensure proper request context
- `postinstall` script ensures Prisma Client is generated after `npm install`
- Database must be accessible from Vercel's edge network (Neon works out of the box)

---

## Roadmap

### Phase 1 — MVP ✅ (Completed)
- [x] Foundation & authentication
- [x] Dashboard & account management
- [x] Complaint center
- [x] Interactive money trail
- [x] AI rule builder (UI)
- [x] Security & audit trail
- [x] Vercel deployment

### Phase 2 — AI Integration (Planned)
- [ ] OpenAI/Anthropic API integration for NLP triage
- [ ] Real explainable AI (XAI) with LLM-generated narratives
- [ ] Automated risk score updates based on transaction patterns
- [ ] Anomaly detection with statistical models

### Phase 3 — Advanced Features (Planned)
- [ ] Recursive CTE database queries for dynamic money trail
- [ ] Temporal slider for time-based graph filtering
- [ ] Automated circular pattern detection
- [ ] Real-time notifications (WebSocket/SSE)
- [ ] PDF report generation for audits
- [ ] Multi-language support (Indonesian)

### Phase 4 — Enterprise (Planned)
- [ ] SSO integration (SAML/OAuth)
- [ ] Role customization
- [ ] API rate limiting
- [ ] Advanced RBAC with permissions matrix
- [ ] Integration with core banking systems

---

## Project Context

For the complete development discussion, decision log, and technical deep-dive, see:
- [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) — Full project archive
- [`docs/FSD.md`](./docs/FSD.md) — Functional Specification Document
- [`docs/TSD.md`](./docs/TSD.md) — Technical Specification Document

---

## Contributors

- **Developer**: InovasiGPT Team
- **Design Reference**: Bank Indonesia (bi.go.id) portal aesthetics
- **Regulatory Framework**: OJK POJK 39/POJK.03/2019

---

## License

This project is proprietary software built for demonstration and educational purposes.

---

<p align="center">
  <strong>Built with ❤️ for safer Indonesian banking.</strong>
</p>

<p align="center">
  <a href="https://github.com/inovasigpt/nasabah">GitHub Repository</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#demo-accounts">Demo</a>
</p>
